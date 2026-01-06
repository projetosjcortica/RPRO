import fs from 'fs';
import path from 'path';
import os from 'os';
import { BaseService } from '../core/baseService';
import { log } from './backendLogger';

/**
 * PersistenceService - Sistema robusto de persistência com múltiplos fallbacks
 * 
 * Este serviço garante que dados SEMPRE sejam salvos em pelo menos um local:
 * 1. SQLite (via ConfigService/CacheService) - mais confiável em dev
 * 2. JSON Fallback - mais confiável em dist/packaged
 * 3. db-config.json - para compatibilidade legacy
 * 
 * Funcionamento:
 * - SALVAR: Tenta SQLite, depois JSON fallback, depois arquivo JSON
 *   Se QUALQUER um funcionar, sucesso!
 * - LER: SQLite → JSON fallback → arquivo JSON → defaults
 * - Retorna SEMPRE feedback detalhado sobre quais locais conseguiram salvar
 */

export interface PersistenceResult {
  success: boolean;
  savedIn: Array<'sqlite' | 'json-fallback' | 'json-file'>;
  failedIn: Array<'sqlite' | 'json-fallback' | 'json-file'>;
  errors: Record<string, string>;
  timestamp: string;
}

export class PersistenceService extends BaseService {
  private jsonFallbackPath: string;
  private isDev: boolean;

  constructor() {
    super('PersistenceService');
    this.isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    
    // JSON Fallback path (sempre em APPDATA/Cortez em production, project root em dev)
    const isPackaged = 
      process.execPath.includes('Cortez.exe') || 
      process.execPath.includes('electron.exe') || 
      (process as any).resourcesPath || 
      __dirname.includes('app.asar');
    
    this.jsonFallbackPath = isPackaged
      ? path.resolve(process.env.APPDATA || os.homedir(), 'Cortez', 'runtime-config-fallback.json')
      : path.resolve(process.cwd(), 'runtime-config-fallback.json');

    log.info('PersistenceService', `Inicializado (isDev: ${this.isDev}, fallbackPath: ${this.jsonFallbackPath})`);
  }

  /**
   * Salvar dados em múltiplos locais com fallback automático
   * @param key Chave do dado
   * @param value Valor (será stringificado se for objeto)
   * @param sqliteSaver Função que salva no SQLite (configService.setSetting)
   * @returns Resultado detalhado da operação
   */
  async save(
    key: string,
    value: any,
    sqliteSaver?: (k: string, v: string) => Promise<void>
  ): Promise<PersistenceResult> {
    const result: PersistenceResult = {
      success: false,
      savedIn: [],
      failedIn: [],
      errors: {},
      timestamp: new Date().toISOString(),
    };

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    // 1. Tentar salvar no SQLite
    if (sqliteSaver) {
      try {
        await sqliteSaver(key, stringValue);
        result.savedIn.push('sqlite');
        log.info('PersistenceService', `Salvo em SQLite: ${key}`);
      } catch (e: any) {
        result.failedIn.push('sqlite');
        result.errors.sqlite = e?.message || String(e);
        log.warn('PersistenceService', `Falha ao salvar em SQLite: ${key}`, { error: e?.message });
      }
    }

    // 2. Tentar salvar em JSON Fallback (fallback principal)
    try {
      await this.saveJsonFallback(key, value);
      result.savedIn.push('json-fallback');
      log.info('PersistenceService', `Salvo em JSON Fallback: ${key}`);
    } catch (e: any) {
      result.failedIn.push('json-fallback');
      result.errors['json-fallback'] = e?.message || String(e);
      log.warn('PersistenceService', `Falha ao salvar em JSON Fallback: ${key}`, { error: e?.message });
    }

    // 3. Tentar salvar em arquivo JSON (compatibilidade legacy)
    try {
      await this.saveJsonFile(key, value);
      result.savedIn.push('json-file');
      log.info('PersistenceService', `Salvo em arquivo JSON: ${key}`);
    } catch (e: any) {
      result.failedIn.push('json-file');
      result.errors['json-file'] = e?.message || String(e);
      log.warn('PersistenceService', `Falha ao salvar em arquivo JSON: ${key}`, { error: e?.message });
    }

    // Sucesso se QUALQUER local conseguiu salvar
    result.success = result.savedIn.length > 0;

    if (!result.success) {
      log.error('PersistenceService', `FALHA CRÍTICA: Não foi possível salvar ${key} em nenhum local!`, {
        errors: result.errors,
      });
    }

    return result;
  }

  /**
   * Salvar múltiplas chaves de uma vez
   */
  async saveBatch(
    obj: Record<string, any>,
    sqliteSaver?: (obj: Record<string, any>) => Promise<void>
  ): Promise<PersistenceResult> {
    const result: PersistenceResult = {
      success: false,
      savedIn: [],
      failedIn: [],
      errors: {},
      timestamp: new Date().toISOString(),
    };

    // 1. Tentar salvar no SQLite
    if (sqliteSaver) {
      try {
        await sqliteSaver(obj);
        result.savedIn.push('sqlite');
        log.info('PersistenceService', `Batch salvo em SQLite (${Object.keys(obj).length} chaves)`);
      } catch (e: any) {
        result.failedIn.push('sqlite');
        result.errors.sqlite = e?.message || String(e);
        log.warn('PersistenceService', `Falha ao salvar batch em SQLite`, { error: e?.message });
      }
    }

    // 2. Tentar salvar em JSON Fallback
    try {
      await this.saveBatchJsonFallback(obj);
      result.savedIn.push('json-fallback');
      log.info('PersistenceService', `Batch salvo em JSON Fallback (${Object.keys(obj).length} chaves)`);
    } catch (e: any) {
      result.failedIn.push('json-fallback');
      result.errors['json-fallback'] = e?.message || String(e);
      log.warn('PersistenceService', `Falha ao salvar batch em JSON Fallback`, { error: e?.message });
    }

    // 3. Tentar salvar em arquivo JSON
    try {
      await this.saveBatchJsonFile(obj);
      result.savedIn.push('json-file');
      log.info('PersistenceService', `Batch salvo em arquivo JSON (${Object.keys(obj).length} chaves)`);
    } catch (e: any) {
      result.failedIn.push('json-file');
      result.errors['json-file'] = e?.message || String(e);
      log.warn('PersistenceService', `Falha ao salvar batch em arquivo JSON`, { error: e?.message });
    }

    result.success = result.savedIn.length > 0;

    if (!result.success) {
      log.error('PersistenceService', `FALHA CRÍTICA: Não foi possível salvar batch em nenhum local!`, {
        keys: Object.keys(obj),
        errors: result.errors,
      });
    }

    return result;
  }

