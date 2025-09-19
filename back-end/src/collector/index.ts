import path from 'path';
import fs from 'fs';
import { IHMService } from '../services/IHMService';
import { dbService } from '../services/dbService';
import { parserService } from '../services/ParserService';
import { setTimeout as wait } from 'timers/promises';
import { BackupService } from '../services/BackupService';
import { fileProcessorService } from '../services/fileProcessorService';

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');
const TMP_DIR = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
const rawServer =
  process.env.INGEST_URL || process.env.SERVER_URL || 'http://192.168.5.254';
const SERVER_URL = /^(?:https?:)\/\//i.test(rawServer)
  ? rawServer
  : `http://${rawServer}`;
const INGEST_TOKEN = process.env.INGEST_TOKEN;

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

let STOP = false;

export function stopCollector() {
  STOP = true;
}

const ihmService = new IHMService(
  process.env.IHM_IP || '192.168.5.254',
  process.env.IHM_USER || 'anonymous',
  process.env.IHM_PASSWORD || ''
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
      console.log('Iniciando o processo de coleta...');

      const downloaded = await this.ihmService.findAndDownloadNewFiles(TMP_DIR); // ok 
      console.log(`${downloaded.length} arquivos baixados.`);

      for (const f of downloaded) {
        if (STOP) break;
        console.log(`Processando arquivo: ${f.name} -> ${f.localPath}`);
        const result = await this.fileProcessor.processFile(f.localPath);

        await this.backup.backupFile({
          originalname: f.name,
          path: f.localPath,
          mimetype: 'text/csv',
          size: fs.statSync(f.localPath).size,
        });

        console.log('Processado:', result);
      }

      console.log('Processo de coleta concluído com sucesso.');
    } catch (error) {
      console.error('Erro durante o processo de coleta:', error);
    }
  }
}

const collector = new Collector(
  new IHMService(
    process.env.IHM_IP || '192.168.5.254',
    process.env.IHM_USER || 'anonymous',
    process.env.IHM_PASS || ''
  )
);

export async function startCollector() {
  collector.start();

  while (!STOP) {
    await wait(POLL_INTERVAL);
  }

  console.log('Coletor encerrado.');
}