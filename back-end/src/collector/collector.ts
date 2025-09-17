/**
 * Módulo responsável pelo ciclo de coleta automática de arquivos CSV do sistema IHM via FTP.
 * Realiza download, processamento e persistência dos dados no banco.
 * @module collector
 */

import * as path from 'path';
import * as fs from 'fs';
import { setTimeout as wait } from 'timers/promises';
import IHMService from '../services/IHMService';
import fileProcessorService from '../services/fileProcessorService';
import BackupService from '../services/backupService';
import dbService from '../services/dbService';

/**
 * Intervalo de polling (em ms) entre cada ciclo de coleta.
 * Pode ser configurado via variável de ambiente POLL_INTERVAL_MS.
 */
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS || '60000');

/**
 * Diretório temporário de trabalho do coletor.
 * Pode ser configurado via variável de ambiente COLLECTOR_TMP.
 */
const TMP_DIR = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');

/**
 * URL do servidor de ingestão de dados (usado para integração externa).
 * Pode ser configurado via INGEST_URL ou SERVER_URL.
 */
const rawServer = process.env.INGEST_URL || process.env.SERVER_URL || 'http://192.168.5.200';
export const SERVER_URL = rawServer.match(/^https?:\/\//i) ? rawServer : `http://${rawServer}`; // e.g. http://192.168.5.200
const INGEST_TOKEN = process.env.INGEST_TOKEN;

// Garante que o diretório temporário existe
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

let STOP = false;

/**
 * Função para parar o coletor de forma segura.
 */
export function stopCollector() {
  STOP = true;
}

/**
 * Classe Collector para gerenciar o fluxo de coleta
 */
class Collector {
  private fileProcessor: any;
  private backup: BackupService;

  constructor(private ihmService: IHMService) {
    this.fileProcessor = fileProcessorService;
    this.backup = new BackupService();
  }

  /**
   * Método principal para iniciar o processo de coleta
   */
  async start() {
    try {
      console.log('Iniciando o processo de coleta...');

      // Passo 1: Listar arquivos disponíveis no FTP
      // tenta baixar novos arquivos para o TMP_DIR
      const downloaded = await this.ihmService.findAndDownloadNewFiles(TMP_DIR);
      console.log(`${downloaded.length} arquivos baixados.`);

      for (const f of downloaded) {
        if (STOP) break;
        console.log(`Processando arquivo: ${f.name} -> ${f.localPath}`);
        const result = await this.fileProcessor.processFile(f.localPath);

        // backup do arquivo original
        await this.backup.backupFile({ originalname: f.name, path: f.localPath, mimetype: 'text/csv', size: fs.statSync(f.localPath).size });

        // note: processFile já realiza inserção no DB via observers
        console.log('Processado:', result);
      }

      console.log('Processo de coleta concluído com sucesso.');
    } catch (error) {
      console.error('Erro durante o processo de coleta:', error);
    }
  }
}

// Instância do coletor e inicialização
const collector = new Collector(new IHMService(process.env.IHM_HOST || '127.0.0.1', process.env.IHM_USER || 'anonymous', process.env.IHM_PASS || ''));

/**
 * Função principal que inicia o ciclo de coleta automática.
 * Realiza conexão com o FTP, download dos arquivos, processamento e inserção no banco.
 * Permanece em loop até ser interrompido.
 * @returns {Promise<void>}
 */
export async function startCollector() {
  await dbService.init();
  collector.start();

  while (!STOP) {
    // Aguarda o intervalo antes do próximo ciclo
    await wait(POLL_INTERVAL);
  }

  console.log('Coletor encerrado.');
}

// Exportação para testes ou uso externo
export default Collector;
