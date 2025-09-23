// ProcessadorHTTP.ts - Interface para comunicação com o backend via HTTP API (substituindo WebSocket)

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
  private port: number;
  private responseTimeout: number = 15000;
  private eventHandlers: Map<string, (payload: any) => void> = new Map();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'connected';
  private baseURL: string;

  constructor(port: number) {
    this.port = port || 3000; // Use provided port or backend default 3000
    this.baseURL = `http://localhost:${this.port}`;
    this.connectionState = 'connected';
    console.log(`[Processador] HTTP client initialized for ${this.baseURL}`);
  }

  // HTTP-based methods replacing WebSocket functionality
 private async makeRequest(endpoint: string, method = 'GET', data?: any): Promise<any> {
  const base = this.baseURL.replace(/\/$/, '');
  let url = `${base}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  const config: RequestInit = { method, headers };
  
  if (method === 'GET' && data && Object.keys(data).length > 0) {
    const params = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      const v = data[key];
      if (v !== null && v !== undefined) params.append(key, String(v));
    });
    url += `?${params.toString()}`;
  } else if (method !== 'GET' && data !== undefined) {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      this.connectionState = 'error';
      console.error(`[Processador] HTTP request failed for ${url}: ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (err: any) {
    // Se erro de rede e endpoint for relativo, tenta novamente
    const isNetworkError = err instanceof TypeError || /failed to fetch/i.test(String(err?.message || ''));
    if (isNetworkError && endpoint.startsWith('/')) {
      const relResponse = await fetch(endpoint, config);
      if (!relResponse.ok) {
        this.connectionState = 'error';
        throw new Error(`HTTP ${relResponse.status}: ${relResponse.statusText}`);
      }
      return await relResponse.json();
    }

    this.connectionState = 'error';
    console.error(`[Processador] HTTP request failed for ${endpoint}:`, err);
    throw err;
  }
}

  // Event handler methods (simplified for HTTP)
  public onEvent(event: string, handler: (payload: any) => void): void {
    this.eventHandlers.set(event, handler);
  }

  public offEvent(event: string): void {
    this.eventHandlers.delete(event);
  }

  // Ping method
  public async ping(): Promise<{ pong: boolean; ts: string }> {
    return this.makeRequest('/api/ping');
  }

  // Connection check method (always returns true for HTTP)
 private async sendWithConnectionCheck(cmd: string, payload: any): Promise<any> {
 
  switch (cmd) {
    case 'ping':
      return this.ping();

    case 'materiaprima.getConfig':
      return this.makeRequest('/api/materiaprima/labels', 'GET');

    case 'backup.list':
    case 'backup.listBackups':
      return this.backupList();

    case 'db.getMateriaPrima':
      return this.getMateriaPrima();

    case 'relatorio.paginate': {
      // Garante valores padrão
      const { page = 1, pageSize = 100, ...filters } = payload || {};
      return this.relatorioPaginate(page, pageSize, filters);
    }

    case 'file.process':
      return this.processFile(payload?.filePath);

    case 'file.processContent':
      return this.processFileContent(payload?.filePath, payload?.content);

    case 'ihm.fetchLatest':
      return this.ihmFetchLatest(payload?.ip, payload?.user, payload?.password);

    case 'db.listBatches':
      return this.dbListBatches();

    case 'db.setupMateriaPrima':
      return this.dbSetupMateriaPrima(payload?.items);

    case 'sync.localToMain':
      return this.syncLocalToMain(payload?.limit);

    case 'collector.start':
      return this.collectorStart();

    case 'collector.stop':
      return this.collectorStop();

    default:
      throw new Error(`Unknown command: ${cmd}`);
  }
  }


  // Report pagination
  public async relatorioPaginate(
    page = 1,
    pageSize = 100,
    filters: FilterOptions = {}
  ): Promise<any> {
    const params: any = { page, pageSize };
    if (filters.formula) params.formula = filters.formula;
    if (filters.dateStart) params.dateStart = filters.dateStart;
    if (filters.dateEnd) params.dateEnd = filters.dateEnd;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortDir) params.sortDir = filters.sortDir;

    return this.makeRequest(`/api/relatorio/paginate?page=${page}&pageSize=${pageSize}`, 'GET', params);
  }
