// Processador.ts - Interface para comunicação com o backend via WebSocket

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
  private websocket: WebSocket | null = null;
  private port: number;
  private responseTimeout: number = 15000;
  private pending: Map<
    string,
    { resolve: (v: any) => void; reject: (e: any) => void; timeout: any }
  > = new Map();
  private eventHandlers: Map<string, (payload: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(port: number) {
    this.port = port;
    this.connect();
  }

  private connect() {
    try {
      this.websocket = new WebSocket(`ws://localhost:${this.port}`);

      this.websocket.onopen = () => {
        console.log(`[Processador] WebSocket connected to port ${this.port}`);
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (error) {
          console.error(
            "[Processador] Error parsing WebSocket message:",
            error
          );
        }
      };

      this.websocket.onclose = () => {
        console.log("[Processador] WebSocket connection closed");
        this.attemptReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error("[Processador] WebSocket error:", error);
      };
    } catch (error) {
      console.error("[Processador] Error creating WebSocket:", error);
      this.attemptReconnect();
    }
  }

  private handleMessage(msg: any) {
    // Response pattern: { id, ok, data, error }
    console.log('[Processador] Received message:', msg);
    if (msg && msg.id && (msg.ok === true || msg.ok === false)) {
      const entry = this.pending.get(msg.id);
      if (entry) {
        clearTimeout(entry.timeout);
        this.pending.delete(msg.id);
        if (msg.ok) entry.resolve(msg.data);
        else entry.reject(msg.error || new Error("Erro desconhecido"));
      }
      return;
    }
    // Event pattern: { type:'event', event, payload }
    if (msg && msg.type === "event" && msg.event) {
      const handler = this.eventHandlers.get(msg.event);
      if (handler) handler(msg.payload);
      return;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[Processador] Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[Processador] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private genId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private send(cmd: string, payload?: any): Promise<any> {
    const id = this.genId();
    console.log(`[Processador] Sending command: ${cmd}, payload:`, payload);

    return new Promise((resolve, reject) => {
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket não está conectado"));
        return;
      }

      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout aguardando resposta de '${cmd}'`));
      }, this.responseTimeout);

      this.pending.set(id, { resolve, reject, timeout });

      try {
        this.websocket.send(JSON.stringify({ id, cmd, payload }));
      } catch (error) {
        clearTimeout(timeout);
        this.pending.delete(id);
        reject(error);
      }
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

  public ping() {
    return this.send("ping");
  }

  // Controle do loop de WebSocket (heartbeat)
  public wsLoopStart(periodMs?: number) {
    return this.send("ws.loop.start", { periodMs });
  }
  public wsLoopStop() {
    return this.send("ws.loop.stop");
  }
  public wsStatus() {
    return this.send("ws.status");
  }

  public relatorioPaginate(
    page = 1,
    pageSize = 300,
    filters: FilterOptions = {}
  ) {
    return this.send("relatorio.paginate", { page, pageSize, ...filters });
  }

  public async getTableData(
    page = 1,
    pageSize = 300,
    filters: FilterOptions = {}
  ): Promise<TableDataResult> {
    const res = await this.relatorioPaginate(page, pageSize, filters);
    return {
      rows: res.rows || [],
      total: res.total || 0,
      page: res.page || page,
      pageSize: res.pageSize || pageSize,
    };
  }

  public processFile(filePath: string) {
    return this.send("file.process", { filePath });
  }

  // Sends the file.processContent command to the backend
  public processFileContent(filePath: string, content: string) {
    return this.send("file.processContent", { filePath, content });
  }

  public ihmFetchLatest(ip: string, user = "anonymous", password = "") {
    return this.send("ihm.fetchLatest", { ip, user, password });
  }

  public backupList() {
    return this.send("backup.list");
  }

  public dbListBatches() {
    return this.send("db.listBatches");
  }

  public dbSetupMateriaPrima(
    items: Array<{ num: number; produto: string; medida: number }>
  ) {
    return this.send("db.setupMateriaPrima", { items });
  }

  public syncLocalToMain(limit = 500) {
    return this.send("sync.localToMain", { limit });
  }

  public collectorStart() {
    return this.send("collector.start");
  }
  public collectorStop() {
    return this.send("collector.stop");
  }

  public sendConfig(config: any) {
    return this.send("config", config);
  }

  // Controle do processo
  public async stop(): Promise<void> {
    this.pending.forEach((p) => clearTimeout(p.timeout));
    this.pending.clear();
    this.eventHandlers.clear();

    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  public isRunning(): boolean {
    return (
      this.websocket !== null && this.websocket.readyState === WebSocket.OPEN
    );
  }

  public getPort(): number {
    return this.port;
  }
  public setTimeout(timeout: number) {
    this.responseTimeout = timeout;
  }
  public getTimeout(): number {
    return this.responseTimeout;
  }
}

// Singleton instance para facilitar o uso
let globalProcessadorInstance: Processador | null = null;

/**
 * Obtém a instância global do Processador
 * @param port Porta do WebSocket (obrigatória na primeira chamada)
 */
export function getProcessador(port?: number): Processador {
  if (!globalProcessadorInstance) {
    if (!port) {
      throw new Error(
        "Port é obrigatória para criar a primeira instância do Processador"
      );
    }
    globalProcessadorInstance = new Processador(port);
  }
  return globalProcessadorInstance;
}

/**
 * Redefine a instância global do Processador
 * @param port Nova porta do WebSocket
 */
export function setProcessador(port: number): Processador {
  globalProcessadorInstance = new Processador(port);
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
