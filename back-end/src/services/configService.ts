import { AppDataSource } from './dbService';
import { Setting } from '../entities';

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
  }

  private async ensureInitialized() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  }
}

export const configService = new ConfigService();
