import { BaseService } from '../core/baseService';
import { Client } from 'basic-ftp';
import path from 'path';
import fs from 'fs';
import { cacheService } from './CacheService';
import { dbService } from './dbService';

export class IHMService extends BaseService {
  private cache: Map<string, number>; // nome do arquivo -> tamanho do arquivo

  constructor(private ip: string, private user = 'anonymous', private password = '') {
    super('IHMService');
    this.cache = new Map(); // mapa para armazenar o cache e identificar arquivos novos
    cacheService.init().catch(() => { /* ignore */ });
  }

  async salvarCacheNoDB() {
    try {
      const cacheEntries = Array.from(this.cache.entries()).map(([name, size]) => ({ name, size }));
      await cacheService.saveCache(cacheEntries);
    } catch (error) {
      console.error('Error saving cache to database:', error);
    }
  }

  filterNewFiles() {
    return (f: { name: string; size: number }) => {
      if (!f.name.toLowerCase().endsWith('.csv')) return false;
      if (f.name.toLowerCase().includes('_sys')) return false;
      if (f.size <= 0) return false;
      if (/Relatorio_[2-9]\.csv$/i.test(f.name)) return false;
      const cachedSize = this.cache.get(f.name);
      if (cachedSize != null && cachedSize === f.size) return false;
      this.cache.set(f.name, f.size);
      return true;
    };
  }

  async findAndDownloadNewFiles(localDir: string) {
    const client = new Client();
    try {
      await client.access({ host: this.ip, user: this.user, password: this.password, secure: false });
      await client.useDefaultSettings();
      await client.cd('/InternalStorage/data/');
      const list = await client.list();
      const csvs = list.filter((f: any) => f.isFile && f.name.toLowerCase().endsWith('.csv'));
      const newFiles = csvs.filter(this.filterNewFiles());
      const results: Array<{ name: string; localPath: string; size: number }> = [];
      for (const f of newFiles) {
        const local = path.join(localDir, f.name);
        await client.downloadTo(local, f.name, 0);
        const stat = fs.statSync(local);
        results.push({ name: f.name, localPath: local, size: stat.size });
      }
      await this.salvarCacheNoDB();
      return results;
    } finally {
      client.close();
    }
  }

  async processAndSaveToDB(files: Array<{ name: string; localPath: string; size: number }>) {
    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}`);
        const result = await dbService.insertRelatorioRows([], file.localPath);
        console.log(`Inserted ${result} rows from ${file.name}`);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }
  }
}
