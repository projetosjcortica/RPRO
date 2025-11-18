import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AmendoimService } from './AmendoimService';
import { backupSvc } from './backupService';
import { IHMService } from './IHMService';
import { getRuntimeConfig, setRuntimeConfigs } from '../core/runtimeConfig';
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
   rawSaved: 0,
 };

export class AmendoimCollectorService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunning = false;
  private static ihmService: IHMService | null = null;
  // Use runtime-config 'collector_tmp' if set, otherwise prefer OS temp directory.
  private static TMP_DIR = ((): string => {
    try {
      const cfg = getRuntimeConfig('collector_tmp') || process.env.COLLECTOR_TMP;
      if (cfg && String(cfg).trim() !== '') return path.resolve(String(cfg));
    } catch (e) {
      // ignore and fallback
    }
    // Fallback to OS tempdir to ensure writable location in packaged apps
    return path.resolve(require('os').tmpdir(), 'cortez-collector-tmp');
  })();
  
  // Cache de detecção de mudanças
  private static changeRecords: Map<string, ChangeDetectionRecord> = new Map();

  /** Normalize IHM2 config supporting both `ihm2` object and flat `ip2/user2/password2` */
  private static resolveIhm2Config(iCfg: any): { ip: string; user?: string; password?: string; caminhoRemoto?: string; source: 'ihm2' | 'flat' } | null {
    if (!iCfg) return null;
    if (iCfg.ihm2 && iCfg.ihm2.ip) {
      return {
        ip: String(iCfg.ihm2.ip),
        user: String(iCfg.ihm2.user || ''),
        password: String(iCfg.ihm2.password || ''),
        caminhoRemoto: iCfg.ihm2.caminhoRemoto,
        source: 'ihm2'
      };
    }
    if (iCfg.ip2) {
      return {
        ip: String(iCfg.ip2),
        user: String(iCfg.user2 || ''),
        password: String(iCfg.password2 || ''),
        caminhoRemoto: iCfg.caminhoRemoto2 || iCfg.caminhoRemoto,
        source: 'flat'
      };
    }
    return null;
  }

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
      const ih2 = this.resolveIhm2Config(ihmCfg as any);
      if (ih2 && ih2.ip) {
        try {
          console.log(`[AmendoimCollector] Tentando IHM2 (${ih2.ip}) como fallback`);
          const runtime = getRuntimeConfig('ihm-config') || {};
          const defaultRemote = runtime.caminhoRemoto || '/InternalStorage/data/';
          const svc2 = new IHMService(
            String(ih2.ip || '192.168.5.250'),
            String(ih2.user || 'anonymous'),
            String(ih2.password || ''),
            String(ih2.caminhoRemoto || defaultRemote)
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
      rawSaved: 0,
      erros: 0,
      deduplicadas: 0,
      entradasSalvas: 0,
      saidasSalvas: 0,
    };

    try {
      // ⚡ INICIALIZAR CACHE antes de processar
      await cacheService.init();
      console.log('[AmendoimCollector] Cache service inicializado');

      // Garantir TMP_DIR existe e é gravável
      try {
        if (!fs.existsSync(this.TMP_DIR)) {
          fs.mkdirSync(this.TMP_DIR, { recursive: true });
          console.log(`[AmendoimCollector] Diretório TMP criado: ${this.TMP_DIR}`);
        }
        fs.accessSync(this.TMP_DIR, fs.constants.W_OK);
      } catch (permErr: any) {
        const msg = `TMP_DIR não gravável: ${this.TMP_DIR} - ${permErr?.message || permErr}`;
        console.error(`[AmendoimCollector] ❌ ${msg}`);
        throw new Error(msg);
      }

      // Usar configuração do ihm-config (preferida) ou amendoim-config quando disponível
      const ihmCfg = getRuntimeConfig('ihm-config') || {};
      console.log('[AmendoimCollector] runtime ihm-config (pre overlay):', JSON.stringify(ihmCfg));
      // Prefer amendoim-config values for file selection if present
      try {
        const { AmendoimConfigService } = await Promise.resolve().then(() => require('./AmendoimConfigService'));
        const amCfg = AmendoimConfigService.getConfig();
        // If amendoim-config defines IHM2 config and runtime ihm-config has not set it,
        // copy it so clearing DB will not remove IHM2 info.
        if (amCfg && amCfg.ihm2 && !(ihmCfg as any).ihm2 && !(ihmCfg as any).ip2) {
          (ihmCfg as any).ip2 = amCfg.ihm2.ip;
          (ihmCfg as any).user2 = amCfg.ihm2.user;
          (ihmCfg as any).password2 = amCfg.ihm2.password;
          (ihmCfg as any).caminhoRemoto2 = amCfg.ihm2.caminhoRemoto;
          try {
            setRuntimeConfigs({ 'ihm-config': ihmCfg });
            console.log('[AmendoimCollector] Persisted ihm-config with IHM2 fields from amendoim-config');
          } catch (e) {
            console.warn('[AmendoimCollector] failed to persist ihm-config mapping from amendoim-config:', e);
          }
        }

        // If amendoim-config defines an explicit localCSV filename, copy it into ihmCfg for selection
        if (amCfg && (amCfg as any).localCSV) {
          ihmCfg.localCSV = (amCfg as any).localCSV;
        }
        if (amCfg && amCfg.ihm2 && (amCfg.ihm2 as any).localCSV) {
          ihmCfg.localCSV2 = (amCfg.ihm2 as any).localCSV;
        }
      } catch (e) {
        // ignore if AmendoimConfigService not available
      }
      
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
      // Show IHM2 info if present (supporting flat ip2 keys as well)
      const resolvedIhm2Display = this.resolveIhm2Config(ihmCfg);
      if (resolvedIhm2Display) {
        console.log(`  - IHM2 IP: ${resolvedIhm2Display.ip}`);
        console.log(`  - IHM2 Caminho: ${resolvedIhm2Display.caminhoRemoto || 'PADRÃO'}`);
        console.log(`  - IHM2 User: ${resolvedIhm2Display.user || 'anonymous'}`);
      } else {
        console.log(`  - IHM2: NÃO CONFIGURADA`);
      }
      console.log('[AmendoimCollector] ========================================');
      console.log('[AmendoimCollector] ========================================');

      // Criar IHM1 (principal)
      const ihm1Service = new IHMService(ipPadrao, userPadrao, passwordPadrao, caminhoPadrao);
      console.log(`[AmendoimCollector] ✓ IHM1 criada - IP: ${ipPadrao}`);

      // Criar IHM2 se configurada (aceita nested ihm2 ou ip2/user2 fields)
      let ihm2Service: IHMService | null = null;
      const ih2cfg = this.resolveIhm2Config(ihmCfg as any);
      if (ih2cfg && ih2cfg.ip) {
        const caminhoIhm2 = ih2cfg.caminhoRemoto || caminhoPadrao;
        ihm2Service = new IHMService(
          ih2cfg.ip,
          ih2cfg.user || 'anonymous',
          ih2cfg.password || '',
          caminhoIhm2
        );
        console.log(`[AmendoimCollector] ✓ IHM2 criada - IP: ${ih2cfg.ip} (source: ${ih2cfg.source})`);
      }

      // 🔧 NOVA LÓGICA: Listar TODOS os arquivos CSV de cada IHM
      const arquivosParaColetar: Array<{ arquivo: string; caminho: string; ihmService: IHMService; ihmLabel: string }> = [];

      // Listar CSVs da IHM1
      console.log('[AmendoimCollector] 📂 Listando arquivos CSV da IHM1...');
      try {
        let arquivosIHM1 = await ihm1Service.listarArquivosCSV();
        console.log(`[AmendoimCollector] ✓ IHM1: ${arquivosIHM1.length} arquivos CSV encontrados`);
        // If config defines a specific filename for this IHM, filter to that file only
        if (ihmCfg && ihmCfg.localCSV && String(ihmCfg.localCSV).trim() !== '') {
          const requested = String(ihmCfg.localCSV).trim();
          const filtered = arquivosIHM1.filter(n => n === requested || n.includes(requested));
          console.log(`[AmendoimCollector] IHM1 localCSV configured: '${requested}' -> matched ${filtered.length} file(s)`);
          arquivosIHM1 = filtered;

          // If no files matched but a filename was requested, attempt a direct force download later
          if (arquivosIHM1.length === 0) {
            console.log(`[AmendoimCollector] ⚠️ localCSV '${requested}' não encontrado na listagem; será tentado download direto via forceDownloadFile`);
            // push a marker entry so we attempt forceDownloadFile later
            arquivosIHM1.push(requested);
          }
        }
        arquivosIHM1.forEach(arquivo => {
          arquivosParaColetar.push({ arquivo, caminho: caminhoPadrao, ihmService: ihm1Service, ihmLabel: 'IHM1' });
        });
      } catch (err: any) {
        console.error(`[AmendoimCollector] ❌ Erro ao listar CSVs da IHM1:`, err.message);
      }

      // Listar CSVs da IHM2 se configurada
      if (ihm2Service) {
        console.log('[AmendoimCollector] 📂 Listando arquivos CSV da IHM2...');
        try {
          const caminhoIhm2 = ih2cfg?.caminhoRemoto || caminhoPadrao;
          let arquivosIHM2 = await ihm2Service.listarArquivosCSV();
          console.log(`[AmendoimCollector] ✓ IHM2: ${arquivosIHM2.length} arquivos CSV encontrados`);
          // if list returned 0 but localCSV2 is configured, attempt force download
          if (arquivosIHM2.length === 0 && (ihmCfg as any).localCSV2 && String((ihmCfg as any).localCSV2).trim() !== '') {
            const requested2 = String((ihmCfg as any).localCSV2).trim();
            console.log(`[AmendoimCollector] ⚠️ IHM2 list 0 files; attempting forceDownloadFile('${requested2}')`);
            try {
              const localDirForIhm2 = path.join(this.TMP_DIR, 'IHM2');
              if (!fs.existsSync(localDirForIhm2)) fs.mkdirSync(localDirForIhm2, { recursive: true });
              const d = await this.downloadSpecificFile(requested2, localDirForIhm2, 'IHM2', ihm2Service);
              if (d) arquivosIHM2 = [d.name];
            } catch (e) {
              console.warn('[AmendoimCollector] error forcing localCSV2 download:', e);
            }
          }
          if (ihmCfg && ihmCfg.localCSV2 && String(ihmCfg.localCSV2).trim() !== '') {
            const requested2 = String(ihmCfg.localCSV2).trim();
            const filtered2 = arquivosIHM2.filter(n => n === requested2 || n.includes(requested2));
            console.log(`[AmendoimCollector] IHM2 localCSV configured: '${requested2}' -> matched ${filtered2.length} file(s)`);
            arquivosIHM2 = filtered2;

            if (arquivosIHM2.length === 0) {
              console.log(`[AmendoimCollector] ⚠️ localCSV2 '${requested2}' não encontrado na listagem da IHM2; será tentado download direto via forceDownloadFile`);
              arquivosIHM2.push(requested2);
            }
          }
          arquivosIHM2.forEach(arquivo => {
            arquivosParaColetar.push({ arquivo, caminho: caminhoIhm2, ihmService: ihm2Service!, ihmLabel: 'IHM2' });
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

          // Preparar diretório local por IHM (ex: TMP_DIR/IHM1)
          const localDirForIhm = path.join(this.TMP_DIR, arquivoInfo.ihmLabel);
          if (!fs.existsSync(localDirForIhm)) fs.mkdirSync(localDirForIhm, { recursive: true });

          // Baixar arquivo forçado (ignora cache de tamanho) para o diretório específico da IHM
          const downloadedFile = await this.downloadSpecificFile(arquivoInfo.arquivo, localDirForIhm, arquivoInfo.ihmLabel, arquivoInfo.ihmService);
          
          if (!downloadedFile) {
            const msg = `Arquivo NÃO ENCONTRADO na ${arquivoInfo.ihmLabel}: ${arquivoInfo.arquivo}`;
            console.error(`[AmendoimCollector] ❌ ${msg}`);
            return { ...DEFAULT_RESULT, erros: [msg] };
          }

          // Criar chave de cache usando o helper da IHM (inclui prefixo por IP)
          const cacheKey = arquivoInfo.ihmService && typeof (arquivoInfo.ihmService as any).getCacheKey === 'function'
            ? (arquivoInfo.ihmService as any).getCacheKey(downloadedFile.name)
            : `${arquivoInfo.ihmLabel}_${downloadedFile.name}`;
          console.log(`[AmendoimCollector] ✓ Arquivo baixado da ${arquivoInfo.ihmLabel}: ${downloadedFile.name} (${downloadedFile.size} bytes) - cacheKey: ${cacheKey}`);

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
          const processResult = await AmendoimService.processarCSV(csvDeduplicated, { forceSaveAll: true, sourceIhm: arquivoInfo.ihmLabel });
          
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
            // backupSvc aceita um segundo argumento label que prefixa o arquivo salvo
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
            rawSaved: processResult.rawSaved || 0,
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
        result.rawSaved += (r.rawSaved || 0);
        result.erros += typeof r.erros === 'number' ? r.erros : r.erros.length;
        result.deduplicadas += r.deduplicadas;
        result.entradasSalvas += r.entradasSalvas || 0;
        result.saidasSalvas += r.saidasSalvas || 0;
      }

      // Numero de arquivos efetivamente processados (para retorno da API)
      try {
        result.filesProcessed = arquivosParaColetar.length;
      } catch (e) {
        result.filesProcessed = settled.length;
      }
      result.recordsSaved = (result.salvos || 0) + (result.rawSaved || 0);

      console.log('[AmendoimCollector] ========================================');
      console.log('[AmendoimCollector] � RESUMO DA COLETA');
      console.log('[AmendoimCollector] ========================================');
      console.log(`  📂 Arquivos processados (planejados): ${arquivosParaColetar.length} | Arquivos efetivamente processados: ${result.filesProcessed}`);
      console.log(`  � Total processado (linhas): ${result.processados}`);
      console.log(`  💾 Total salvos (linhas): ${result.salvos}`);
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
        .where('c.originalName LIKE :pattern1 OR c.originalName LIKE :pattern2 OR c.originalName LIKE :pattern3', {
          pattern1: 'entrada_%',
          pattern2: 'saida_%',
          pattern3: 'ihm_%'
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
