import fs from 'fs';
import path from 'path';
import { BaseService } from '../core/baseService';
import { BackupMeta, hashBufferHex } from '../core/utils';
import { cacheService } from './cacheService';

const DEFAULT_BACKUP_DIR = path.resolve(process.cwd(), 'backups');
const ENV_WORK_DIR = process.env.BACKUP_WORKDIR ? path.resolve(process.cwd(), process.env.BACKUP_WORKDIR) : null;
const BACKUP_WRITE_FILES = process.env.BACKUP_WRITE_FILES !== 'false';

function ensureDirectoryExists(dir: string) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`[BackupService] created directory: ${dir}`);
    }
  } catch (err) {
    console.error(`[BackupService] failed to ensure directory ${dir}:`, err);
    throw err;
  }
}

if (BACKUP_WRITE_FILES) {
  ensureDirectoryExists(DEFAULT_BACKUP_DIR);
  if (ENV_WORK_DIR) ensureDirectoryExists(ENV_WORK_DIR);
}

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
    if (BACKUP_WRITE_FILES) {
      // Ensure target directories exist right before writing
      ensureDirectoryExists(path.dirname(backupPath));
      try {
        fs.writeFileSync(backupPath, buffer);
        if (ENV_WORK_DIR) {
          ensureDirectoryExists(path.dirname(workPath));
          fs.writeFileSync(workPath, buffer);
        }
      } catch (err) {
        console.error(`[BackupService] failed to write backup files (backupPath=${backupPath}, workPath=${workPath}):`, err);
        throw err;
      }
    }
    const meta: BackupMeta = { id, originalName: name, backupPath, workPath: ENV_WORK_DIR ? workPath : undefined, size: fileObj.size || buffer.length, createdAt: new Date().toISOString(), hash };
    this.metas.push(meta);
    try { await cacheService.recordBackupMeta(meta, fs.statSync(fileObj.path)); } catch {}
    return meta;
  }
}

export const backupSvc = new BackupService();
