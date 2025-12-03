import path from 'path';
import fs from 'fs';
import { IHMService } from '../services/IHMService';
import { getRuntimeConfig } from '../core/runtimeConfig';
import { dbService } from '../services/dbService';
import { parserService } from '../services/parserService';
// We'll use a cancellable sleep so stopCollector can interrupt waiting
import { BackupService } from '../services/backupService';
import { fileProcessorService } from '../services/fileProcessorService';
import { changeDetectionService } from '../services/changeDetectionService';
import { CSVFormatDetector } from '../services/csvFormatDetector';
import { AmendoimService } from '../services/AmendoimService';
import iconv from 'iconv-lite';

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');
const os = require('os');
// Base temp dir: runtime config -> env var -> OS temp dir
const TMP_BASE = path.resolve(getRuntimeConfig('collector_tmp') || process.env.COLLECTOR_TMP || os.tmpdir());
if (!fs.existsSync(TMP_BASE)) fs.mkdirSync(TMP_BASE, { recursive: true });

let STOP = false;

let sleepTimer: ReturnType<typeof setTimeout> | null = null;
let sleepResolve: (() => void) | null = null;

export function stopCollector() {
  STOP = true;
  // clear pending sleep if any so the loop exits promptly
  try {
    if (sleepTimer) {
      clearTimeout(sleepTimer as any);
      sleepTimer = null;
    }
    if (sleepResolve) {
      sleepResolve();
      sleepResolve = null;
    }
  } catch (e) {
    // ignore
  }
}

// Prefer runtime-config topic 'ihm-config' if present (ip, user, password)
const ihmCfg = getRuntimeConfig('ihm-config') || {};
const ihmService = new IHMService(
  ihmCfg.ip || process.env.IHM_IP || '192.168.5.252',
  ihmCfg.user || process.env.IHM_USER || 'anonymous',
  ihmCfg.password || process.env.IHM_PASSWORD || ''
);

class Collector {
  private fileProcessor: typeof fileProcessorService;
  private backup: BackupService;

  constructor(private ihmService: IHMService) {
    this.fileProcessor = fileProcessorService;
    this.backup = new BackupService();
  }

  async start() {
    try {
      console.log('[Collector] Iniciando ciclo de coleta...');

      // Create per-IHM subdirectory under TMP_BASE to avoid filename collisions
      const runtimeIhmCfg = getRuntimeConfig('ihm-config') || {};
      const ihmIpForDir = (runtimeIhmCfg.ip || process.env.IHM_IP || 'local').toString().replace(/\./g, '_');
      const perIhmDir = path.join(TMP_BASE, `ihm_${ihmIpForDir}`);
      if (!fs.existsSync(perIhmDir)) fs.mkdirSync(perIhmDir, { recursive: true });

      const downloaded = await this.ihmService.findAndDownloadNewFiles(perIhmDir);

      if (downloaded.length === 0) {
        console.log('[Collector] Nenhum arquivo novo encontrado');
        return;
      }

      console.log(`[Collector] ${downloaded.length} arquivo(s) baixado(s)`);

      for (const f of downloaded) {
        if (STOP) break;
        console.log(`[Collector] Processando arquivo: ${f.name} -> ${f.localPath}`);

        try {
          // 🔍 Detectar mudanças no arquivo
          const changeInfo = await changeDetectionService.detectChanges(f.localPath);

          if (changeInfo.hasChanged || changeInfo.changeType === 'new_file') {
            console.log(`📊 [Collector] Mudança detectada: ${changeInfo.changeType}`);

            // 🔎 Detectar formato do CSV (ração ou amendoim)
            // 🔎 Detectar formato do CSV (ração ou amendoim)
            // Ler como buffer para detectar encoding
            const buffer = fs.readFileSync(f.localPath);

            // Tentar decodificar como UTF-8 primeiro
            let csvContent = iconv.decode(buffer, 'utf8');

            // Se contiver caracteres de substituição (\uFFFD), provavelmente é Latin1/Windows-1252
            if (csvContent.includes('\uFFFD')) {
              console.log(`[Collector] ⚠️ Detectado possível problema de encoding (UTF-8 inválido). Tentando Latin1...`);
              csvContent = iconv.decode(buffer, 'win1252'); // win1252 é superset do latin1 e muito comum
            }
            const format = CSVFormatDetector.detect(csvContent);

            console.log(`[Collector] Formato detectado: ${format}`);

            if (format === 'amendoim') {
              // Processar como amendoim
              console.log(`🥜 [Collector] Processando como AMENDOIM: ${f.name}`);

              const resultado = await AmendoimService.processarCSV(csvContent);

              await this.backup.backupFile({
                originalname: f.name,
                path: f.localPath,
                mimetype: 'text/csv',
                size: fs.statSync(f.localPath).size,
              }, 'RACAO'); // Prefixo RACAO para diferenciar do coletor de amendoim

              console.log(`✅ [Collector] Amendoim processado: ${resultado.salvos} registros salvos`);

            } else if (format === 'racao') {
              // Processar como ração (comportamento padrão)
              console.log(`🌾 [Collector] Processando como RAÇÃO: ${f.name}`);

              const result = await this.fileProcessor.processFile(f.localPath);

              await this.backup.backupFile({
                originalname: f.name,
                path: f.localPath,
                mimetype: 'text/csv',
                size: fs.statSync(f.localPath).size,
              }, 'RACAO'); // Prefixo RACAO para diferenciar do coletor de amendoim

              console.log(`✅ [Collector] Ração processada: ${result.parsed.rowsCount} registros`);

            } else {
              console.warn(`⚠️  [Collector] Formato desconhecido, pulando: ${f.name}`);
            }
          } else {
            console.log(`⏭️  [Collector] Arquivo ${f.name} não foi modificado, pulando processamento`);
          }
        } catch (fileError) {
          console.error(`[Collector] Erro ao processar arquivo ${f.name}:`, fileError);
        }
      }

      console.log('[Collector] Ciclo de coleta concluído com sucesso.');
    } catch (error) {
      console.error('[Collector] Erro durante o processo de coleta:', error);
      throw error;
    }
  }
}

const collector = new Collector(
  new IHMService(
    (getRuntimeConfig('ihm-config') || {}).ip || process.env.IHM_IP || '192.168.5.252',
    (getRuntimeConfig('ihm-config') || {}).user || process.env.IHM_USER || 'anonymous',
    (getRuntimeConfig('ihm-config') || {}).password || process.env.IHM_PASS || ''
  )
);

export async function startCollector() {
  console.log(`[Collector] Starting collector with ${POLL_INTERVAL}ms interval`);

  while (!STOP) {
    try {
      await collector.start();
    } catch (error) {
      console.error('[Collector] Error during collection cycle:', error);
    }

    if (!STOP) {
      console.log(`[Collector] Waiting ${POLL_INTERVAL}ms before next cycle...`);
      // cancellable sleep
      await new Promise<void>((resolve) => {
        sleepResolve = resolve;
        sleepTimer = setTimeout(() => {
          sleepTimer = null;
          sleepResolve = null;
          resolve();
        }, POLL_INTERVAL);
      });
    }
  }

  console.log('[Collector] Coletor encerrado.');
}