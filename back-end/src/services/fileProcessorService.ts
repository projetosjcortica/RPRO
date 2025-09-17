import parserService, { ParserRow, ParserResult } from './parserService';
import BackupService from './backupService';
import * as db from './dbService';
import localBackupDb from './localBackupDbService';
import * as path from 'path';
import * as fs from 'fs';
import BaseService from './BaseService';

export type ProcessPayload = { filename: string; lastProcessedAt: string; rowCount: number };

export interface Observer {
  update(payload: ProcessPayload): Promise<void>;
}

export interface CandidateObserver {
  updateCandidates(candidates: Array<{ name: string; size: number }>): Promise<Array<{ name: string; size: number }>>;
}

class CandidateSubject {
  private observers: Set<CandidateObserver> = new Set();
  attach(o: CandidateObserver) { this.observers.add(o); }
  detach(o: CandidateObserver) { this.observers.delete(o); }
  async notify(candidates: Array<{ name: string; size: number }>) {
    let current = candidates.slice();
    for (const o of Array.from(this.observers)) {
      try {
        const res = await o.updateCandidates(current);
        if (Array.isArray(res)) current = res;
      } catch (e) {
        console.error('Candidate observer error', e);
      }
    }
    return current;
  }
}

class ProcessorSubject {
  private observers: Set<Observer> = new Set();

  attach(o: Observer) { this.observers.add(o); }
  detach(o: Observer) { this.observers.delete(o); }
  async notify(payload: ProcessPayload) {
    const promises = Array.from(this.observers).map(o => o.update(payload).catch((e) => {
      // eslint-disable-next-line no-console
      console.error('Observer error', e);
    }));
    await Promise.all(promises);
  }
}

// instância única para uso interno do serviço
const backupSvc = new BackupService();

class BackupObserver implements Observer {
  async update(payload: ProcessPayload) {
    const candidates = [path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp', payload.filename), path.resolve(process.cwd(), payload.filename)];
    let found: string | null = null;
    for (const c of candidates) {
      if (fs.existsSync(c)) { found = c; break; }
    }
    if (!found) return;
    const fileStat = fs.statSync(found);
    const fileObj: any = { originalname: payload.filename, path: found, mimetype: 'text/csv', size: fileStat.size };
    // usa a instância real
    await backupSvc.backupFile(fileObj);
  }
}

class CleanupObserver implements Observer {
  async update(payload: ProcessPayload) {
    const cnt = await db.countRelatorioByFile(payload.filename);
    if (cnt >= payload.rowCount) {
      const meta = backupSvc.listBackups().find((m: any) => m.originalName === payload.filename || m.storedName?.endsWith(payload.filename));
      if (meta) {
        const local = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp', payload.filename);
        if (fs.existsSync(local)) fs.unlinkSync(local);
      }
    }
  }
}

/**
 * Serviço responsável por processar arquivos CSV e gerenciar observadores.
 * Implementa o padrão Observer para notificar eventos de processamento.
 */
class FileProcessorService extends BaseService {
  private subject: ProcessorSubject;
  private candidateSubject: CandidateSubject;

  constructor() {
    super('FileProcessorService');
    this.subject = new ProcessorSubject();
  this.candidateSubject = new CandidateSubject();
    // attach default observers
    this.subject.attach(new BackupObserver());
    this.subject.attach(new CleanupObserver());
  // attach self as default candidate observer
  this.candidateSubject.attach(this as unknown as CandidateObserver);
  }
  private mapRow(r: ParserRow | any): any {
    const base: any = {};
    // prefer canonical ParserRow shape (r.datetime)
    if (r.datetime) {
      try {
        const dt = new Date(r.datetime);
        base.Dia = `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear().toString().slice(-2)}`;
        base.Hora = dt.toTimeString().split(' ')[0];
      } catch (e) {
        base.Dia = r.date || r.Dia || r.DiaStr || null;
        base.Hora = r.time || r.Hora || null;
      }
    } else {
      base.Dia = r.date || r.Dia || r.DiaStr || null;
      base.Hora = r.time || r.Hora || null;
    }

    base.Nome = r.label || r.Nome || r.NomeStr || null;

    // Form1/Form2 may be present explicitly or as the first two numeric values
    const fv0 = Array.isArray(r.values) && r.values.length > 0 ? r.values[0] : null;
    const fv1 = Array.isArray(r.values) && r.values.length > 1 ? r.values[1] : null;
    base.Form1 = r.Form1 != null ? r.Form1 : (r.form1 != null ? r.form1 : (fv0 != null ? fv0 : null));
    base.Form2 = r.Form2 != null ? r.Form2 : (r.form2 != null ? r.form2 : (fv1 != null ? fv1 : null));

    if (Array.isArray(r.values) && r.values.length > 0) {
      for (let i = 1; i <= 40; i++) base[`Prod_${i}`] = r.values[i - 1] != null ? r.values[i - 1] : null;
    } else {
      for (let i = 1; i <= 40; i++) {
        const k = `Prod_${i}`;
        base[k] = r[k] != null ? r[k] : null;
      }
    }

    return base;
  }

