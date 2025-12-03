import fs from 'fs';
import path from 'path';
import { BaseService } from '../core/baseService';
import { BackupMeta, hashBufferHex } from '../core/utils';
import { cacheService } from './CacheService';

const os = require('os');
// Prefer runtime-config or env var, fallback to OS temp dir to ensure writable location in packaged apps
const DEFAULT_BACKUP_DIR = path.resolve(String(require('../core/runtimeConfig').getRuntimeConfig('backup_dir') ?? process.env.BACKUP_DIR ?? path.join(os.tmpdir(), 'cortez-backups')));
const ENV_WORK_DIR = process.env.BACKUP_WORKDIR ? path.resolve(String(process.env.BACKUP_WORKDIR)) : null;
const BACKUP_WRITE_FILES = process.env.BACKUP_WRITE_FILES !== 'false';
if (BACKUP_WRITE_FILES && !fs.existsSync(DEFAULT_BACKUP_DIR)) fs.mkdirSync(DEFAULT_BACKUP_DIR, { recursive: true });
if (BACKUP_WRITE_FILES && ENV_WORK_DIR && !fs.existsSync(ENV_WORK_DIR)) fs.mkdirSync(ENV_WORK_DIR, { recursive: true });

export class BackupService extends BaseService {
  private metas: BackupMeta[] = [];
  constructor() { super('BackupService'); }
  
  /**
   * Cria ID único para backup com prefixo opcional (ex: IHM1_, IHM2_)
   * @param name Nome original do arquivo
   * @param prefix Prefixo opcional (ex: "IHM1", "IHM2")
   */
  private createId(name: string, prefix?: string) { 
    const ts = Date.now(); 
    const sanitizedName = name.replace(/[^a-zA-Z0-9_.-]+/g, '_');
    return prefix ? `${prefix}_${ts}-${sanitizedName}` : `${ts}-${sanitizedName}`;
  }
  
  listBackups() { return [...this.metas]; }
  
  /**
   * Obtém o último backup de um arquivo considerando o prefixo IHM
   * @param originalName Nome original do arquivo
   * @param ihmPrefix Prefixo da IHM (opcional, ex: "IHM1", "IHM2")
   */
  getLatestBackup(originalName: string, ihmPrefix?: string) { 
    const filtered = this.metas.filter((m) => {
      // Se há prefixo, verificar se o backup tem esse prefixo
      if (ihmPrefix && m.id) {
        return m.originalName === originalName && m.id.startsWith(`${ihmPrefix}_`);
      }
      return m.originalName === originalName;
    });
    
    if (filtered.length === 0) return null; 
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]; 
  }
  
  /**
   * Realiza backup de arquivo com prefixo IHM opcional
   * @param fileObj Objeto com informações do arquivo
   * @param ihmPrefix Prefixo da IHM (opcional, ex: "IHM1", "IHM2")
   */
  async backupFile(
    fileObj: { originalname: string; path: string; mimetype?: string; size?: number },
    ihmPrefix?: string
  ): Promise<BackupMeta> {
    const name = fileObj.originalname || path.basename(fileObj.path);
    const id = this.createId(name, ihmPrefix);
    const backupPath = path.join(DEFAULT_BACKUP_DIR, id);
    const workDir = ENV_WORK_DIR || DEFAULT_BACKUP_DIR;
    const workPath = path.join(workDir, id);
    const buffer = fs.readFileSync(fileObj.path);
    const hash = hashBufferHex(buffer);
    
    if (BACKUP_WRITE_FILES) { 
      fs.writeFileSync(backupPath, buffer); 
      if (ENV_WORK_DIR) fs.writeFileSync(workPath, buffer); 
    }
    
    const meta: BackupMeta = { 
      id, 
      originalName: name, 
      backupPath, 
      workPath: ENV_WORK_DIR ? workPath : undefined, 
      size: fileObj.size || buffer.length, 
      createdAt: new Date().toISOString(), 
      hash 
    };
    
    this.metas.push(meta);
    
    try { 
      await cacheService.recordBackupMeta(meta, fs.statSync(fileObj.path)); 
    } catch {}
    
    console.log(`[BackupService] 💾 Backup criado: ${id} (${ihmPrefix || 'sem prefixo'})`);
    
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
