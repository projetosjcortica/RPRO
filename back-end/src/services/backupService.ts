import fs from 'fs';
import path from 'path';
import { BaseService } from '../core/baseService';
import { BackupMeta, hashBufferHex } from '../core/utils';
import { cacheService } from './CacheService';

const DEFAULT_BACKUP_DIR = path.resolve(process.cwd(), 'backups');
const ENV_WORK_DIR = process.env.BACKUP_WORKDIR ? path.resolve(process.cwd(), process.env.BACKUP_WORKDIR) : null;
const BACKUP_WRITE_FILES = process.env.BACKUP_WRITE_FILES !== 'false';
if (BACKUP_WRITE_FILES && !fs.existsSync(DEFAULT_BACKUP_DIR)) fs.mkdirSync(DEFAULT_BACKUP_DIR, { recursive: true });
if (BACKUP_WRITE_FILES && ENV_WORK_DIR && !fs.existsSync(ENV_WORK_DIR)) fs.mkdirSync(ENV_WORK_DIR, { recursive: true });

export class BackupService extends BaseService {
  private metas: BackupMeta[] = [];
  constructor() { super('BackupService'); }
  private createId(name: string) { const ts = Date.now(); return `${ts}-${name.replace(/[^a-zA-Z0-9_.-]+/g, '_')}`; }
  listBackups() { return [...this.metas]; }
  getLatestBackup(originalName: string) { const filtered = this.metas.filter((m) => m.originalName === originalName); if (filtered.length === 0) return null; return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]; }
  async backupFile(fileObj: { originalname: string; path: string; mimetype?: string; size?: number }): Promise<BackupMeta> {
    const name = fileObj.originalname || path.basename(fileObj.path);
    const id = this.createId(name);
    const backupPath = path.join(DEFAULT_BACKUP_DIR, id);
    const workDir = ENV_WORK_DIR || DEFAULT_BACKUP_DIR;
    const workPath = path.join(workDir, id);
    const buffer = fs.readFileSync(fileObj.path);
    const hash = hashBufferHex(buffer);
    if (BACKUP_WRITE_FILES) { fs.writeFileSync(backupPath, buffer); if (ENV_WORK_DIR) fs.writeFileSync(workPath, buffer); }
    const meta: BackupMeta = { id, originalName: name, backupPath, workPath: ENV_WORK_DIR ? workPath : undefined, size: fileObj.size || buffer.length, createdAt: new Date().toISOString(), hash };
    this.metas.push(meta);
    try { await cacheService.recordBackupMeta(meta, fs.statSync(fileObj.path)); } catch {}
    return meta;
  }

  /**
   * Remove all backup files and clear the in-memory metas list.
   */
  async clearAllBackups() {
    try {
      if (fs.existsSync(DEFAULT_BACKUP_DIR)) {
        const files = fs.readdirSync(DEFAULT_BACKUP_DIR);
        for (const f of files) {
          try { fs.unlinkSync(path.join(DEFAULT_BACKUP_DIR, f)); } catch (e) { /* ignore */ }
        }
      }
    } catch (e) {
      console.warn('[BackupService] Failed to clear backup files:', e);
    }
    this.metas = [];
  }
}

export const backupSvc = new BackupService();
