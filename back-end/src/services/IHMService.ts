import { BaseService } from '../core/baseService';
import { Client } from 'basic-ftp';
import path from 'path';
import fs from 'fs';
import { cacheService } from './CacheService';
import { dbService } from './dbService';
import { log } from 'console';

export class IHMService extends BaseService {
  private cache: Map<string, number>; // chave em lower-case do nome do arquivo -> tamanho do arquivo
  // map lower-case name -> last seen original case name (preserve original casing for DB writes)
  private originalNames: Map<string, string>;

  constructor(private ip: string, private user = 'anonymous', private password = '') {
    super('IHMService');
    this.cache = new Map(); // mapa para armazenar o cache e identificar arquivos novos
    this.originalNames = new Map();
    // Initialize cache DB and then load saved cache entries into memory so
    // we can compare remote file sizes across restarts.
    cacheService
      .init()
      .then(() => cacheService.getAllCache())
      .then((entries) => {
        for (const e of entries) {
          try {
            // store cache by lower-case name to avoid case-sensitivity issues
            const key = String(e.name).toLowerCase();
            this.cache.set(key, Number(e.size) || 0);
            this.originalNames.set(key, e.name);
          } catch (err) {
            console.warn('[IHMService] failed to load cache entry', e, err);
          }
        }
        if (entries.length > 0) {
          console.log('[IHMService] loaded cache entries from DB:', entries.length);
        }
      })
      .catch((e) => {
        console.warn('[IHMService] failed to initialize cacheService:', String(e));
      });
  }

  async salvarCacheNoDB() {
    try {
      // Persist cache using original-casing when available
      const cacheEntries = Array.from(this.cache.entries()).map(([key, size]) => {
        const original = this.originalNames.get(key) || key;
        return { name: original, size };
      });
      await cacheService.saveCache(cacheEntries);
    } catch (error) {
      console.error('Error saving cache to database:', error);
    }
  }

  filterNewFiles() {
    return (f: { name: string; size: number }) => {
      log(`[IHMService] Checking file: ${f.name}, size: ${f.size}`);
      if (!f.name.toLowerCase().endsWith('.csv')) {
        log(`[IHMService] Skipping non-CSV file: ${f.name}`);
        return false;
      }
      if (f.name.toLowerCase().includes('_sys')) {
        log(`[IHMService] Skipping system file: ${f.name}`);
        return false;
      }
      const sizeNum = typeof f.size === 'number' ? f.size : Number(f.size || 0);
      if (!Number.isFinite(sizeNum) || sizeNum <= 0) {
        log(`[IHMService] Skipping file with invalid size: ${f.name}`);
        return false;
      }
      // normalize key to lower-case to compare against cache (avoid case mismatch)
      const key = String(f.name).toLowerCase();
      const cachedSize = this.cache.get(key);
      if (cachedSize != null && cachedSize === sizeNum) {
        log(`[IHMService] File ${f.name} unchanged (size: ${sizeNum}), skipping`);
        return false;
      }
      // update cache and remember original-casing name
      this.cache.set(key, sizeNum);
      this.originalNames.set(key, f.name);
      log(`[IHMService] File ${f.name} is new or changed (old size: ${cachedSize}, new size: ${sizeNum})`);
      return true;
    };
  }

  async findAndDownloadNewFiles(localDir: string) {
    const client = new Client();
    try {
      log(`[IHMService] Connecting to FTP server: ${this.ip}`);
      await client.access({ host: this.ip, user: this.user, password: this.password, secure: false });
      await client.useDefaultSettings();
      await client.cd('/InternalStorage/data/');
      const list = await client.list(); 
      log(`[IHMService] Found ${list.length} files on FTP server`);
      if (list.length === 0) {
        log('[IHMService] No files found on FTP server.');
        return [];
      }
      const csvs = list.filter((f: any) => f.isFile && f.name.toLowerCase().endsWith('.csv'));
      log(`[IHMService] Found ${csvs.length} CSV files: ${csvs.map(f => f.name).join(', ')}`);
       
      const newFiles =  csvs.filter(this.filterNewFiles());
      log(`[IHMService] ${newFiles.length} files to download: ${newFiles.map(f => f.name).join(', ')}`);
      
      const results: Array<{ name: string; localPath: string; size: number }> = [];
      for (const f of newFiles) {
        const local = path.join(localDir, f.name);
        log(`[IHMService] Downloading ${f.name} to ${local}`);
        await client.downloadTo(local, f.name, 0);
        const stat = fs.statSync(local);
        results.push({ name: f.name, localPath: local, size: stat.size });
        log(`[IHMService] Downloaded ${f.name} (${stat.size} bytes)`);
      }
      await this.salvarCacheNoDB();
      log(`[IHMService] Download completed, ${results.length} files processed`);
      return results;
    } catch (error) {
      log(`[IHMService] Error during FTP operation: ${error}`);
      throw error;
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

