import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AmendoimService } from './AmendoimService';
import { backupSvc } from './backupService';
import { IHMService } from './IHMService';
import { getRuntimeConfig } from '../core/runtimeConfig';
import { AmendoimConfigService } from './AmendoimConfigService';

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
   * Baixar arquivo específico do IHM via findAndDownloadNewFiles
   * Como o IHMService não tem método direto, usamos findAndDownloadNewFiles
   * e filtramos pelo nome desejado
   */
  private static async downloadSpecificFile(
    fileName: string,
    localDir: string
  ): Promise<{ name: string; localPath: string; size: number } | null> {
    const ihmService = this.getIHMService();
    
    // Baixar todos os arquivos novos e filtrar pelo nome
    const downloaded = await ihmService.findAndDownloadNewFiles(localDir);
    const targetFile = downloaded.find(f => f.name === fileName);
    
    return targetFile || null;
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
   * Coleta arquivos de entrada e saída conforme configuração
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
      const config = AmendoimConfigService.getConfig();
      const ihmService = this.getIHMService();
      
      console.log('[AmendoimCollector] Configuração:', {
        arquivoEntrada: config.arquivoEntrada,
        arquivoSaida: config.arquivoSaida,
        caminhoRemoto: config.caminhoRemoto,
        duasIHMs: config.duasIHMs,
      });

      // Obter lista de arquivos para coletar
      const arquivosParaColetar = AmendoimConfigService.getArquivosParaColetar();

      // Executar downloads e processamento em paralelo para reduzir tempo e isolar falhas por arquivo
      const tasks = arquivosParaColetar.map(async (arquivoInfo) => {
        const localFile = path.join(this.TMP_DIR, `${arquivoInfo.tipo}_${arquivoInfo.arquivo}`);
        const cacheKey = `${arquivoInfo.tipo}_${arquivoInfo.arquivo}`;
        try {
          console.log(`[AmendoimCollector] (parallel) Buscando arquivo ${arquivoInfo.tipo}: ${arquivoInfo.arquivo}`);

          // TODO: Se duasIHMs = true e tipo = 'saida', usar ihm2
          // Por enquanto, usar sempre a mesma IHM

          // Tentar baixar via IHM usando findAndDownloadNewFiles
          let downloadedFile = await this.downloadSpecificFile(arquivoInfo.arquivo, this.TMP_DIR);

          if (!downloadedFile) {
            // Tentativa de fallback local (útil para desenvolvimento/offline):
            const candidates = [
              path.join(this.TMP_DIR, arquivoInfo.arquivo),
              path.join(this.TMP_DIR, `${arquivoInfo.tipo}_${arquivoInfo.arquivo}`),
              path.join(process.cwd(), 'backups', arquivoInfo.arquivo),
              path.join(process.cwd(), 'backups', `${arquivoInfo.tipo}_${arquivoInfo.arquivo}`),
            ];

            let fallbackPath: string | null = null;
            for (const c of candidates) {
              if (fs.existsSync(c)) {
                fallbackPath = c;
                break;
              }
            }

            if (fallbackPath) {
              console.log(`[AmendoimCollector] Usando fallback local para ${arquivoInfo.tipo}: ${fallbackPath}`);
              // Garantir que o arquivo local final existe com o nome esperado
              if (fallbackPath !== localFile) {
                fs.copyFileSync(fallbackPath, localFile);
              }
              downloadedFile = { name: arquivoInfo.arquivo, localPath: localFile, size: fs.statSync(localFile).size };
            } else {
              const msg = `Arquivo ${arquivoInfo.tipo} não encontrado no IHM e sem fallback local: ${arquivoInfo.arquivo}`;
              console.warn(`[AmendoimCollector] ${msg}`);
              return { filesProcessed: 0, recordsSaved: 0, errors: [msg] };
            }
          }

          // Copiar para nome específico com prefixo de tipo (se necessário)
          if (downloadedFile.localPath !== localFile) {
            fs.copyFileSync(downloadedFile.localPath, localFile);
          }

          // Ler conteúdo
          const csvContent = fs.readFileSync(localFile, 'utf-8');
          const fileSize = Buffer.byteLength(csvContent, 'utf-8');

          // 🔍 Detectar mudanças no arquivo
          const changeInfo = await this.detectChanges(cacheKey, csvContent, fileSize);

          if (changeInfo.hasChanged || changeInfo.changeType === 'new_file') {
            console.log(`📊 [AmendoimCollector] Mudança detectada (${arquivoInfo.tipo}): ${changeInfo.changeType}`);

            // Fazer backup do arquivo
            try {
              await backupSvc.backupFile({
                originalname: cacheKey,
                path: localFile,
                size: fileSize,
              });
              console.log(`[AmendoimCollector] Backup criado: ${cacheKey}`);
            } catch (backupErr) {
              console.warn(`[AmendoimCollector] Erro ao criar backup: ${backupErr}`);
            }

            // Processar CSV com o tipo correto (entrada ou saida)
            const processResult = await AmendoimService.processarCSV(csvContent, arquivoInfo.tipo);

            const errors: string[] = [];
            if (processResult.erros && processResult.erros.length > 0) {
              errors.push(`${cacheKey}: ${processResult.erros.length} erros de validação`);
            }

            console.log(`✅ [AmendoimCollector] Arquivo ${arquivoInfo.tipo} processado:`, {
              arquivo: arquivoInfo.arquivo,
              tipo: arquivoInfo.tipo,
              processados: processResult.processados,
              salvos: processResult.salvos,
              fileSize,
            });

            return { filesProcessed: 1, recordsSaved: processResult.salvos || 0, errors };
          }

          console.log(`⏭️  [AmendoimCollector] Arquivo ${arquivoInfo.tipo} (${arquivoInfo.arquivo}) não foi modificado`);
          return { filesProcessed: 0, recordsSaved: 0, errors: [] };
        } catch (err: any) {
          console.error(`[AmendoimCollector] Erro ao processar ${arquivoInfo.tipo}:`, err?.message || err);
          return { filesProcessed: 0, recordsSaved: 0, errors: [`${arquivoInfo.tipo}: ${err?.message || err}`] };
        }
      });

      // Aguardar todas as tasks (em paralelo) e agregar resultados
      const settled = await Promise.all(tasks);
      for (const r of settled) {
        result.filesProcessed += r.filesProcessed;
        result.recordsSaved += r.recordsSaved;
        if (r.errors && r.errors.length > 0) result.errors.push(...r.errors);
      }

      console.log('[AmendoimCollector] Ciclo de coleta concluído.');
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
