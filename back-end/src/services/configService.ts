import { AppDataSource, dbService } from './dbService';
import { Setting } from '../entities';
import { setRuntimeConfig, setRuntimeConfigs } from '../core/runtimeConfig';

class ConfigService {
  async getSetting(key: string): Promise<string | null> {
    await this.ensureInitialized();
    const repo = AppDataSource.getRepository(Setting);
    const setting = await repo.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.ensureInitialized();
    const repo = AppDataSource.getRepository(Setting);
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
    const repo = AppDataSource.getRepository(Setting);
    for (const k of Object.keys(obj)) {
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
    const repo = AppDataSource.getRepository(Setting);
    const settings = await repo.find();
    const result: Record<string, string> = {};
    settings.forEach(s => {
      result[s.key] = s.value;
    });
    return result;
  }

  private async ensureInitialized() {
    // Ensure DBService has initialized the underlying DataSource (handles fallbacks and entities)
    await dbService.init();
  }
}

export const configService = new ConfigService();
