import { BaseService } from '../core/baseService';
import { cacheService } from './CacheService';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface ChangeDetectionRecord {
  filePath: string;
  fileName: string;
  fileHash: string;
  fileSize: number;
  lastModified: Date;
  rowCount: number;
  lastChecksum: string;
  lastChangedAt: Date;
  hasChanged: boolean;
}

/**
 * Serviço para detectar alterações em arquivos e atualizar cache automaticamente
 */
export class ChangeDetectionService extends BaseService {
  private changeRecords: Map<string, ChangeDetectionRecord> = new Map();

  constructor() {
    super('ChangeDetectionService');
  }

  /**
   * Calcular hash de um arquivo
   */
  private calculateFileHash(filePath: string): string {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      console.error(`[ChangeDetectionService] Erro ao calcular hash para ${filePath}:`, error);
      return '';
    }
  }

  /**
   * Calcular checksum apenas das primeiras e últimas linhas (rápido)
   */
  private calculateQuickChecksum(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Pegar primeiras 5 linhas + últimas 5 linhas + total de linhas
      const firstLines = lines.slice(0, 5).join('\n');
      const lastLines = lines.slice(Math.max(0, lines.length - 5)).join('\n');
      const checkContent = `${firstLines}|${lastLines}|${lines.length}`;
      
      return crypto.createHash('md5').update(checkContent).digest('hex');
    } catch (error) {
      console.error(`[ChangeDetectionService] Erro ao calcular checksum para ${filePath}:`, error);
      return '';
    }
  }

  /**
   * Registrar um arquivo para monitoramento
   */
  async registerFile(filePath: string): Promise<ChangeDetectionRecord | null> {
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`[ChangeDetectionService] Arquivo não existe: ${filePath}`);
        return null;
      }

      const stat = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      const fileHash = this.calculateFileHash(filePath);
      const quickChecksum = this.calculateQuickChecksum(filePath);

      const record: ChangeDetectionRecord = {
        filePath,
        fileName,
        fileHash,
        fileSize: stat.size,
        lastModified: stat.mtime,
        rowCount: 0,
        lastChecksum: quickChecksum,
        lastChangedAt: new Date(),
        hasChanged: false,
      };

      this.changeRecords.set(filePath, record);
      console.log(`✅ [ChangeDetectionService] Arquivo registrado: ${fileName}`);
      
      return record;
    } catch (error) {
      console.error(`[ChangeDetectionService] Erro ao registrar arquivo ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Detectar se um arquivo foi alterado
   */
  async detectChanges(filePath: string): Promise<{
    hasChanged: boolean;
    changeType: 'none' | 'modified' | 'size_changed' | 'new_file';
    previousSize: number;
    currentSize: number;
    previousHash: string;
    currentHash: string;
  }> {
    try {
      if (!fs.existsSync(filePath)) {
        return {
          hasChanged: false,
          changeType: 'none',
          previousSize: 0,
          currentSize: 0,
          previousHash: '',
          currentHash: '',
        };
      }

      const stat = fs.statSync(filePath);
      const currentHash = this.calculateFileHash(filePath);
      const currentChecksum = this.calculateQuickChecksum(filePath);
      const previousRecord = this.changeRecords.get(filePath);

      if (!previousRecord) {
        console.log(`📌 [ChangeDetectionService] Novo arquivo detectado: ${path.basename(filePath)}`);
        await this.registerFile(filePath);
        return {
          hasChanged: true,
          changeType: 'new_file',
          previousSize: 0,
          currentSize: stat.size,
          previousHash: '',
          currentHash,
        };
      }

      // Verificar se o hash mudou (mudança real no conteúdo)
      if (currentHash !== previousRecord.fileHash) {
        console.log(`🔄 [ChangeDetectionService] Alteração detectada em ${path.basename(filePath)}`);
        
        // Atualizar registro
        previousRecord.fileHash = currentHash;
        previousRecord.fileSize = stat.size;
        previousRecord.lastModified = stat.mtime;
        previousRecord.lastChecksum = currentChecksum;
        previousRecord.lastChangedAt = new Date();
        previousRecord.hasChanged = true;

        return {
          hasChanged: true,
          changeType: stat.size !== previousRecord.fileSize ? 'size_changed' : 'modified',
          previousSize: previousRecord.fileSize,
          currentSize: stat.size,
          previousHash: previousRecord.fileHash,
          currentHash,
        };
      }

      // Verificar se apenas o tamanho mudou (sem mudança de conteúdo)
      if (stat.size !== previousRecord.fileSize) {
        console.log(`📐 [ChangeDetectionService] Tamanho mudou mas conteúdo igual: ${path.basename(filePath)}`);
        return {
          hasChanged: false,
          changeType: 'size_changed',
          previousSize: previousRecord.fileSize,
          currentSize: stat.size,
          previousHash: previousRecord.fileHash,
          currentHash,
        };
      }

      return {
        hasChanged: false,
        changeType: 'none',
        previousSize: previousRecord.fileSize,
        currentSize: stat.size,
        previousHash: previousRecord.fileHash,
        currentHash,
      };
    } catch (error) {
      console.error(`[ChangeDetectionService] Erro ao detectar mudanças em ${filePath}:`, error);
      return {
        hasChanged: false,
        changeType: 'none',
        previousSize: 0,
        currentSize: 0,
        previousHash: '',
        currentHash: '',
      };
    }
  }

  /**
   * Limpar cache de um arquivo
   */
  async clearCache(filePath: string): Promise<void> {
    try {
      const fileName = path.basename(filePath);
      // Limpar o cache para este arquivo específico
      // (O CacheService não tem deleteByName, então limpamos tudo e reconstruímos)
      const allCache = await cacheService.getAllCache();
      const filteredCache = allCache.filter(c => c.name !== fileName);
      await cacheService.clearAll();
      if (filteredCache.length > 0) {
        await cacheService.saveCache(filteredCache);
      }
      this.changeRecords.delete(filePath);
      console.log(`🗑️  [ChangeDetectionService] Cache limpo para: ${fileName}`);
    } catch (error) {
      console.error(`[ChangeDetectionService] Erro ao limpar cache:`, error);
    }
  }

  /**
   * Obter estatísticas de um arquivo monitorado
   */
  getFileStats(filePath: string): ChangeDetectionRecord | null {
    return this.changeRecords.get(filePath) || null;
  }

  /**
   * Listar todos os arquivos monitorados
   */
  listMonitoredFiles(): ChangeDetectionRecord[] {
    return Array.from(this.changeRecords.values());
  }

  /**
   * Limpar todos os registros (útil para restart)
   */
  clearAll(): void {
    console.log(`[ChangeDetectionService] Limpando todos os registros de monitoramento`);
    this.changeRecords.clear();
  }
}

export const changeDetectionService = new ChangeDetectionService();
