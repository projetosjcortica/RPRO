import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AmendoimService } from './AmendoimService';
import { backupSvc } from './backupService';
import { IHMService } from './IHMService';
import { getRuntimeConfig } from '../core/runtimeConfig';

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

export class AmendoimCollectorService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;
  private static ihmService: IHMService | null = null;
  private static TMP_DIR = path.resolve(process.cwd(), 'tmp');
  
  // Cache de detecção de mudanças
  private static changeRecords: Map<string, ChangeDetectionRecord> = new Map();

  /**
   * Inicializa o IHMService com as configurações do ihm-config
   */
  private static getIHMService(): IHMService {
    if (!this.ihmService) {
      const ihmCfg = getRuntimeConfig('ihm-config') || {};
      this.ihmService = new IHMService(
        ihmCfg.ip || process.env.IHM_IP || '192.168.5.252',
        ihmCfg.user || process.env.IHM_USER || 'anonymous',
        ihmCfg.password || process.env.IHM_PASSWORD || ''
      );
    }
    return this.ihmService;
  }

  /**
   * Calcular hash de um conteúdo
   */
  private static calculateContentHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Calcular checksum rápido (primeiras e últimas linhas)
   */
  private static calculateQuickChecksum(content: string): string {
    const lines = content.split('\n');
    const firstLines = lines.slice(0, 5).join('\n');
    const lastLines = lines.slice(Math.max(0, lines.length - 5)).join('\n');
    const checkContent = `${firstLines}|${lastLines}|${lines.length}`;
    return crypto.createHash('md5').update(checkContent).digest('hex');
  }

  /**
   * Detectar se o arquivo foi alterado
   */
  private static async detectChanges(
    fileName: string,
    content: string,
    fileSize: number
  ): Promise<{
    hasChanged: boolean;
    changeType: 'none' | 'modified' | 'size_changed' | 'new_file';
    previousSize: number;
    currentSize: number;
  }> {
    const currentHash = this.calculateContentHash(content);
    const currentChecksum = this.calculateQuickChecksum(content);
    const previousRecord = this.changeRecords.get(fileName);

    if (!previousRecord) {
      console.log(`📌 [AmendoimCollector] Novo arquivo detectado: ${fileName}`);
      
      // Registrar arquivo novo
      this.changeRecords.set(fileName, {
        filePath: fileName,
        fileName,
        fileHash: currentHash,
        fileSize,
        lastModified: new Date(),
        rowCount: content.split('\n').length,
        lastChecksum: currentChecksum,
        lastChangedAt: new Date(),
        hasChanged: true,
      });

      return {
        hasChanged: true,
        changeType: 'new_file',
        previousSize: 0,
        currentSize: fileSize,
      };
    }

    // Verificar se o hash mudou (mudança real no conteúdo)
    if (currentHash !== previousRecord.fileHash) {
      console.log(`🔄 [AmendoimCollector] Alteração detectada em ${fileName}`);
      
      // Atualizar registro
      previousRecord.fileHash = currentHash;
      previousRecord.fileSize = fileSize;
      previousRecord.lastModified = new Date();
      previousRecord.lastChecksum = currentChecksum;
      previousRecord.lastChangedAt = new Date();
      previousRecord.hasChanged = true;
      previousRecord.rowCount = content.split('\n').length;

      return {
        hasChanged: true,
        changeType: fileSize !== previousRecord.fileSize ? 'size_changed' : 'modified',
        previousSize: previousRecord.fileSize,
        currentSize: fileSize,
      };
    }

    // Arquivo não mudou
    console.log(`⏭️  [AmendoimCollector] Arquivo ${fileName} não foi modificado, pulando processamento`);
    return {
      hasChanged: false,
      changeType: 'none',
      previousSize: previousRecord.fileSize,
      currentSize: fileSize,
    };
  }

  /**
   * Verifica se o coletor está rodando
   */
  static getStatus(): { running: boolean } {
    return {
      running: this.isRunning,
    };
  }

  /**
   * Inicia o coletor automático
   */
  static async start(intervalMinutes: number = 5): Promise<void> {
    if (this.isRunning) {
      console.log('[AmendoimCollector] Coletor já está rodando');
      return;
    }

    this.isRunning = true;
    console.log(`[AmendoimCollector] Iniciando coletor (intervalo: ${intervalMinutes} minutos)`);

    // Garantir que o diretório temporário existe
    if (!fs.existsSync(this.TMP_DIR)) {
      fs.mkdirSync(this.TMP_DIR, { recursive: true });
    }

    // Executa imediatamente
    await this.collectOnce();

    // Configura execução periódica
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.collectOnce();
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Para o coletor automático
   */
  static stop(): void {
    if (!this.isRunning) {
      console.log('[AmendoimCollector] Coletor não está rodando');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('[AmendoimCollector] Coletor parado');
  }

  /**
   * Executa uma coleta única
   */
  static async collectOnce(): Promise<{
    success: boolean;
    filesProcessed: number;
    recordsSaved: number;
    errors: string[];
  }> {
    console.log('[AmendoimCollector] Iniciando coleta única');

    const result = {
      success: true,
      filesProcessed: 0,
      recordsSaved: 0,
      errors: [] as string[],
    };

    try {
      const ihmService = this.getIHMService();
      
      // Usar o IHMService para buscar e baixar arquivos novos
      const downloaded = await ihmService.findAndDownloadNewFiles(this.TMP_DIR);
      
      // Filtrar apenas arquivos de amendoim
      const amendoimFiles = downloaded.filter(f => 
        f.name.toLowerCase().includes('amendoim')
      );

      if (amendoimFiles.length === 0) {
        console.log('[AmendoimCollector] Nenhum arquivo novo de amendoim encontrado');
        return result;
      }

      console.log(`[AmendoimCollector] ${amendoimFiles.length} arquivo(s) de amendoim encontrado(s)`);

      // Processar cada arquivo
      for (const file of amendoimFiles) {
        try {
          console.log(`[AmendoimCollector] Processando arquivo: ${file.name}`);

          // Ler conteúdo do arquivo baixado
          const csvContent = fs.readFileSync(file.localPath, 'utf-8');

          // 🔍 Detectar mudanças no arquivo
          const changeInfo = await this.detectChanges(file.name, csvContent, csvContent.length);

          if (changeInfo.hasChanged || changeInfo.changeType === 'new_file') {
            console.log(`📊 [AmendoimCollector] Mudança detectada: ${changeInfo.changeType}`);

            // Fazer backup do arquivo
            try {
              await backupSvc.backupFile({
                originalname: file.name,
                path: file.localPath,
                size: file.size,
              });
              console.log(`[AmendoimCollector] Backup criado: ${file.name}`);
            } catch (backupErr) {
              console.warn(`[AmendoimCollector] Erro ao criar backup: ${backupErr}`);
            }

            // Processar CSV
            const processResult = await AmendoimService.processarCSV(csvContent);

            result.filesProcessed++;
            result.recordsSaved += processResult.salvos;

            console.log(`✅ [AmendoimCollector] Arquivo ${file.name} processado e cache atualizado:`, {
              rowsProcessed: processResult.processados,
              rowsSaved: processResult.salvos,
              fileSize: file.size
            });

            if (processResult.erros.length > 0) {
              result.errors.push(
                `${file.name}: ${processResult.erros.length} erros de validação`
              );
            }
          } else {
            console.log(`⏭️  [AmendoimCollector] Arquivo ${file.name} não foi modificado, pulando processamento`);
          }
        } catch (fileErr: any) {
          console.error(`[AmendoimCollector] Erro ao processar ${file.name}:`, fileErr);
          result.errors.push(`${file.name}: ${fileErr.message}`);
          result.success = false;
        }
      }

      console.log('[AmendoimCollector] Ciclo de coleta concluído com sucesso.');
    } catch (err: any) {
      console.error('[AmendoimCollector] Erro na coleta:', err);
      result.errors.push(`Erro: ${err.message}`);
      result.success = false;
    }

    console.log('[AmendoimCollector] Coleta concluída', result);
    return result;
  }

  /**
   * Limpar cache de um arquivo específico
   */
  static clearFileCache(fileName: string): boolean {
    const deleted = this.changeRecords.delete(fileName);
    if (deleted) {
      console.log(`🗑️  [AmendoimCollector] Cache limpo para: ${fileName}`);
    }
    return deleted;
  }

  /**
   * Limpar todo o cache
   */
  static clearAllCache(): void {
    const count = this.changeRecords.size;
    this.changeRecords.clear();
    console.log(`🗑️  [AmendoimCollector] Cache completo limpo (${count} arquivo(s))`);
  }

  /**
   * Obter estatísticas do cache
   */
  static getCacheStats(): {
    totalFiles: number;
    files: Array<{
      fileName: string;
      fileSize: number;
      rowCount: number;
      lastModified: Date;
      lastChangedAt: Date;
    }>;
  } {
    const files = Array.from(this.changeRecords.values()).map(record => ({
      fileName: record.fileName,
      fileSize: record.fileSize,
      rowCount: record.rowCount,
      lastModified: record.lastModified,
      lastChangedAt: record.lastChangedAt,
    }));

    return {
      totalFiles: this.changeRecords.size,
      files,
    };
  }
}
