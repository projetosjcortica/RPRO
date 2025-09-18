// =============================================
// RPRO Back-end Monolítico (index.ts)
// Tudo centralizado com POO e comentários simples.
// Seções: Utils, Tipos, Base, Entidades, Serviços, Controllers, Middlewares, Coletor, Contexto
// =============================================

// --------- Imports Node/external (via require para evitar typings) ---------
// @ts-ignore
declare const require: any;
// @ts-ignore
declare const process: any;
// @ts-ignore
declare const Buffer: any;
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');
require('reflect-metadata');
const {
  DataSource,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} = require('typeorm');
const { Client } = require('basic-ftp');
const crypto = require('crypto');

// Prefer SQLite by default when running as a child (local/dev),
// but respect explicit MySQL configuration if provided.
try {
  const isChild = typeof (process as any)?.send === 'function';
  const hasMysqlCfg = !!(process as any).env.MYSQL_HOST || !!(process as any).env.MYSQL_DB;
  if (isChild && !(process as any).env.USE_SQLITE && !hasMysqlCfg) {
    (process as any).env.USE_SQLITE = 'true';
  }
} catch {}

// =============================================
// Utils (equivalente a src/utils/*)
// =============================================

// hash util
function hashBufferHex(buffer: any, alg = 'sha256') {
  const h = crypto.createHash(alg);
  h.update(buffer);
  return h.digest('hex');
}

// http util
function postJson(url: string, body: any, token?: string) {
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
          try {
            resolve(JSON.parse(buf));
          } catch {
            resolve(buf);
          }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// date util
function parseRowDateTime(row: any): Date | null {
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
  } catch {
    return null;
  }
}

// config util
interface Config {
  nomeCliente: string;
  ip: string;
  user: string;
  password: string;
  localCSV: string;
  metodoCSV: string;
  habilitarCSV: boolean;
  serverDB: string;
  database: string;
  userDB: string;
  passwordDB: string;
  mySqlDir: string;
  dumpDir: string;
  batchDumpDir: string;
}
const defaultConfig: Config = {
  nomeCliente: '',
  ip: '',
  user: '',
  password: '',
  localCSV: '',
  metodoCSV: '',
  habilitarCSV: false,
  serverDB: '',
  database: '',
  userDB: '',
  passwordDB: '',
  mySqlDir: '',
  dumpDir: '',
  batchDumpDir: '',
};

// =============================================
// Tipos (equivalente a src/types/*)
// =============================================

type ParserRow = {
  datetime: string;
  label?: string | null;
  form1?: number | null;
  form2?: number | null;
  values: Array<number | null>;
};
type ParserResult = { processedPath: string; rowsCount: number; rows: ParserRow[] };
type ProcessPayload = { filename: string; lastProcessedAt: string; rowCount: number };

// =============================================
// Base POO (src/services/BaseService.ts)
// =============================================

abstract class BaseService {
  constructor(public name: string) {}
  async init(): Promise<void> {}
  async shutdown(): Promise<void> {}
}

// =============================================
// Entidades TypeORM (src/entities/*)
// =============================================

@Entity({ name: 'relatorio' })
class Relatorio {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 10, nullable: true }) Dia!: string | null;
  @Column({ type: 'time', nullable: true }) Hora!: string | null;
  @Column({ type: 'varchar', length: 30, nullable: true }) Nome!: string | null;
  @Column({ type: 'int', nullable: true }) Form1!: number | null;
  @Column({ type: 'int', nullable: true }) Form2!: number | null;

  @Column({ type: 'int', nullable: true }) Prod_1!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_2!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_3!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_4!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_5!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_6!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_7!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_8!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_9!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_10!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_11!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_12!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_13!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_14!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_15!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_16!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_17!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_18!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_19!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_20!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_21!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_22!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_23!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_24!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_25!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_26!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_27!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_28!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_29!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_30!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_31!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_32!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_33!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_34!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_35!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_36!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_37!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_38!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_39!: number | null;
  @Column({ type: 'int', nullable: true }) Prod_40!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true }) processedFile!: string | null;
}

@Entity({ name: 'materia_prima' })
class MateriaPrima {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'int', unique: true }) num!: number;
  @Column({ type: 'varchar', length: 30 }) produto!: string;
  @Column({ type: 'int' }) medida!: number;
}

@Entity()
class Batch {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() source!: string;
  @Column() fileName!: string;
  @Column({ type: 'datetime', nullable: true }) fileTimestamp!: Date | null;
  @Column({ type: 'int', default: 0 }) rowCount!: number;
  @Column({ type: 'simple-json', nullable: true }) meta!: any;
  @OneToMany(() => Row as any, (r: any) => r.batch, { cascade: true })
  rows!: Row[];
}

