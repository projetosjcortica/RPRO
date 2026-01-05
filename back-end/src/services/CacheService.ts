import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';
import os from 'os';
import { BaseService } from '../core/baseService';
import { CacheFile, Setting } from '../entities/index';
import fs from 'fs';
import child_process from 'child_process';
import { BackupMeta } from '../core/utils';
import { log } from './backendLogger';

export class CacheService extends BaseService {
  ds: DataSource;
  private initPromise?: Promise<void> | null;
  private dbPath: string;
  private creatingDatasource = false;
  private deletingFile = false;
  constructor() {
    super('CacheService');
    // Detect if running in packaged Electron app (ASAR or Program Files path)
    const isPackaged = process.execPath.includes("Cortez.exe") || process.execPath.includes("electron.exe") || (process as any).resourcesPath || __dirname.includes("app.asar");
    
    // In packaged mode, use writable APPDATA location; in dev use project root
    let dbPath = process.env.CACHE_SQLITE_PATH;
    if (!dbPath) {
      dbPath = isPackaged 
        ? path.resolve(process.env.APPDATA || os.homedir(), "Cortez", "cache.sqlite")
        : path.resolve(process.cwd(), "cache.sqlite");
    }
    
    const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
    this.dbPath = absPath;
    
    console.log(`[CacheService] Using sqlite cache at: ${absPath} (isPackaged: ${isPackaged})`);
    
    // Try to ensure parent directory exists, but don't fail if it doesn't
    // The init() method will handle it more robustly
    try {
      const dir = path.dirname(absPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`[CacheService] Created cache directory: ${dir}`);
      }
    } catch (e) {
      console.warn(`[CacheService] Warning: could not create cache directory in constructor:`, e);
      // Continue anyway - init() will handle this
    }
    
