import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';
import { BaseService } from '../core/baseService';
import { CacheFile } from '../entities/index';
import fs from 'fs';
import { BackupMeta } from '../core/utils';

export class CacheService extends BaseService {
  ds: DataSource;
  constructor() {
    super('CacheService');
    const dbPath = process.env.CACHE_SQLITE_PATH || 'cache.sqlite';
    const absPath = path.isAbsolute(dbPath) ? dbPath : path.resolve(process.cwd(), dbPath);
    this.ds = new DataSource({ type: 'sqlite', database: absPath, synchronize: true, logging: false, entities: [CacheFile] });
  }
  async init() { if (!this.ds.isInitialized) await this.ds.initialize(); }
  async getByName(originalName: string): Promise<CacheFile | null> { await this.init(); return this.ds.getRepository(CacheFile).findOne({ where: { originalName } }); }
  async upsert(rec: Partial<CacheFile> & { originalName: string }) {
    await this.init();
    const repo = this.ds.getRepository(CacheFile);
    const existing = await repo.findOne({ where: { originalName: rec.originalName } });
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
      const existing = await repo.findOne({ where: { originalName: entry.name } });
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
}

export const cacheService = new CacheService();
