import { Client as FtpClient } from 'basic-ftp';
import fs from 'fs';
import { log as consoleLog } from 'console';
import path from 'path';
import SftpClient from 'ssh2-sftp-client';
import { getRuntimeConfig } from '../core/runtimeConfig';
import { BaseService } from '../core/baseService';
import { cacheService } from './CacheService';
import { log as backendLog } from './backendLogger';
import { dbService } from './dbService';

type ConnectionMode = 'ftp' | 'sftp';

type ConnectionProfile = {
  mode: ConnectionMode;
  label: 'FTP' | 'SFTP';
  port: number;
};

type RemoteFileEntry = {
  name: string;
  size: number;
  type?: string | number;
  isFile?: boolean;
};

export class IHMService extends BaseService {
  private cache: Map<string, number>;
  private originalNames: Map<string, string>;
  private remotePath: string;
  private cachePrefix: string;

  constructor(
    private ip: string,
    private user = 'Admin',
    private password = '',
    remotePath = '/public/internalStorage/data',
    private useSftp?: boolean
  ) {
    super('IHMService');
    this.cache = new Map();
    this.originalNames = new Map();

    try {
      const rp = String(remotePath || '').trim();
      if (rp.toLowerCase().includes('.csv')) {
        let dir = path.posix.dirname(rp);
        if (!dir || dir === '.' || dir === '') dir = '/';
        this.remotePath = dir;
        console.log(`[IHMService] Normalized remotePath from '${remotePath}' to directory '${this.remotePath}'`);
      } else {
        this.remotePath = remotePath;
      }
    } catch {
      this.remotePath = remotePath;
    }

    this.cachePrefix = `ihm_${ip.replace(/\./g, '_')}`;
    console.log(`[IHMService] Inicializando com cache prefix: ${this.cachePrefix}`);

    cacheService
      .init()
      .then(() => cacheService.getAllCache())
      .then((entries: any[]) => {
        const myEntries = entries.filter((entry: any) => {
          const name = String(entry.name);
          return name.startsWith(this.cachePrefix + '_');
        });

        for (const entry of myEntries) {
          try {
            const name = String(entry.name);
            const realName = name.replace(this.cachePrefix + '_', '');
            const key = realName.toLowerCase();
            this.cache.set(key, Number(entry.size) || 0);
            this.originalNames.set(key, realName);
          } catch (error) {
            console.warn('[IHMService] failed to load cache entry', entry, error);
          }
        }

        if (myEntries.length > 0) {
          console.log(`[IHMService] ${this.cachePrefix} - loaded ${myEntries.length} cache entries from DB`);
        }
      })
      .catch((error) => {
        console.warn('[IHMService] failed to initialize cacheService:', String(error));
      });
  }

  private resolveConnectionProfile(): ConnectionProfile {
    if (typeof this.useSftp === 'boolean') {
      return this.useSftp
        ? { mode: 'sftp', label: 'SFTP', port: 22 }
        : { mode: 'ftp', label: 'FTP', port: 21 };
    }

    const runtimeIhmCfg = getRuntimeConfig('ihm-config') || {};
    const useSftp = this.parseSftpFlag(runtimeIhmCfg.sftp);
    return useSftp
      ? { mode: 'sftp', label: 'SFTP', port: 22 }
      : { mode: 'ftp', label: 'FTP', port: 21 };
  }

