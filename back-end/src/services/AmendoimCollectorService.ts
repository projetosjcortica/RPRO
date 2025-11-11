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
        // 🔥 SEMPRE baixar arquivo para coleta incremental (ignora cache de tamanho)
        console.log(`[AmendoimCollector] 🔄 Baixando arquivo ${tipo} (forçado): ${fileName}`);
        const downloaded = await svc.forceDownloadFile(fileName, localDir);
        
        if (!downloaded) {
          console.log(`[AmendoimCollector] ⚠️  Arquivo não encontrado no IHM: ${fileName}`);
          return null;
        }

        console.log(`[AmendoimCollector] ✓ Arquivo ${tipo} baixado: ${downloaded.name} (${downloaded.size} bytes)`);
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
      const arquivoPadraoEntrada = `Relatorio_${ano}_${mes}.csv`;  // IHM1 = ENTRADA
      
      // ⚡ LÓGICA INTELIGENTE: Definir arquivo padrão baseado no modo de coleta
      let arquivoPadraoSaida: string;
      
      if (ihmCfg.duasIHMs && ihmCfg.ihm2 && ihmCfg.ihm2.ip) {
        // Tem IHM2 configurada → usar Relatorio2
        arquivoPadraoSaida = `Relatorio2_${ano}_${mes}.csv`;
      } else {
        // IHM única - verificar modo de coleta
        if (ihmCfg.modoColeta === 'entrada-saida') {
          // Modo entrada-saida: usuário especifica arquivos diferentes
          arquivoPadraoSaida = `Relatorio2_${ano}_${mes}.csv`; // Fallback caso não especificado
        } else if (ihmCfg.modoColeta === 'apenas-entrada') {
          // Modo apenas-entrada: não precisa arquivo de saída
          arquivoPadraoSaida = ''; // Não coletar saída
        } else if (ihmCfg.modoColeta === 'apenas-saida') {
          // Modo apenas-saida: não precisa arquivo de entrada
          arquivoPadraoSaida = arquivoPadraoEntrada; // Será o único arquivo
        } else {
          // Sem modo definido - assumir mesmo arquivo (legacy)
          arquivoPadraoSaida = arquivoPadraoEntrada;
          console.log('[AmendoimCollector] ⚠️  Modo de coleta não definido - usando mesmo arquivo');
        }
      }
      
      // Usar configuração do usuário se especificada
      const arquivoEntradaPadrao = ihmCfg.arquivoEntrada || arquivoPadraoEntrada;
      const arquivoSaidaPadrao = ihmCfg.arquivoSaida || arquivoPadraoSaida;
      
      // ⚡ REGRA FIXA: IHM1 = ENTRADA, IHM2 = SAÍDA
      const ihmEntrada = "ihm1";  // SEMPRE IHM1
      const ihmSaida = ihmCfg.duasIHMs ? "ihm2" : "ihm1";
      
      console.log('[AmendoimCollector] ========================================');
      console.log('[AmendoimCollector] Configuração completa (ihm-config):');
      console.log('[AmendoimCollector] ========================================');
      console.log(`  - duasIHMs: ${ihmCfg.duasIHMs}`);
      console.log(`  - Arquivo Entrada: ${arquivoEntradaPadrao} ← IHM1`);
      console.log(`  - Arquivo Saída: ${arquivoSaidaPadrao} ← ${ihmSaida.toUpperCase()}`);
      console.log(`  - IHM1 IP: ${ipPadrao}`);
      console.log(`  - IHM1 Caminho: ${caminhoPadrao}`);
      console.log(`  - IHM1 Função: ENTRADA (padrão fixo)`);
      if (ihmCfg.duasIHMs && ihmCfg.ihm2) {
        console.log(`  - IHM2 IP: ${ihmCfg.ihm2.ip || 'NÃO CONFIGURADO'}`);
        console.log(`  - IHM2 Caminho: ${ihmCfg.ihm2.caminhoRemoto || 'PADRÃO'}`);
        console.log(`  - IHM2 User: ${ihmCfg.ihm2.user || 'anonymous'}`);
        console.log(`  - IHM2 Função: SAÍDA`);
      } else {
        console.log(`  - IHM2: NÃO CONFIGURADA (SAÍDA também virá da IHM1)`);
      }
      console.log('[AmendoimCollector] ========================================');

      // Criar IHM1 (principal - sempre ENTRADA)
      const ihm1Service = new IHMService(ipPadrao, userPadrao, passwordPadrao, caminhoPadrao);
      console.log(`[AmendoimCollector] ✓ IHM1 criada - IP: ${ipPadrao}`);

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
        console.log(`[AmendoimCollector] ✓ IHM2 criada - IP: ${ihmCfg.ihm2.ip}`);
      } else if (ihmCfg.duasIHMs) {
        console.log(`[AmendoimCollector] ⚠️  AVISO: duasIHMs=true mas IHM2 não está configurada!`);
        console.log(`[AmendoimCollector]     Usando apenas IHM1 para entrada e saída`);
      }

      // Determinar quais arquivos coletar e de qual IHM
      const arquivosParaColetar: Array<{ tipo: 'entrada' | 'saida'; arquivo: string; caminho: string; ihmService: IHMService }> = [];

      // Verificar modo de coleta para IHM única
      const coletarEntrada = !ihmCfg.modoColeta || ihmCfg.modoColeta === 'entrada-saida' || ihmCfg.modoColeta === 'apenas-entrada';
      const coletarSaida = !ihmCfg.modoColeta || ihmCfg.modoColeta === 'entrada-saida' || ihmCfg.modoColeta === 'apenas-saida';

      // Arquivo de ENTRADA - sempre da IHM1
      const ihmParaEntrada = ihm1Service;
      const caminhoEntrada = caminhoPadrao;
      
      if (coletarEntrada && arquivoEntradaPadrao) {
        arquivosParaColetar.push({
          tipo: 'entrada',
          arquivo: arquivoEntradaPadrao,
          caminho: caminhoEntrada,
          ihmService: ihmParaEntrada,
        });
        console.log(`[AmendoimCollector] ✓ ENTRADA será coletada: ${arquivoEntradaPadrao} ← IHM1`);
      } else {
        console.log(`[AmendoimCollector] ⊘ ENTRADA não será coletada (modo: ${ihmCfg.modoColeta})`);
      }

      // Arquivo de SAÍDA - da IHM2 se configurado, senão IHM1
      const ihmParaSaida = ihmCfg.duasIHMs && ihm2Service ? ihm2Service : ihm1Service;
      const ihmSaidaLabel = ihmCfg.duasIHMs && ihm2Service ? "IHM2" : "IHM1";
      const caminhoSaida = ihmCfg.duasIHMs && ihmCfg.ihm2?.caminhoRemoto 
        ? ihmCfg.ihm2.caminhoRemoto 
        : caminhoPadrao;
      
      // ⚡ OTIMIZAÇÃO: Se entrada e saída são o MESMO arquivo da MESMA IHM, coletar apenas uma vez
      const mesmoArquivo = arquivoEntradaPadrao === arquivoSaidaPadrao && ihmParaEntrada === ihmParaSaida;
      
      if (coletarSaida && arquivoSaidaPadrao) {
        if (mesmoArquivo && coletarEntrada) {
          console.log(`[AmendoimCollector] ℹ️  ENTRADA e SAÍDA usam o MESMO arquivo: ${arquivoEntradaPadrao}`);
          console.log(`[AmendoimCollector]    Será baixado UMA vez e processado com mapeamento de balanças`);
          // Não adicionar novamente - já foi adicionado na entrada
        } else {
          // Arquivos diferentes ou não está coletando entrada
          arquivosParaColetar.push({
            tipo: 'saida',
            arquivo: arquivoSaidaPadrao,
            caminho: caminhoSaida,
            ihmService: ihmParaSaida,
          });
          console.log(`[AmendoimCollector] ✓ SAÍDA será coletada: ${arquivoSaidaPadrao} ← ${ihmSaidaLabel}`);
        }
      } else {
        console.log(`[AmendoimCollector] ⊘ SAÍDA não será coletada (modo: ${ihmCfg.modoColeta})`);
      }

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

          // ⚡ SEMPRE BAIXAR DO IHM - DOWNLOAD FORÇADO PARA COLETA INCREMENTAL
          const downloadedFile = await this.downloadSpecificFile(arquivoNome, this.TMP_DIR, arquivoInfo.tipo, arquivoInfo.ihmService);

          if (!downloadedFile) {
            // Arquivo não encontrado no IHM
            const msg = `Arquivo ${arquivoInfo.tipo} NÃO ENCONTRADO no ${ihmLabel}: ${arquivoNome}`;
            console.log(`❌ [AmendoimCollector] ${msg}`);
            return { filesProcessed: 0, recordsSaved: 0, errors: [msg] };
          }

          // Usar APENAS arquivo baixado do IHM
          const localFile = downloadedFile.localPath;
          const cacheKey = `${arquivoInfo.tipo}_${downloadedFile.name}`;
          
          console.log(`[AmendoimCollector] ✓ Arquivo ${arquivoInfo.tipo} baixado da ${ihmLabel}: ${downloadedFile.name} (${downloadedFile.size} bytes)`);

          // Ler conteúdo
          const csvContent = fs.readFileSync(localFile, 'utf-8');
          const fileSize = Buffer.byteLength(csvContent, 'utf-8');
          const fileHash = this.calculateContentHash(csvContent);

          // 🔍 Verificar cache do banco de dados para coleta incremental
          let csvToProcess = csvContent;
          let isIncremental = false;
          
          try {
            await cacheService.init();
            const cacheRecord = await cacheService.getByName(cacheKey);
            
            if (!cacheRecord) {
              // Arquivo nunca foi processado
              console.log(`📌 [AmendoimCollector] Novo arquivo ${arquivoInfo.tipo} detectado: ${cacheKey}`);
            } else {
              // Arquivo já existe no cache - fazer coleta incremental
              const { newLines, totalLines, newCount } = this.extractNewLines(
                csvContent,
                cacheRecord.lastLineHash || undefined
              );

              if (newCount === 0) {
                // Nenhuma linha nova - pular processamento
                console.log(`⏭️  [AmendoimCollector] Nenhuma linha nova no arquivo ${arquivoInfo.tipo} - PULANDO: ${cacheKey}`);
                console.log(`   Última linha hash: ${cacheRecord.lastLineHash?.substring(0, 10)}...`);
                console.log(`   Última vez processado: ${cacheRecord.lastProcessedAt || 'N/A'}`);
                return { filesProcessed: 0, recordsSaved: 0, errors: [] };
              }

              // Processar apenas linhas novas
              csvToProcess = newLines.join('\n');
              isIncremental = true;
              console.log(`🔄 [AmendoimCollector] Coleta INCREMENTAL para ${arquivoInfo.tipo}:`);
              console.log(`   Total de linhas no arquivo: ${totalLines}`);
              console.log(`   Linhas NOVAS a processar: ${newCount}`);
            }
          } catch (cacheErr) {
            console.warn(`[AmendoimCollector] Erro ao verificar cache: ${cacheErr}`);
          }

          // Fazer backup do arquivo (apenas se não for incremental ou se for primeira vez)
          if (!isIncremental) {
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
          }

          // Processar CSV com o tipo correto (entrada ou saida)
          const processStart = Date.now();
          let processResult;
          
          // 🛡️ DEDUPLICAÇÃO ADICIONAL: Remover linhas duplicadas do próprio lote antes de processar
          const uniqueLines = new Set<string>();
          const csvLinesToProcess = csvToProcess.split('\n').filter(line => {
            const trimmed = line.trim();
            if (!trimmed) return false;
            
            if (uniqueLines.has(trimmed)) {
              // Linha duplicada no próprio arquivo, ignorar
              return false;
            }
            
            uniqueLines.add(trimmed);
            return true;
          });
          
          const csvDeduplicated = csvLinesToProcess.join('\n');
          const duplicatasRemovidas = csvToProcess.split('\n').filter(l => l.trim()).length - csvLinesToProcess.length;
          
          if (duplicatasRemovidas > 0) {
            console.log(`[AmendoimCollector] 🛡️ ${duplicatasRemovidas} linhas duplicadas removidas do lote antes do processamento`);
          }
          
          // ⚡ OTIMIZAÇÃO: Se arquivo ÚNICO, processar DUAS vezes (entrada + saída) com filtro de balança
          if (mesmoArquivo) {
            console.log(`[AmendoimCollector] 🔄 Processando arquivo único com separação por balança...`);
            
            // Processar como ENTRADA
            const resultEntrada = await AmendoimService.processarCSV(csvDeduplicated, 'entrada');
            console.log(`   ✅ ENTRADA: ${resultEntrada.salvos} registros salvos`);
            
            // Processar como SAÍDA
            const resultSaida = await AmendoimService.processarCSV(csvDeduplicated, 'saida');
            console.log(`   ✅ SAÍDA: ${resultSaida.salvos} registros salvos`);
            
            // Agregar resultados
            processResult = {
              processados: resultEntrada.processados + resultSaida.processados,
              salvos: resultEntrada.salvos + resultSaida.salvos,
              erros: [...resultEntrada.erros, ...resultSaida.erros],
            };
          } else {
            // Arquivo único para um tipo específico
            processResult = await AmendoimService.processarCSV(csvDeduplicated, arquivoInfo.tipo);
          }
          
          const processElapsed = Date.now() - processStart;
          console.log(`⚡ [AmendoimCollector] Processamento concluído em ${processElapsed}ms`);

          // 🔹 Calcular hash da ÚLTIMA LINHA do arquivo original (para próxima coleta)
          const allLines = csvContent.split('\n').filter(line => line.trim());
          const lastLine = allLines[allLines.length - 1];
          const lastLineHash = lastLine ? this.calculateLineHash(lastLine) : null;

          // ✅ Atualizar cache no banco de dados após processamento bem-sucedido
          try {
            await cacheService.upsert({
              originalName: cacheKey,
              lastHash: fileHash,
              lastLineHash: lastLineHash || null,
              lastSize: fileSize,
              lastMTime: new Date().toISOString(),
              lastProcessedAt: new Date().toISOString(),
            });
            console.log(`[AmendoimCollector] ✅ Cache atualizado para: ${cacheKey}`);
            if (lastLineHash) {
              console.log(`   Última linha hash: ${lastLineHash.substring(0, 10)}...`);
            }
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
            modo: isIncremental ? 'INCREMENTAL' : 'COMPLETO',
            processados: processResult.processados,
            salvos: processResult.salvos,
            fileSize,
          });

          return { filesProcessed: 1, recordsSaved: processResult.salvos || 0, errors };
        } catch (err: any) {
          console.error(`[AmendoimCollector] ❌ Erro ao processar ${arquivoInfo.tipo}:`, err?.message || err);
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

      console.log('[AmendoimCollector] ========================================');
      console.log('[AmendoimCollector] 📊 RESUMO DA COLETA');
      console.log('[AmendoimCollector] ========================================');
      console.log(`  ✅ Arquivos processados: ${result.filesProcessed}`);
      console.log(`  💾 Registros salvos: ${result.recordsSaved}`);
      console.log(`  ⚠️  Erros: ${result.errors.length}`);
      if (result.errors.length > 0) {
        result.errors.forEach(err => console.log(`     - ${err}`));
      }
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
