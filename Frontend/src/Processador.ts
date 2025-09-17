// Processador.ts - Interface para comunicação com o backend child process

export interface FilterOptions {
  formula?: string | null;
  dateStart?: string | null;
  dateEnd?: string | null;
  sortBy?: string | null;
  sortDir?: "ASC" | "DESC";
}

export interface TableDataResult {
  total: number;
  pages: number;
  currentPage: number;
  pageSize: number;
  batidas: any[];
  rowsCount: number;
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
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private responseTimeout: number = 10000; // 10 seconds timeout
  
  constructor(pid: number) {
    this.pid = pid;
    this.setupMessageListener();
  }

  private setupMessageListener() {
    // Set up message listener to handle responses from child process
    (window as any).electronAPI.onChildMessage((_evt: any, payload: any) => {
      if (payload && payload.pid === this.pid && payload.msg) {
          const message = payload.msg;
          console.log(message);
        console.log(`[Processador-${this.pid}] Received message:`, message.type);
        
        // Call registered handler for this message type
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
          handler(message);
        }
      }
    });
  }

  public async sendMessage(msg: any): Promise<any> {
    // Send a message to the process and return result
    try {
      const result = await (window as any).electronAPI.sendToChild(this.pid, msg);
      if (!result.ok) {
        throw new Error(result.reason || 'Failed to send message');
      }
      return result;
    } catch (error) {
      console.error(`[Processador-${this.pid}] Error sending message:`, error);
      throw error;
    }
  }

  public onMessage(messageType: string, handler: (data: any) => void) {
    // Register a handler for a specific message type
    this.messageHandlers.set(messageType, handler);
  }

  public removeMessageHandler(messageType: string) {
    // Remove a message handler
    this.messageHandlers.delete(messageType);
  }

  private createPromiseWithTimeout<T>(
    messageType: string,
    requestMessage: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeMessageHandler(`${messageType}-response`);
        reject(new Error(`Timeout: No response received for ${messageType} within ${this.responseTimeout}ms`));
      }, this.responseTimeout);

      // Set up response handler
      this.onMessage(`${messageType}-response`, (message) => {
        clearTimeout(timeoutId);
        this.removeMessageHandler(`${messageType}-response`);
        
        if (message.error) {
          reject(new Error(message.error));
        } else {
          resolve(message.result);
        }
      });

      // Send request
      this.sendMessage(requestMessage).catch((error) => {
        clearTimeout(timeoutId);
        this.removeMessageHandler(`${messageType}-response`);
        reject(error);
      });
    });
  }

  // === Métodos do Contexto (Backend) ===

  /**
   * Busca dados da tabela com paginação e filtros
   * @param page Página atual (padrão: 1)
   * @param pageSize Tamanho da página (padrão: 300)
   * @param filters Filtros de busca
   */
  public async getTableData(
    page: number = 1, 
    pageSize: number = 300, 
    filters: FilterOptions = {}
  ): Promise<TableDataResult> {
    return this.createPromiseWithTimeout<TableDataResult>('getTableData', {
      type: 'getTableData',
      args: [page, pageSize, filters]
    });
  }

  /**
   * Busca dados para gráficos com paginação e filtros
   * @param page Página atual
   * @param pageSize Tamanho da página
   * @param filters Filtros de busca
   */
  public async getChartData(
    page: number = 1,
    pageSize: number = 300,
    filters: FilterOptions = {}
  ): Promise<ChartDataResult> {
    return this.createPromiseWithTimeout<ChartDataResult>('getChartData', {
      type: 'getChartData',
      args: [page, pageSize, filters]
    });
  }

  /**
   * Faz upload e processa um arquivo CSV
   * @param filePath Caminho para o arquivo CSV
   */
  public async uploadCSVFile(filePath: string): Promise<void> {
    return this.createPromiseWithTimeout<void>('uploadCSVFile', {
      type: 'uploadCSVFile',
      args: [filePath]
    });
  }

  /**
   * Carrega dados de exemplo no banco de dados para demonstração
   */
  public async loadSampleData(): Promise<void> {
    return this.createPromiseWithTimeout<void>('loadSampleData', {
      type: 'loadSampleData',
      args: []
    });
  }

  /**
   * Obtém a configuração atual do contexto
   */
  public async getConfig(): Promise<any> {
    return this.createPromiseWithTimeout<any>('getConfig', {
      type: 'getConfig',
      args: []
    });
  }

  /**
   * Define a configuração do contexto
   * @param config Dados de configuração
   */
  public async setConfig(config: any): Promise<void> {
    return this.createPromiseWithTimeout<void>('setConfig', {
      type: 'setConfig',
      args: [config]
    });
  }

  /**
   * Inicializa o banco de dados
   */
  public async initDb(): Promise<void> {
    return this.createPromiseWithTimeout<void>('initDb', {
      type: 'initDb',
      args: []
    });
  }

  /**
   * Fecha a conexão com o banco de dados
   */
  public async closeDb(): Promise<void> {
    return this.createPromiseWithTimeout<void>('closeDb', {
      type: 'closeDb',
      args: []
    });
  }

  /**
   * Obtém o serviço de banco de dados
   */
  public async getDbService(): Promise<any> {
    return this.createPromiseWithTimeout<any>('getDbService', {
      type: 'getDbService',
      args: []
    });
  }

  /**
   * Obtém o repositório de relatórios
   */
  public async getRelatorioRepository(): Promise<any> {
    return this.createPromiseWithTimeout<any>('getRelatorioRepository', {
      type: 'getRelatorioRepository',
      args: []
    });
  }

  // === Métodos de controle do processo ===

  /**
   * Para o processo child
   */
  public async stop(): Promise<void> {
    try {
      // Clear all message handlers
      this.messageHandlers.clear();
      
      // Stop the process
      await (window as any).electronAPI.stopProcess(this.pid);
      console.log(`[Processador-${this.pid}] Process stopped successfully`);
    } catch (error) {
      console.error(`[Processador-${this.pid}] Error stopping process:`, error);
      throw error;
    }
  }

  /**
   * Verifica se o processo está ativo
   */
  public isRunning(): boolean {
    return this.pid !== null && this.pid !== undefined;
  }

  /**
   * Obtém o PID do processo
   */
  public getPid(): number {
    return this.pid;
  }

  /**
   * Define o timeout para respostas (em ms)
   */
  public setTimeout(timeout: number): void {
    this.responseTimeout = timeout;
  }

  /**
   * Obtém o timeout atual
   */
  public getTimeout(): number {
    return this.responseTimeout;
  }
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