import fs from 'fs';
import path from 'path';
import { BaseService } from '../core/baseService';
import { ParserResult, ParserRow, parseRowDateTime } from '../core/utils';

export class ParserService extends BaseService {
  tmpDir: string;
  processedDir: string;
  constructor() {
    super('ParserService');
    this.tmpDir = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
    this.processedDir = path.join(this.tmpDir, 'processed');
    if (!fs.existsSync(this.tmpDir)) fs.mkdirSync(this.tmpDir, { recursive: true });
    if (!fs.existsSync(this.processedDir)) fs.mkdirSync(this.processedDir, { recursive: true });
  }
  private detectDelimiter(sample: string) {
    const candidates = [',', ';', '\t'];
    let best = ',', bestScore = -1;
    for (const c of candidates) {
      const counts = sample.split('\n').slice(0, 5).map((l: string) => (l.match(new RegExp(`\\${c}`, 'g')) || []).length);
      const score = counts.reduce((a, b) => a + b, 0);
      if (score > bestScore) { bestScore = score; best = c; }
    }
    return best;
  }

  /**
   * Detecta se o CSV está em formato legado analisando a primeira linha
   */
  private isLegacyFormat(firstLine: string, delimiter: string): boolean {
    const parts = firstLine.split(delimiter).map(s => s.trim());
    if (parts.length < 2) return false;

    const dateField = parts[0];
    const timeField = parts[1];
    
    // Formato legado: DD/MM/YY ou DD-MM-YY ou DD/MM/YYYY
    const legacyDatePattern = /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/;
    
    // Formato novo: YYYY-MM-DD
    const newDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    
    // Hora em formato HH:MM:SS ou HH:MM
    const validTimePattern = /^\d{1,2}:\d{2}(:\d{2})?$/;
    
    const isLegacyDate = legacyDatePattern.test(dateField) && !newDatePattern.test(dateField);
    const isValidTime = validTimePattern.test(timeField);
    
    if (isLegacyDate && isValidTime) {
      console.log(`[ParserService] ✅ Formato legado detectado: Data="${dateField}", Hora="${timeField}"`);
      return true;
    }
    
    console.log(`[ParserService] 📋 Formato novo detectado: Data="${dateField}", Hora="${timeField}"`);
    return false;
  }

  /**
   * Converte data de formato legado para YYYY-MM-DD
   */
  private convertLegacyDate(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    
    const s = String(dateStr).trim();
    if (!s) return null;

    // Já está no formato DB esperado (DD-MM-YY)
    if (/^\d{2}-\d{2}-\d{2}$/.test(s)) return s;

    // DD/MM/YY ou DD-MM-YY ou DD/MM/YYYY ou DD-MM-YYYY
    const ddmmMatch = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
    if (ddmmMatch) {
      let [_, dd, mm, yy] = ddmmMatch;
      dd = dd.padStart(2, '0');
      mm = mm.padStart(2, '0');
      
      // Converter ano de 4 dígitos para 2 (formato do banco)
      if (yy.length === 4) {
        yy = yy.slice(-2);
      } else if (yy.length === 2) {
        // Já está em 2 dígitos, manter
      }
      
      // Retornar no formato do banco: DD-MM-YY
      return `${dd}-${mm}-${yy}`;
    }

    return s;
  }

  /**
   * Converte horário para formato HH:MM:SS
   * Aceita: HH:MM:SS ou HH:MM
   * Retorna null se a hora estiver vazia ou inválida
   */
  private convertLegacyTime(timeStr: string | null | undefined): string | null {
    if (!timeStr) return null;
    
    const s = String(timeStr).trim();
    if (!s) return null;

    // HH:MM:SS - permite 1 ou 2 dígitos na hora, minutos e segundos
    const match3 = s.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
    if (match3) {
      const [_, hh, mm, ss] = match3;
      const hour = parseInt(hh, 10);
      const min = parseInt(mm, 10);
      const sec = parseInt(ss, 10);
      
      // Validar ranges
      if (hour >= 0 && hour <= 23 && min >= 0 && min <= 59 && sec >= 0 && sec <= 59) {
        return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
      }
    }

    // HH:MM - permite 1 ou 2 dígitos na hora e minutos
    const match2 = s.match(/^(\d{1,2}):(\d{1,2})$/);
    if (match2) {
      const [_, hh, mm] = match2;
      const hour = parseInt(hh, 10);
      const min = parseInt(mm, 10);
      
      // Validar ranges
      if (hour >= 0 && hour <= 23 && min >= 0 && min <= 59) {
        return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
      }
    }

    // Se não corresponde a nenhum padrão válido, retorna null
    console.warn(`[ParserService] ⚠️ Hora inválida detectada: "${timeStr}" - será null no banco`);
    return null;
  }