  /**
   * Processa um arquivo CSV, mapeia as linhas e insere no banco de dados.
   * Notifica observadores após o processamento.
   * @param fullPath Caminho completo do arquivo CSV a ser processado.
   * @returns Informações sobre o processamento (caminho, contagem de linhas, etc.).
   */
  async processFile(fullPath: string) {
    const parsed: ParserResult = await parserService.processFile(fullPath as any);
    const rows: ParserRow[] = Array.isArray(parsed.rows) ? parsed.rows : [];
    let mapped = rows.map((r: any) => this.mapRow(r));

    // filter out completely empty rows (no Nome and no numeric data)
    mapped = mapped.filter((m: any) => {
      if (m.Nome) return true;
      if (m.Form1 != null || m.Form2 != null) return true;
      for (let i = 1; i <= 40; i++) {
        if (m[`Prod_${i}`] != null) return true;
      }
      return false;
    });
  // no debug logs in main branch

    const filename = path.basename(fullPath);
    const existing = await db.countRelatorioByFile(filename);
    if (existing > 0) return { skipped: true, reason: 'already processed', rowsCount: mapped.length };

    // debug: log first few mapped rows to diagnose null fields arriving in DB
    try {
      const sample = mapped.slice(0, 3).map((m: any) => {
        const copy: any = {};
        for (const k of Object.keys(m)) copy[k] = m[k];
        return copy;
      });
      console.log('[fileProcessor] mapped sample before DB insert:', JSON.stringify(sample, null, 2));
    } catch (e) {
      // ignore logging errors
    }

    let inserted: any = null;
    if (process.env.BACKUP_WRITE_FILES === 'false') {
      // Save to local SQLite backup DB instead of main DB
      await localBackupDb.saveRelatorioRows(mapped, filename);
      inserted = mapped;
    } else {
      inserted = await db.insertRelatorioRows(mapped, filename);
    }

    const payload: ProcessPayload = { filename, lastProcessedAt: new Date().toISOString(), rowCount: mapped.length };
    await this.subject.notify(payload);

    return { processedPath: fullPath, rowsCount: mapped.length, insertedCount: Array.isArray(inserted) ? inserted.length : null };
  }

  /**
   * Atualiza a lista de candidatos a serem processados, filtrando duplicados.
   * @param candidates Lista de candidatos com nome e tamanho.
   * @returns Lista filtrada de candidatos.
   */
  async updateCandidates(candidates: Array<{ name: string; size: number }>) {
    const out: Array<{ name: string; size: number }> = [];
    for (const c of candidates) {
      try {
        const cnt = await db.countRelatorioByFile(c.name);
        if (!cnt || cnt === 0) out.push(c);
      } catch (e) {
        // on error, conservatively include candidate
        out.push(c);
      }
    }
    return out;
  }

  async notifyCandidates(candidates: Array<{ name: string; size: number }>) {
    return this.candidateSubject.notify(candidates);
  }

  attachCandidateObserver(o: CandidateObserver) { this.candidateSubject.attach(o); }
  detachCandidateObserver(o: CandidateObserver) { this.candidateSubject.detach(o); }

  async preFilterCandidates(candidates: Array<{ name: string; size: number }>) {
    // potential extension point for observers; currently passthrough
    return candidates;
  }

  /**
   * Anexa um novo observador para eventos de processamento.
   * @param o Observador a ser anexado.
   */
  attachObserver(o: Observer) {
    this.subject.attach(o);
  }

  /**
   * Remove um observador de eventos de processamento.
   * @param o Observador a ser removido.
   */
  detachObserver(o: Observer) {
    this.subject.detach(o);
  }

  static process(file: any): any {
    // Compatibilidade: delega para uma instância do serviço
    const svc = new FileProcessorService();
    const fullPath = file && typeof file === 'object' ? (file.localPath || file.path || String(file)) : String(file);
    return svc.processFile(fullPath as string);
  }
}

const fileProcessor = new FileProcessorService();
export default fileProcessor;
export { FileProcessorService };