@Entity()
class Row {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Batch as any, (b: any) => b.rows) batch!: Batch;
  @Column({ type: 'datetime', nullable: true }) datetime!: Date | null;
  @Column({ type: 'varchar', nullable: true }) Nome!: string | null;
  @Column({ name: 'Código Fórmula', type: 'int', nullable: true }) Form1!: number | null;
  @Column({ name: 'Número Fórmula', type: 'int', nullable: true }) Form2!: number | null;
  @Column({ type: 'simple-json', nullable: true }) values!: number[] | null;
}

// Cache/backup metadata (separate lightweight SQLite)
@Entity({ name: 'cache_file' })
class CacheFile {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 255 }) originalName!: string;
  @Column({ type: 'varchar', length: 64, nullable: true }) lastHash!: string | null;
  @Column({ type: 'int', nullable: true }) lastSize!: number | null;
  @Column({ type: 'varchar', length: 32, nullable: true }) lastMTime!: string | null;
  @Column({ type: 'varchar', length: 32, nullable: true }) lastRowDia!: string | null;
  @Column({ type: 'varchar', length: 16, nullable: true }) lastRowHora!: string | null;
  @Column({ type: 'varchar', length: 40, nullable: true }) lastRowTimestamp!: string | null; // ISO or DiaT/Hora
  @Column({ type: 'int', nullable: true }) lastRowCount!: number | null;
  @Column({ type: 'varchar', length: 40, nullable: true }) lastProcessedAt!: string | null;
  @Column({ type: 'int', nullable: true }) ingestedRows!: number | null;
}

// =============================================
// Serviços (Backup, Parser, DB, IHM, FileProcessor)
// =============================================

// Diretórios e flags de backup
const DEFAULT_BACKUP_DIR = path.resolve(process.cwd(), 'backups');
const ENV_WORK_DIR = process.env.BACKUP_WORKDIR ? path.resolve(process.cwd(), process.env.BACKUP_WORKDIR) : null;
const BACKUP_WRITE_FILES = process.env.BACKUP_WRITE_FILES !== 'false';
if (BACKUP_WRITE_FILES && !fs.existsSync(DEFAULT_BACKUP_DIR)) fs.mkdirSync(DEFAULT_BACKUP_DIR, { recursive: true });
if (BACKUP_WRITE_FILES && ENV_WORK_DIR && !fs.existsSync(ENV_WORK_DIR)) fs.mkdirSync(ENV_WORK_DIR, { recursive: true });

type BackupMeta = {
  id: string;
  originalName: string;
  backupPath: string;
  workPath?: string;
  size?: number;
  createdAt: string;
  hash?: string;
};

class BackupService extends BaseService {
  private metas: BackupMeta[] = [];
  constructor() {
    super('BackupService');
  }
  private createId(name: string) {
    const ts = Date.now();
    return `${ts}-${name.replace(/[^a-zA-Z0-9_.-]+/g, '_')}`;
  }
  listBackups() {
    return [...this.metas];
  }
  getLatestBackup(originalName: string) {
    const filtered = this.metas.filter((m) => m.originalName === originalName);
    if (filtered.length === 0) return null;
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }
  async backupFile(fileObj: { originalname: string; path: string; mimetype?: string; size?: number }): Promise<BackupMeta> {
    const name = fileObj.originalname || path.basename(fileObj.path);
    const id = this.createId(name);
    const backupPath = path.join(DEFAULT_BACKUP_DIR, id);
    const workDir = ENV_WORK_DIR || DEFAULT_BACKUP_DIR;
    const workPath = path.join(workDir, id);
    const buffer = fs.readFileSync(fileObj.path);
    const hash = hashBufferHex(buffer);
    if (BACKUP_WRITE_FILES) {
      fs.writeFileSync(backupPath, buffer);
      if (ENV_WORK_DIR) fs.writeFileSync(workPath, buffer);
    }
    const meta: BackupMeta = {
      id,
      originalName: name,
      backupPath,
      workPath: ENV_WORK_DIR ? workPath : undefined,
      size: fileObj.size || buffer.length,
      createdAt: new Date().toISOString(),
      hash,
    };
    this.metas.push(meta);
    try { await cacheService.recordBackupMeta(meta, fs.statSync(fileObj.path)); } catch {}
    return meta;
  }
}
const backupSvc = new BackupService();

