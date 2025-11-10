import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AmendoimService } from './AmendoimService';
import { backupSvc } from './backupService';
import { IHMService } from './IHMService';
import { getRuntimeConfig } from '../core/runtimeConfig';
import { cacheService } from './CacheService';

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
   * Baixar arquivo do IHM via findAndDownloadNewFiles
   * Usa o arquivo configurado como referência, mas aceita qualquer CSV baixado
   */
  private static async downloadSpecificFile(
    fileName: string,
    localDir: string,
    tipo: 'entrada' | 'saida',
    ihmServiceOverride?: IHMService
  ): Promise<{ name: string; localPath: string; size: number } | null> {
    const tryWithService = async (svc: IHMService) => {
      try {
        const downloaded = await svc.findAndDownloadNewFiles(localDir);
        if (!downloaded || downloaded.length === 0) {
          console.log(`[AmendoimCollector] Nenhum arquivo novo baixado do IHM`);
          return null;
        }

        // Prioridade 1: Nome exato configurado
        let targetFile = downloaded.find(f => f.name === fileName);
        
        // Prioridade 2: Match inteligente por padrão do tipo (ENTRADA/SAIDA)
        if (!targetFile) {
          const patterns = tipo === 'entrada' 
            ? ['ENTRA', 'ENTRADA', 'IN', 'INPUT'] 
            : ['SAIDA', 'OUT', 'OUTPUT'];
          
          targetFile = downloaded.find(f => {
            const upperName = f.name.toUpperCase();
            return patterns.some(p => upperName.includes(p));
          });
          
          if (targetFile) {
            console.log(`[AmendoimCollector] ✓ Arquivo encontrado por padrão ${tipo}: "${targetFile.name}" (configurado: "${fileName}")`);
          }
        }

        // Prioridade 3: Usar primeiro CSV disponível (sem _sys.csv)
        if (!targetFile && downloaded.length > 0) {
          targetFile = downloaded.find(f => 
            !f.name.toLowerCase().includes('_sys') && 
            f.name.toLowerCase().endsWith('.csv')
          );
          
          if (targetFile) {
            console.log(`[AmendoimCollector] ⚠️ Usando primeiro CSV disponível: "${targetFile.name}" (configurado: "${fileName}")`);
          }
        }

        return targetFile || null;
      } catch (err: any) {
        console.warn(`[AmendoimCollector] Erro no download FTP: ${err?.message || err}`);
        return null;
      }
    };

    // Tentar IHM primário
    const primarySvc = ihmServiceOverride ?? this.getIHMService();
    let result = await tryWithService(primarySvc);

    // Tentar IHM2 se configurado e primário falhou
    if (!result) {
      const ihmCfg = getRuntimeConfig('ihm-config') || {};
      if ((ihmCfg as any).duasIHMs && (ihmCfg as any).ihm2) {
        const ih2 = (ihmCfg as any).ihm2;
        try {
          console.log(`[AmendoimCollector] Tentando IHM2 (${ih2.ip}) como fallback`);
          const svc2 = new IHMService(
            ih2.ip || '192.168.5.250',
            ih2.user || 'anonymous',
            ih2.password || ''
          );
          result = await tryWithService(svc2);
          if (result) console.log(`[AmendoimCollector] ✓ Arquivo obtido via IHM2: ${result.name}`);
        } catch (e) {
          console.warn('[AmendoimCollector] Erro ao tentar IHM2:', e);
        }
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

    // Arquivo não mudou (mas será reprocessado mesmo assim)
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
   * Limpa a cache de detecção de mudanças
   * Deve ser chamado ao limpar dados de produção para forçar reprocessamento
   */
  static clearChangeCache(): void {
    const count = this.changeRecords.size;
    this.changeRecords.clear();
    console.log(`[AmendoimCollector] Cache de mudanças limpa: ${count} registros removidos`);
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
      // ⚡ INICIALIZAR CACHE antes de processar
      await cacheService.init();
      console.log('[AmendoimCollector] Cache service inicializado');

      // Usar configuração do ihm-config
      const ihmCfg = getRuntimeConfig('ihm-config') || {};
      
      // ⚡ VALIDAÇÃO: Verificar se há configuração mínima
      const hasIpConfig = ihmCfg.ip || process.env.IHM_IP;
      if (!hasIpConfig) {
        console.warn('[AmendoimCollector] ⚠️  Configuração de IHM não encontrada, usando padrão 192.168.5.250');
      }
      
      // Valores padrão para evitar erros
      const ipPadrao = ihmCfg.ip || process.env.IHM_IP || '192.168.5.250';
      const userPadrao = ihmCfg.user || process.env.IHM_USER || 'anonymous';
      const passwordPadrao = ihmCfg.password || process.env.IHM_PASSWORD || '';
      const caminhoPadrao = ihmCfg.caminhoRemoto || '/InternalStorage/data/';
      
      // Gerar nomes de arquivo padrão baseado no mês/ano atual
      const agora = new Date();
      const mes = String(agora.getMonth() + 1).padStart(2, '0');
      const ano = agora.getFullYear();
      const arquivoPadrao = `Relatorio_${ano}_${mes}.csv`;
      
      const arquivoEntradaPadrao = ihmCfg.arquivoEntrada || arquivoPadrao;
      const arquivoSaidaPadrao = ihmCfg.arquivoSaida || arquivoPadrao;
      
      // ⚡ REGRA FIXA: IHM1 = ENTRADA, IHM2 = SAÍDA
      const ihmEntrada = ihmCfg.duasIHMs ? "ihm1" : "ihm1";
      const ihmSaida = ihmCfg.duasIHMs ? "ihm2" : "ihm1";
      
      console.log('[AmendoimCollector] Configuração (ihm-config):', {
        arquivoEntrada: arquivoEntradaPadrao,
        arquivoSaida: arquivoSaidaPadrao,
        caminhoRemoto: caminhoPadrao,
        duasIHMs: ihmCfg.duasIHMs,
        ihmEntrada,
        ihmSaida,
        ip: ipPadrao,
      });

      // Criar IHM1 (principal - sempre ENTRADA)
      const ihm1Service = new IHMService(ipPadrao, userPadrao, passwordPadrao, caminhoPadrao);
      console.log(`[AmendoimCollector] IHM1 criada - IP: ${ipPadrao}, Caminho: ${caminhoPadrao}`);

      // Criar IHM2 se configurada (sempre SAÍDA)
      let ihm2Service: IHMService | null = null;
      if (ihmCfg.duasIHMs && ihmCfg.ihm2 && ihmCfg.ihm2.ip) {
        const caminhoIhm2 = ihmCfg.ihm2.caminhoRemoto || caminhoPadrao;
        ihm2Service = new IHMService(
          ihmCfg.ihm2.ip,
          ihmCfg.ihm2.user || 'anonymous',
          ihmCfg.ihm2.password || '',
          caminhoIhm2
        );
        console.log(`[AmendoimCollector] IHM2 criada - IP: ${ihmCfg.ihm2.ip}, Caminho: ${caminhoIhm2}`);
      }

      // Determinar quais arquivos coletar e de qual IHM
      const arquivosParaColetar: Array<{ tipo: 'entrada' | 'saida'; arquivo: string; caminho: string; ihmService: IHMService }> = [];

      // Arquivo de ENTRADA - sempre da IHM1
      const ihmParaEntrada = ihm1Service;
      const caminhoEntrada = caminhoPadrao;
      
      arquivosParaColetar.push({
        tipo: 'entrada',
        arquivo: arquivoEntradaPadrao,
        caminho: caminhoEntrada,
        ihmService: ihmParaEntrada,
      });
      console.log(`[AmendoimCollector] ENTRADA será coletada da IHM1`);

      // Arquivo de SAÍDA - da IHM2 se configurado, senão IHM1
      const ihmParaSaida = ihmCfg.duasIHMs && ihm2Service ? ihm2Service : ihm1Service;
      const caminhoSaida = ihmCfg.duasIHMs && ihmCfg.ihm2?.caminhoRemoto 
        ? ihmCfg.ihm2.caminhoRemoto 
        : caminhoPadrao;
      
      arquivosParaColetar.push({
        tipo: 'saida',
        arquivo: arquivoSaidaPadrao,
        caminho: caminhoSaida,
        ihmService: ihmParaSaida,
      });
      console.log(`[AmendoimCollector] SAÍDA será coletada da ${ihmCfg.duasIHMs ? "IHM2" : "IHM1"}`);

      console.log(`[AmendoimCollector] Total de arquivos para coletar: ${arquivosParaColetar.length}`);
      arquivosParaColetar.forEach(a => console.log(`  - ${a.tipo}: ${a.arquivo}`));

      // Executar downloads e processamento em paralelo para reduzir tempo e isolar falhas por arquivo
      const tasks = arquivosParaColetar.map(async (arquivoInfo) => {
        try {
          const ihmLabel = arquivoInfo.ihmService === ihm1Service ? 'IHM1' : 'IHM2';
          console.log(`[AmendoimCollector] ⚡ Iniciando coleta ${arquivoInfo.tipo.toUpperCase()} da ${ihmLabel}`);
          console.log(`[AmendoimCollector] (parallel) Buscando arquivo ${arquivoInfo.tipo}: ${arquivoInfo.arquivo}`);

          // Normalize arquivo name defensively (strip garbage after .csv)
          let arquivoNome = String(arquivoInfo.arquivo || '');
          const lower = arquivoNome.toLowerCase();
          const idx = lower.indexOf('.csv');
          if (idx >= 0) arquivoNome = arquivoNome.slice(0, idx + 4);
          arquivoNome = arquivoNome.trim();

          // ⚡ SEMPRE BAIXAR DO IHM - SEM FALLBACK LOCAL
          const downloadedFile = await this.downloadSpecificFile(arquivoNome, this.TMP_DIR, arquivoInfo.tipo, arquivoInfo.ihmService);

          if (!downloadedFile) {
            // IHM não retornou arquivo - PULAR (não usar arquivo local)
            const msg = `Arquivo ${arquivoInfo.tipo} não disponível na ${ihmLabel} - pulando`;
            console.log(`⏭️  [AmendoimCollector] ${msg}`);
            return { filesProcessed: 0, recordsSaved: 0, errors: [] };
          }

          // Usar APENAS arquivo baixado do IHM
          const localFile = downloadedFile.localPath;
          const cacheKey = `${arquivoInfo.tipo}_${downloadedFile.name}`;
          
          console.log(`[AmendoimCollector] ✓ Arquivo ${arquivoInfo.tipo} baixado da ${ihmLabel}: ${downloadedFile.name} (${downloadedFile.size} bytes)`);

          // Ler conteúdo
          const csvContent = fs.readFileSync(localFile, 'utf-8');
          const fileSize = Buffer.byteLength(csvContent, 'utf-8');
          const fileHash = this.calculateContentHash(csvContent);

          // 🔍 Verificar cache do banco de dados para evitar duplicatas
          try {
            await cacheService.init();
            const cacheRecord = await cacheService.getByName(cacheKey);
            
            if (!cacheRecord) {
              // Arquivo nunca foi processado
              console.log(`📌 [AmendoimCollector] Novo arquivo ${arquivoInfo.tipo} detectado: ${cacheKey}`);
            } else if (cacheRecord.lastHash !== fileHash) {
              // Arquivo foi modificado
              console.log(`🔄 [AmendoimCollector] Arquivo ${arquivoInfo.tipo} modificado (hash diferente): ${cacheKey}`);
              console.log(`   Hash anterior: ${cacheRecord.lastHash?.substring(0, 10)}...`);
              console.log(`   Hash atual:    ${fileHash.substring(0, 10)}...`);
            } else {
              // Arquivo idêntico - pular processamento
              console.log(`⏭️  [AmendoimCollector] Arquivo ${arquivoInfo.tipo} idêntico - PULANDO processamento: ${cacheKey}`);
              console.log(`   Hash: ${fileHash.substring(0, 10)}...`);
              console.log(`   Última vez processado: ${cacheRecord.lastProcessedAt || 'N/A'}`);
              return { filesProcessed: 0, recordsSaved: 0, errors: [] };
            }
          } catch (cacheErr) {
            console.warn(`[AmendoimCollector] Erro ao verificar cache: ${cacheErr}`);
          }

          // 🔍 Detectar mudanças no arquivo (apenas para logging em memória)
          const changeInfo = await this.detectChanges(cacheKey, csvContent, fileSize);

          if (changeInfo.changeType !== 'none') {
            console.log(`� [AmendoimCollector] Mudança detectada (${arquivoInfo.tipo}): ${changeInfo.changeType}`);
          }

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

          // ✅ Atualizar cache no banco de dados após processamento bem-sucedido
          try {
            await cacheService.upsert({
              originalName: cacheKey,
              lastHash: fileHash,
              lastSize: fileSize,
              lastMTime: new Date().toISOString(),
              lastProcessedAt: new Date().toISOString(),
            });
            console.log(`[AmendoimCollector] Cache atualizado para: ${cacheKey}`);
          } catch (cacheErr) {
            console.warn(`[AmendoimCollector] Erro ao atualizar cache: ${cacheErr}`);
          }

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
   * Limpar cache de um arquivo específico (memória + banco)
   */
  static async clearFileCache(fileName: string): Promise<boolean> {
    // Limpar cache em memória
    const deletedMemory = this.changeRecords.delete(fileName);
    
    // Limpar cache no banco de dados
    try {
      await cacheService.init();
      const cacheRecord = await cacheService.getByName(fileName);
      if (cacheRecord) {
        const repo = cacheService.ds.getRepository(cacheService.ds.getMetadata('CacheFile').target);
        await repo.remove(cacheRecord);
        console.log(`🗑️  [AmendoimCollector] Cache DB limpo para: ${fileName}`);
      }
    } catch (err) {
      console.warn(`[AmendoimCollector] Erro ao limpar cache DB: ${err}`);
    }
    
    if (deletedMemory) {
      console.log(`🗑️  [AmendoimCollector] Cache memória limpo para: ${fileName}`);
    }
    return deletedMemory;
  }

  /**
   * Limpar todo o cache (memória + banco)
   */
  static async clearAllCache(): Promise<void> {
    // Limpar cache em memória
    const count = this.changeRecords.size;
    this.changeRecords.clear();
    console.log(`🗑️  [AmendoimCollector] Cache memória limpo (${count} arquivo(s))`);
    
    // Limpar cache do banco de dados (apenas registros de amendoim)
    try {
      await cacheService.init();
      const repo = cacheService.ds.getRepository(cacheService.ds.getMetadata('CacheFile').target);
      const amendoimRecords = await repo.createQueryBuilder('c')
        .where('c.originalName LIKE :pattern1 OR c.originalName LIKE :pattern2', {
          pattern1: 'entrada_%',
          pattern2: 'saida_%'
        })
        .getMany();
      
      if (amendoimRecords.length > 0) {
        await repo.remove(amendoimRecords);
        console.log(`🗑️  [AmendoimCollector] Cache DB limpo (${amendoimRecords.length} registro(s) de amendoim)`);
      }
    } catch (err) {
      console.warn(`[AmendoimCollector] Erro ao limpar cache DB: ${err}`);
    }
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
