import { cacheService } from './CacheService';
import { Setting } from '../entities';
import { setRuntimeConfig, setRuntimeConfigs } from '../core/runtimeConfig';

class ConfigService {
  async getSetting(key: string): Promise<string | null> {
    await this.ensureInitialized();
    const repo = cacheService.ds.getRepository(Setting);
    const setting = await repo.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    // validate key
    if (!key || String(key).trim() === '') {
      // Do not persist empty keys — log and ignore
      console.warn('[ConfigService] Ignoring attempt to set empty setting key');
      return;
    }

    await this.ensureInitialized();
    const repo = cacheService.ds.getRepository(Setting);
    let setting = await repo.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
    } else {
      setting = repo.create({ key, value });
    }
    await repo.save(setting);
    // update runtime config too
    try { setRuntimeConfig(key, value); } catch (e) { /* ignore */ }
  }

  async setSettings(obj: Record<string, any>): Promise<void> {
    if (!obj || typeof obj !== 'object') return;
    await this.ensureInitialized();
    const repo = cacheService.ds.getRepository(Setting);
    for (const k of Object.keys(obj)) {
      // ignore empty keys which could create primary-key collisions
      if (!k || String(k).trim() === '') {
        console.warn('[ConfigService] Skipping empty config key during setSettings');
        continue;
      }
      const v = typeof obj[k] === 'string' ? obj[k] : JSON.stringify(obj[k]);
      let s = await repo.findOne({ where: { key: k } });
      if (s) { s.value = v; } else { s = repo.create({ key: k, value: v }); }
      await repo.save(s);
    }
    // update runtime config map
    try { setRuntimeConfigs(obj); } catch (e) { /* ignore */ }
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
  }
}

export const configService = new ConfigService();
