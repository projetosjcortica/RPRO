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
  async processFile(filePath: string, opts?: { sinceTs?: string }): Promise<ParserResult> {
    const raw = fs.readFileSync(filePath, 'utf8');
    const delim = this.detectDelimiter(raw);
    const lines = raw.split(/\r?\n/).filter(Boolean);
    let start = 0; let headers: string[] | null = null;
    if (lines.length > 0 && /[A-Za-z]/.test(lines[0])) { headers = lines[0].split(delim).map((s: string) => s.trim()); start = 1; }
    const rows: ParserRow[] = [];
    const sinceTs = opts?.sinceTs ? new Date(opts.sinceTs).getTime() : null;
    const iterate = (i: number) => {
      const parts = lines[i].split(delim).map((s: string) => s.trim());
      let datetime: string | null = null; let label: string | null = null; let form1: number | null = null; let form2: number | null = null;
      const values: Array<number | null> = [];
      if (headers) {
        const hmap = new Map(headers.map((h, idx) => [h, parts[idx] ?? '']));
        const dia = (hmap.get('Dia') || hmap.get('date') || '') as string;
        const hora = (hmap.get('Hora') || hmap.get('time') || '') as string;
        const dt = parseRowDateTime({ Dia: dia, Hora: hora });
        datetime = dt ? dt.toISOString() : new Date().toISOString();
        label = (hmap.get('Nome') || hmap.get('label') || '') as string;
        form1 = hmap.get('Form1') ? Number(hmap.get('Form1')) : null;
        form2 = hmap.get('Form2') ? Number(hmap.get('Form2')) : null;
        for (let p = 1; p <= 40; p++) { const v = hmap.get(`Prod_${p}`) as string | undefined; values.push(v != null && v !== '' ? Number(v) : null); }
      } else {
        const dia = parts[0] || ''; const hora = parts[1] || '';
        const dt = parseRowDateTime({ Dia: dia, Hora: hora });
        datetime = dt ? dt.toISOString() : new Date().toISOString();
        label = parts[2] || null; form1 = parts[3] ? Number(parts[3]) : null; form2 = parts[4] ? Number(parts[4]) : null;
        for (let p = 5; p < parts.length; p++) values.push(parts[p] ? Number(parts[p]) : null);
      }
      return { datetime: datetime!, label, form1, form2, values } as ParserRow;
    };
    if (sinceTs != null) {
      const acc: ParserRow[] = [];
      for (let i = lines.length - 1; i >= start; i--) { const r = iterate(i); const ts = new Date(r.datetime).getTime(); if (ts > sinceTs) acc.push(r); else break; }
      rows.push(...acc.reverse());
    } else {
      for (let i = start; i < lines.length; i++) rows.push(iterate(i));
    }
    const processedPath = path.join(this.processedDir, path.basename(filePath) + '.json');
    fs.writeFileSync(processedPath, JSON.stringify({ rows }, null, 2));
    return { processedPath, rowsCount: rows.length, rows };
  }
}

export const parserService = new ParserService();