/**
 * @deprecated Usa o paginator ao inves de usar isso aqui
 */
  public async getTableData(
    page = 1,
    pageSize = 100,
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
    return this.makeRequest('/api/file/process', 'GET', { filePath });
  }

  public processFileContent(filePath: string, content: string) {
    return this.makeRequest('/api/file/processContent', 'POST', { filePath, content });
  }

  public ihmFetchLatest(ip: string, user = "anonymous", password = "") {
    return this.makeRequest('/api/ihm/fetchLatest', 'GET', { ip, user, password });
  }

  public backupList() {
    return this.makeRequest('/api/backup/list');
  }

  public dbListBatches() {
    return this.makeRequest('/api/db/listBatches');
  }

  public dbSetupMateriaPrima(
    items: Array<{ num: number; produto: string; medida: number }>
  ) {
    return this.makeRequest('/api/db/setupMateriaPrima', 'POST', { items });
  }

  // Alias to match HTTP client naming
  public listBackups() { return this.backupList(); }

  // Database helpers
  public listBatches() { return this.dbListBatches(); }
  public getMateriaPrimaLabels() { return this.makeRequest('/api/materiaprima/labels', 'GET'); }
  public setupMateriaPrimaItems(items: Array<{ num: number; produto: string; medida: number }>) { return this.dbSetupMateriaPrima(items); }

  public getMateriaPrima() {
    return this.makeRequest('/api/db/getMateriaPrima');
  }

  public syncLocalToMain(limit = 500) {
    return this.makeRequest('/api/db/syncLocalToMain', 'GET', { limit });
  }

  public collectorStart() {
    return this.makeRequest('/api/collector/start');
  }

  public collectorStop() {
    return this.makeRequest('/api/collector/stop');
  }

  public getResumo(areaId?: string, formula?: string, dateStart?: string, dateEnd?: string) {
    const params: any = {};
    if (areaId) params.areaId = areaId;
    if (formula) params.formula = formula;
    if (dateStart) params.dateStart = dateStart;
    if (dateEnd) params.dateEnd = dateEnd;
    
    return this.makeRequest('/api/resumo', 'GET', params);
  }


  public converterUnidade(valor: number, de: number, para: number) {
    return this.makeRequest('/api/unidades/converter', 'GET', { valor, de, para });
  }

  public normalizarParaKg(valores: any, unidades: any) {
    return this.makeRequest('/api/unidades/normalizarParaKg', 'POST', { valores, unidades });
  }

  public populateDatabase(tipo = 'relatorio', quantidade = 10, config = {}) {
    return this.makeRequest('/api/db/populate', 'POST', { tipo, quantidade, config });
  }



  public estoqueOperation(operation: string, payload: any = {}) {
    return this.makeRequest(`/api/estoque/${operation}`, 'POST', payload);
  }

  // Método genérico para executar comandos (mantido para compatibilidade)
  public executarWs(comando: string, parametros: any = {}) {
    return this.sendWithConnectionCheck(comando, parametros);
  }

  public sendConfig(config: any) {
    return this.makeRequest('/api/config', 'POST', config);
  }

  // Controle do processo (simplificado para HTTP)
  public async stop(): Promise<void> {
    this.eventHandlers.clear();
    this.connectionState = 'disconnected';
    console.log('[Processador] HTTP client stopped');
  }

  public isRunning(): boolean {
    return this.connectionState === 'connected';
  }

  public getConnectionState(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this.connectionState;
  }

  public async waitForConnection(_timeoutMs: number = 10000): Promise<boolean> {
    // For HTTP, we're always "connected"
    return true;
  }

  public reconnect(): void {
    this.connectionState = 'connected';
    console.log('[Processador] HTTP client reconnected');
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
 * @param port Porta do HTTP server (obrigatória na primeira chamada)
 */
export function getProcessador(port?: number): Processador {
  if (!globalProcessadorInstance) {
    const defaultPort = port || 3000; // Default to 3000 to match backend
    globalProcessadorInstance = new Processador(defaultPort);
  }
  return globalProcessadorInstance;
}

/**
 * Redefine a instância global do Processador
 * @param port Nova porta do HTTP server
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