  private parseSftpFlag(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') return true;
      if (normalized === 'false') return false;
    }
    return Boolean(value);
  }

  private async connectClient(profile: ConnectionProfile): Promise<any> {
    if (profile.mode === 'sftp') {
      const client = new SftpClient();
      await client.connect({
        host: this.ip,
        port: profile.port,
        username: this.user,
        password: this.password
      });
      return client;
    }

    const client = new FtpClient();
    client.ftp.verbose = false;
    await client.access({
      host: this.ip,
      port: profile.port,
      user: this.user,
      password: this.password,
      secure: false
    });
    return client;
  }

  private async closeClient(client: any, profile: ConnectionProfile): Promise<void> {
    if (!client) return;

    try {
      if (profile.mode === 'sftp') {
        await client.end();
      } else {
        client.close();
      }
    } catch (error) {
      console.warn(`[IHMService] ${this.cachePrefix} - failed to close ${profile.label} client`, error);
    }
  }

  private async listRemoteFiles(client: any, _profile: ConnectionProfile): Promise<RemoteFileEntry[]> {
    const list = await client.list(this.remotePath);
    return (Array.isArray(list) ? list : []).map((entry: any) => ({
      name: String(entry?.name || ''),
      size: typeof entry?.size === 'number' ? entry.size : Number(entry?.size || 0),
      type: entry?.type,
      isFile: typeof entry?.isFile === 'boolean' ? entry.isFile : undefined,
    }));
  }

  private async downloadFile(
    client: any,
    profile: ConnectionProfile,
    remoteFileName: string,
    localPath: string
  ): Promise<void> {
    const remoteFilePath = path.posix.join(this.remotePath || '/', String(remoteFileName));

    if (profile.mode === 'sftp') {
      await client.fastGet(remoteFilePath, localPath);
      return;
    }

    await client.downloadTo(localPath, remoteFilePath);
  }

  private isRegularFile(file: RemoteFileEntry): boolean {
    if (typeof file.isFile === 'boolean') return file.isFile;
    return file.type === '-' || file.type === 'f' || file.type === 'file' || file.type === 1;
  }

  async salvarCacheNoDB() {
    try {
      const cacheEntries = Array.from(this.cache.entries()).map(([key, size]) => {
        const original = this.originalNames.get(key) || key;
        return { name: `${this.cachePrefix}_${original}`, size };
      });
      await cacheService.saveCache(cacheEntries);
      console.log(`[IHMService] ${this.cachePrefix} - saved ${cacheEntries.length} cache entries`);
    } catch (error) {
      backendLog.error('IHMService', `${this.cachePrefix} - Erro ao salvar cache no banco`, error, {
        cachePrefix: this.cachePrefix
      });
    }
  }

  getCacheKey(fileName: string): string {
    return `${this.cachePrefix}_${String(fileName)}`;
  }

  filterNewFiles() {
    return (file: { name: string; size: number }) => {
      consoleLog(`[IHMService] ${this.cachePrefix} - Checking file: ${file.name}, size: ${file.size}`);

      if (!file.name.toLowerCase().endsWith('.csv')) {
        consoleLog(`[IHMService] ${this.cachePrefix} - Skipping non-CSV file: ${file.name}`);
        return false;
      }

      if (file.name.endsWith('_2.csv')) {
        consoleLog(`[IHMService] ${this.cachePrefix} - Skipping duplicate file: ${file.name}`);
        return false;
      }

      if (file.name.toLowerCase().includes('_sys')) {
        consoleLog(`[IHMService] ${this.cachePrefix} - Skipping system file: ${file.name}`);
        return false;
      }

      if (file.name.toLowerCase().endsWith('_2.csv')) {
        consoleLog(`[IHMService] ${this.cachePrefix} - Skipping system file: ${file.name}`);
        return false;
      }

      const sizeNum = typeof file.size === 'number' ? file.size : Number(file.size || 0);
      if (!Number.isFinite(sizeNum) || sizeNum <= 0) {
        consoleLog(`[IHMService] ${this.cachePrefix} - Skipping file with invalid size: ${file.name}`);
        return false;
      }

      const key = String(file.name).toLowerCase();
      const cachedSize = this.cache.get(key);

      if (cachedSize != null && cachedSize === sizeNum) {
        consoleLog(`[IHMService] ${this.cachePrefix} - File ${file.name} unchanged (size: ${sizeNum}), skipping`);
        return false;
      }

      this.cache.set(key, sizeNum);
      this.originalNames.set(key, file.name);
      consoleLog(
        `[IHMService] ${this.cachePrefix} - File ${file.name} is new or changed (old size: ${cachedSize}, new size: ${sizeNum})`
      );
      return true;
    };
  }

  async findAndDownloadNewFiles(localDir: string) {
    const profile = this.resolveConnectionProfile();
    let client: any = null;

    try {
      consoleLog(`[IHMService] ${this.cachePrefix} - Connecting to ${profile.label} server: ${this.ip}:${profile.port}`);
      client = await this.connectClient(profile);
      consoleLog(`[IHMService] ${this.cachePrefix} - Listing directory: ${this.remotePath}`);

      const list = await this.listRemoteFiles(client, profile);
      consoleLog(`[IHMService] ${this.cachePrefix} - Found ${list.length} files on ${profile.label} server`);

      if (list.length === 0) {
        consoleLog(`[IHMService] ${this.cachePrefix} - No files found on ${profile.label} server.`);
        return [];
      }

      const csvs = list.filter((file) => this.isRegularFile(file) && file.name.toLowerCase().endsWith('.csv'));
      consoleLog(`[IHMService] ${this.cachePrefix} - Found ${csvs.length} CSV files: ${csvs.map((file) => file.name).join(', ')}`);

      const newFiles = csvs.filter(this.filterNewFiles());
      consoleLog(`[IHMService] ${this.cachePrefix} - ${newFiles.length} files to download: ${newFiles.map((file) => file.name).join(', ')}`);

      const results: Array<{ name: string; localPath: string; size: number }> = [];
      for (const file of newFiles) {
        const local = path.join(localDir, file.name);
        consoleLog(`[IHMService] ${this.cachePrefix} - Downloading ${file.name} to ${local}`);
        await this.downloadFile(client, profile, file.name, local);
        const stat = fs.statSync(local);
        results.push({ name: file.name, localPath: local, size: stat.size });
        consoleLog(`[IHMService] ${this.cachePrefix} - Downloaded ${file.name} (${stat.size} bytes)`);
      }

      await this.salvarCacheNoDB();
      consoleLog(`[IHMService] ${this.cachePrefix} - Download completed, ${results.length} files processed`);
      return results;
    } catch (error) {
      backendLog.error('IHMService', `${this.cachePrefix} - Erro durante operacao ${profile.label}`, error, {
        ip: this.ip,
        port: profile.port,
        protocol: profile.mode,
        remotePath: this.remotePath
      });
      throw error;
    } finally {
      await this.closeClient(client, profile);
    }
  }

  async processAndSaveToDB(files: Array<{ name: string; localPath: string; size: number }>) {
    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}`);
        const result = await dbService.insertRelatorioRows([], file.localPath);
        console.log(`Inserted ${result} rows from ${file.name}`);
      } catch (error) {
        backendLog.error('IHMService', `Erro ao processar arquivo ${file.name}`, error, {
          fileName: file.name,
          localPath: file.localPath
        });
      }
    }
  }

  async forceDownloadFile(
    fileName: string,
    localDir: string
  ): Promise<{ name: string; localPath: string; size: number } | null> {
    const profile = this.resolveConnectionProfile();
    let client: any = null;

    try {
      consoleLog(`[IHMService] ${this.cachePrefix} - [FORCE] Connecting to ${profile.label}: ${this.ip}:${profile.port}`);
      client = await this.connectClient(profile);

      const list = await this.listRemoteFiles(client, profile);
      let targetFile = list.find((file) => this.isRegularFile(file) && file.name === fileName);

      if (!targetFile) {
        targetFile = list.find(
          (file) => this.isRegularFile(file) && String(file.name || '').toLowerCase() === String(fileName || '').toLowerCase()
        );

        if (targetFile) {
          backendLog.warn(
            'IHMService',
            `${this.cachePrefix} - [FORCE] Arquivo encontrado por case-insensitive: ${fileName} -> ${targetFile.name}`,
            { fileName, foundName: targetFile.name }
          );
        }
      }

      if (!targetFile) {
        consoleLog(`[IHMService] ${this.cachePrefix} - [FORCE] Arquivo nao encontrado: ${fileName}`);
        return null;
      }

      const local = path.join(localDir, fileName);
      consoleLog(`[IHMService] ${this.cachePrefix} - [FORCE] Baixando ${fileName} para ${local}`);
      await this.downloadFile(client, profile, targetFile.name, local);

      const stat = fs.statSync(local);
      const key = String(fileName).toLowerCase();
      const sizeNum = typeof targetFile.size === 'number' ? targetFile.size : Number(targetFile.size || 0);
      this.cache.set(key, sizeNum);
      this.originalNames.set(key, fileName);

      consoleLog(`[IHMService] ${this.cachePrefix} - [FORCE] Download concluido: ${fileName} (${stat.size} bytes)`);
      return { name: fileName, localPath: local, size: stat.size };
    } catch (error) {
      backendLog.error('IHMService', `${this.cachePrefix} - [FORCE] Erro no download forcado`, error, {
        fileName,
        localDir,
        ip: this.ip,
        port: profile.port,
        protocol: profile.mode
      });
      throw error;
    } finally {
      await this.closeClient(client, profile);
    }
  }

  async listarArquivosCSV(): Promise<string[]> {
    const profile = this.resolveConnectionProfile();
    let client: any = null;

    try {
      consoleLog(`[IHMService] ${this.cachePrefix} - Listando CSVs no ${profile.label}: ${this.ip}:${profile.port}`);
      client = await this.connectClient(profile);

      const list = await this.listRemoteFiles(client, profile);
      const csvFiles = list
        .filter((file) => this.isRegularFile(file) && file.name.toLowerCase().endsWith('.csv'))
        .filter((file) => {
          const name = file.name.toLowerCase();
          return !name.endsWith('_2.csv') && !name.includes('_sys');
        })
        .map((file) => file.name);

      consoleLog(`[IHMService] ${this.cachePrefix} - Encontrados ${csvFiles.length} arquivos CSV`);
      return csvFiles;
    } catch (error) {
      backendLog.error('IHMService', `${this.cachePrefix} - Erro ao listar arquivos CSV`, error, {
        ip: this.ip,
        port: profile.port,
        protocol: profile.mode,
        remotePath: this.remotePath
      });
      throw error;
    } finally {
      await this.closeClient(client, profile);
    }
  }
}
