import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { BaseService } from '../core/baseService';
import { Relatorio, MateriaPrima, Batch, Row, Estoque, MovimentacaoEstoque, CacheFile, Setting, User } from '../entities/index';
import { getRuntimeConfig } from '../core/runtimeConfig';

export class DBService extends BaseService {
  ds: DataSource;
  useMysql: boolean;
  sqlitePath?: string;
  constructor() {
    super('DBService');
    // Do not create DataSource here. We'll initialize it lazily inside init()
    // so runtime-provided 'db-config' values (loaded at server startup) are used.
    // Initialize ds with a placeholder; real DataSource will be created in init().
    // @ts-ignore - assign later in init
    this.ds = {} as DataSource;
    this.useMysql = process.env.USE_SQLITE !== 'true';
  }
  async init() {
    // If ds already initialized, skip
    // @ts-ignore
    if ((this.ds && (this.ds as any).isInitialized)) return;

    // Read runtime DB config (frontend may have saved 'db-config')
    const runtimeDb = getRuntimeConfig('db-config') || {};
    const finalHost = runtimeDb.serverDB ?? process.env.MYSQL_HOST ?? 'localhost';
    const finalPort = Number(runtimeDb.port ?? process.env.MYSQL_PORT ?? 3306);
    const finalUser = runtimeDb.userDB ?? process.env.MYSQL_USER ?? 'root';
    const finalPass = runtimeDb.passwordDB ?? process.env.MYSQL_PASSWORD ?? 'root';
    const finalDb = runtimeDb.database ?? process.env.MYSQL_DB ?? 'cadastro';

    try {
      if (this.useMysql) {
        this.ds = new DataSource({
          type: 'mysql',
          host: finalHost,
          port: finalPort,
          username: finalUser,
          password: finalPass,
          database: finalDb,
          synchronize: true,
          logging: false,
          entities: [Relatorio, MateriaPrima, Batch, Row, Estoque, MovimentacaoEstoque, CacheFile, Setting, User],
        });
      } else {
        const dbPath = process.env.DATABASE_PATH || 'data.sqlite';
        const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
        this.sqlitePath = absPath;
        const shouldSync = !fs.existsSync(absPath) || process.env.FORCE_SQLITE_SYNC === 'true';
        this.ds = new DataSource({
          type: 'sqlite',
          database: absPath,
          synchronize: shouldSync,
          logging: false,
          entities: [Relatorio, MateriaPrima, Batch, Row, Estoque, MovimentacaoEstoque, CacheFile, Setting, User],
        });
      }
      await this.ds.initialize();
      return;
    } catch (err) {
      console.warn('[DBService] DataSource initialization failed:', String(err));
      if (this.useMysql) {
        try {
          const dbPath = process.env.DATABASE_PATH || 'data.sqlite';
          const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
          this.sqlitePath = absPath;
          const shouldSync = !fs.existsSync(absPath) || process.env.FORCE_SQLITE_SYNC === 'true';
          this.ds = new DataSource({
            type: 'sqlite',
            database: absPath,
            synchronize: true,
            logging: false,
            entities: [Relatorio, MateriaPrima, Batch, Row, Estoque, MovimentacaoEstoque, CacheFile, Setting, User],
          });
          await this.ds.initialize();
          this.useMysql = false;
          console.info('[DBService] Fell back to SQLite at', absPath);
          return;
        } catch (err2) {
          console.error('[DBService] SQLite fallback initialization failed:', err2);
          throw err2;
        }
      }
      throw err;
    }
  }
  async insertRelatorioRows(rows: any[], processedFile: string) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    // Helper to normalize a variety of incoming date string formats to YYYY-MM-DD
    const normalizeDateString = (s: any): string | null => {
      if (s === undefined || s === null) return null;
      const str = String(s).trim();
      if (!str) return null;
      // Already ISO
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
      // DD-MM-YYYY or DD/MM/YYYY
      const m1 = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
      if (m1) {
        let [_, dd, mm, yy] = m1;
        dd = dd.padStart(2, '0');
        mm = mm.padStart(2, '0');
        if (yy.length === 2) yy = '20' + yy;
        return `${yy}-${mm}-${dd}`;
      }
      // Fallback to Date parse
      const dt = new Date(str);
      if (!isNaN(dt.getTime())) {
        const yy = dt.getFullYear();
        const mm = String(dt.getMonth() + 1).padStart(2, '0');
        const dd = String(dt.getDate()).padStart(2, '0');
        return `${yy}-${mm}-${dd}`;
      }
      return null;
    };

