import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { BaseService } from '../core/baseService';
import { Relatorio, MateriaPrima, Batch, Row, CacheFile, User, Amendoim, AmendoimRaw } from '../entities/index';
import { getRuntimeConfig } from '../core/runtimeConfig';
import { log } from './backendLogger';

export class DBService extends BaseService {
  ds: DataSource;
  useMysql: boolean;
  sqlitePath?: string;
  private static dbChecked = false; // Cache: evita verificar DB repetidamente
  private initPromise: Promise<void> | null = null; // Previne múltiplas inicializações simultâneas
  private lastError: Error | null = null; // Último erro para diagnóstico
  
  constructor() {
    super('DBService');
    // Do not create DataSource here. We'll initialize it lazily inside init()
    // so runtime-provided 'db-config' values (loaded at server startup) are used.
    // Initialize ds with a placeholder; real DataSource will be created in init().
    // @ts-ignore - assign later in init
    this.ds = {} as DataSource;
    this.useMysql = process.env.USE_SQLITE !== 'true';
  }
  
  /**
   * Verifica se o banco está pronto para uso
   */
  isReady(): boolean {
    try {
      return this.ds && (this.ds as any).isInitialized === true;
    } catch {
      return false;
    }
  }
  
  /**
   * Retorna o último erro ocorrido (para diagnóstico)
   */
  getLastError(): Error | null {
    return this.lastError;
  }
  