    // Include Setting entity so runtime configs can be persisted into the cache DB.
    this.ds = new DataSource({ type: 'sqlite', database: absPath, synchronize: true, logging: false, entities: [CacheFile, Setting] });
  }
  async init() {
    // If already initialized, return
    if ((this.ds as any)?.isInitialized) {
      console.log(`[CacheService] DataSource already initialized`);
      return;
    }
    // If an initialization is in-flight, wait for it
    if (this.initPromise) {
      console.log(`[CacheService] Waiting for in-flight initialization...`);
      return this.initPromise;
    }
    // Otherwise start initialization and store promise so concurrent callers wait
    this.initPromise = (async () => {
      try {
        // Ensure parent directory exists before initializing DataSource
        try {
          const dir = path.dirname(this.dbPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`[CacheService] Created cache directory: ${dir}`);
          }
        } catch (e) {
          console.error(`[CacheService] Failed to create cache directory:`, e);
          throw new Error(`Cannot create cache directory: ${String(e)}`);
        }
        
        // If a deletion is in progress, wait until it finishes so we don't re-open the file
        while (this.deletingFile) {
          await new Promise((r) => setTimeout(r, 100));
        }
        if (!((this.ds as any)?.isInitialized)) {
          // prevent recursive datasource creation
          if (this.creatingDatasource) {
            console.log(`[CacheService] DataSource creation already in progress, waiting...`);
            // Wait for the in-progress creation to finish
            let attempts = 0;
            while (this.creatingDatasource && attempts < 50) {
              await new Promise((r) => setTimeout(r, 100));
              attempts++;
            }
            if ((this.ds as any)?.isInitialized) return;
            throw new Error('DataSource initialization timed out');
          }
          this.creatingDatasource = true;
          try {
            console.log(`[CacheService] Initializing DataSource for: ${this.dbPath}`);
            await this.ds.initialize();
            console.log(`[CacheService] ✅ DataSource initialized successfully`);
          } finally {
            this.creatingDatasource = false;
          }
        }
      } catch (err: any) {
        // reset promise so subsequent attempts can retry
        this.initPromise = null;
        log.error('CacheService', 'Falha ao inicializar DataSource', err, { dbPath: this.dbPath });
        throw err;
      }
    })();
    return this.initPromise;
  }
  async getByName(originalName: string): Promise<CacheFile | null> {
    await this.init();
    const repo = this.ds.getRepository(CacheFile);
    // case-insensitive search to avoid duplicate entries differing only by case
    const lowerName = String(originalName).toLowerCase();
    const qb = repo.createQueryBuilder('c').where('lower(c.originalName) = :n', { n: lowerName }).limit(1);
    return await qb.getOne();
  }

  async upsert(rec: Partial<CacheFile> & { originalName: string }) {
    await this.init();
    const repo = this.ds.getRepository(CacheFile);
    const lowerName = String(rec.originalName).toLowerCase();
    const existing = await repo.createQueryBuilder('c').where('lower(c.originalName) = :n', { n: lowerName }).getOne();
    if (existing) { Object.assign(existing, rec); return repo.save(existing); }
    return repo.save(repo.create(rec));
  }
  async recordBackupMeta(meta: BackupMeta, st: fs.Stats) {
    const mtime = st?.mtime ? new Date(st.mtime).toISOString() : null;
    await this.upsert({ originalName: meta.originalName, lastHash: meta.hash || null, lastSize: meta.size || null, lastMTime: mtime, lastProcessedAt: meta.createdAt });
  }

  async saveCache(entries: Array<{ name: string; size: number }>) {
    await this.init();
    const repo = this.ds.getRepository(CacheFile);
    for (const entry of entries) {
      // case-insensitive lookup
      const existing = await repo.createQueryBuilder('c').where('lower(c.originalName) = :n', { n: String(entry.name).toLowerCase() }).getOne();
      if (existing) {
        existing.lastSize = entry.size;
        await repo.save(existing);
      } else {
        const newRecord = repo.create({ originalName: entry.name, lastSize: entry.size });
        await repo.save(newRecord);
      }
    }
  }

  async getAllCache(): Promise<Array<{ name: string; size: number }>> {
    await this.init();
    const repo = this.ds.getRepository(CacheFile);
    const all = await repo.find();
    return all.map((c) => ({ name: c.originalName, size: c.lastSize || 0 }));
  }

  async clearAll() {
    await this.init();
    const repo = this.ds.getRepository(CacheFile);
    try {
      // try the high-level clear first
      await repo.clear();
    } catch (e: any) {
      // fallback to DELETE via QueryBuilder in case clear() maps to TRUNCATE or is unsupported
      try {
        log.warn('CacheService', 'repo.clear() falhou, usando delete fallback', { error: e?.message });
        await repo.createQueryBuilder().delete().execute();
      } catch (e2: any) {
        log.error('CacheService', 'Fallback delete também falhou', e2);
        throw e2;
      }
    }
  }

  /**
   * Close/destroy the underlying DataSource so the SQLite file is released.
   * This is useful before deleting the physical DB file.
   */
  async close() {
    try {
      if ((this.ds as any)?.isInitialized) {
        try {
          await this.ds.destroy();
        } catch (e) {
          console.warn('[CacheService] error while destroying datasource:', e);
        }
      }
      // recreate datasource instance so future init() will reinitialize cleanly
      this.ds = new DataSource({ type: 'sqlite', database: this.dbPath, synchronize: true, logging: false, entities: [CacheFile, Setting] });
    } finally {
      // allow re-init in the future
      this.initPromise = null;
    }
  }

  /** Delete the physical sqlite file backing the cache. Closes datasource first. */
  async deleteFile() {
    // Mark that deletion is in progress so init() will wait and not re-open the DB mid-delete
    this.deletingFile = true;
    try {
      try {
        await this.close();
      } catch (e) {
        console.warn('[CacheService] deleteFile: failed to close datasource:', e);
      }

      // Give the OS extra time to release file handles after datasource destruction
      await new Promise((r) => setTimeout(r, 500));

      if (!fs.existsSync(this.dbPath)) {
        return false;
      }

      // Try unlink with aggressive retries (handles transient Windows locks)
      const maxAttempts = 12;
      let attempt = 0;
      let lastErr: any = null;
      while (attempt < maxAttempts) {
        try {
          fs.unlinkSync(this.dbPath);
          console.log('[CacheService] cache sqlite file deleted:', this.dbPath);
          return true;
        } catch (err) {
          lastErr = err;
          // exponential backoff
          const delay = Math.min(100 * Math.pow(1.5, attempt), 2000);
          await new Promise((r) => setTimeout(r, delay));
          attempt += 1;
        }
      }

      // If we couldn't unlink, try to rename the file out of the way so future inits create a fresh DB
      try {
        const renamed = `${this.dbPath}.deleted.${Date.now()}`;
        fs.renameSync(this.dbPath, renamed);
        console.warn('[CacheService] cache sqlite file could not be unlinked but was renamed to:', renamed);
        // schedule an attempt to remove the renamed file on process exit (unlock usually released then)
        process.once('exit', () => {
          try {
            if (fs.existsSync(renamed)) fs.unlinkSync(renamed);
          } catch (e) {
            // nothing else to do
          }
        });
        return true;
      } catch (renameErr) {
        console.warn('[CacheService] rename fallback also failed:', renameErr, 'last unlink error:', lastErr);
        // Try a platform-specific force delete via shell as a last-ditch attempt
        try {
          if (process.platform === 'win32') {
            // Use PowerShell Remove-Item -Force
            const ps = `powershell.exe -NoProfile -Command Remove-Item -LiteralPath ${JSON.stringify(this.dbPath)} -Force -ErrorAction SilentlyContinue`;
            child_process.execSync(ps, { stdio: 'ignore' });
          } else {
            // POSIX: rm -f
            child_process.execSync(`rm -f ${this.dbPath}`, { stdio: 'ignore' });
          }
          if (!fs.existsSync(this.dbPath)) {
            console.log('[CacheService] cache sqlite file force-deleted via shell fallback:', this.dbPath);
            return true;
          }
        } catch (shellErr) {
          console.warn('[CacheService] shell force-delete fallback failed:', shellErr);
        }

        // As a last resort, schedule deletion of the original path on exit (may succeed after handles are released)
        process.once('exit', () => {
          try {
            if (fs.existsSync(this.dbPath)) fs.unlinkSync(this.dbPath);
          } catch (e) {
            // give up
          }
        });
        // propagate last unlink error so callers can log if desired
        throw lastErr || renameErr;
      }
    } finally {
      this.deletingFile = false;
    }
  }

  /**
   * Compatibilidade com collector: buscar cache por nome
   */
  async getCacheByName(name: string): Promise<{ lastProcessedLine?: number; lastModified?: string } | null> {
    const cached = await this.getByName(name);
    if (!cached) return null;
    
    return {
      lastProcessedLine: (cached as any).lastProcessedLine,
      lastModified: cached.lastMTime || undefined,
    };
  }

  /**
   * Compatibilidade com collector: atualizar cache
   */
  async updateCache(name: string, size: number, lastProcessedLine: number): Promise<void> {
    await this.upsert({
      originalName: name,
      lastSize: size,
      lastMTime: new Date().toISOString(),
      lastProcessedAt: new Date().toISOString(),
      ...(lastProcessedLine ? { lastProcessedLine } as any : {}),
    });
  }
}

export const cacheService = new CacheService();
