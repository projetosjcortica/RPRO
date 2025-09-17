/**
 * Serviço responsável por notificar observadores sobre eventos de processamento de arquivos.
 * Utiliza o padrão Observer para acionar rotinas de backup, persistência no banco e registro de logs.
 * Cada observador é desacoplado e pode ser estendido facilmente.
 * @module NotifyService
 */

import * as fs from 'fs';
import * as path from 'path';
import db from './dbService';
import BackupService from './backupService';

// instância do backup usada pelos observers
const backupSvcInstance = new BackupService();

/**
 * Estrutura do payload enviado aos observadores.
 * Representa os dados do arquivo processado e informações relevantes para cada rotina.
 * @typedef {Object} NotifyPayload
 * @property {string} filename - Nome do arquivo processado
 * @property {any[]} rows - Array de linhas no formato do relatorio
 * @property {string} lastProcessedAt - Data/hora do processamento
 * @property {number} rowCount - Quantidade de linhas processadas
 * @property {string} [originalPath] - Caminho original do arquivo (opcional)
 */
export interface NotifyPayload {
  filename: string;
  rows: any[];
  lastProcessedAt: string;
  rowCount: number;
  originalPath?: string;
}

/**
 * Interface para observadores que recebem notificações.
 * Permite que cada rotina implemente sua própria lógica de atualização.
 * @interface Observer
 * @method update
 * @param {NotifyPayload} payload - Dados do processamento
 * @returns {Promise<void>}
 */
export interface Observer {
  update(payload: NotifyPayload): Promise<void>;
}

/**
 * Classe base para Subjects (observáveis) que gerenciam observadores.
 * Permite adicionar, remover e notificar observadores de forma desacoplada.
 * @class
 */
class Subject {
  private observers: Set<Observer> = new Set();

  /**
   * Adiciona um observador à lista.
   * @param {Observer} o - Observador a ser adicionado
   */
  attach(o: Observer) { this.observers.add(o); }
  /**
   * Remove um observador da lista.
   * @param {Observer} o - Observador a ser removido
   */
  detach(o: Observer) { this.observers.delete(o); }
  /**
   * Notifica todos os observadores com o payload.
   * @param {NotifyPayload} payload - Dados do processamento
   * @returns {Promise<void>}
   */
  async notify(payload: NotifyPayload) {
    await Promise.all(
      Array.from(this.observers).map(async (o) => {
        try {
          await o.update(payload);
        } catch (e) {
          // Loga erro individual sem interromper os demais
          // eslint-disable-next-line no-console
          console.error('Erro no Observer:', e);
        }
      })
    );
  }
}

/**
 * Observador responsável por realizar backup dos arquivos processados.
 * Faz backup tanto do CSV original quanto do JSON processado, se existirem.
 * @class
 * @implements {Observer}
 */
class BackupObserver implements Observer {
  /**
   * Realiza backup dos arquivos processados.
   * @param {NotifyPayload} payload - Dados do processamento
   * @returns {Promise<void>}
   */
  async update(payload: NotifyPayload) {
    try {
      // Backup do arquivo CSV original
      if (payload.originalPath && fs.existsSync(payload.originalPath)) {
        await backupSvcInstance.backupFile({
          originalname: payload.filename,
          path: payload.originalPath,
          mimetype: 'text/csv',
          size: fs.statSync(payload.originalPath).size,
        });
      }
      // Backup do arquivo JSON processado
      const downloadsDir = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
      const processedPath = path.join(downloadsDir, 'processed', payload.filename + '.json');
      if (fs.existsSync(processedPath)) {
        await backupSvcInstance.backupFile({
          originalname: payload.filename + '.json',
          path: processedPath,
          mimetype: 'application/json',
          size: fs.statSync(processedPath).size,
        });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Falha no BackupObserver:', e);
    }
  }
}

/**
 * Observador responsável por persistir os dados no banco de dados.
 * Só insere se houver linhas válidas no payload.
 * @class
 * @implements {Observer}
 */
class DbObserver implements Observer {
  /**
   * Persiste os dados no banco de dados.
   * @param {NotifyPayload} payload - Dados do processamento
   * @returns {Promise<void>}
   */
  async update(payload: NotifyPayload) {
    if (!payload.rows || payload.rows.length === 0) return;
    try {
      await db.insertRelatorioRows(payload.rows, payload.filename);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Falha no DbObserver:', e);
    }
  }
}

/**
 * Observador responsável por registrar logs do processamento.
 * Gera um arquivo de log em formato JSONL para facilitar auditoria e rastreabilidade.
 * @class
 * @implements {Observer}
 */
class LogObserver implements Observer {
  /**
   * Registra log do processamento.
   * @param {NotifyPayload} payload - Dados do processamento
   * @returns {Promise<void>}
   */
  async update(payload: NotifyPayload) {
    try {
      const downloadsDir = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
      const logPath = path.join(downloadsDir, 'process_logs.jsonl');
      const entry = {
        filename: payload.filename,
        time: payload.lastProcessedAt,
        rowCount: payload.rowCount,
        status: payload.rows && payload.rows.length > 0 ? 'sucesso' : 'vazio',
      };
      fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
    } catch (e) {
      // eslint-disable-next-line no-console
      // Falha silenciosa no log
    }
  }
}

/**
 * Serviço principal que gerencia e notifica os observadores.
 * Por padrão, já adiciona os observadores de backup, banco e log.
 * Permite fácil extensão para novos tipos de observadores.
 * @class
 * @extends Subject
 */
class NotifyService extends Subject {
  /**
   * Inicializa o serviço e adiciona os observadores padrão.
   */
  constructor() {
    super();
    this.attach(new BackupObserver());
    this.attach(new DbObserver());
    this.attach(new LogObserver());
  }
}

const notifyService = new NotifyService();
export default notifyService;
export const subject = notifyService;
