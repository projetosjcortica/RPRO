import { BaseService } from '../core/baseService';
import { Client } from 'basic-ftp';
import path from 'path';
import fs from 'fs';

export class IHMService extends BaseService {
  constructor(private ip: string, private user = 'anonymous', private password = '') {
    super('IHMService');
  }
  async findAndDownloadNewFiles(localDir: string) {
    const client = new Client();
    try {
      await client.access({ host: this.ip, user: this.user, password: this.password, secure: false });
      await client.useDefaultSettings();
      await client.cd('/');
      const list = await client.list();
      const csvs = list.filter((f: any) => f.isFile && f.name.toLowerCase().endsWith('.csv'));
      const results: Array<{ name: string; localPath: string; size: number }> = [];
      for (const f of csvs) {
        const local = path.join(localDir, f.name);
        await client.downloadTo(local, f.name, 0);
        const stat = fs.statSync(local);
        results.push({ name: f.name, localPath: local, size: stat.size });
      }
      return results;
    } finally { client.close(); }
  }
}
