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
    const raw = fs.readFileSync(filePath, 'utf8');
    console.log('Raw file content:', raw.slice(0, 500)); // Log the first 500 characters of the file

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
      const date = parts[0] || null;
      const time = parts[1] || null;
      const label = parts[2] || null;
      const form1 = parts[3] ? Number(parts[3]) : null;
      const form2 = parts[4] ? Number(parts[4]) : null;
      const values = parts.slice(5, 45).map((v) => (v ? Number(v) : 0)); // Map Prod_1 to Prod_40

      return { date, time, label, form1, form2, values };
    } catch (error) {
      console.error('Error parsing row:', parts, error);
      return null;
    }
  }
}

export const parserService = new ParserService();
