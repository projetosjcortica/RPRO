// Processador.ts - Interface para comunicação com o backend child process (IPC)

export interface FilterOptions {
  formula?: string | null;
  dateStart?: string | null;
  dateEnd?: string | null;
  sortBy?: string | null;
  sortDir?: "ASC" | "DESC";
}

export interface TableDataResult {
  rows: any[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ChartDataResult {
  formulaSums: Record<string, number>;
  productData: Array<{ name: string; value: number }>;
  productTotal: number;
  chartData: any[];
  total: number;
  rowsCount: number;
}

export class Processador {
  private pid: number;
  private responseTimeout: number = 15000;
  private pending: Map<string, { resolve: (v: any) => void; reject: (e: any) => void; timeout: any } > = new Map();
  private eventHandlers: Map<string, (payload: any) => void> = new Map();

  constructor(pid: number) {
    this.pid = pid;
    this.setupMessageListener();
  }

  private setupMessageListener() {
    (window as any).electronAPI.onChildMessage((_evt: any, payload: any) => {
      if (!payload || payload.pid !== this.pid || !payload.msg) return;
      const msg = payload.msg;
      // Response pattern: { id, ok, data, error }
      if (msg && msg.id && (msg.ok === true || msg.ok === false)) {
        const entry = this.pending.get(msg.id);
        if (entry) {
          clearTimeout(entry.timeout);
          this.pending.delete(msg.id);
          if (msg.ok) entry.resolve(msg.data);
          else entry.reject(msg.error || new Error('Erro desconhecido'));
        }
        return;
      }
      // Event pattern: { type:'event', event, payload }
      if (msg && msg.type === 'event' && msg.event) {
        const handler = this.eventHandlers.get(msg.event);
        if (handler) handler(msg.payload);
        return;
      }
    });
  }

  private genId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private send(cmd: string, payload?: any): Promise<any> {
    const id = this.genId();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout aguardando resposta de '${cmd}'`));
      }, this.responseTimeout);

      this.pending.set(id, { resolve, reject, timeout });
      (window as any).electronAPI
        .sendToChild(this.pid, { id, cmd, payload })
        .then((res: { ok: boolean; reason?: string }) => {
          if (!res || res.ok !== true) {
            // Falha de envio até o processo (não é a resposta do backend)
            clearTimeout(timeout);
            this.pending.delete(id);
            reject(new Error(res?.reason || 'Falha ao enviar mensagem ao processo filho'));
          }
        })
        .catch((err: unknown) => {
          clearTimeout(timeout);
          this.pending.delete(id);
          reject(err);
        });
    });
  }

  // Eventos do backend (ex.: 'file.processed', 'ready', 'config-ack')
  public onEvent(event: string, handler: (payload: any) => void) {
    this.eventHandlers.set(event, handler);
  }
  public offEvent(event: string) {
    this.eventHandlers.delete(event);
  }

  // ==== Métodos mapeando os comandos do backend ====

  public ping() { return this.send('ping'); }

  public relatorioPaginate(page = 1, pageSize = 50, filters: FilterOptions = {}) {
    return this.send('relatorio.paginate', { page, pageSize, ...filters });
  }

  public async getTableData(page = 1, pageSize = 300, filters: FilterOptions = {}): Promise<TableDataResult> {
    const res = await this.relatorioPaginate(page, pageSize, filters);
    return { rows: res.rows || [], total: res.total || 0, page: res.page || page, pageSize: res.pageSize || pageSize };
  }

  public processFile(filePath: string) { return this.send('file.process', { filePath }); }

  public ihmFetchLatest(ip: string, user = 'anonymous', password = '') { return this.send('ihm.fetchLatest', { ip, user, password }); }

  public backupList() { return this.send('backup.list'); }

  public dbListBatches() { return this.send('db.listBatches'); }

  public dbSetupMateriaPrima(items: Array<{ num: number; produto: string; medida: number }>) { return this.send('db.setupMateriaPrima', { items }); }

  public syncLocalToMain(limit = 500) { return this.send('sync.localToMain', { limit }); }

  public collectorStart() { return this.send('collector.start'); }
  public collectorStop() { return this.send('collector.stop'); }

  // Controle do processo
  public async stop(): Promise<void> {
    this.pending.forEach((p) => clearTimeout(p.timeout));
    this.pending.clear();
    this.eventHandlers.clear();
    await (window as any).electronAPI.stopProcess(this.pid);
  }

  public isRunning(): boolean { return this.pid !== null && this.pid !== undefined; }
  public getPid(): number { return this.pid; }
  public setTimeout(timeout: number) { this.responseTimeout = timeout; }
  public getTimeout(): number { return this.responseTimeout; }
}

// Singleton instance para facilitar o uso
let globalProcessadorInstance: Processador | null = null;

/**
 * Obtém a instância global do Processador
 * @param pid PID do processo (obrigatório na primeira chamada)
 */
export function getProcessador(pid?: number): Processador {
  if (!globalProcessadorInstance) {
    if (!pid) {
      throw new Error('PID é obrigatório para criar a primeira instância do Processador');
    }
    globalProcessadorInstance = new Processador(pid);
  }
  return globalProcessadorInstance;
}

/**
 * Redefine a instância global do Processador
 * @param pid Novo PID do processo
 */
export function setProcessador(pid: number): Processador {
  globalProcessadorInstance = new Processador(pid);
  return globalProcessadorInstance;
}

/**
 * Limpa a instância global do Processador
 */
export function clearProcessador(): void {
  if (globalProcessadorInstance) {
    globalProcessadorInstance.stop().catch(console.error);
    globalProcessadorInstance = null;
  }
}