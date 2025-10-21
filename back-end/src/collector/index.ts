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

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');
const TMP_DIR = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

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

      const downloaded = await this.ihmService.findAndDownloadNewFiles(TMP_DIR); 
      
      if (downloaded.length === 0) {
        console.log('[Collector] Nenhum arquivo novo encontrado');
        return;
      }
      
      console.log(`[Collector] ${downloaded.length} arquivos novos baixados.`);

      for (const f of downloaded) {
        if (STOP) break;
        console.log(`[Collector] Processando arquivo: ${f.name} -> ${f.localPath}`);
        
        try {
          // 🔍 Detectar mudanças no arquivo
          const changeInfo = await changeDetectionService.detectChanges(f.localPath);
          
          if (changeInfo.hasChanged || changeInfo.changeType === 'new_file') {
            console.log(`📊 [Collector] Mudança detectada: ${changeInfo.changeType}`);
            
            // Se mudou, processar e atualizar cache
            const result = await this.fileProcessor.processFile(f.localPath);

            await this.backup.backupFile({
              originalname: f.name,
              path: f.localPath,
              mimetype: 'text/csv',
              size: fs.statSync(f.localPath).size,
            });

            console.log(`✅ [Collector] Arquivo ${f.name} processado e cache atualizado:`, {
              rowsProcessed: result.parsed.rowsCount,
              fileSize: f.size
            });
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