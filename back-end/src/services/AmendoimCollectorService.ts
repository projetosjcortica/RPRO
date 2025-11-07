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
   * USA SOMENTE runtime ihm-config (salvo via config.tsx IHMConfig)
   */
  private static getIHMService(): IHMService {
    if (!this.ihmService) {
      const ihmCfg = getRuntimeConfig('ihm-config') || {};
      this.ihmService = new IHMService(
        ihmCfg.ip || process.env.IHM_IP || '192.168.5.250',
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
    localDir: string,
    tipo: 'entrada' | 'saida',
    ihmServiceOverride?: IHMService
  ): Promise<{ name: string; localPath: string; size: number } | null> {
    // Try primary IHM first, then fall back to IHM2 (if configured) before giving up
    const tryWithService = async (svc: IHMService) => {
      try {
        const downloaded = await svc.findAndDownloadNewFiles(localDir);
        if (!downloaded || downloaded.length === 0) return null;
        let targetFile = downloaded.find(f => f.name === fileName);

        // If exact name not found, try intelligent partial match by tipo
        if (!targetFile && downloaded.length > 0) {
          const normalizedSearch = fileName.replace(/\.+/g, '.').replace(/[^a-zA-Z0-9_.-]/g, '');
          const patterns = tipo === 'entrada' ? ['ENTRA', 'ENTRADA', 'IN', 'INPUT'] : ['SAIDA', 'OUT', 'OUTPUT'];
          targetFile = downloaded.find(f => {
            const upperName = f.name.toUpperCase();
            return patterns.some(p => upperName.includes(p));
          });
          if (targetFile) {
            console.log(`[AmendoimCollector] Nome configurado "${fileName}" não encontrado, usando "${targetFile.name}" (match por tipo ${tipo})`);
          }
        }

        return targetFile || null;
      } catch (err: any) {
        console.warn(`[AmendoimCollector] Falha no download FTP de ${fileName} com um IHM (erro: ${err?.message || err})`);
        return null;
      }
    };

    // Primary attempt
    const primarySvc = ihmServiceOverride ?? this.getIHMService();
    let result = await tryWithService(primarySvc);

    // If primary failed, and Amendoim has a configured ihm2, try it
    if (!result) {
      try {
        const amCfg = AmendoimConfigService.getConfig();
        if ((amCfg as any).duasIHMs && (amCfg as any).ihm2) {
          const ih2 = (amCfg as any).ihm2;
          // Only try IHM2 if it is intended for this tipo OR if primary failed
          try {
            console.log(`[AmendoimCollector] Tentando IHM2 (${ih2.ip}) como fallback para ${fileName}`);
            const svc2 = new IHMService(
              ih2.ip || process.env.IHM_IP || '192.168.5.250',
              ih2.user || process.env.IHM_USER || 'anonymous',
              ih2.password || process.env.IHM_PASSWORD || ''
            );
            result = await tryWithService(svc2);
            if (result) console.log(`[AmendoimCollector] Sucesso via IHM2: ${result.name}`);
          } catch (e) {
            console.warn('[AmendoimCollector] Erro ao tentar IHM2 fallback', e);
          }
        }
      } catch (e) {
        // ignore amendoim-config read errors
      }
    }

    return result;
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
      // Usar SOMENTE runtime ihm-config para definir quais arquivos coletar
      const ihmCfg: any = getRuntimeConfig('ihm-config') || {};
      const ihmService = this.getIHMService();
      
      // Helper para gerar nome do arquivo baseado no método
      const computeFileName = (metodo: string, localFile?: string): string => {
        const m = String(metodo || '').toLowerCase();
        if (m === 'mensal') {
          const now = new Date();
          const yyyy = now.getFullYear();
          const mm = String(now.getMonth() + 1).padStart(2, '0');
          return `Relatorio_${yyyy}_${mm}.csv`;
        }
        if (m === 'geral') return 'Relatorio_1.csv';
        if (m === 'custom' && localFile) return String(localFile);
        return 'Relatorio_1.csv'; // fallback
      };

      const arquivoEntrada = computeFileName(ihmCfg.metodoCSV || '', ihmCfg.localCSV);
      const arquivoSaida = computeFileName(ihmCfg.metodoCSV2 || ihmCfg.metodoCSV || '', ihmCfg.localCSV2 || ihmCfg.localCSV);
      const caminhoRemoto = ihmCfg.localCSVPath || '/InternalStorage/data/';
      const duasIHMs = !!ihmCfg.duasIHMs;

      console.log('[AmendoimCollector] Configuração (ihm-config):', {
        arquivoEntrada,
        arquivoSaida,
        caminhoRemoto,
        duasIHMs,
        metodoCSV: ihmCfg.metodoCSV,
        metodoCSV2: ihmCfg.metodoCSV2,
      });

      // Montar lista de arquivos para coletar
      const arquivosParaColetar = [
        { tipo: 'entrada' as const, arquivo: arquivoEntrada, caminho: caminhoRemoto },
        { tipo: 'saida' as const, arquivo: arquivoSaida, caminho: caminhoRemoto },
      ];

      // Executar downloads e processamento em paralelo para reduzir tempo e isolar falhas por arquivo
      const tasks = arquivosParaColetar.map(async (arquivoInfo) => {
        const localFile = path.join(this.TMP_DIR, `${arquivoInfo.tipo}_${arquivoInfo.arquivo}`);
        const cacheKey = `${arquivoInfo.tipo}_${arquivoInfo.arquivo}`;
        try {
          console.log(`[AmendoimCollector] (parallel) Buscando arquivo ${arquivoInfo.tipo}: ${arquivoInfo.arquivo}`);

          // Determine which IHM to use for this arquivo (usar ihm-config.ip2/user2/password2 se duasIHMs)
          let ihmForThis: IHMService | undefined = undefined;
          try {
            if (duasIHMs && ihmCfg.ip2) {
              // Criar IHM2 usando credenciais do ihm-config
              ihmForThis = new IHMService(
                ihmCfg.ip2 || ihmCfg.ip || '192.168.5.250', 
                ihmCfg.user2 || ihmCfg.user || 'anonymous', 
                ihmCfg.password2 || ihmCfg.password || ''
              );
              console.log('[AmendoimCollector] Usando IHM2 (ihm-config.ip2) para tipo', arquivoInfo.tipo, ':', ihmCfg.ip2);
            }
          } catch (e) {
            console.warn('[AmendoimCollector] falha ao inicializar IHM2 override', e);
            ihmForThis = undefined;
          }

          // Normalize arquivo name defensively (strip garbage after .csv)
          let arquivoNome = String(arquivoInfo.arquivo || '');
          const lower = arquivoNome.toLowerCase();
          const idx = lower.indexOf('.csv');
          if (idx >= 0) arquivoNome = arquivoNome.slice(0, idx + 4);
          arquivoNome = arquivoNome.trim();

          // Tentar baixar via IHM usando findAndDownloadNewFiles (possivelmente override)
          let downloadedFile = await this.downloadSpecificFile(arquivoNome, this.TMP_DIR, arquivoInfo.tipo, ihmForThis);

          if (!downloadedFile) {
            // Tentativa de fallback local (útil para desenvolvimento/offline):
            console.log(`[AmendoimCollector] Download IHM falhou para ${arquivoInfo.tipo}, tentando fallback local...`);
            const candidates = [
              path.join(this.TMP_DIR, arquivoNome),
              path.join(this.TMP_DIR, `${arquivoInfo.tipo}_${arquivoNome}`),
              path.join(process.cwd(), 'backups', arquivoNome),
              path.join(process.cwd(), 'backups', `${arquivoInfo.tipo}_${arquivoNome}`),
            ];

            console.log(`[AmendoimCollector] Procurando em:`, candidates);

            let fallbackPath: string | null = null;
            for (const c of candidates) {
              if (fs.existsSync(c)) {
                fallbackPath = c;
                console.log(`[AmendoimCollector] ✓ Encontrado: ${c}`);
                break;
              } else {
                console.log(`[AmendoimCollector] ✗ Não existe: ${c}`);
              }
            }

              if (fallbackPath) {
              console.log(`[AmendoimCollector] Usando fallback local para ${arquivoInfo.tipo}: ${fallbackPath}`);
              // Garantir que o arquivo local final existe com o nome esperado
              if (fallbackPath !== localFile) {
                fs.copyFileSync(fallbackPath, localFile);
              }
              downloadedFile = { name: arquivoNome, localPath: localFile, size: fs.statSync(localFile).size };
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
