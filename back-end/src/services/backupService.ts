import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_BACKUP_DIR = path.resolve(__dirname, '..', '..', 'backups');
const ENV_WORK_DIR = process.env.BACKUP_WORKDIR ? path.resolve(process.cwd(), process.env.BACKUP_WORKDIR) : null;
// If BACKUP_WRITE_FILES=false, the service should not persist temporary work files on disk.
const BACKUP_WRITE_FILES = process.env.BACKUP_WRITE_FILES !== 'false';

// garante que diretórios existam na inicialização do módulo
if (BACKUP_WRITE_FILES && !fs.existsSync(DEFAULT_BACKUP_DIR)) fs.mkdirSync(DEFAULT_BACKUP_DIR, { recursive: true });
if (BACKUP_WRITE_FILES && ENV_WORK_DIR && !fs.existsSync(ENV_WORK_DIR)) fs.mkdirSync(ENV_WORK_DIR, { recursive: true });

/**
 * Metadados armazenados para cada backup.
 */
export interface BackupMeta {
  originalName: string;
  storedName: string;
  mimetype?: string | null;
  size?: number | null;
  backupPath: string;
  workPath?: string | null;
  timestamp: string;
}

/**
 * Serviço responsável por armazenar backups e metadados no disco.
 * Mantém um cache em memória para consultas rápidas.
 */
class BackupService {
  dir: string;
  workdir: string | null;
  private metaCache: Map<string, BackupMeta> = new Map();

  constructor(dir = DEFAULT_BACKUP_DIR, workdir: string | null = ENV_WORK_DIR) {
    this.dir = dir;
    this.workdir = workdir;
    this.loadMetaCache();
  }

  /** Carrega arquivos .json de metadados existentes para a memória. */
  private loadMetaCache() {
    try {
      const files = fs.readdirSync(this.dir).filter(f => f.endsWith('.json'));
      for (const f of files) {
        try {
          const raw = fs.readFileSync(path.join(this.dir, f), 'utf8');
          const meta = JSON.parse(raw) as BackupMeta;
          if (meta && meta.storedName) this.metaCache.set(meta.storedName, meta);
        } catch (e) {
          // ignora metadados corrompidos
        }
      }
    } catch (e) {
      // diretório pode não existir ou não ser legível; ignorar
    }
  }

  private writeMeta(meta: BackupMeta) {
    const metaPath = path.join(this.dir, meta.storedName + '.json');
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    this.metaCache.set(meta.storedName, meta);
  }

  private makeTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Faz backup de um arquivo representado por { path } ou { buffer }.
   * Retorna os metadados do backup criado.
   */
  async backupFile(file: { path?: string; buffer?: Buffer; originalname: string; mimetype?: string; size?: number }) {
    const ts = this.makeTimestamp();
    const storedName = `${ts}-${file.originalname}`;
    const backupPath = path.join(this.dir, storedName);

    let workPath: string | null = null;

    if (!BACKUP_WRITE_FILES) {
      // If not writing files, we still accept buffer or path but we will not persist work copies.
      if (file.buffer) {
        // leave only backupPath written (if default dir writable), otherwise skip file write
        try {
          fs.writeFileSync(backupPath, file.buffer);
        } catch (e) {
          // best-effort: do not throw, continue with metadata only
        }
      } else if (file.path) {
        try {
          // copy to backup dir if possible; otherwise skip
          fs.copyFileSync(file.path, backupPath);
        } catch (e) {
          // skip
        }
      }
    } else {
      if (file.buffer) {
        fs.writeFileSync(backupPath, file.buffer);
        if (this.workdir) {
          workPath = path.join(this.workdir, storedName);
          fs.writeFileSync(workPath, file.buffer);
        }
      } else if (file.path) {
        fs.copyFileSync(file.path, backupPath);
        if (this.workdir) {
          workPath = path.join(this.workdir, storedName);
          fs.copyFileSync(file.path, workPath);
        }
      } else {
        throw new Error('Objeto de arquivo inválido para backup');
      }
    }

    const finalSize = file.size ?? (fs.existsSync(backupPath) ? fs.statSync(backupPath).size : null);
    const meta: BackupMeta = {
      originalName: file.originalname,
      storedName,
      mimetype: file.mimetype || null,
      size: typeof finalSize === 'number' ? finalSize : null,
      backupPath,
      workPath,
      timestamp: new Date().toISOString(),
    };

    this.writeMeta(meta);
    return meta;
  }

  /** Lista backups ordenados pelo timestamp (mais recentes primeiro). */
  listBackups() {
    return Array.from(this.metaCache.values()).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }

  /** Retorna o backup mais recente para um nome original (ou null). */
  getLatestBackup(originalName: string) {
    const all = this.listBackups();
    for (const m of all) {
      if (m.originalName === originalName || (m.storedName && m.storedName.endsWith(originalName))) return m;
    }
    return null;
  }

  getMeta(storedName: string) {
    return this.metaCache.get(storedName) || null;
  }

  /**
   * Restaura um backup para o workdir configurado. Retorna o caminho do arquivo restaurado.
   */
  restoreToWork(storedName: string) {
    const meta = this.getMeta(storedName);
    if (!meta) throw new Error('Backup não encontrado');
    if (!this.workdir) throw new Error('Workdir de backup não configurado');
    const dest = path.join(this.workdir, meta.storedName);
    fs.copyFileSync(meta.backupPath, dest);
    return dest;
  }

  /**
   * Limpa backups antigos mantendo os `keep` mais recentes.
   * Retorna a lista de backups restantes.
   */
  cleanup(keep = 10) {
    const all = this.listBackups();
    const toRemove = all.slice(keep);
    for (const m of toRemove) {
      try { fs.unlinkSync(m.backupPath); } catch (e) {}
      if (m.workPath) {
        try { fs.unlinkSync(m.workPath); } catch (e) {}
      }
      try { fs.unlinkSync(path.join(this.dir, m.storedName + '.json')); } catch (e) {}
      this.metaCache.delete(m.storedName);
    }
    return this.listBackups();
  }

  static createBackup(file: any): void {
    // Implementação fictícia
  }
}

export default BackupService;