class ParserService extends BaseService {
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
    let best = ',',
      bestScore = -1;
    for (const c of candidates) {
      const counts = sample
        .split('\n')
        .slice(0, 5)
        .map((l: string) => (l.match(new RegExp(`\\${c}`, 'g')) || []).length);
      const score = counts.reduce((a, b) => a + b, 0);
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return best;
  }
  async processFile(filePath: string, opts?: { sinceTs?: string }): Promise<ParserResult> {
    const raw = fs.readFileSync(filePath, 'utf8');
    const delim = this.detectDelimiter(raw);
    const lines = raw.split(/\r?\n/).filter(Boolean);
    let start = 0;
    let headers: string[] | null = null;
    if (lines.length > 0 && /[A-Za-z]/.test(lines[0])) {
      headers = lines[0].split(delim).map((s: string) => s.trim());
      start = 1;
    }
    const rows: ParserRow[] = [];
    const sinceTs = opts?.sinceTs ? new Date(opts.sinceTs).getTime() : null;
    if (sinceTs != null) {
      const acc: ParserRow[] = [];
      for (let i = lines.length - 1; i >= start; i--) {
        const parts = lines[i].split(delim).map((s: string) => s.trim());
        let datetime: string | null = null;
        let label: string | null = null;
        let form1: number | null = null;
        let form2: number | null = null;
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
          for (let p = 1; p <= 40; p++) {
            const v = hmap.get(`Prod_${p}`) as string | undefined;
            values.push(v != null && v !== '' ? Number(v) : null);
          }
        } else {
          const dia = parts[0] || '';
          const hora = parts[1] || '';
          const dt = parseRowDateTime({ Dia: dia, Hora: hora });
          datetime = dt ? dt.toISOString() : new Date().toISOString();
          label = parts[2] || null;
          form1 = parts[3] ? Number(parts[3]) : null;
          form2 = parts[4] ? Number(parts[4]) : null;
          for (let p = 5; p < parts.length; p++) values.push(parts[p] ? Number(parts[p]) : null);
        }
        const ts = new Date(datetime!).getTime();
        if (ts > sinceTs) {
          acc.push({ datetime: datetime!, label, form1, form2, values });
        } else {
          break; // reached already ingested region
        }
      }
      rows.push(...acc.reverse());
    } else {
      for (let i = start; i < lines.length; i++) {
      const parts = lines[i].split(delim).map((s: string) => s.trim());
      let datetime: string | null = null;
      let label: string | null = null;
      let form1: number | null = null;
      let form2: number | null = null;
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
        for (let p = 1; p <= 40; p++) {
          const v = hmap.get(`Prod_${p}`) as string | undefined;
          values.push(v != null && v !== '' ? Number(v) : null);
        }
      } else {
        const dia = parts[0] || '';
        const hora = parts[1] || '';
        const dt = parseRowDateTime({ Dia: dia, Hora: hora });
        datetime = dt ? dt.toISOString() : new Date().toISOString();
        label = parts[2] || null;
        form1 = parts[3] ? Number(parts[3]) : null;
        form2 = parts[4] ? Number(parts[4]) : null;
        for (let p = 5; p < parts.length; p++) values.push(parts[p] ? Number(parts[p]) : null);
      }
      rows.push({ datetime: datetime!, label, form1, form2, values });
      }
    }
    const processedPath = path.join(this.processedDir, path.basename(filePath) + '.json');
    fs.writeFileSync(processedPath, JSON.stringify({ rows }, null, 2));
    return { processedPath, rowsCount: rows.length, rows };
  }
}
const parserService = new ParserService();