    const mapped = rows.map((r: any) => ({
      Dia: normalizeDateString(r.Dia) ?? r.Dia ?? null,
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

    // Perform upsert-like behavior: for each mapped row, try to find an existing
    // row by (Dia, Hora, Nome, processedFile). If found, replace/update it;
    // otherwise insert a new record. Return the number of inserted rows.
    let inserted = 0;
    for (const row of mapped) {
      try {
        const existing = await repo.findOne({ where: { Dia: row.Dia, Hora: row.Hora, Nome: row.Nome, processedFile: row.processedFile } });
        if (existing) {
          // Update existing record with new values
          Object.assign(existing, row);
          await repo.save(existing);
        } else {
          try {
            await repo.save(repo.create(row));
            inserted++;
          } catch (errInsert) {
            // If insert failed due to race condition / unique constraint, attempt to fetch and update
            console.warn('[DBService] Insert failed, attempting fetch+update (possible race):', String(errInsert));
            const maybeExisting = await repo.findOne({ where: { Dia: row.Dia, Hora: row.Hora, Nome: row.Nome, processedFile: row.processedFile } });
            if (maybeExisting) {
              Object.assign(maybeExisting, row);
              await repo.save(maybeExisting);
            } else {
              // Re-throw if we couldn't resolve
              throw errInsert;
            }
          }
        }
      } catch (err) {
        // Log and continue processing other rows
        console.error('[DBService] Failed to upsert relatorio row:', err, row);
      }
    }

    return inserted;
  }
  async getLastRelatorioTimestamp(processedFile?: string) {
    await this.init();
    const qb = this.ds.getRepository(Relatorio).createQueryBuilder('r');
    if (processedFile) qb.where('r.processedFile = :pf', { pf: processedFile });
    qb.orderBy('r.Dia', 'DESC').addOrderBy('r.Hora', 'DESC').limit(1);
    const last = await qb.getOne();
    return last ? `${last.Dia ?? ''}T${last.Hora ?? ''}` : null;
  }

  /**
   * Remove all rows from all managed entities (keeps schema intact).
   */
  async clearAll() {
    await this.init();
    const entities = [Relatorio, MateriaPrima, Batch, Row, Estoque, MovimentacaoEstoque, CacheFile, Setting, User];
    // Use a transaction to ensure atomicity when supported
    const queryRunner = this.ds.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      for (const e of entities) {
        // Use manager.clear to remove all rows
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await queryRunner.manager.clear(e);
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      try {
        await queryRunner.rollbackTransaction();
      } catch {}
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Export a full JSON dump of selected tables. Optionally saves a file to disk
   * under runtime-config 'dumpDir' or env DUMP_DIR.
   */
  async exportDump(saveToFile = true) {
    await this.init();
    const out: any = { _meta: { generatedAt: new Date().toISOString(), useMysql: this.useMysql } };
    const entities: Record<string, any> = {
      Relatorio,
      MateriaPrima,
      Batch,
      Row,
      Estoque,
      MovimentacaoEstoque,
      Setting,
      User,
    };
    for (const k of Object.keys(entities)) {
      // @ts-ignore
      out[k] = await this.ds.getRepository(entities[k]).find();
    }

    // Optionally persist to disk
    let savedPath: string | undefined;
    try {
      if (saveToFile) {
        const runtime = getRuntimeConfig('ihm-config') || {};
        const dumpDir = runtime.dumpDir || process.env.DUMP_DIR || process.env.MYSQL_DUMP_DIR || 'dumps';
        const absDumpDir = path.isAbsolute(dumpDir) ? dumpDir : path.resolve(process.cwd(), String(dumpDir));
        if (!fs.existsSync(absDumpDir)) fs.mkdirSync(absDumpDir, { recursive: true });
        const fname = `dump-${Date.now()}.json`;
        savedPath = path.join(absDumpDir, fname);
        fs.writeFileSync(savedPath, JSON.stringify(out));
      }
    } catch (err) {
      // non-fatal — still return JSON
      console.warn('[DBService] Failed to save dump to disk:', err);
    }

    return { dump: out, savedPath };
  }

  /**
   * Import a previously exported dump object. This will clear existing data
   * for the targeted tables and insert the provided rows inside a transaction.
   */
  async importDump(dumpObj: any) {
    if (!dumpObj || typeof dumpObj !== 'object') throw new Error('Invalid dump');
    await this.init();
    const entitiesMap: Record<string, any> = {
      Relatorio,
      MateriaPrima,
      Batch,
      Row,
      Estoque,
      MovimentacaoEstoque,
      Setting,
      User,
    };

    const queryRunner = this.ds.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      for (const k of Object.keys(entitiesMap)) {
        const repo = queryRunner.manager.getRepository(entitiesMap[k]);
        // Clear existing rows
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await repo.clear();
        // Insert provided rows if present
        if (Array.isArray(dumpObj[k]) && dumpObj[k].length > 0) {
          // Use save which can insert arrays
          await repo.save(dumpObj[k]);
        }
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      try {
        await queryRunner.rollbackTransaction();
      } catch {}
      throw err;
    } finally {
      await queryRunner.release();
    }
    return { importedAt: new Date().toISOString() };
  }
}

export const dbService = new DBService();

// Export a runtime proxy that forwards to the current dbService.ds instance.
// This keeps existing imports like `AppDataSource.getRepository(...)` working
// even if we swap datasources at runtime (MySQL -> SQLite fallback).
export const AppDataSource: DataSource = new Proxy({} as any, {
  get(_target, prop: string | symbol) {
    const ds = (dbService as any).ds as DataSource | undefined;
    if (!ds) throw new Error('DataSource not available yet');
    // @ts-ignore
    const val = (ds as any)[prop];
    if (typeof val === 'function') return val.bind(ds);
    return val;
  },
  set(_target, prop: string | symbol, value) {
    const ds = (dbService as any).ds as DataSource | undefined;
    if (!ds) throw new Error('DataSource not available yet');
    // @ts-ignore
    (ds as any)[prop] = value;
    return true;
  }

});
