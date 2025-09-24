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

    const rows: ParserRow[] = [];

    for (let i = 1; i < lines.length; i++) { // Start from 1 to skip the header
      const parts = lines[i].split(delim).map((s: string) => s.trim());
      const row = this.parseRow(parts);
      if (row) {
        rows.push(row);
      } else {
        console.warn(`Skipped invalid row at line ${i + 1}`);
      }
    }

    const processedPath = path.join(this.processedDir, path.basename(filePath) + '.json');
    fs.writeFileSync(processedPath, JSON.stringify({ rows }, null, 2));
    console.log(`Processed file saved to: ${processedPath}`);

    return { processedPath, rowsCount: rows.length, rows };
  }

  private parseRow(parts: string[]): ParserRow | null {
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

      const date = sanitize(parts[0]);
      const time = sanitize(parts[1]);
      const label = sanitize(parts[2]);
      const form1 = safeNumber(parts[3]);
      const form2 = safeNumber(parts[4]);
      const values = parts.slice(5, 45).map((v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      }); // Map Prod_1 to Prod_40

      return { date, time, label, form1, form2, values };
    } catch (error) {
      console.error('Error parsing row:', parts, error);
      return null;
    }
  }
}

export const parserService = new ParserService();