class DBService extends BaseService {
  ds: any;
  constructor(
    host = process.env.MYSQL_HOST || 'localhost',
    port = Number(process.env.MYSQL_PORT || 3306),
    username = process.env.MYSQL_USER || 'root',
    password = process.env.MYSQL_PASSWORD || 'root',
    database = process.env.MYSQL_DB || 'cadastro'
  ) {
    super('DBService');
    const useMysql = process.env.USE_SQLITE !== 'true';
    if (useMysql) {
      this.ds = new DataSource({
        type: 'mysql',
        host,
        port,
        username,
        password,
        database,
        synchronize: true,
        logging: false,
        entities: [Relatorio, MateriaPrima, Batch, Row],
      });
    } else {
      const dbPath = process.env.DATABASE_PATH || 'data.sqlite';
      const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
      const shouldSync = !fs.existsSync(absPath) || process.env.FORCE_SQLITE_SYNC === 'true';
      this.ds = new DataSource({
        type: 'sqlite',
        database: absPath,
        synchronize: shouldSync,
        logging: false,
        entities: [Relatorio, MateriaPrima, Batch, Row],
      });
    }
  }
  async init() {
    if (!this.ds.isInitialized) await this.ds.initialize();
  }
  async insertRelatorioRows(rows: any[], processedFile: string) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    const mapped = rows.map((r: any) => ({
      Dia: r.Dia ?? null,
      Hora: r.Hora ?? null,
      Nome: r.Nome ?? r.label ?? null,
      Form1: r.Form1 ?? r.form1 ?? null,
      Form2: r.Form2 ?? r.form2 ?? null,
      processedFile,
      Prod_1: r.Prod_1 ?? r.values?.[0] ?? null,
      Prod_2: r.Prod_2 ?? r.values?.[1] ?? null,
      Prod_3: r.Prod_3 ?? r.values?.[2] ?? null,
      Prod_4: r.Prod_4 ?? r.values?.[3] ?? null,
      Prod_5: r.Prod_5 ?? r.values?.[4] ?? null,
      Prod_6: r.Prod_6 ?? r.values?.[5] ?? null,
      Prod_7: r.Prod_7 ?? r.values?.[6] ?? null,
      Prod_8: r.Prod_8 ?? r.values?.[7] ?? null,
      Prod_9: r.Prod_9 ?? r.values?.[8] ?? null,
      Prod_10: r.Prod_10 ?? r.values?.[9] ?? null,
      Prod_11: r.Prod_11 ?? r.values?.[10] ?? null,
      Prod_12: r.Prod_12 ?? r.values?.[11] ?? null,
      Prod_13: r.Prod_13 ?? r.values?.[12] ?? null,
      Prod_14: r.Prod_14 ?? r.values?.[13] ?? null,
      Prod_15: r.Prod_15 ?? r.values?.[14] ?? null,
      Prod_16: r.Prod_16 ?? r.values?.[15] ?? null,
      Prod_17: r.Prod_17 ?? r.values?.[16] ?? null,
      Prod_18: r.Prod_18 ?? r.values?.[17] ?? null,
      Prod_19: r.Prod_19 ?? r.values?.[18] ?? null,
      Prod_20: r.Prod_20 ?? r.values?.[19] ?? null,
      Prod_21: r.Prod_21 ?? r.values?.[20] ?? null,
      Prod_22: r.Prod_22 ?? r.values?.[21] ?? null,
      Prod_23: r.Prod_23 ?? r.values?.[22] ?? null,
      Prod_24: r.Prod_24 ?? r.values?.[23] ?? null,
      Prod_25: r.Prod_25 ?? r.values?.[24] ?? null,
      Prod_26: r.Prod_26 ?? r.values?.[25] ?? null,
      Prod_27: r.Prod_27 ?? r.values?.[26] ?? null,
      Prod_28: r.Prod_28 ?? r.values?.[27] ?? null,
      Prod_29: r.Prod_29 ?? r.values?.[28] ?? null,
      Prod_30: r.Prod_30 ?? r.values?.[29] ?? null,
      Prod_31: r.Prod_31 ?? r.values?.[30] ?? null,
      Prod_32: r.Prod_32 ?? r.values?.[31] ?? null,
      Prod_33: r.Prod_33 ?? r.values?.[32] ?? null,
      Prod_34: r.Prod_34 ?? r.values?.[33] ?? null,
      Prod_35: r.Prod_35 ?? r.values?.[34] ?? null,
      Prod_36: r.Prod_36 ?? r.values?.[35] ?? null,
      Prod_37: r.Prod_37 ?? r.values?.[36] ?? null,
      Prod_38: r.Prod_38 ?? r.values?.[37] ?? null,
      Prod_39: r.Prod_39 ?? r.values?.[38] ?? null,
      Prod_40: r.Prod_40 ?? r.values?.[39] ?? null,
    }));
    return repo.save(mapped);
  }
  async countRelatorioByFile(processedFile: string) {
    await this.init();
    return this.ds.getRepository(Relatorio).count({ where: { processedFile } });
  }
  async getLastRelatorioTimestamp(processedFile?: string) {
    await this.init();
    const qb = this.ds.getRepository(Relatorio).createQueryBuilder('r');
    if (processedFile) qb.where('r.processedFile = :pf', { pf: processedFile });
    qb.orderBy('r.Dia', 'DESC').addOrderBy('r.Hora', 'DESC').limit(1);
    const last = await qb.getOne();
    return last ? `${last.Dia ?? ''}T${last.Hora ?? ''}` : null;
  }
  async deleteRelatorioByFile(processedFile: string) {
    await this.init();
    return this.ds.getRepository(Relatorio).delete({ processedFile });
  }
}
const dbService = new DBService();
const AppDataSource = dbService.ds;

