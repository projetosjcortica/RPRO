import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Relatorio } from '../entities/Relatorio';
import { MateriaPrima } from '../entities/MateriaPrima';

const LOCAL_DB_PATH = process.env.LOCAL_BACKUP_DB_PATH || './local_backup.sqlite';

class LocalBackupDB {
  ds: DataSource;

  constructor() {
    this.ds = new DataSource({
      type: 'sqlite',
      database: LOCAL_DB_PATH,
      synchronize: true,
      logging: false,
      entities: [Relatorio, MateriaPrima],
    });
  }

  async init() {
    if (!this.ds.isInitialized) await this.ds.initialize();
  }

  async saveRelatorioRows(rows: any[], processedFile: string) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    const entities = rows.map(r => ({ ...r, processedFile }));
    return repo.save(entities as any[]);
  }

  async listPendingForSync(limit = 100) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    return repo.find({ take: limit });
  }

  async clear() {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    return repo.clear();
  }

  async deleteByIds(ids: string[]) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    return repo.delete(ids);
  }

  async getAll(limit = 100) {
    await this.init();
    const repo = this.ds.getRepository(Relatorio);
    return repo.find({ take: limit });
  }
}

const localBackupDb = new LocalBackupDB();
export default localBackupDb;