  async processFile(filePath: string, opts?: { sinceTs?: string }): Promise<ParserResult> {
    console.log(`Processing file: ${filePath}`);
    const buffer = fs.readFileSync(filePath);

    // Try UTF-8 first. If the decoded text contains replacement chars, fall back to latin1.
    let raw = buffer.toString('utf8');
    if (raw.includes('\uFFFD')) {
      console.warn('UTF-8 decoding produced replacement characters, falling back to latin1');
      raw = buffer.toString('latin1');
    }

    // Strip common BOMs and normalize
    if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
    try { raw = raw.normalize('NFC'); } catch (e) { /* ignore if not supported */ }

    // Remove control characters except common whitespace (tab, LF, CR)
    raw = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

    console.log('Raw file content (first 500 chars):', raw.slice(0, 500));

    const delim = this.detectDelimiter(raw);
    console.log('Detected delimiter:', delim);

    const lines = raw.split(/\r?\n/).filter(Boolean);
    console.log('Total lines in file:', lines.length);

    // Detectar se é formato legado
    const isLegacy = lines.length > 0 ? this.isLegacyFormat(lines[0], delim) : false;
    if (isLegacy) {
      console.log('🔄 [ParserService] Formato legado detectado - convertendo automaticamente...');
    }

    const rows: ParserRow[] = [];

    // The system does not use headers — accept the first line as data.
    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(delim).map((s: string) => s.trim());
      const row = this.parseRow(parts, isLegacy, i < 5); // Passar flag de debug para primeiras 5 linhas
      if (row) {
        rows.push(row);
      } else {
        console.warn(`Skipped invalid row at line ${i + 1}`);
      }
    }

    if (isLegacy) {
      console.log(`✅ [ParserService] Conversão legado concluída: ${rows.length} linhas processadas`);
    }

    // If caller provided a sinceTs, filter out rows older or equal to that timestamp
    const since = opts?.sinceTs ? new Date(String(opts.sinceTs)) : null;
    let rowsToReturn = rows;
    if (since && !isNaN(since.getTime())) {
      const beforeCount = rows.length;
      rowsToReturn = rows.filter((r) => {
        const dt = parseRowDateTime({ date: r.date, time: r.time });
        if (!dt) return false;
        return dt.getTime() > since.getTime();
      });
      console.log(`Parsed ${rows.length} rows, ${rowsToReturn.length} after sinceTs filter (removed ${beforeCount - rowsToReturn.length})`);
    }

  const processedPath = path.join(this.processedDir, path.basename(filePath) + '.json');
  fs.writeFileSync(processedPath, JSON.stringify({ rows: rowsToReturn }, null, 2));
  console.log(`Processed file saved to: ${processedPath}`);
  console.log(`Parsed ${rows.length} rows, returning ${rowsToReturn.length} rows after filtering.`);

    return { 
      processedPath, 
      rowsCount: rowsToReturn.length, 
      rows: rowsToReturn,
      isLegacyFormat: isLegacy 
    };
  }

  private parseRow(parts: string[], isLegacy: boolean = false, debug: boolean = false): ParserRow | null {
    try {
      const sanitize = (s: string | undefined | null) => {
        if (s === undefined || s === null) return null;
        let t = String(s);
        t = t.replace(/\uFFFD/g, ''); // remove replacement chars
        t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // control chars
        t = t.trim();
        return t.length ? t : null;
      };

      const safeNumber = (s: string | undefined | null) => {
        if (s === undefined || s === null) return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
      };

      // Converter data e hora se for formato legado
      let date = sanitize(parts[0]);
      let time = sanitize(parts[1]);
      
      if (debug) {
        console.log(`[ParserService] RAW: date="${date}", time="${time}"`);
      }
      
      // SEMPRE tentar converter se parecer legado, mesmo que isLegacy=false
      if (date && /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/.test(date)) {
        console.log(`[ParserService] 🔄 Detectado formato legado na linha (convertendo): "${date}"`);
        date = this.convertLegacyDate(date);
      }
      
      if (time && /^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
        // Garantir que tempo seja convertido
        time = this.convertLegacyTime(time);
      }
      
      if (debug) {
        console.log(`[ParserService] APÓS CONVERSÃO: date="${date}", time="${time}"`);
      }

      const label = sanitize(parts[2]);
      const form1 = safeNumber(parts[3]);
      const form2 = safeNumber(parts[4]);
      const values = parts.slice(5, 45).map((v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      }); // Map Prod_1 to Prod_40

      return { date, time, label, form1, form2, values };
    } catch (error: any) {
      console.error('Error parsing row:', parts, error);
      return null;
    }
  }
}

export const parserService = new ParserService();

