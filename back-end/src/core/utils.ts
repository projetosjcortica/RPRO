import crypto from 'crypto';
import http from 'http';
import https from 'https';

export function hashBufferHex(buffer: any, alg = 'sha256') {
  const h = crypto.createHash(alg);
  h.update(buffer);
  return h.digest('hex');
}

export function postJson(url: string, body: any, token?: string) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http;
      const data = JSON.stringify(body);
      const headers: any = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data).toString(),
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const opts: any = {
        hostname: parsed.hostname,
        port: parsed.port ? Number(parsed.port) : parsed.protocol === 'https:' ? 443 : 80,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers,
      };
      const req = lib.request(opts, (res: any) => {
        const chunks: any[] = [];
        res.on('data', (c: any) => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks).toString('utf8');
          try { resolve(JSON.parse(buf)); } catch { resolve(buf); }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    } catch (err) { reject(err); }
  });
}

export function parseRowDateTime(row: any): Date | null {
  try {
    if (!row) return null;
    if (row.datetime) return new Date(row.datetime);
    const d = row.date || row.Dia || null;
    const t = row.time || row.Hora || null;
    if (!d || !t) return null;
    if (/\//.test(d)) {
      const [dd = '01', mm = '01', yy = String(new Date().getFullYear())] = String(d).split('/');
      const day = dd.padStart(2, '0');
      const mon = mm.padStart(2, '0');
      const yr = yy.length === 2 ? '20' + yy : yy;
      return new Date(`${yr}-${mon}-${day}T${t}`);
    }
    return new Date(`${d}T${t}`);
  } catch { return null; }
}

export type ParserRow = {
  datetime: string;
  label?: string | null;
  form1?: number | null;
  form2?: number | null;
  values: Array<number | null>;
};

export type ParserResult = { processedPath: string; rowsCount: number; rows: ParserRow[] };
export type ProcessPayload = { filename: string; lastProcessedAt: string; rowCount: number };

export type BackupMeta = {
  id: string;
  originalName: string;
  backupPath: string;
  workPath?: string;
  size?: number;
  createdAt: string;
  hash?: string;
};