class CacheService extends BaseService {
  ds: any;
  constructor() {
    super('CacheService');
    const dbPath = process.env.CACHE_SQLITE_PATH || 'cache.sqlite';
    const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
    this.ds = new DataSource({
      type: 'sqlite',
      database: absPath,
      synchronize: true,
      logging: false,
      entities: [CacheFile],
    });
  }
  async init() { if (!this.ds.isInitialized) await this.ds.initialize(); }
  async getByName(originalName: string): Promise<CacheFile | null> {
    await this.init();
    return this.ds.getRepository(CacheFile).findOne({ where: { originalName } });
  }
  async upsert(rec: Partial<CacheFile> & { originalName: string }) {
    await this.init();
    const repo = this.ds.getRepository(CacheFile);
    const existing = await repo.findOne({ where: { originalName: rec.originalName } });
    if (existing) {
      Object.assign(existing, rec);
      return repo.save(existing);
    }
    return repo.save(repo.create(rec));
  }
  async recordBackupMeta(meta: BackupMeta, st: any) {
    const mtime = st?.mtime ? new Date(st.mtime).toISOString() : null;
    await this.upsert({
      originalName: meta.originalName,
      lastHash: meta.hash || null,
      lastSize: meta.size || null,
      lastMTime: mtime,
      lastProcessedAt: meta.createdAt,
    });
  }
}
const cacheService = new CacheService();

class IHMService extends BaseService {
  constructor(private ip: string, private user = 'anonymous', private password = '') {
    super('IHMService');
  }
  async findAndDownloadNewFiles(localDir: string) {
    const client = new Client();
    try {
      await client.access({ host: this.ip, user: this.user, password: this.password, secure: false });
      await client.useDefaultSettings();
      await client.cd('/');
      const list = await client.list();
      const csvs = list.filter((f: any) => f.isFile && f.name.toLowerCase().endsWith('.csv'));
      const results: Array<{ name: string; localPath: string; size: number }> = [];
      for (const f of csvs) {
        const local = path.join(localDir, f.name);
        await client.downloadTo(local, f.name, 0);
        const stat = fs.statSync(local);
        results.push({ name: f.name, localPath: local, size: stat.size });
      }
      return results;
    } finally {
      client.close();
    }
  }
}

class Subject<T> {
  private observers: Array<{ update(payload: T): Promise<void> }> = [];
  attach(o: { update(payload: T): Promise<void> }) {
    if (!this.observers.includes(o)) this.observers.push(o);
  }
  detach(o: { update(payload: T): Promise<void> }) {
    this.observers = this.observers.filter((x) => x !== o);
  }
  async notify(payload: T) {
    for (const o of this.observers) await o.update(payload);
  }
}

class FileProcessorService extends BaseService {
  private subject = new Subject<ProcessPayload>();
  constructor(private backup = backupSvc, private parser = parserService, private db = dbService, private cache = cacheService) {
    super('FileProcessorService');
  }
  addObserver(o: { update(payload: ProcessPayload): Promise<void> | void }) {
    this.subject.attach({
      update: async (p: ProcessPayload) => {
        await Promise.resolve(o.update(p));
      },
    });
  }
  async processFile(fullPath: string) {
    const st = fs.statSync(fullPath);
    const originalName = path.basename(fullPath);
    const fileObj = { originalname: originalName, path: fullPath, size: st.size };

    const buffer = fs.readFileSync(fullPath);
    const hash = hashBufferHex(buffer);

    const cacheRec = await this.cache.getByName(originalName);
    const lastTs = cacheRec?.lastRowTimestamp || (await this.db.getLastRelatorioTimestamp(originalName));

    if (cacheRec && cacheRec.lastHash === hash && cacheRec.lastSize === st.size) {
      return { meta: { originalName, size: st.size, hash }, parsed: { rowsCount: 0, rows: [] } };
    }

    const meta = await this.backup.backupFile(fileObj);
  const parsed = await this.parser.processFile(fullPath, lastTs ? { sinceTs: lastTs } : undefined);

    const newRows = parsed.rows;

    if (newRows.length > 0) {
      const fileTag = originalName; // stable per source file
      const mappedRows = newRows.map((r) => ({
        Dia: r.datetime.substring(0, 10),
        Hora: r.datetime.substring(11, 19),
        Nome: r.label ?? null,
        Form1: r.form1 ?? null,
        Form2: r.form2 ?? null,
        values: r.values,
      }));
      await this.db.insertRelatorioRows(mappedRows, fileTag);
      const lastRow = newRows.length > 0 ? newRows[newRows.length - 1] : null;
      await this.cache.upsert({
        originalName,
        lastHash: hash,
        lastSize: st.size,
        lastMTime: st.mtime ? new Date(st.mtime).toISOString() : null,
        lastRowDia: lastRow ? lastRow.datetime.substring(0, 10) : cacheRec?.lastRowDia || null,
        lastRowHora: lastRow ? lastRow.datetime.substring(11, 19) : cacheRec?.lastRowHora || null,
        lastRowTimestamp: lastRow ? lastRow.datetime : cacheRec?.lastRowTimestamp || null,
        lastRowCount: (cacheRec?.lastRowCount || 0) + newRows.length,
        lastProcessedAt: new Date().toISOString(),
        ingestedRows: (cacheRec?.ingestedRows || 0) + newRows.length,
      });
    } else {
      await this.cache.upsert({
        originalName,
        lastHash: hash,
        lastSize: st.size,
        lastMTime: st.mtime ? new Date(st.mtime).toISOString() : null,
        lastProcessedAt: new Date().toISOString(),
      });
    }

    await this.subject.notify({ filename: originalName, lastProcessedAt: new Date().toISOString(), rowCount: newRows.length });
    return { meta, parsed: { processedPath: parsed.processedPath, rowsCount: newRows.length, rows: newRows } };
  }
}
const fileProcessorService = new FileProcessorService();

