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

// Resultado padrão para coletas individuais
const DEFAULT_RESULT = {
  processados: 0,
  salvos: 0,
  erros: 0,
  deduplicadas: 0,
  entradasSalvas: 0,
  saidasSalvas: 0,
};

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
    label: string,  // IHM1, IHM2, ou entrada/saida
    ihmServiceOverride?: IHMService
  ): Promise<{ name: string; localPath: string; size: number } | null> {
    const tryWithService = async (svc: IHMService) => {
      try {
        // 🔥 SEMPRE baixar arquivo para coleta incremental (ignora cache de tamanho)
        console.log(`[AmendoimCollector] 🔄 Baixando arquivo (${label}): ${fileName}`);
        const downloaded = await svc.forceDownloadFile(fileName, localDir);
        
        if (!downloaded) {
          console.log(`[AmendoimCollector] ⚠️  Arquivo não encontrado no IHM: ${fileName}`);
          return null;
        }

        console.log(`[AmendoimCollector] ✓ Arquivo (${label}) baixado: ${downloaded.name} (${downloaded.size} bytes)`);
        return downloaded;
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
   * Calcular hash de uma única linha CSV
   */
  private static calculateLineHash(line: string): string {
    return crypto.createHash('md5').update(line.trim()).digest('hex');
  }

  /**
   * Extrai apenas linhas NOVAS do CSV (coleta incremental)
   * Compara última linha do cache com linhas do arquivo (de baixo pra cima)
   * Retorna apenas as linhas que ainda não foram processadas
   */
  private static extractNewLines(
    csvContent: string,
    lastLineHash: string | undefined
  ): { newLines: string[]; totalLines: number; newCount: number } {
    const startTime = Date.now();
    const allLines = csvContent.split('\n').filter(line => line.trim());
    const totalLines = allLines.length;

    // Se não há hash de última linha, retornar tudo
    if (!lastLineHash) {
      console.log(`[AmendoimCollector] 📂 Sem cache de linha - processando arquivo completo (${totalLines} linhas)`);
      return { newLines: allLines, totalLines, newCount: totalLines };
    }

    // Buscar de baixo pra cima até encontrar a linha de referência
    const newLines: string[] = [];
    let foundReference = false;

    for (let i = allLines.length - 1; i >= 0; i--) {
      const line = allLines[i];
      const lineHash = this.calculateLineHash(line);

      if (lineHash === lastLineHash) {
        // Encontrou a linha de referência - parar
        foundReference = true;
        const elapsed = Date.now() - startTime;
        console.log(`[AmendoimCollector] ✓ Linha de referência encontrada na posição ${i + 1}/${totalLines} (${elapsed}ms)`);
        break;
      }

      // Adicionar linha nova (invertido porque estamos indo de baixo pra cima)
      newLines.unshift(line);
    }

    if (!foundReference) {
      // Não encontrou referência - arquivo pode ter sido truncado ou reiniciado
      const elapsed = Date.now() - startTime;
      console.log(`[AmendoimCollector] ⚠️  Linha de referência NÃO encontrada (${elapsed}ms) - processando arquivo completo`);
      return { newLines: allLines, totalLines, newCount: totalLines };
    }

    const elapsed = Date.now() - startTime;
    console.log(`[AmendoimCollector] 🔄 Coleta incremental: ${newLines.length} novas linhas de ${totalLines} totais (${elapsed}ms)`);
    return { newLines, totalLines, newCount: newLines.length };
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
    processados?: number;
    salvos?: number;
    erros?: number;
    deduplicadas?: number;
    entradasSalvas?: number;
    saidasSalvas?: number;
  }> {
    console.log('[AmendoimCollector] Iniciando coleta única');

    const result = {
      success: true,
      filesProcessed: 0,
      recordsSaved: 0,
      errors: [] as string[],
      processados: 0,
      salvos: 0,
      erros: 0,
      deduplicadas: 0,
      entradasSalvas: 0,
      saidasSalvas: 0,
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
      
      console.log('[AmendoimCollector] ========================================');
      console.log('[AmendoimCollector] 🔧 NOVA LÓGICA: Coleta por Balança');
      console.log('[AmendoimCollector] ========================================');
      console.log(`  - duasIHMs: ${ihmCfg.duasIHMs}`);
      console.log(`  - IHM1 IP: ${ipPadrao}`);
      console.log(`  - IHM1 Caminho: ${caminhoPadrao}`);
      console.log(`  - REGRA: Balanças 1,2 = ENTRADA | Balança 3 = SAÍDA`);
      console.log(`  - COLETA: Todos os arquivos CSV serão processados`);
      if (ihmCfg.duasIHMs && ihmCfg.ihm2) {
        console.log(`  - IHM2 IP: ${ihmCfg.ihm2.ip || 'NÃO CONFIGURADO'}`);
        console.log(`  - IHM2 Caminho: ${ihmCfg.ihm2.caminhoRemoto || 'PADRÃO'}`);
        console.log(`  - IHM2 User: ${ihmCfg.ihm2.user || 'anonymous'}`);
      } else {
        console.log(`  - IHM2: NÃO CONFIGURADA`);
      }
      console.log('[AmendoimCollector] ========================================');

      // Criar IHM1 (principal)
      const ihm1Service = new IHMService(ipPadrao, userPadrao, passwordPadrao, caminhoPadrao);
      console.log(`[AmendoimCollector] ✓ IHM1 criada - IP: ${ipPadrao}`);

      // Criar IHM2 se configurada
      let ihm2Service: IHMService | null = null;
      if (ihmCfg.duasIHMs && ihmCfg.ihm2 && ihmCfg.ihm2.ip) {
        const caminhoIhm2 = ihmCfg.ihm2.caminhoRemoto || caminhoPadrao;
        ihm2Service = new IHMService(
          ihmCfg.ihm2.ip,
          ihmCfg.ihm2.user || 'anonymous',
          ihmCfg.ihm2.password || '',
          caminhoIhm2
        );
        console.log(`[AmendoimCollector] ✓ IHM2 criada - IP: ${ihmCfg.ihm2.ip}`);
      }

      // 🔧 NOVA LÓGICA: Listar TODOS os arquivos CSV de cada IHM
      const arquivosParaColetar: Array<{ arquivo: string; caminho: string; ihmService: IHMService; ihmLabel: string }> = [];

      // Listar CSVs da IHM1
      console.log('[AmendoimCollector] 📂 Listando arquivos CSV da IHM1...');
      try {
        const arquivosIHM1 = await ihm1Service.listarArquivosCSV();
        console.log(`[AmendoimCollector] ✓ IHM1: ${arquivosIHM1.length} arquivos CSV encontrados`);
        arquivosIHM1.forEach(arquivo => {
          arquivosParaColetar.push({
            arquivo,
            caminho: caminhoPadrao,
            ihmService: ihm1Service,
            ihmLabel: 'IHM1'
          });
        });
      } catch (err: any) {
        console.error(`[AmendoimCollector] ❌ Erro ao listar CSVs da IHM1:`, err.message);
      }

      // Listar CSVs da IHM2 se configurada
      if (ihm2Service) {
        console.log('[AmendoimCollector] 📂 Listando arquivos CSV da IHM2...');
        try {
          const caminhoIhm2 = ihmCfg.ihm2?.caminhoRemoto || caminhoPadrao;
          const arquivosIHM2 = await ihm2Service.listarArquivosCSV();
          console.log(`[AmendoimCollector] ✓ IHM2: ${arquivosIHM2.length} arquivos CSV encontrados`);
          arquivosIHM2.forEach(arquivo => {
            arquivosParaColetar.push({
              arquivo,
              caminho: caminhoIhm2,
              ihmService: ihm2Service!,
              ihmLabel: 'IHM2'
            });
          });
        } catch (err: any) {
          console.error(`[AmendoimCollector] ❌ Erro ao listar CSVs da IHM2:`, err.message);
        }
      }

      console.log(`[AmendoimCollector] 📊 Total de arquivos CSV para processar: ${arquivosParaColetar.length}`);
      arquivosParaColetar.forEach(a => console.log(`  - ${a.ihmLabel}: ${a.arquivo}`));

      // Executar downloads e processamento em paralelo
      const tasks = arquivosParaColetar.map(async (arquivoInfo) => {
        try {
          console.log(`[AmendoimCollector] ⚡ Iniciando coleta da ${arquivoInfo.ihmLabel}: ${arquivoInfo.arquivo}`);

          // Baixar arquivo forçado (ignora cache de tamanho)
          const downloadedFile = await this.downloadSpecificFile(arquivoInfo.arquivo, this.TMP_DIR, arquivoInfo.ihmLabel, arquivoInfo.ihmService);
          
          if (!downloadedFile) {
            const msg = `Arquivo NÃO ENCONTRADO na ${arquivoInfo.ihmLabel}: ${arquivoInfo.arquivo}`;
            console.error(`[AmendoimCollector] ❌ ${msg}`);
            return { ...DEFAULT_RESULT, erros: [msg] };
          }

          // Criar chave de cache
          const cacheKey = `${arquivoInfo.ihmLabel}_${downloadedFile.name}`;
          console.log(`[AmendoimCollector] ✓ Arquivo baixado da ${arquivoInfo.ihmLabel}: ${downloadedFile.name} (${downloadedFile.size} bytes)`);

          // Ler conteúdo CSV
          const csvContent = fs.readFileSync(downloadedFile.localPath, 'utf8');

          // Verificar cache - contar linhas no arquivo atual
          let csvDeduplicated = csvContent;
          let linhasNovas = csvContent.split('\n').filter(l => l.trim() !== '').length;
          let deduplicadas = 0;

          const cachedEntry = await cacheService.getCacheByName(cacheKey);

          if (cachedEntry && cachedEntry.lastProcessedLine) {
            console.log(`🗂️  [AmendoimCollector] Cache encontrado: ${cacheKey}`);
            console.log(`    Última coleta: ${cachedEntry.lastProcessedLine} linhas processadas em ${cachedEntry.lastModified || 'data desconhecida'}`);

            // Contar linhas atuais no arquivo
            const linhasCSVAtuais = csvContent.split('\n').filter(l => l.trim() !== '').length;

            if (linhasCSVAtuais > cachedEntry.lastProcessedLine) {
              // Arquivo CRESCEU - coletar apenas linhas novas
              console.log(`📌 [AmendoimCollector] Arquivo cresceu: ${cacheKey}`);
              console.log(`    Linhas já processadas: ${cachedEntry.lastProcessedLine}`);
              console.log(`    Linhas totais atuais: ${linhasCSVAtuais}`);
              linhasNovas = linhasCSVAtuais - cachedEntry.lastProcessedLine;
              console.log(`    Linhas novas para processar: ${linhasNovas}`);

              if (linhasNovas === 0) {
                console.log(`⏭️  [AmendoimCollector] Nenhuma linha nova no arquivo - PULANDO: ${cacheKey}`);
                return DEFAULT_RESULT;
              }

              // Implementar coleta incremental - pegar apenas linhas novas (do final do arquivo)
              const linhas = csvContent.split('\n').filter(l => l.trim() !== '');
              const linhasParaProcessar = linhas.slice(cachedEntry.lastProcessedLine); // Pegar últimas N linhas novas
              csvDeduplicated = linhasParaProcessar.join('\n');
              deduplicadas = linhas.length - linhasParaProcessar.length;

              console.log(`🔄 [AmendoimCollector] Coleta INCREMENTAL para ${arquivoInfo.ihmLabel}:`);
              console.log(`    Linhas puladas: ${deduplicadas}`);
              console.log(`    Linhas a processar: ${linhasParaProcessar.length}`);
            } else if (linhasCSVAtuais === cachedEntry.lastProcessedLine) {
              // Arquivo NÃO MUDOU - PULAR completamente
              console.log(`⏭️  [AmendoimCollector] Arquivo não mudou desde última coleta: ${cacheKey}`);
              console.log(`    Linhas: ${linhasCSVAtuais} (sem mudanças)`);
              return DEFAULT_RESULT;
            } else {
              // Arquivo ENCOLHEU - arquivo foi substituído ou truncado
              console.log(`⚠️  [AmendoimCollector] Arquivo ENCOLHEU - provável substituição: ${cacheKey}`);
              console.log(`    Linhas anteriores: ${cachedEntry.lastProcessedLine}`);
              console.log(`    Linhas atuais: ${linhasCSVAtuais}`);
              console.log(`    Processando arquivo completo novamente...`);
              // Processar arquivo completo (csvDeduplicated já é csvContent)
              deduplicadas = 0;
              linhasNovas = linhasCSVAtuais;
            }
          } else {
            console.log(`🆕 [AmendoimCollector] Nenhum cache encontrado - primeira coleta de: ${cacheKey}`);
            // Sem cache - processar arquivo completo
          }

          // ✅ PROCESSAMENTO SIMPLIFICADO: Apenas chamar processarCSV
          // O próprio AmendoimService determina tipo baseado no campo balança
          const processResult = await AmendoimService.processarCSV(csvDeduplicated);
          
          const linhasProcessadas = linhasNovas;
          const totalSalvas = processResult.salvos;
          const totalErros = processResult.erros.length;
          const entradasSalvas = processResult.entradasSalvas || 0;
          const saidasSalvas = processResult.saidasSalvas || 0;

          console.log(`[AmendoimCollector] 📊 Resultado da ${arquivoInfo.ihmLabel}:`);
          console.log(`  Processadas: ${processResult.processados}, Salvos: ${totalSalvas}, Erros: ${totalErros}`);
          console.log(`  Entradas: ${entradasSalvas}, Saídas: ${saidasSalvas}`);
          console.log(`  Duplicatas bloqueadas: ${deduplicadas}`);

          // 💾 Criar backup com prefixo IHM para evitar conflitos entre IHM1/IHM2
          try {
            await backupSvc.backupFile({
              originalname: downloadedFile.name,
              path: downloadedFile.localPath,
              mimetype: 'text/csv',
              size: downloadedFile.size,
            }, arquivoInfo.ihmLabel);
            console.log(`💾 [AmendoimCollector] Backup criado: ${arquivoInfo.ihmLabel}_${downloadedFile.name}`);
          } catch (backupErr: any) {
            console.warn(`[AmendoimCollector] ⚠️  Erro ao criar backup: ${backupErr.message}`);
          }

          // Atualizar cache - salvar total de linhas do arquivo ATUAL
          const linhasTotaisAtuais = csvContent.split('\n').filter(l => l.trim() !== '').length;
          await cacheService.updateCache(cacheKey, downloadedFile.size, linhasTotaisAtuais);
          console.log(`💾 [AmendoimCollector] Cache atualizado: ${cacheKey} → ${linhasTotaisAtuais} linhas totais`);

          return {
            processados: processResult.processados,
            salvos: totalSalvas,
            erros: totalErros,
            deduplicadas,
            entradasSalvas,
            saidasSalvas,
          };

        } catch (err: any) {
          const errorMsg = `Erro ao coletar ${arquivoInfo.ihmLabel}/${arquivoInfo.arquivo}: ${err.message}`;
          console.error(`[AmendoimCollector] ❌ ${errorMsg}`);
          return { ...DEFAULT_RESULT, erros: [errorMsg] };
        }
      });

      // Aguardar todas as tasks (em paralelo) e agregar resultados
      const settled = await Promise.all(tasks);
      for (const r of settled) {
        result.processados += r.processados;
        result.salvos += r.salvos;
        result.erros += typeof r.erros === 'number' ? r.erros : r.erros.length;
        result.deduplicadas += r.deduplicadas;
        result.entradasSalvas += r.entradasSalvas || 0;
        result.saidasSalvas += r.saidasSalvas || 0;
      }

      console.log('[AmendoimCollector] ========================================');
      console.log('[AmendoimCollector] � RESUMO DA COLETA');
      console.log('[AmendoimCollector] ========================================');
      console.log(`  📂 Arquivos processados: ${arquivosParaColetar.length}`);
      console.log(`  � Total processado: ${result.processados}`);
      console.log(`  💾 Total salvos: ${result.salvos}`);
      console.log(`    ⬆️  Entradas: ${result.entradasSalvas}`);
      console.log(`    ⬇️  Saídas: ${result.saidasSalvas}`);
      console.log(`  �️ Duplicatas bloqueadas: ${result.deduplicadas}`);
      console.log(`  ⚠️  Erros: ${result.erros}`);
      console.log('[AmendoimCollector] ========================================');
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