  private async createDatabaseIfNotExists(host: string, port: number, user: string, pass: string, dbName: string) {
    // 🔧 OTIMIZAÇÃO: Pular verificação se já foi feita nesta sessão
    if (DBService.dbChecked) {
      return;
    }
    
    // Create a temporary connection without specifying a database
    const tempDs = new DataSource({
      type: 'mysql',
      host,
      port,
      username: user,
      password: pass,
      charset: 'utf8mb4',
      synchronize: false,
      logging: false,
      // 🔧 OTIMIZAÇÃO: Timeout reduzido para conexão temporária
      connectTimeout: 5000,
    });

    try {
      await tempDs.initialize();
      
      // Check if database exists
      const dbExists = await tempDs.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${dbName}'`
      );

      if (dbExists.length === 0) {
        console.info(`[DBService] Creating database '${dbName}'...`);
        await tempDs.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.info(`[DBService] Database '${dbName}' created successfully`);
      }
      
      DBService.dbChecked = true; // Marcar como verificado
    } finally {
      if (tempDs.isInitialized) {
        await tempDs.destroy();
      }
    }
  }

  async init() {
    // If ds already initialized, skip
    // @ts-ignore
    if ((this.ds && (this.ds as any).isInitialized)) return;

    // Prevenir múltiplas inicializações simultâneas
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInit();
    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  private async _doInit() {
    // Read runtime DB config (frontend may have saved 'db-config')
    const runtimeDb = getRuntimeConfig('db-config') || {};
    const finalHost = runtimeDb.serverDB ?? process.env.MYSQL_HOST ?? 'localhost';
    const finalPort = Number(runtimeDb.port ?? process.env.MYSQL_PORT ?? 3306);
    const finalUser = runtimeDb.userDB ?? process.env.MYSQL_USER ?? 'root';
    const finalPass = runtimeDb.passwordDB ?? process.env.MYSQL_PASSWORD ?? 'root';
    const finalDb = runtimeDb.database ?? process.env.MYSQL_DB ?? 'cadastro';

    const allEntities: any[] = [Relatorio, MateriaPrima, Batch, Row, CacheFile, User, Amendoim, AmendoimRaw];
    try {
      const schemaCfg = getRuntimeConfig('db-schemas');
      let selectedEntities = allEntities;
      if (Array.isArray(schemaCfg) && schemaCfg.length > 0) {
        const names = schemaCfg.map((s: any) => String(s).trim()).filter(Boolean);
        selectedEntities = allEntities.filter((e) => names.includes(e.name));
        console.info('[DBService] Using selected entities from runtime config:', names);
      }

      if (this.useMysql) {
        // First ensure database exists
        await this.createDatabaseIfNotExists(finalHost, finalPort, finalUser, finalPass, finalDb);

        // 🔧 OTIMIZAÇÃO: synchronize apenas em dev, não em produção
        const isDev = process.env.NODE_ENV !== 'production';
        const shouldSync = isDev || process.env.TYPEORM_SYNC === 'true';

        // Now connect to the specific database and sync schema
        this.ds = new DataSource({
          type: 'mysql',
          host: finalHost,
          port: finalPort,
          username: finalUser,
          password: finalPass,
          database: finalDb,
          charset: 'utf8mb4',
          synchronize: shouldSync,
          logging: isDev ? ['error', 'schema'] : ['error'],
          entities: selectedEntities,
          // 🔧 OTIMIZAÇÃO: Connection pooling
          extra: {
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0,
            connectTimeout: 10000,
          },
          // 🔧 OTIMIZAÇÃO: Cache de queries
          cache: {
            type: 'database',
            tableName: 'query_cache',
            duration: 30000, // 30 segundos
          },
        });
      } else {
        // Explicitly requested sqlite as primary environment
        // const dbPath = process.env.DATABASE_PATH || 'data.sqlite';
        // const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
        // this.sqlitePath = absPath;
        // const typeormSync = process.env.TYPEORM_SYNC !== 'false';
        // this.ds = new DataSource({
        //   type: 'sqlite',
        //   database: absPath,
        //   synchronize: typeormSync,
        //   logging: false,
        //   entities: selectedEntities,
        // });
        throw new Error('SQLite as primary database is not yet implemented.');

      }
      await this.ds.initialize();

      // Optionally convert existing database/tables to utf8mb4 if explicitly requested.
      // This is a potentially destructive operation (changes column encodings) so it is
      // only performed when env var `FORCE_CONVERT_TO_UTF8MB4=true` is set.
      if (this.useMysql && process.env.FORCE_CONVERT_TO_UTF8MB4 === 'true') {
        try {
          console.info('[DBService] FORCE_CONVERT_TO_UTF8MB4=true — converting database and tables to utf8mb4');
          await this.ds.query(`ALTER DATABASE \`${finalDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
          const tables: any[] = await this.ds.query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${finalDb}' AND TABLE_TYPE='BASE TABLE'`);
          for (const t of tables) {
            const tableName = t.TABLE_NAME || Object.values(t)[0];
            console.info(`[DBService] Converting table ${tableName} to utf8mb4`);
            await this.ds.query(`ALTER TABLE \`${tableName}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
          }
          console.info('[DBService] Conversion to utf8mb4 complete');
        } catch (convErr) {
          log.error('DBService', 'Failed to convert database/tables to utf8mb4', convErr);
          // Do not abort startup; conversion failure shouldn't prevent normal operation.
        }
      }

      return;
    } catch (err) {
      log.error('DBService', 'Database initialization failed', err, {
        host: finalHost,
        port: finalPort,
        user: finalUser,
        database: finalDb,
      });
      console.info('[DBService] Connection details:', {
        host: finalHost,
        port: finalPort,
        user: finalUser,
        database: finalDb,
      });

      // By default do NOT fallback to SQLite. Allow fallback only when explicitly enabled
      // through environment variable `ALLOW_SQLITE_FALLBACK=true`.
      if (this.useMysql && process.env.ALLOW_SQLITE_FALLBACK === 'true') {
        console.info('[DBService] ALLOW_SQLITE_FALLBACK=true — attempting fallback to SQLite');
        try {
          const dbPath = process.env.DATABASE_PATH || 'data.sqlite';
          const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
          this.sqlitePath = absPath;
          const shouldSync = !fs.existsSync(absPath) || process.env.FORCE_SQLITE_SYNC === 'true';
          console.info(`[DBService] Initializing SQLite at ${absPath} (sync: ${shouldSync})`);
          this.ds = new DataSource({
            type: 'sqlite',
            database: absPath,
            synchronize: true,
            logging: ['error', 'schema'],
            entities: allEntities,
          });
          await this.ds.initialize();
          this.useMysql = false;
          console.info('[DBService] Successfully switched to SQLite');
          this.lastError = null;
          return;
        } catch (err2) {
          console.error('[DBService] SQLite fallback also failed:', err2);
          this.lastError = new Error(`Database initialization failed - MySQL error: ${err}\nSQLite error: ${err2}`);
          throw this.lastError;
        }
      }

      this.lastError = new Error(`MySQL initialization failed and fallback disabled: ${err}`);
      throw this.lastError;
    }
  }
  async reconnect() {
    // Destroy existing connection if present and reinitialize using runtime configs
    try {
      // @ts-ignore
      if (this.ds && (this.ds as any).isInitialized) {
        await this.ds.destroy();
        // Reset data source placeholder
        // @ts-ignore
        this.ds = {} as DataSource;
      }
    } catch (e) {
      console.warn('[DBService] Error destroying existing data source during reconnect:', e);
    }
    // Reinitialize using updated runtime configs
    await this.init();
  }

  async testConnection(cfg?: { host?: string; port?: number; user?: string; password?: string; database?: string }) {
    const host = cfg?.host ?? getRuntimeConfig('db-config')?.serverDB ?? process.env.MYSQL_HOST ?? 'localhost';
    const port = Number(cfg?.port ?? getRuntimeConfig('db-config')?.port ?? process.env.MYSQL_PORT ?? 3306);
    const user = cfg?.user ?? getRuntimeConfig('db-config')?.userDB ?? process.env.MYSQL_USER ?? 'root';
    const pass = cfg?.password ?? getRuntimeConfig('db-config')?.passwordDB ?? process.env.MYSQL_PASSWORD ?? 'root';
    const dbName = cfg?.database ?? getRuntimeConfig('db-config')?.database ?? process.env.MYSQL_DB ?? 'cadastro';

    const testDs = new DataSource({
      type: 'mysql',
      host,
      port,
      username: user,
      password: pass,
      database: dbName,
      // Keep small footprint
      synchronize: false,
      logging: false,
      entities: [],
    });
    try {
      await testDs.initialize();
      await testDs.destroy();
      return true;
    } catch (e) {
      if (testDs.isInitialized) await testDs.destroy().catch(() => { });
      throw e;
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
      Form1: r.Form1 ?? r.form1 ?? 0,
      Form2: r.Form2 ?? r.form2 ?? 0,
      processedFile,
      Prod_1: r.Prod_1 ?? r.values?.[0] ?? 0,
      Prod_2: r.Prod_2 ?? r.values?.[1] ?? 0,
      Prod_3: r.Prod_3 ?? r.values?.[2] ?? 0,
      Prod_4: r.Prod_4 ?? r.values?.[3] ?? 0,
      Prod_5: r.Prod_5 ?? r.values?.[4] ?? 0,
      Prod_6: r.Prod_6 ?? r.values?.[5] ?? 0,
      Prod_7: r.Prod_7 ?? r.values?.[6] ?? 0,
      Prod_8: r.Prod_8 ?? r.values?.[7] ?? 0,
      Prod_9: r.Prod_9 ?? r.values?.[8] ?? 0,
      Prod_10: r.Prod_10 ?? r.values?.[9] ?? 0,
      Prod_11: r.Prod_11 ?? r.values?.[10] ?? 0,
      Prod_12: r.Prod_12 ?? r.values?.[11] ?? 0,
      Prod_13: r.Prod_13 ?? r.values?.[12] ?? 0,
      Prod_14: r.Prod_14 ?? r.values?.[13] ?? 0,
      Prod_15: r.Prod_15 ?? r.values?.[14] ?? 0,
      Prod_16: r.Prod_16 ?? r.values?.[15] ?? 0,
      Prod_17: r.Prod_17 ?? r.values?.[16] ?? 0,
      Prod_18: r.Prod_18 ?? r.values?.[17] ?? 0,
      Prod_19: r.Prod_19 ?? r.values?.[18] ?? 0,
      Prod_20: r.Prod_20 ?? r.values?.[19] ?? 0,
      Prod_21: r.Prod_21 ?? r.values?.[20] ?? 0,
      Prod_22: r.Prod_22 ?? r.values?.[21] ?? 0,
      Prod_23: r.Prod_23 ?? r.values?.[22] ?? 0,
      Prod_24: r.Prod_24 ?? r.values?.[23] ?? 0,
      Prod_25: r.Prod_25 ?? r.values?.[24] ?? 0,
      Prod_26: r.Prod_26 ?? r.values?.[25] ?? 0,
      Prod_27: r.Prod_27 ?? r.values?.[26] ?? 0,
      Prod_28: r.Prod_28 ?? r.values?.[27] ?? 0,
      Prod_29: r.Prod_29 ?? r.values?.[28] ?? 0,
      Prod_30: r.Prod_30 ?? r.values?.[29] ?? 0,
      Prod_31: r.Prod_31 ?? r.values?.[30] ?? 0,
      Prod_32: r.Prod_32 ?? r.values?.[31] ?? 0,
      Prod_33: r.Prod_33 ?? r.values?.[32] ?? 0,
      Prod_34: r.Prod_34 ?? r.values?.[33] ?? 0,
      Prod_35: r.Prod_35 ?? r.values?.[34] ?? 0,
      Prod_36: r.Prod_36 ?? r.values?.[35] ?? 0,
      Prod_37: r.Prod_37 ?? r.values?.[36] ?? 0,
      Prod_38: r.Prod_38 ?? r.values?.[37] ?? 0,
      Prod_39: r.Prod_39 ?? r.values?.[38] ?? 0,
      Prod_40: r.Prod_40 ?? r.values?.[39] ?? 0,
      Prod_41: r.Prod_41 ?? r.values?.[40] ?? 0,
      Prod_42: r.Prod_42 ?? r.values?.[41] ?? 0,
      Prod_43: r.Prod_43 ?? r.values?.[42] ?? 0,
      Prod_44: r.Prod_44 ?? r.values?.[43] ?? 0,
      Prod_45: r.Prod_45 ?? r.values?.[44] ?? 0,
      Prod_46: r.Prod_46 ?? r.values?.[45] ?? 0,
      Prod_47: r.Prod_47 ?? r.values?.[46] ?? 0,
      Prod_48: r.Prod_48 ?? r.values?.[47] ?? 0,
      Prod_49: r.Prod_49 ?? r.values?.[48] ?? 0,
      Prod_50: r.Prod_50 ?? r.values?.[49] ?? 0,
      Prod_51: r.Prod_51 ?? r.values?.[50] ?? 0,
      Prod_52: r.Prod_52 ?? r.values?.[51] ?? 0,
      Prod_53: r.Prod_53 ?? r.values?.[52] ?? 0,
      Prod_54: r.Prod_54 ?? r.values?.[53] ?? 0,
      Prod_55: r.Prod_55 ?? r.values?.[54] ?? 0,
      Prod_56: r.Prod_56 ?? r.values?.[55] ?? 0,
      Prod_57: r.Prod_57 ?? r.values?.[56] ?? 0,
      Prod_58: r.Prod_58 ?? r.values?.[57] ?? 0,
      Prod_59: r.Prod_59 ?? r.values?.[58] ?? 0,
      Prod_60: r.Prod_60 ?? r.values?.[59] ?? 0,
      Prod_61: r.Prod_61 ?? r.values?.[60] ?? 0,
      Prod_62: r.Prod_62 ?? r.values?.[61] ?? 0,
      Prod_63: r.Prod_63 ?? r.values?.[62] ?? 0,
      Prod_64: r.Prod_64 ?? r.values?.[63] ?? 0,
      Prod_65: r.Prod_65 ?? r.values?.[64] ?? 0,
    }));

    // ✅ OTIMIZADO: Bulk insert/upsert em lotes para melhor performance
    const BATCH_SIZE = 100; // Processar 100 linhas por vez
    let inserted = 0;
    
    // Primeiro, buscar todos os registros existentes de uma vez
    const existingRecords = await repo.find({
      where: { processedFile },
      select: ['id', 'Dia', 'Hora', 'Nome', 'processedFile']
    });
    
    // Criar um mapa para lookup rápido
    const existingMap = new Map<string, any>();
    for (const record of existingRecords) {
      const key = `${record.Dia}|${record.Hora}|${record.Nome}|${record.processedFile}`;
      existingMap.set(key, record);
    }
    
    // Separar entre novos e atualizações
    const toInsert: any[] = [];
    const toUpdate: any[] = [];
    
    for (const row of mapped) {
      const key = `${row.Dia}|${row.Hora}|${row.Nome}|${row.processedFile}`;
      const existing = existingMap.get(key);
      
      if (existing) {
        // Atualizar registro existente
        toUpdate.push({ ...row, id: existing.id });
      } else {
        // Novo registro
        toInsert.push(row);
      }
    }
    
    // Bulk insert em lotes
    if (toInsert.length > 0) {
      for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
        const batch = toInsert.slice(i, i + BATCH_SIZE);
        try {
          await repo.insert(batch);
          inserted += batch.length;
        } catch (err) {
          // Se falhar o batch, tentar um por um (fallback)
          console.warn('[DBService] Bulk insert failed, trying individual inserts:', String(err));
          for (const row of batch) {
            try {
              await repo.save(repo.create(row));
              inserted++;
            } catch (errIndividual) {
              console.error('[DBService] Failed to insert row:', errIndividual);
            }
          }
        }
      }
    }
    
    // Bulk update em lotes
    if (toUpdate.length > 0) {
      for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
        const batch = toUpdate.slice(i, i + BATCH_SIZE);
        try {
          await repo.save(batch);
        } catch (err) {
          // Se falhar o batch, tentar um por um (fallback)
          console.warn('[DBService] Bulk update failed, trying individual updates:', String(err));
          for (const row of batch) {
            try {
              await repo.save(row);
            } catch (errIndividual) {
              console.error('[DBService] Failed to update row:', errIndividual);
            }
          }
        }
      }
    }
    
    console.log(`[DBService] Processed ${mapped.length} rows: ${inserted} inserted, ${toUpdate.length} updated`);

    return inserted;
  }

  /**
   * Ensure the database schema is synchronized with the current entities.
   * This calls TypeORM synchronize() which will create missing tables/columns
   * without dropping existing data. Useful to fix installations where columns
   * are missing or out-of-sync.
   */
  async synchronizeSchema() {
    await this.init();
    // @ts-ignore
    if (this.ds && (this.ds as any).isInitialized) {
      try {
        await this.ds.synchronize();
        console.info('[DBService] Schema synchronization complete');
      } catch (e) {
        console.error('[DBService] Schema synchronization failed:', e);
        throw e;
      }
    } else {
      throw new Error('DataSource not initialized');
    }
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
    const entities = [Relatorio, MateriaPrima, Batch, Row, CacheFile, User, Amendoim, AmendoimRaw];
    // Use a transaction to ensure atomicity when supported
    const queryRunner = this.ds.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      
      // Disable foreign key checks temporarily
      if (this.useMysql) {
        await queryRunner.query('SET FOREIGN_KEY_CHECKS=0');
      } else {
        // SQLite
        await queryRunner.query('PRAGMA foreign_keys = OFF');
      }
      
      for (const e of entities) {
        // Use manager.clear to remove all rows
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await queryRunner.manager.clear(e);
      }
      
      // Re-enable foreign key checks
      if (this.useMysql) {
        await queryRunner.query('SET FOREIGN_KEY_CHECKS=1');
      } else {
        await queryRunner.query('PRAGMA foreign_keys = ON');
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
      User,
      Amendoim,
      AmendoimRaw,
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
      User,
      Amendoim,
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

  /**
   * Execute a SQL file directly against the database.
   * Useful for importing raw SQL dumps.
   * 
   * @param sqlFilePath - Path to the SQL file to execute
   * @param options - Execution options (failOnError, clearBefore, etc.)
   * @returns Execution result with status and details
   */
  async executeSqlFile(
    sqlFilePath: string, 
    options?: { 
      failOnError?: boolean; 
      clearBefore?: boolean;
      skipCreateTable?: boolean;
    }
  ): Promise<{ success: boolean; message: string; statementsExecuted?: number; statementsFailed?: number }> {
    await this.init();

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    
    // Split SQL into individual statements with improved parsing
    // Handle multi-line statements and various comment styles
    const statements = this.parseSqlStatements(sqlContent, options?.skipCreateTable);

    console.log(`[DBService] Executing ${statements.length} SQL statements from ${sqlFilePath}`);

    const queryRunner = this.ds.createQueryRunner();
    await queryRunner.connect();
    
    let executedCount = 0;
    let failedCount = 0;
    
    try {
      // Optionally clear tables before import
      if (options?.clearBefore) {
        console.log('[DBService] Clearing existing data before import...');
        await this.clearAll();
      }

      await queryRunner.startTransaction();
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await queryRunner.query(statement);
            executedCount++;
          } catch (err) {
            failedCount++;
            const preview = statement.substring(0, 100).replace(/\s+/g, ' ');
            console.warn(`[DBService] Statement ${executedCount + failedCount} failed: ${err}`, preview);
            
            // If failOnError is true, stop execution
            if (options?.failOnError) {
              throw err;
            }
            // Otherwise continue with other statements (default behavior)
          }
        }
      }
      
      await queryRunner.commitTransaction();
      
      return {
        success: true,
        message: `Executed ${executedCount}/${statements.length} SQL statements successfully`,
        statementsExecuted: executedCount,
        statementsFailed: failedCount
      };
    } catch (err) {
      try {
        await queryRunner.rollbackTransaction();
      } catch {}
      console.error('[DBService] SQL file execution failed:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Parse SQL content into individual statements
   * Handles comments, multi-line statements, and various SQL dialects
   */
  private parseSqlStatements(sqlContent: string, skipCreateTable?: boolean): string[] {
    const lines = sqlContent.split('\n');
    const statements: string[] = [];
    let currentStatement = '';
    let inMultilineComment = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Handle multi-line comments /* ... */
      if (trimmed.includes('/*')) {
        inMultilineComment = true;
      }
      if (inMultilineComment) {
        if (trimmed.includes('*/')) {
          inMultilineComment = false;
        }
        continue;
      }

      // Skip single-line comments
      if (trimmed.startsWith('--') || trimmed.startsWith('#')) {
        continue;
      }

      // Skip empty lines
      if (!trimmed) {
        continue;
      }

      // Skip CREATE TABLE if requested
      if (skipCreateTable && trimmed.toUpperCase().startsWith('CREATE TABLE')) {
        // Skip until we find the ending semicolon
        let depth = 0;
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '(') depth++;
          if (line[i] === ')') depth--;
          if (depth === 0 && line[i] === ';') break;
        }
        continue;
      }

      currentStatement += line + '\n';

      // Check if statement is complete (ends with semicolon)
      if (trimmed.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }

    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    return statements;
  }

  /**
   * Export database as SQL dump file
   * Compatible with both MySQL and SQLite
   * 
   * @param outputPath - Optional path for the dump file
   * @returns Path to the generated dump file
   */
  async exportSqlDump(outputPath?: string): Promise<{ filePath: string; size: number; tables: string[] }> {
    await this.init();

    // Generate default output path if not provided
    if (!outputPath) {
      const runtime = getRuntimeConfig('ihm-config') || {};
      const dumpDir = runtime.dumpDir || process.env.DUMP_DIR || 'dumps';
      const absDumpDir = path.isAbsolute(dumpDir) ? dumpDir : path.resolve(process.cwd(), dumpDir);
      if (!fs.existsSync(absDumpDir)) fs.mkdirSync(absDumpDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      outputPath = path.join(absDumpDir, `dump_${timestamp}.sql`);
    }

    console.log(`[DBService] Exporting SQL dump to: ${outputPath}`);

    const entities = [Relatorio, MateriaPrima, Batch, Row, User, Amendoim];
    const exportedTables: string[] = [];
    let sqlContent = '';

    // Add header
    sqlContent += `-- SQL Dump Generated by RPRO\n`;
    sqlContent += `-- Date: ${new Date().toISOString()}\n`;
    sqlContent += `-- Database: ${this.useMysql ? 'MySQL' : 'SQLite'}\n\n`;

    // Disable foreign key checks for import
    if (this.useMysql) {
      sqlContent += `SET FOREIGN_KEY_CHECKS=0;\n\n`;
    }

    // Export each table
    for (const entity of entities) {
      const repo = this.ds.getRepository(entity);
      const tableName = repo.metadata.tableName;
      const rows = await repo.find();

      if (rows.length === 0) {
        console.log(`[DBService] Skipping empty table: ${tableName}`);
        continue;
      }

      exportedTables.push(tableName);
      console.log(`[DBService] Exporting ${rows.length} rows from ${tableName}`);

      sqlContent += `-- Table: ${tableName}\n`;
      
      // Get column names
      const columns = repo.metadata.columns.map(col => col.databaseName);
      
      // Generate INSERT statements
      for (const row of rows) {
        const values = columns.map(col => {
          const value = (row as any)[col];
          
          if (value === null || value === undefined) {
            return 'NULL';
          }
          
          if (typeof value === 'string') {
            // Escape single quotes
            return `'${value.replace(/'/g, "''")}'`;
          }
          
          if (typeof value === 'number') {
            return value.toString();
          }
          
          if (typeof value === 'boolean') {
            return value ? '1' : '0';
          }
          
          if (value instanceof Date) {
            return `'${value.toISOString().substring(0, 10)}'`;
          }
          
          return `'${String(value).replace(/'/g, "''")}'`;
        });

        sqlContent += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
      }

      sqlContent += `\n`;
    }

    // Re-enable foreign key checks
    if (this.useMysql) {
      sqlContent += `SET FOREIGN_KEY_CHECKS=1;\n`;
    }

    // Write to file
    fs.writeFileSync(outputPath, sqlContent, 'utf-8');
    const fileSize = fs.statSync(outputPath).size;

    console.log(`[DBService] SQL dump exported successfully: ${(fileSize / 1024).toFixed(2)} KB`);

    return {
      filePath: outputPath,
      size: fileSize,
      tables: exportedTables
    };
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
