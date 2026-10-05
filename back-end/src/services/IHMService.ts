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

type ParsedListEntry = {
  name: string;
  size: number;
  type: number | string;
  isFile: boolean;
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
    this.remotePath = this.normalizeRemotePath(remotePath);

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

  private normalizeRemotePath(remotePath: string): string {
    try {
      const raw = String(remotePath || '').trim().replace(/\\/g, '/');
      if (!raw) return '/';

      let normalized = raw.replace(/\/+/g, '/');
      if (normalized.toLowerCase().includes('.csv')) {
        let dir = path.posix.dirname(normalized);
        if (!dir || dir === '.' || dir === '') dir = '/';
        normalized = dir;
        console.log(`[IHMService] Normalized remotePath from '${remotePath}' to directory '${normalized}'`);
      }

      if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
      }

      return normalized || '/';
    } catch {
      return String(remotePath || '/');
    }
  }

  private getRemotePathCandidates(profile: ConnectionProfile): string[] {
    const raw = this.normalizeRemotePath(this.remotePath);
    const candidates = new Set<string>();

    const addCandidate = (candidate: string | null | undefined) => {
      const normalized = this.normalizeRemotePath(String(candidate || ''));
      if (!normalized) return;
      candidates.add(normalized);
    };

    addCandidate(raw);

    if (raw !== '/') {
      addCandidate(raw.replace(/^\/+/, ''));
      addCandidate(`/${raw.replace(/^\/+/, '')}`);
    }

    if (profile.mode === 'ftp') {
      candidates.add('.');
    }

    return Array.from(candidates).filter(Boolean);
  }

  private isDirectoryEntry(file: RemoteFileEntry): boolean {
    if (typeof file.isFile === 'boolean') return !file.isFile;
    return file.type === 'd' || file.type === 'dir' || file.type === 2;
  }

  private looksLikeFileName(name: string): boolean {
    const trimmed = String(name || '').trim();
    if (!trimmed) return false;
    if (trimmed === '.' || trimmed === '..') return false;
    return /\.[a-z0-9]{1,8}$/i.test(trimmed);
  }

  private mapRemoteEntries(list: any): RemoteFileEntry[] {
    return (Array.isArray(list) ? list : []).map((entry: any) => ({
      name: String(entry?.name || ''),
      size: typeof entry?.size === 'number' ? entry.size : Number(entry?.size || 0),
      type: entry?.type,
      isFile: typeof entry?.isFile === 'boolean' ? entry.isFile : undefined,
    }));
  }

  private joinRemotePath(base: string, name: string): string {
    if (base === '/' || base === '') return `/${name}`;
    if (base === '.') return name;
    return path.posix.join(base, name);
  }

  private async resolveCaseInsensitiveDirectory(
    client: any,
    profile: ConnectionProfile
  ): Promise<{ directory: string; list: RemoteFileEntry[] } | null> {
    const normalized = this.normalizeRemotePath(this.remotePath);
    const isAbsolute = normalized.startsWith('/');
    const segments = normalized.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    let current = isAbsolute ? '/' : '.';

    for (const segment of segments) {
      let currentList: RemoteFileEntry[];
      try {
        currentList = this.mapRemoteEntries(await client.list(current));
      } catch (error) {
        consoleLog(
          `[IHMService] ${this.cachePrefix} - Failed listing parent directory '${current}' while resolving case-insensitive ${profile.label} path: ${error instanceof Error ? error.message : error}`
        );
        return null;
      }

      const matched = currentList.find((entry) => {
        if (!entry.name) return false;
        if (entry.name.toLowerCase() !== segment.toLowerCase()) return false;
        return this.isDirectoryEntry(entry);
      });

      if (!matched) {
        return null;
      }

      current = this.joinRemotePath(current, matched.name);
    }

    try {
      const list = this.mapRemoteEntries(await client.list(current));
      consoleLog(
        `[IHMService] ${this.cachePrefix} - ${profile.label} directory resolved case-insensitively: configured='${this.remotePath}' -> using='${current}'`
      );
      return { directory: current, list };
    } catch (error) {
      consoleLog(
        `[IHMService] ${this.cachePrefix} - Failed listing resolved case-insensitive ${profile.label} directory '${current}': ${error instanceof Error ? error.message : error}`
      );
      return null;
    }
  }

  private async resolveRemoteDirectory(
    client: any,
    profile: ConnectionProfile
  ): Promise<{ directory: string; list: RemoteFileEntry[] }> {
    const candidates = this.getRemotePathCandidates(profile);
    let lastError: any = null;

    for (const candidate of candidates) {
      try {
        const list = await client.list(candidate);
        consoleLog(
          `[IHMService] ${this.cachePrefix} - ${profile.label} directory resolved: configured='${this.remotePath}' -> using='${candidate}'`
        );
        return {
          directory: candidate,
          list: this.mapRemoteEntries(list),
        };
      } catch (error) {
        lastError = error;
        consoleLog(
          `[IHMService] ${this.cachePrefix} - Failed listing ${profile.label} directory candidate '${candidate}': ${error instanceof Error ? error.message : error}`
        );
      }
    }

    const caseInsensitiveMatch = await this.resolveCaseInsensitiveDirectory(client, profile);
    if (caseInsensitiveMatch) {
      return caseInsensitiveMatch;
    }

    throw lastError ?? new Error(`Nao foi possivel listar o diretorio remoto '${this.remotePath}'`);
  }

  private async enterFtpDirectoryCaseInsensitive(client: FtpClient): Promise<string | null> {
    const normalized = this.normalizeRemotePath(this.remotePath);
    const segments = normalized.split('/').filter(Boolean);

    if (normalized === '/' || segments.length === 0) {
      await client.cd('/');
      return '/';
    }

    if (normalized.startsWith('/')) {
      await client.cd('/');
    }

    for (const segment of segments) {
      const currentList = this.mapRemoteEntries(await client.list());
      const matched = currentList.find((entry) => {
        if (!entry.name) return false;
        if (entry.name.toLowerCase() !== segment.toLowerCase()) return false;
        return this.isDirectoryEntry(entry);
      });

      if (!matched) {
        return null;
      }

      await client.cd(matched.name);
    }

    try {
      return await client.pwd();
    } catch {
      return normalized;
    }
  }

  private async enterFtpRemoteDirectory(client: FtpClient): Promise<string> {
    const candidates = this.getRemotePathCandidates({ mode: 'ftp', label: 'FTP', port: 21 });
    let lastError: any = null;

    for (const candidate of candidates) {
      try {
        await client.cd(candidate);
        const resolved = await client.pwd().catch(() => candidate);
        consoleLog(
          `[IHMService] ${this.cachePrefix} - FTP directory resolved via cd: configured='${this.remotePath}' -> using='${resolved}'`
        );
        return resolved;
      } catch (error) {
        lastError = error;
        consoleLog(
          `[IHMService] ${this.cachePrefix} - Failed changing to FTP directory candidate '${candidate}': ${error instanceof Error ? error.message : error}`
        );
      }
    }

    try {
      const caseInsensitiveResolved = await this.enterFtpDirectoryCaseInsensitive(client);
      if (caseInsensitiveResolved) {
        consoleLog(
          `[IHMService] ${this.cachePrefix} - FTP directory resolved case-insensitively via cd: configured='${this.remotePath}' -> using='${caseInsensitiveResolved}'`
        );
        return caseInsensitiveResolved;
      }
    } catch (error) {
      lastError = error;
      consoleLog(
        `[IHMService] ${this.cachePrefix} - Failed case-insensitive FTP cd resolution: ${error instanceof Error ? error.message : error}`
      );
    }

    throw lastError ?? new Error(`Nao foi possivel acessar o diretorio remoto '${this.remotePath}'`);
  }

  private async resolveAndListRemoteFiles(
    client: any,
    profile: ConnectionProfile
  ): Promise<{ directory: string; list: RemoteFileEntry[] }> {
    if (profile.mode === 'ftp') {
      const resolvedRemoteDir = await this.enterFtpRemoteDirectory(client as FtpClient);
      const list = this.mapRemoteEntries(await client.list());
      consoleLog(`[IHMService] ${this.cachePrefix} - Changed to FTP directory: ${resolvedRemoteDir}`);
      return { directory: resolvedRemoteDir, list };
    }

    return this.resolveRemoteDirectory(client, profile);
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
      console.log(`[IHMService] ${this.cachePrefix} - CONEXÃO OK: ${profile.label} conectado em ${this.ip}:${profile.port}`);
      return client;
    }

    const client = new FtpClient();
    client.ftp.verbose = false;
    client.parseList = ((rawList: string) => this.parseRawFtpList(rawList) as any) as any;
    await client.access({
      host: this.ip,
      port: profile.port,
      user: this.user,
      password: this.password,
      secure: false
    });
    console.log(`[IHMService] ${this.cachePrefix} - CONEXÃO OK: ${profile.label} conectado em ${this.ip}:${profile.port}`);
    return client;
  }

  private parseRawFtpList(rawList: string): ParsedListEntry[] {
    const lines = String(rawList || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.toLowerCase().startsWith('total'));

    return lines
      .map((line) => this.parseRawFtpLine(line))
      .filter((entry): entry is ParsedListEntry => Boolean(entry));
  }

  private parseRawFtpLine(line: string): ParsedListEntry | null {
    const mlsdMatch = line.match(/^([^ ]+?);(?:\s+)?(.+)$/);
    if (mlsdMatch) {
      const facts = mlsdMatch[1].split(';').filter(Boolean);
      const name = String(mlsdMatch[2] || '').trim();
      const factMap = new Map<string, string>();
      for (const fact of facts) {
        const idx = fact.indexOf('=');
        if (idx > -1) {
          factMap.set(fact.slice(0, idx).toLowerCase(), fact.slice(idx + 1));
        }
      }
      const typeFact = String(factMap.get('type') || '').toLowerCase();
      const isDir = typeFact === 'dir' || typeFact === 'cdir' || typeFact === 'pdir';
      return {
        name,
        size: Number(factMap.get('size') || 0),
        type: isDir ? 2 : 1,
        isFile: !isDir,
      };
    }

    const unixMatch = line.match(/^([\-dl])([rwx\-]{9})\s+\d+\s+\S+\s+\S+\s+(\d+)\s+\w+\s+\d+\s+[\d:]+\s+(.+)$/i);
    if (unixMatch) {
      const entryType = unixMatch[1];
      return {
        name: String(unixMatch[4] || '').trim(),
        size: Number(unixMatch[3] || 0),
        type: entryType === 'd' ? 2 : 1,
        isFile: entryType !== 'd',
      };
    }

    const dosMatch = line.match(/^(\d{2}-\d{2}-\d{2,4})\s+(\d{2}:\d{2}(?:AM|PM)?)\s+(<DIR>|\d+)\s+(.+)$/i);
    if (dosMatch) {
      const marker = String(dosMatch[3] || '').toUpperCase();
      const isDir = marker === '<DIR>';
      return {
        name: String(dosMatch[4] || '').trim(),
        size: isDir ? 0 : Number(marker || 0),
        type: isDir ? 2 : 1,
        isFile: !isDir,
      };
    }

    const tokens = line.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return null;
    const guessedName = tokens[tokens.length - 1];
    if (!guessedName || guessedName === '.' || guessedName === '..') return null;
    const sizeToken = [...tokens].reverse().find((token) => /^\d+$/.test(token));
    return {
      name: guessedName,
      size: Number(sizeToken || 0),
      type: this.looksLikeFileName(guessedName) ? 1 : 0,
      isFile: this.looksLikeFileName(guessedName),
    };
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

  private async downloadFile(
    client: any,
    profile: ConnectionProfile,
    resolvedRemoteDir: string,
    remoteFileName: string,
    localPath: string
  ): Promise<void> {
    try {
      if (profile.mode === 'sftp') {
        const remoteFilePath = path.posix.join(resolvedRemoteDir || '/', String(remoteFileName));
        await client.fastGet(remoteFilePath, localPath);
        console.log(`[IHMService] ${this.cachePrefix} - CSV BAIXADO COM SUCESSO: ${remoteFileName} -> ${localPath}`);
        return;
      }

      await client.downloadTo(localPath, String(remoteFileName), 0);
      console.log(`[IHMService] ${this.cachePrefix} - CSV BAIXADO COM SUCESSO: ${remoteFileName} -> ${localPath}`);
    } catch (error) {
      console.error(`[IHMService] ${this.cachePrefix} - FALHA NO DOWNLOAD do CSV ${remoteFileName}:`, error);
      throw error;
    }
  }

  private isRegularFile(file: RemoteFileEntry): boolean {
    if (typeof file.isFile === 'boolean') return file.isFile;
    if (this.isDirectoryEntry(file)) return false;
    return file.type === '-' || file.type === 'f' || file.type === 'file' || file.type === 1;
  }

  private shouldTreatAsFile(file: RemoteFileEntry): boolean {
    if (this.isRegularFile(file)) return true;
    if (this.isDirectoryEntry(file)) return false;
    return this.looksLikeFileName(file.name);
  }

  private logListedEntries(profile: ConnectionProfile, list: RemoteFileEntry[]): void {
    const summary = list.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      isFile: file.isFile,
      treatedAsFile: this.shouldTreatAsFile(file),
    }));
    consoleLog(
      `[IHMService] ${this.cachePrefix} - Raw ${profile.label} entries: ${JSON.stringify(summary)}`
    );
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

      const { directory: resolvedRemoteDir, list } = await this.resolveAndListRemoteFiles(client, profile);
      consoleLog(`[IHMService] ${this.cachePrefix} - Found ${list.length} files on ${profile.label} server`);

      if (list.length === 0) {
        consoleLog(`[IHMService] ${this.cachePrefix} - No files found on ${profile.label} server.`);
        return [];
      }

      this.logListedEntries(profile, list);
      const csvs = list.filter((file) => this.shouldTreatAsFile(file) && file.name.toLowerCase().endsWith('.csv'));
      consoleLog(`[IHMService] ${this.cachePrefix} - Found ${csvs.length} CSV files: ${csvs.map((file) => file.name).join(', ')}`);

      const newFiles = csvs.filter(this.filterNewFiles());
      consoleLog(`[IHMService] ${this.cachePrefix} - ${newFiles.length} files to download: ${newFiles.map((file) => file.name).join(', ')}`);

      const results: Array<{ name: string; localPath: string; size: number }> = [];
      for (const file of newFiles) {
        const local = path.join(localDir, file.name);
        consoleLog(`[IHMService] ${this.cachePrefix} - Downloading ${file.name} to ${local}`);
        await this.downloadFile(client, profile, resolvedRemoteDir, file.name, local);
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

      const { directory: resolvedRemoteDir, list } = await this.resolveAndListRemoteFiles(client, profile);
      this.logListedEntries(profile, list);
      let targetFile = list.find((file) => this.shouldTreatAsFile(file) && file.name === fileName);

      if (!targetFile) {
        targetFile = list.find(
          (file) => this.shouldTreatAsFile(file) && String(file.name || '').toLowerCase() === String(fileName || '').toLowerCase()
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
      await this.downloadFile(client, profile, resolvedRemoteDir, targetFile.name, local);

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

      const { list } = await this.resolveAndListRemoteFiles(client, profile);
      const csvFiles = list
        .filter((file) => this.shouldTreatAsFile(file) && file.name.toLowerCase().endsWith('.csv'))
        .filter((file) => {
          const name = file.name.toLowerCase();
          return !name.endsWith('_2.csv') && !name.includes('_sys');
        })
        .map((file) => file.name);

      this.logListedEntries(profile, list);
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
