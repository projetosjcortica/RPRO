import { cacheService } from './CacheService';
import { persistenceService, PersistenceResult } from './PersistenceService';
import { Setting } from '../entities';
import { setRuntimeConfig, setRuntimeConfigs } from '../core/runtimeConfig';
import { log } from './backendLogger';

class ConfigService {
  async getSetting(key: string): Promise<string | null> {
    await this.ensureInitialized();
    const repo = cacheService.ds.getRepository(Setting);
    const setting = await repo.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: string): Promise<PersistenceResult> {
    // validate key
    if (!key || String(key).trim() === '') {
      // Do not persist empty keys — log and ignore
      console.warn('[ConfigService] Ignoring attempt to set empty setting key');
      return {
        success: false,
        savedIn: [],
        failedIn: [],
        errors: { validation: 'Empty key' },
        timestamp: new Date().toISOString(),
      };
    }

    try {
      await this.ensureInitialized();
      
      // Definir a função de salvamento no SQLite
      const sqliteSetter = async (k: string, v: string) => {
        const repo = cacheService.ds.getRepository(Setting);
        let setting = await repo.findOne({ where: { key: k } });
        if (setting) {
          setting.value = v;
        } else {
          setting = repo.create({ key: k, value: v });
        }
        await repo.save(setting);
        console.log(`[ConfigService] Saved to SQLite: ${k}`);
      };

      // Usar PersistenceService para salvar com fallback
      const result = await persistenceService.save(key, value, sqliteSetter);
      
      // update runtime config too
      try { setRuntimeConfig(key, value); } catch (e) { /* ignore */ }
      
      if (!result.success) {
        log.error('ConfigService', `Falha ao salvar ${key} em qualquer local`, result);
      }
      
      return result;
    } catch (e) {
      console.error(`[ConfigService] Error saving setting ${key}:`, e);
      return {
        success: false,
        savedIn: [],
        failedIn: ['sqlite', 'json-fallback', 'json-file'],
        errors: { exception: String(e) },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async setSettings(obj: Record<string, any>): Promise<PersistenceResult> {
    if (!obj || typeof obj !== 'object') return {
      success: false,
      savedIn: [],
      failedIn: [],
      errors: { validation: 'Invalid object' },
      timestamp: new Date().toISOString(),
    };

    try {
      await this.ensureInitialized();
      
      // Definir a função de salvamento em batch no SQLite
      const sqliteBatchSetter = async (batchObj: Record<string, any>) => {
        const repo = cacheService.ds.getRepository(Setting);
        for (const k of Object.keys(batchObj)) {
          // ignore empty keys which could create primary-key collisions
          if (!k || String(k).trim() === '') {
            console.warn('[ConfigService] Skipping empty config key during setSettings');
            continue;
          }
          const v = typeof batchObj[k] === 'string' ? batchObj[k] : JSON.stringify(batchObj[k]);
          let s = await repo.findOne({ where: { key: k } });
          if (s) { s.value = v; } else { s = repo.create({ key: k, value: v }); }
          await repo.save(s);
          console.log(`[ConfigService] Saved to SQLite (batch): ${k}`);
        }
      };

      // Usar PersistenceService para salvar em batch com fallback
      const result = await persistenceService.saveBatch(obj, sqliteBatchSetter);
      
      // update runtime config map
      try { setRuntimeConfigs(obj); } catch (e) { /* ignore */ }
      
      if (!result.success) {
        log.error('ConfigService', `Falha ao salvar batch em qualquer local`, result);
      }
      
      return result;
    } catch (e) {
      console.error('[ConfigService] Error in setSettings:', e);
      return {
        success: false,
        savedIn: [],
        failedIn: ['sqlite', 'json-fallback', 'json-file'],
        errors: { exception: String(e) },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getAllSettings(): Promise<Record<string, string>> {
    await this.ensureInitialized();
    const repo = cacheService.ds.getRepository(Setting);
    const settings = await repo.find();
    const result: Record<string, string> = {};
    settings.forEach(s => {
      result[s.key] = s.value;
    });
    return result;
  }

  private async ensureInitialized() {
    // Ensure cacheService's sqlite DB is available for storing settings.
    await cacheService.init();
    
    // Additional check: verify DataSource is actually initialized
    if (!cacheService.ds) {
      throw new Error('[ConfigService] Cache service DataSource is null');
    }
    if (!(cacheService.ds as any)?.isInitialized) {
      console.warn('[ConfigService] DataSource claims not initialized after init() call, attempting to reinitialize...');
      // Try to reinitialize if something went wrong
      await cacheService.init();
      if (!(cacheService.ds as any)?.isInitialized) {
        throw new Error('[ConfigService] Cache service DataSource failed to initialize');
      }
    }
  }
}

export const configService = new ConfigService();
