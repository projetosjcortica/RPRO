import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';
import { BaseService } from '../core/baseService';
import { CacheFile } from '../entities/index';
import fs from 'fs';
import child_process from 'child_process';
import { BackupMeta } from '../core/utils';

export class CacheService extends BaseService {
  ds: DataSource;
  private initPromise?: Promise<void> | null;
  private dbPath: string;
  private creatingDatasource = false;
  private deletingFile = false;
  constructor() {
    super('CacheService');
    const dbPath = process.env.CACHE_SQLITE_PATH || 'cache.sqlite';
    const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
    this.dbPath = absPath;
    this.ds = new DataSource({ type: 'sqlite', database: absPath, synchronize: true, logging: false, entities: [CacheFile] });
  }
  async init() {
    // If already initialized, return
    if ((this.ds as any)?.isInitialized) return;
    // If an initialization is in-flight, wait for it
    if (this.initPromise) return this.initPromise;
    // Otherwise start initialization and store promise so concurrent callers wait
    this.initPromise = (async () => {
      try {
        // If a deletion is in progress, wait until it finishes so we don't re-open the file
        while (this.deletingFile) {
          await new Promise((r) => setTimeout(r, 100));
        }
        if (!((this.ds as any)?.isInitialized)) {
          // prevent recursive datasource creation
          if (this.creatingDatasource) return;
          this.creatingDatasource = true;
          try {
            await this.ds.initialize();
          } finally {
            this.creatingDatasource = false;
          }
        }
      } catch (err) {
        // reset promise so subsequent attempts can retry
        this.initPromise = null;
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
    } catch (e) {
      // fallback to DELETE via QueryBuilder in case clear() maps to TRUNCATE or is unsupported
      try {
        console.warn('[CacheService] repo.clear() failed, falling back to delete:', String(e));
        await repo.createQueryBuilder().delete().execute();
      } catch (e2) {
        console.error('[CacheService] fallback delete also failed:', String(e2));
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
      this.ds = new DataSource({ type: 'sqlite', database: this.dbPath, synchronize: true, logging: false, entities: [CacheFile] });
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
}

export const cacheService = new CacheService();