// =============================================
// Controllers (Express-like)
// =============================================

const fileController = {
  uploadFile: async (req: any, res: any, next: any) => {
    try {
      const file = req?.file;
      if (!file) {
        const err = new Error('Nenhum arquivo enviado');
        (err as any).status = 400;
        throw err;
      }
      const meta = await backupSvc.backupFile(file);
      const ext = path.extname(meta.originalName).toLowerCase();
      if (ext === '.csv' || file.mimetype === 'text/csv') {
        const csvPath = meta.workPath || meta.backupPath;
        const processed = await parserService.processFile(csvPath);
        return res.json({ meta, processed });
      }
      return res.json({ meta });
    } catch (e) {
      next(e);
    }
  },
};

const ihmController = {
  fetchLatestFromIHM: async (req: any, res: any, next: any) => {
    try {
      const { ip, user = 'anonymous', password = '' } = req.body || {};
      if (!ip) {
        const err = new Error('IP do IHM é obrigatório');
        (err as any).status = 400;
        throw err;
      }
      const tmpDir = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const ihm = new IHMService(ip, user, password);
      const downloaded = await ihm.findAndDownloadNewFiles(tmpDir);
      if (!downloaded || downloaded.length === 0) return res.json({ ok: true, message: 'Nenhum CSV novo encontrado' });
  const result = downloaded[0];
  if (!result) return res.json({ ok: true, message: 'Nenhum CSV novo encontrado' });
  const fileStat = fs.statSync(result.localPath);
  const fileObj: any = { originalname: result.name, path: result.localPath, mimetype: 'text/csv', size: fileStat.size };
      const meta = await backupSvc.backupFile(fileObj);
      const processed = await parserService.processFile(meta.workPath || meta.backupPath);
      return res.json({ meta, processed });
    } catch (e) {
      next(e);
    }
  },
  list: async (_req: any, res: any) => res.json({ backups: backupSvc.listBackups() }),
};

const paginateController = {
  paginate: async (req: any, res: any, next: any) => {
    try {
      const page = Math.max(1, Number(req.query?.page || 1));
      const pageSize = Math.max(1, Math.min(500, Number(req.query?.pageSize || 50)));
      const filters: any = {
        formula: req.query?.formula || null,
        dateStart: req.query?.dateStart || null,
        dateEnd: req.query?.dateEnd || null,
        sortBy: req.query?.sortBy || 'Dia',
        sortDir: req.query?.sortDir === 'ASC' ? 'ASC' : 'DESC',
      };
      await dbService.init();
      const repo = AppDataSource.getRepository(Relatorio);
      const qb = repo.createQueryBuilder('r');
      if (filters.formula) {
        const f = String(filters.formula);
        const n = Number(f);
        if (!Number.isNaN(n)) qb.andWhere('(r.Form1 = :n OR r.Form2 = :n)', { n });
        else qb.andWhere('(r.Nome LIKE :f OR r.processedFile LIKE :f)', { f: `%${f}%` });
      }
      if (filters.dateStart) qb.andWhere('r.Dia >= :ds', { ds: filters.dateStart });
      if (filters.dateEnd) qb.andWhere('r.Dia <= :de', { de: filters.dateEnd });
      const allowed = new Set(['Dia', 'Hora', 'Nome', 'Form1', 'Form2', 'processedFile']);
      const sortBy = allowed.has(filters.sortBy) ? filters.sortBy : 'Dia';
      const sortDir = filters.sortDir === 'ASC' ? 'ASC' : 'DESC';
      qb.orderBy(`r.${sortBy}`, sortDir);
      const total = await qb.getCount();
      const rows = await qb.offset((page - 1) * pageSize).limit(pageSize).getMany();
      return res.json({ rows, total, page, pageSize });
    } catch (e) {
      next(e);
    }
  },
};