  /**
   * Ler valor tentando múltiplas fontes
   */
  async read(
    key: string,
    sqliteReader?: (k: string) => Promise<string | null>,
    defaultValue?: any
  ): Promise<any> {
    // 1. Tentar SQLite
    if (sqliteReader) {
      try {
        const value = await sqliteReader(key);
        if (value !== null) {
          log.debug('PersistenceService', `Lido de SQLite: ${key}`);
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
      } catch (e: any) {
        log.debug('PersistenceService', `Falha ao ler de SQLite: ${key}`, { error: e?.message });
      }
    }

    // 2. Tentar JSON Fallback
    try {
      const value = await this.readJsonFallback(key);
      if (value !== null) {
        log.debug('PersistenceService', `Lido de JSON Fallback: ${key}`);
        return value;
      }
    } catch (e: any) {
      log.debug('PersistenceService', `Falha ao ler de JSON Fallback: ${key}`, { error: e?.message });
    }

    // 3. Tentar arquivo JSON
    try {
      const value = await this.readJsonFile(key);
      if (value !== null) {
        log.debug('PersistenceService', `Lido de arquivo JSON: ${key}`);
        return value;
      }
    } catch (e: any) {
      log.debug('PersistenceService', `Falha ao ler de arquivo JSON: ${key}`, { error: e?.message });
    }

    // 4. Retornar default ou null
    return defaultValue ?? null;
  }

  // ============= Métodos privados para JSON Fallback =============

  private async saveJsonFallback(key: string, value: any): Promise<void> {
    const config = await this.readJsonFallbackFile();
    config[key] = typeof value === 'string' ? value : JSON.stringify(value);
    await this.writeJsonFallbackFile(config);
  }

  private async saveBatchJsonFallback(obj: Record<string, any>): Promise<void> {
    const config = await this.readJsonFallbackFile();
    for (const [k, v] of Object.entries(obj)) {
      config[k] = typeof v === 'string' ? v : JSON.stringify(v);
    }
    await this.writeJsonFallbackFile(config);
  }

  private async readJsonFallback(key: string): Promise<any> {
    const config = await this.readJsonFallbackFile();
    const value = config[key];
    if (value === undefined) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  private async readJsonFallbackFile(): Promise<Record<string, any>> {
    try {
      if (fs.existsSync(this.jsonFallbackPath)) {
        const data = fs.readFileSync(this.jsonFallbackPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (e) {
      log.warn('PersistenceService', `Erro ao ler JSON Fallback`, { path: this.jsonFallbackPath, error: e });
    }
    return {};
  }

  private async writeJsonFallbackFile(config: Record<string, any>): Promise<void> {
    const dir = path.dirname(this.jsonFallbackPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.jsonFallbackPath, JSON.stringify(config, null, 2), 'utf8');
  }

  // ============= Métodos privados para arquivo JSON legacy =============

  private getJsonFilePath(key: string): string {
    const isPackaged = 
      process.execPath.includes('Cortez.exe') || 
      process.execPath.includes('electron.exe') || 
      (process as any).resourcesPath || 
      __dirname.includes('app.asar');
    
    return isPackaged
      ? path.resolve(process.env.APPDATA || os.homedir(), 'Cortez', `${key}.json`)
      : path.resolve(process.cwd(), `${key}.json`);
  }

  private async saveJsonFile(key: string, value: any): Promise<void> {
    const filePath = this.getJsonFilePath(key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const content = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
  }

  private async saveBatchJsonFile(obj: Record<string, any>): Promise<void> {
    for (const [k, v] of Object.entries(obj)) {
      await this.saveJsonFile(k, v);
    }
  }

  private async readJsonFile(key: string): Promise<any> {
    const filePath = this.getJsonFilePath(key);
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        try {
          return JSON.parse(data);
        } catch {
          return data;
        }
      }
    } catch (e) {
      log.warn('PersistenceService', `Erro ao ler arquivo JSON: ${key}`, { path: filePath, error: e });
    }
    return null;
  }

  /**
   * Obter caminhos dos arquivos de persistência para diagnóstico
   */
  getPathInfo(): {
    jsonFallback: string;
    dbConfig: string;
  } {
    const isPackaged = 
      process.execPath.includes('Cortez.exe') || 
      process.execPath.includes('electron.exe') || 
      (process as any).resourcesPath || 
      __dirname.includes('app.asar');
    
    const dbConfigPath = isPackaged
      ? path.resolve(process.env.APPDATA || os.homedir(), 'Cortez', 'db-config.json')
      : path.resolve(process.cwd(), 'db-config.json');

    return {
      jsonFallback: this.jsonFallbackPath,
      dbConfig: dbConfigPath,
    };
  }
}

export const persistenceService = new PersistenceService();
