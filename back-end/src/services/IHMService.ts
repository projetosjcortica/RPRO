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
  private remotePath: string;
  private cachePrefix: string; // Identificador único para cache desta IHM

  constructor(private ip: string, private user = 'anonymous', private password = '', remotePath = '/InternalStorage/data/') {
    super('IHMService');
    this.cache = new Map(); // mapa para armazenar o cache e identificar arquivos novos
    this.originalNames = new Map();
    this.remotePath = remotePath;
    // Criar prefixo único baseado no IP para separar caches
    this.cachePrefix = `ihm_${ip.replace(/\./g, '_')}`;
    console.log(`[IHMService] Inicializando com cache prefix: ${this.cachePrefix}`);
    // Initialize cache DB and then load saved cache entries into memory so
    // we can compare remote file sizes across restarts.
    cacheService
      .init()
      .then(() => cacheService.getAllCache())
      .then((entries) => {
        // Filtrar apenas entradas deste IP específico
        const myEntries = entries.filter(e => {
          const name = String(e.name);
          return name.startsWith(this.cachePrefix + '_');
        });
        
        for (const e of myEntries) {
          try {
            // Remover o prefixo para obter o nome real do arquivo
            const name = String(e.name);
            const realName = name.replace(this.cachePrefix + '_', '');
            const key = realName.toLowerCase();
            this.cache.set(key, Number(e.size) || 0);
            this.originalNames.set(key, realName);
          } catch (err) {
            console.warn('[IHMService] failed to load cache entry', e, err);
          }
        }
        if (myEntries.length > 0) {
          console.log(`[IHMService] ${this.cachePrefix} - loaded ${myEntries.length} cache entries from DB`);
        }
      })
      .catch((e) => {
        console.warn('[IHMService] failed to initialize cacheService:', String(e));
      });
  }

  async salvarCacheNoDB() {
    try {
      // Persist cache using original-casing when available
      // Adicionar prefixo do IP para separar caches por IHM
      const cacheEntries = Array.from(this.cache.entries()).map(([key, size]) => {
        const original = this.originalNames.get(key) || key;
        // Incluir prefixo único desta IHM no nome armazenado
        return { name: `${this.cachePrefix}_${original}`, size };
      });
      await cacheService.saveCache(cacheEntries);
      console.log(`[IHMService] ${this.cachePrefix} - saved ${cacheEntries.length} cache entries`);
    } catch (error) {
      console.error(`[IHMService] ${this.cachePrefix} - Error saving cache to database:`, error);
    }
  }

  filterNewFiles() {
    return (f: { name: string; size: number }) => {
      log(`[IHMService] ${this.cachePrefix} - Checking file: ${f.name}, size: ${f.size}`);
      if (!f.name.toLowerCase().endsWith('.csv')) {
        log(`[IHMService] ${this.cachePrefix} - Skipping non-CSV file: ${f.name}`);
        return false;
      }
      if (f.name.endsWith('_2.csv')) { 
        log(`[IHMService] ${this.cachePrefix} - Skipping duplicate file: ${f.name}`);
        return false;
      }
      if (f.name.toLowerCase().includes('_sys')) {
        log(`[IHMService] ${this.cachePrefix} - Skipping system file: ${f.name}`);
        return false;
      }
      if (f.name.toLowerCase().endsWith('_2.csv')) {
        log(`[IHMService] ${this.cachePrefix} - Skipping system file: ${f.name}`);
        return false;
      }
      const sizeNum = typeof f.size === 'number' ? f.size : Number(f.size || 0);
      if (!Number.isFinite(sizeNum) || sizeNum <= 0) {
        log(`[IHMService] ${this.cachePrefix} - Skipping file with invalid size: ${f.name}`);
        return false;
      }
      // normalize key to lower-case to compare against cache (avoid case mismatch)
      const key = String(f.name).toLowerCase();
      const cachedSize = this.cache.get(key);
      if (cachedSize != null && cachedSize === sizeNum) {
        log(`[IHMService] ${this.cachePrefix} - File ${f.name} unchanged (size: ${sizeNum}), skipping`);
        return false;
      }
      // update cache and remember original-casing name
      this.cache.set(key, sizeNum);
      this.originalNames.set(key, f.name);
      log(`[IHMService] ${this.cachePrefix} - File ${f.name} is new or changed (old size: ${cachedSize}, new size: ${sizeNum})`);
      return true;
    };
  }

  async findAndDownloadNewFiles(localDir: string) {
    const client = new Client();
    try {
      log(`[IHMService] ${this.cachePrefix} - Connecting to FTP server: ${this.ip}`);
      await client.access({ host: this.ip, user: this.user, password: this.password, secure: false });
      await client.useDefaultSettings();
      await client.cd(this.remotePath);
      log(`[IHMService] ${this.cachePrefix} - Changed to directory: ${this.remotePath}`);
      const list = await client.list(); 
      log(`[IHMService] ${this.cachePrefix} - Found ${list.length} files on FTP server`);
      if (list.length === 0) {
        log(`[IHMService] ${this.cachePrefix} - No files found on FTP server.`);
        return [];
      }
      const csvs = list.filter((f: any) => f.isFile && f.name.toLowerCase().endsWith('.csv'));
      log(`[IHMService] ${this.cachePrefix} - Found ${csvs.length} CSV files: ${csvs.map(f => f.name).join(', ')}`);
       
      const newFiles =  csvs.filter(this.filterNewFiles());
      log(`[IHMService] ${this.cachePrefix} - ${newFiles.length} files to download: ${newFiles.map(f => f.name).join(', ')}`);
      
      const results: Array<{ name: string; localPath: string; size: number }> = [];
      for (const f of newFiles) {
        const local = path.join(localDir, f.name);
        log(`[IHMService] ${this.cachePrefix} - Downloading ${f.name} to ${local}`);
        await client.downloadTo(local, f.name, 0);
        const stat = fs.statSync(local);
        results.push({ name: f.name, localPath: local, size: stat.size });
        log(`[IHMService] ${this.cachePrefix} - Downloaded ${f.name} (${stat.size} bytes)`);
      }
      await this.salvarCacheNoDB();
      log(`[IHMService] ${this.cachePrefix} - Download completed, ${results.length} files processed`);
      return results;
    } catch (error) {
      log(`[IHMService] ${this.cachePrefix} - Error during FTP operation: ${error}`);
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

  /**
   * Baixa um arquivo específico do IHM, SEMPRE, ignorando cache de tamanho.
   * Usado para coleta incremental onde precisamos ler o conteúdo mesmo sem mudança de tamanho.
   */
  async forceDownloadFile(fileName: string, localDir: string): Promise<{ name: string; localPath: string; size: number } | null> {
    const client = new Client();
    try {
      log(`[IHMService] ${this.cachePrefix} - [FORCE] Connecting to FTP: ${this.ip}`);
      await client.access({ host: this.ip, user: this.user, password: this.password, secure: false });
      await client.useDefaultSettings();
      await client.cd(this.remotePath);
      
      const list = await client.list();
      const targetFile = list.find((f: any) => f.isFile && f.name === fileName);
      
      if (!targetFile) {
        log(`[IHMService] ${this.cachePrefix} - [FORCE] Arquivo não encontrado: ${fileName}`);
        return null;
      }

      const local = path.join(localDir, fileName);
      log(`[IHMService] ${this.cachePrefix} - [FORCE] Baixando ${fileName} para ${local}`);
      await client.downloadTo(local, fileName, 0);
      const stat = fs.statSync(local);
      
      // Atualizar cache interno
      const key = String(fileName).toLowerCase();
      const sizeNum = typeof targetFile.size === 'number' ? targetFile.size : Number(targetFile.size || 0);
      this.cache.set(key, sizeNum);
      this.originalNames.set(key, fileName);
      
      log(`[IHMService] ${this.cachePrefix} - [FORCE] Download concluído: ${fileName} (${stat.size} bytes)`);
      return { name: fileName, localPath: local, size: stat.size };
    } catch (error) {
      log(`[IHMService] ${this.cachePrefix} - [FORCE] Erro: ${error}`);
      throw error;
    } finally {
      client.close();
    }
  }
}
