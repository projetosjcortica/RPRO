import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';
import { BaseService } from '../core/baseService';
import { CacheFile } from '../entities/index';
import fs from 'fs';
import { BackupMeta } from '../core/utils';

export class CacheService extends BaseService {
  ds: DataSource;
  private initPromise?: Promise<void> | null;
  constructor() {
    super('CacheService');
    const dbPath = process.env.CACHE_SQLITE_PATH || 'cache.sqlite';
    const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
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
        if (!((this.ds as any)?.isInitialized)) await this.ds.initialize();
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
    await repo.clear();
  }
}

export const cacheService = new CacheService();
