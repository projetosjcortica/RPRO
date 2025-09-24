import { FilterOptions } from "./components/types";
import axios from "axios";

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
    this.port = port || 3000;
    this.baseURL = `http://localhost:${this.port}`;
    this.connectionState = 'connected';
    console.log(`[Processador] HTTP client initialized for ${this.baseURL}`);
  }

  // Método makeRequest corrigido
private async makeRequest(endpoint: string, method = 'GET', data?: any): Promise<any> {
  let url: string;

  // Se endpoint for URL absoluta, usar diretamente
  if (/^https?:\/\//i.test(endpoint)) {
    url = endpoint;
  } else {
    // Endpoint relativo → combinar com baseURL
    
    url = `${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    console.log(`[Processador] Making request to ${url} with method ${method} and data:`, data);
  }

  const headers: Record<string, string> = { 'Accept': 'application/json' };
  const config: RequestInit = { method, headers };

  // GET → colocar parâmetros na URL
  if (method === 'GET' && data) {
    const params = new URLSearchParams();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params.append(k, String(v));
    });
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
  } else if (method !== 'GET' && data !== undefined) {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return await response.json();
}



  // Event handler methods
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

  // Connection check method
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

  // Report pagination CORRIGIDO
  public async relatorioPaginate(
    page = 1,
    pageSize = 100,
    filters: FilterOptions = {}
  ): Promise<any> {
    // Construir objeto de parâmetros incluindo page, pageSize E filters
    const params: any = { 
      page, 
      pageSize 
    };
    
    // Adicionar filtros apenas se tiverem valor
    if (filters.nomeFormula && filters.nomeFormula !== '') {
      params.nomeFormula = filters.nomeFormula;
    }
    if (filters.dataInicio && filters.dataInicio !== '') {
      params.dataInicio = filters.dataInicio;
    }
    if (filters.dataFim && filters.dataFim !== '') {
      params.dataFim = filters.dataFim;
    }
    if (filters.codigo && filters.codigo !== '') {
      params.codigo = filters.codigo;
    }
    if (filters.numero && filters.numero !== '') {
      params.numero = filters.numero;
    }

    console.log("[relatorioPaginate] Parâmetros para API:", params);

    return this.makeRequest('/api/relatorio/paginate', 'POST', { params });
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

  public getResumo(areaId?: string, nomeFormula?: string, dataInicio?: string, dataFim?: string) {
    const params: any = {};
    if (areaId) params.areaId = areaId;
    if (nomeFormula) params.nomeFormula = nomeFormula;
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;
    
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

  // Controle do processo
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

// Singleton instance
let globalProcessadorInstance: Processador | null = null;

export function getProcessador(): Processador {
  if (!globalProcessadorInstance) {
    // Cria a instância padrão na porta 3000
    globalProcessadorInstance = new Processador(3000);
  }
  return globalProcessadorInstance;
}

export function setProcessador(port: number): Processador {
  globalProcessadorInstance = new Processador(port);
  return globalProcessadorInstance;
}

export function clearProcessador(): void {
  if (globalProcessadorInstance) {
    globalProcessadorInstance.stop().catch(console.error);
    globalProcessadorInstance = null;
  }
}