const dbController = {
  listBatches: async (_req: any, res: any, next: any) => {
    try {
      await dbService.init();
      const repo = AppDataSource.getRepository(Batch);
      const [items, total] = await repo.findAndCount({ take: 50, order: { fileTimestamp: 'DESC' } });
      res.json({ items, total, page: 1, pageSize: 50 });
    } catch (e) {
      next(e);
    }
  },
  setupMateriaPrima: async (req: any, res: any, next: any) => {
    try {
      await dbService.init();
      const items = Array.isArray(req.body) ? req.body : [];
      const repo = AppDataSource.getRepository(MateriaPrima);
      const saved = await repo.save(items);
      res.status(201).json(saved);
    } catch (e) {
      next(e);
    }
  },
};

const syncController = {
  syncLocalToMain: async (req: any, res: any, next: any) => {
    try {
      const limit = Number(req.body?.limit || 500);
      await dbService.init();
      const repo = AppDataSource.getRepository(Relatorio);
      const rows = await repo.find({ take: limit });
      if (!rows || rows.length === 0) return res.json({ synced: 0 });
      const inserted = await dbService.insertRelatorioRows(rows as any[], 'local-backup-sync');
      return res.json({ synced: Array.isArray(inserted) ? inserted.length : rows.length });
    } catch (e) {
      next(e);
    }
  },
};

// =============================================
// Middlewares
// =============================================

const logsMiddleware = (req: any, _res: any, next: any) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};
const errorHandler = (err: any, _req: any, res: any, _next: any) => {
  console.error('[errorHandler] ', err);
  res.status(err?.status || 500).json({ error: err?.message || 'Erro interno do servidor' });
};

// =============================================
// Coletor (FTP + ingest opcional)
// =============================================

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');
const TMP_DIR = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
const rawServer = process.env.INGEST_URL || process.env.SERVER_URL || 'http://192.168.5.200';
const SERVER_URL = /^(?:https?:)\/\//i.test(rawServer) ? rawServer : `http://${rawServer}`;
const INGEST_TOKEN = process.env.INGEST_TOKEN;
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

let STOP = false;
function stopCollector() {
  STOP = true;
}
async function startCollector() {
  const ihm = new IHMService(
    process.env.IHM_IP || '127.0.0.1',
    process.env.IHM_USER || 'anonymous',
    process.env.IHM_PASS || ''
  );
  const collector = {
    async cycle() {
      const downloaded = await ihm.findAndDownloadNewFiles(TMP_DIR);
      for (const f of downloaded) {
        const res = await fileProcessorService.processFile(f.localPath);
        if (process.env.INGEST_URL) {
          try {
            await postJson(
              `${SERVER_URL}/api/ingest`,
              { meta: res.meta, count: res.parsed.rowsCount },
              INGEST_TOKEN
            );
          } catch {}
        }
      }
    },
  };
  STOP = false;
  while (!STOP) {
    try {
      await collector.cycle();
    } catch (e) {
      console.error('[collector cycle error]', e);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

// =============================================
// Contexto (export default)
// =============================================

class Contexto {
  backup = backupSvc;
  parser = parserService;
  db = dbService;
  fileProcessor = fileProcessorService;
  controllers = { fileController, ihmController, paginateController, dbController, syncController };
  middlewares = { logsMiddleware, errorHandler };
  collector = { startCollector, stopCollector };
}
const contexto = new Contexto();

// Exports públicos principais
export { BaseService, Relatorio, MateriaPrima, Batch, Row };
export {
  BackupService,
  backupSvc,
  ParserService,
  parserService,
  DBService,
  dbService,
  AppDataSource,
  IHMService,
  FileProcessorService,
  fileProcessorService,
};
export { fileController, ihmController, paginateController, dbController, syncController };
export { logsMiddleware, errorHandler };
export { startCollector, stopCollector };
export default contexto;

// =============================================
// IPC (child_process) - comunicação via process
// =============================================

class IPCBridge {
  private handlers: Record<string, (payload: any) => Promise<any> | any> = {};
  register(cmd: string, handler: (payload: any) => Promise<any> | any) {
    this.handlers[cmd] = handler;
  }
  async handleMessage(msg: any) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'event-ack') return;
    // Compat: aceitar mensagem simples de configuração
    if (msg.type === 'config') {
      this.sendEvent('config-ack', { ok: true });
      return;
    }
    const { id, cmd, payload } = msg;
    if (!id || !cmd) return;
    try {
      const h = this.handlers[cmd];
      if (!h) throw Object.assign(new Error(`Unknown cmd: ${cmd}`), { status: 404 });
      const data = await h(payload);
      this.respond(id, true, data);
    } catch (err: any) {
      this.respond(id, false, undefined, err);
    }
  }
  respond(id: string, ok: boolean, data?: any, err?: any) {
    if (typeof (process as any)?.send === 'function') {
      (process as any).send({ id, ok, data, error: err ? { message: err.message || String(err), stack: err.stack, status: err.status } : undefined });
    }
  }
  sendEvent(event: string, payload: any) {
    if (typeof (process as any)?.send === 'function') {
      (process as any).send({ type: 'event', event, payload, ts: new Date().toISOString() });
    }
  }
  start() {
    process.on('message', (msg: any) => this.handleMessage(msg));
    // Aviso de pronto
    this.sendEvent('ready', { ts: new Date().toISOString() });
  }
}

const ipc = new IPCBridge();

// ---------- API commands (sem Express) ----------
ipc.register('ping', async () => ({ pong: true, ts: new Date().toISOString() }));

ipc.register('backup.list', async () => backupSvc.listBackups());

ipc.register('file.process', async ({ filePath }: any) => {
  if (!filePath) throw Object.assign(new Error('filePath é obrigatório'), { status: 400 });
  const r = await fileProcessorService.processFile(filePath);
  return { meta: r.meta, rowsCount: r.parsed.rowsCount };
});

ipc.register('ihm.fetchLatest', async ({ ip, user = 'anonymous', password = '' }: any) => {
  if (!ip) throw Object.assign(new Error('IP do IHM é obrigatório'), { status: 400 });
  const tmpDir = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const ihm = new IHMService(ip, user, password);
  const downloaded = await ihm.findAndDownloadNewFiles(tmpDir);
  if (!downloaded || downloaded.length === 0) return { ok: true, message: 'Nenhum CSV novo encontrado' };
  const result = downloaded[0];
  if (!result) return { ok: true, message: 'Nenhum CSV novo encontrado' };
  const fileStat = fs.statSync(result.localPath);
  const fileObj: any = { originalname: result.name, path: result.localPath, mimetype: 'text/csv', size: fileStat.size };
  const meta = await backupSvc.backupFile(fileObj);
  const processed = await parserService.processFile(meta.workPath || meta.backupPath);
  return { meta, processed };
});

ipc.register('relatorio.paginate', async ({ page = 1, pageSize = 50, formula = null, dateStart = null, dateEnd = null, sortBy = 'Dia', sortDir = 'DESC' }: any) => {
  await dbService.init();
  const repo = AppDataSource.getRepository(Relatorio);
  const qb = repo.createQueryBuilder('r');
  if (formula) {
    const f = String(formula);
    const n = Number(f);
    if (!Number.isNaN(n)) qb.andWhere('(r.Form1 = :n OR r.Form2 = :n)', { n });
    else qb.andWhere('(r.Nome LIKE :f OR r.processedFile LIKE :f)', { f: `%${f}%` });
  }
  if (dateStart) qb.andWhere('r.Dia >= :ds', { ds: dateStart });
  if (dateEnd) qb.andWhere('r.Dia <= :de', { de: dateEnd });
  const allowed = new Set(['Dia', 'Hora', 'Nome', 'Form1', 'Form2', 'processedFile']);
  const sb = allowed.has(sortBy) ? sortBy : 'Dia';
  const sd = sortDir === 'ASC' ? 'ASC' : 'DESC';
  qb.orderBy(`r.${sb}`, sd);
  const total = await qb.getCount();
  const rows = await qb.offset((Math.max(1, Number(page)) - 1) * Math.max(1, Number(pageSize))).limit(Math.max(1, Number(pageSize))).getMany();
  return { rows, total, page, pageSize };
});

ipc.register('db.listBatches', async () => {
  await dbService.init();
  const repo = AppDataSource.getRepository(Batch);
  const [items, total] = await repo.findAndCount({ take: 50, order: { fileTimestamp: 'DESC' } });
  return { items, total, page: 1, pageSize: 50 };
});

ipc.register('db.setupMateriaPrima', async ({ items }: any) => {
  await dbService.init();
  const repo = AppDataSource.getRepository(MateriaPrima);
  return repo.save(Array.isArray(items) ? items : []);
});

ipc.register('sync.localToMain', async ({ limit = 500 }: any) => {
  await dbService.init();
  const repo = AppDataSource.getRepository(Relatorio);
  const rows = await repo.find({ take: Number(limit) });
  if (!rows || rows.length === 0) return { synced: 0 };
  const inserted = await dbService.insertRelatorioRows(rows as any[], 'local-backup-sync');
  return { synced: Array.isArray(inserted) ? inserted.length : rows.length };
});

ipc.register('collector.start', async () => {
  startCollector();
  return { started: true };
});

ipc.register('collector.stop', async () => {
  stopCollector();
  return { stopped: true };
});

// Auto-start IPC when running as a child process
if (typeof (process as any)?.send === 'function') {
  ipc.start();
  fileProcessorService.addObserver({ update: async (p) => ipc.sendEvent('file.processed', p) });
}

export { IPCBridge, ipc };