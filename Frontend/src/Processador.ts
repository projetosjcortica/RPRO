import { FilterOptions } from "./components/types";

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
  
  // OTIMIZAÇÃO: Cache de requisições em memória (TTL de 5s)
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL: number = 5000; // 5 segundos

  constructor(port: number) {
    this.port = port || 3000;
    this.baseURL = `http://localhost:${this.port}`;
    this.connectionState = 'connected';
    console.log(`[Processador] HTTP client initialized for ${this.baseURL}`);
  }

  /**
   * Upload a file to the amendoim upload endpoint using FormData.
   * Accepts a File (browser) or Blob; in Electron renderer File is available.
   */
  public async uploadAmendoimFile(file: File | Blob, tipo?: string): Promise<any> {
    const url = `${this.baseURL}/api/amendoim/upload`;
    const form = new FormData();
    form.append('file', file as any);
    if (tipo) form.append('tipo', tipo);

    try {
      const resp = await fetch(url, { method: 'POST', body: form });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${resp.status}: ${resp.statusText}`);
      }
      return await resp.json();
    } catch (err) {
      console.error('[Processador] uploadAmendoimFile failed:', err);
      throw err;
    }
  }

  // Método makeRequest corrigido - SEMPRE usa URL absoluta
  private async makeRequest(endpoint: string, method = 'GET', data?: any): Promise<any> {
    
    let url: string;
    if (/^https?:\/\//i.test(endpoint)) {
      url = endpoint;
    } else {
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      url = `${this.baseURL}${normalizedEndpoint}`;
    }

    // OTIMIZAÇÃO: Verificar cache para requisições GET
    if (method === 'GET' && !data) {
      const cached = this.requestCache.get(url);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
        console.log(`[Processador] 💾 Cache hit para ${url}`);
        return cached.data;
      }
    }

    console.log(`[Processador] 🌐 Request para ${url} (${method})`);

    const headers: Record<string, string> = { 
      'Accept': 'application/json',
      'Connection': 'keep-alive', // Reutilizar conexões
    };
    
    // Ensure summary/resumo endpoints are never cached by browsers or intermediate proxies
    if (/\/api\/resumo$/.test(url) || /\/api\/resumo\?/.test(url)) {
      headers['Cache-Control'] = 'no-cache';
    }
    const config: RequestInit = { 
      method, 
      headers,
      keepalive: true // Manter conexão ativa
    };

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

    try {
      const response = await fetch(url, config);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const result = await response.json();
      
      // OTIMIZAÇÃO: Salvar no cache se for GET
      if (method === 'GET') {
        this.requestCache.set(url, { data: result, timestamp: Date.now() });
      }
      
      return result;
    } catch (error) {
      console.error(`[Processador] Request failed to ${url}:`, error);
      throw error;
    }
  }

  // Event handler methods
  public onEvent(event: string, handler: (payload: any) => void): void {
    this.eventHandlers.set(event, handler);
  }

  public offEvent(event: string): void {
    this.eventHandlers.delete(event);
  }

  // ✅ CORRIGIDO: Ping method usa endpoint relativo
  public async ping(): Promise<{ pong: boolean; ts: string }> {
    return this.makeRequest('/api/ping'); // ✅ Agora usa baseURL + endpoint
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

      case 'ihm.discover':
        return this.discoverIhms(payload?.method, payload?.ports, payload?.timeoutMs);

      case 'ihm.discover.last':
        return this.getIhmDiscoveryLast();

      default:
        throw new Error(`Unknown command: ${cmd}`);
    }
  }

  // Report pagination - ✅ CORRIGIDO
  public async relatorioPaginate(
    page = 1,
    pageSize = 100,
    filters: FilterOptions & { advancedFilters?: any } = {}
  ): Promise<any> {
    const params: any = { 
      page, 
      pageSize 
    };
    
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
    // Forward advancedFilters in the POST body when provided
    const body: any = { params };
    if ((filters as any).advancedFilters) body.advancedFilters = (filters as any).advancedFilters;
    return this.makeRequest('/api/relatorio/paginate', 'POST', body);
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

  // ✅ TODOS os métodos agora usam endpoints relativos corretamente
  public processFile(filePath: string) {
    return this.makeRequest('/api/file/process', 'GET', { filePath });
  }

  public processFileContent(filePath: string, content: string) {
    return this.makeRequest('/api/file/processContent', 'POST', { filePath, content });
  }

  public ihmFetchLatest(ip: string, user = "anonymous", password = "") {
    return this.makeRequest('/api/ihm/fetchLatest', 'GET', { ip, user, password });
  }

  public discoverIhms(method: 'node' | 'powershell' = 'node', ports: number[] = [80,443,502], timeoutMs = 800, paths: string[] = ['/', '/visu', '/visu/index.html']) {
    return this.makeRequest('/api/ihm/discover', 'POST', { method, ports, timeoutMs, paths });
  }

  public getIhmDiscoveryLast() {
    return this.makeRequest('/api/ihm/discover/last', 'GET');
  }

  public getAdminUsers() {
    return this.makeRequest('/api/admin/users', 'GET');
  }

  public deleteUser(username?: string, id?: number) {
    return this.makeRequest('/api/admin/delete-user', 'POST', { username, id });
  }

  public toggleAdmin(username?: string, id?: number, isAdmin = true) {
    return this.makeRequest('/api/admin/toggle-admin', 'POST', { username, id, isAdmin });
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
  
  public setupMateriaPrimaItems(items: Array<{ num: number; produto: string; medida: number }>) { 
    return this.dbSetupMateriaPrima(items); 
  }

  public getMateriaPrima() {
    return this.makeRequest('/api/db/getMateriaPrima');
  }

  public syncLocalToMain(limit = 500) {
    return this.makeRequest('/api/db/syncLocalToMain', 'GET', { limit });
  }

  public async collectorStart(ihmConfig?: { ip?: string; user?: string; password?: string }) {
    if (ihmConfig && (ihmConfig.ip || ihmConfig.user || ihmConfig.password)) {
      return this.makeRequest('/api/collector/start', 'POST', ihmConfig);
    }
    return this.makeRequest('/api/collector/start');
  }

  public collectorStop() {
    return this.makeRequest('/api/collector/stop');
  }

  // Versão atualizada com suporte a AbortSignal
  private async makeRequestWithSignal(endpoint: string, signal: AbortSignal, method = 'GET', data?: any): Promise<any> {
    let url: string;
    if (/^https?:\/\//i.test(endpoint)) {
      url = endpoint;
    } else {
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      url = `${this.baseURL}${normalizedEndpoint}`;
    }

    console.log(`[Processador] Making request to ${url} with method ${method} (with signal)`, data);

  const headers: Record<string, string> = { 'Accept': 'application/json', 'Cache-Control': 'no-cache' };
    const config: RequestInit = { method, headers, signal };

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

    try {
      const response = await fetch(url, config);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(`[Processador] Request failed to ${url}:`, error);
      throw error;
    }
  }

  public getResumo(areaId?: string, nomeFormula?: string, dataInicio?: string, dataFim?: string, codigo?: number | string, numero?: number | string, advancedFilters?: any) {
    const params: any = {};
    if (areaId) params.areaId = areaId;
    if (nomeFormula) params.nomeFormula = nomeFormula;
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;
    if (codigo !== undefined && codigo !== null && String(codigo) !== '') params.codigo = codigo;
    if (numero !== undefined && numero !== null && String(numero) !== '') params.numero = numero;

    // If advancedFilters provided, prefer POST body to avoid long URLs
    if (advancedFilters && typeof advancedFilters === 'object') {
      return this.makeRequest('/api/resumo', 'POST', { params, advancedFilters });
    }

    return this.makeRequest('/api/resumo', 'GET', params);
  }
  
  // Nova versão com suporte a AbortSignal
  public getResumoWithSignal(signal: AbortSignal, areaId?: string, nomeFormula?: string, dataInicio?: string, dataFim?: string, codigo?: number | string, numero?: number | string, advancedFilters?: any) {
    const params: any = {};
    if (areaId) params.areaId = areaId;
    if (nomeFormula) params.nomeFormula = nomeFormula;
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;
    if (codigo !== undefined && codigo !== null && String(codigo) !== '') params.codigo = codigo;
    if (numero !== undefined && numero !== null && String(numero) !== '') params.numero = numero;

    if (advancedFilters && typeof advancedFilters === 'object') {
      return this.makeRequestWithSignal('/api/resumo', signal, 'POST', { params, advancedFilters });
    }

    return this.makeRequestWithSignal('/api/resumo', signal, 'GET', params);
  }

  /**
   * Retorna um mapeamento { formulaNome: somatoriaTotalEmKg }
   */
  public async getFormulaSomatoria(areaId?: string, nomeFormula?: string, dataInicio?: string, dataFim?: string, codigo?: number | string, numero?: number | string): Promise<Record<string, number>> {
    const params: any = {};
    if (areaId) params.areaId = areaId;
    if (nomeFormula) params.nomeFormula = nomeFormula;
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;
    if (codigo !== undefined && codigo !== null && String(codigo) !== '') params.codigo = codigo;
    if (numero !== undefined && numero !== null && String(numero) !== '') params.numero = numero;

    const resumo: any = await this.makeRequest('/api/resumo', 'GET', params);
    const formulas = resumo?.formulasUtilizadas || {};
    const out: Record<string, number> = {};
    Object.keys(formulas).forEach((k) => {
      const v = formulas[k];
      if (v && typeof v === 'object') {
        const st = v.somatoriaTotal != null ? Number(v.somatoriaTotal) : 0;
        out[k] = Number.isFinite(st) ? st : 0;
      } else {
        out[k] = 0;
      }
    });
    return out;
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

  // New admin/database helpers
  public clearDatabase() {
    return this.makeRequest('/api/db/clear', 'POST');
  }

  public clearCache() {
    return this.makeRequest('/api/cache/clear', 'POST');
  }

  public exportDump() {
    return this.makeRequest('/api/db/dump', 'GET');
  }

  public importDump(dumpObj: any) {
    return this.makeRequest('/api/db/import', 'POST', dumpObj);
  }

  public clearAll() {
    return this.makeRequest('/api/clear/all', 'POST');
  }

  /**
   * Reset production data (DB clear + cache delete) - convenience wrapper
   */
  public async resetProduction(): Promise<boolean> {
    try {
      const res = await this.makeRequest('/api/clear/production', 'POST');
      // some backends return { ok: true } or { success: true }
      return res && (res.ok === true || res.success === true);
    } catch (err) {
      console.error('[Processador] resetProduction failed', err);
      throw err;
    }
  }

  public estoqueOperation(operation: string, payload: any = {}) {
    return this.makeRequest(`/api/estoque/${operation}`, 'POST', payload);
  }

  // Stock helpers
  public listarEstoque(incluirInativos = false) {
    return this.estoqueOperation('listar', { incluirInativos });
  }

  public listarEstoqueBaixo() {
    return this.estoqueOperation('baixo');
  }

  public listarEstoqueMovimentacoes(materiaPrimaId?: string, tipo?: any, dataInicial?: string, dataFinal?: string) {
    return this.estoqueOperation('movimentacoes', { materiaPrimaId, tipo, dataInicial, dataFinal });
  }

  public adicionarEstoque(materiaPrimaId: string, quantidade: number, opts: any = {}) {
    return this.estoqueOperation('adicionar', { materiaPrimaId, quantidade, ...opts });
  }

  public removerEstoque(materiaPrimaId: string, quantidade: number, opts: any = {}) {
    return this.estoqueOperation('remover', { materiaPrimaId, quantidade, ...opts });
  }

  public ajustarEstoque(materiaPrimaId: string, quantidade: number, opts: any = {}) {
    return this.estoqueOperation('ajustar', { materiaPrimaId, quantidade, ...opts });
  }

  public atualizarLimitesEstoque(materiaPrimaId: string, minimo: number, maximo: number, opts: any = {}) {
    return this.estoqueOperation('limites', { materiaPrimaId, minimo, maximo, ...opts });
  }

  public inicializarEstoque(materiaPrimaId: string, quantidade = 0, minimo = 0, maximo = 0) {
    return this.estoqueOperation('inicializar', { materiaPrimaId, quantidade, minimo, maximo });
  }

  // Método genérico para executar comandos
  public executarWs(comando: string, parametros: any = {}) {
    return this.sendWithConnectionCheck(comando, parametros);
  }

  // ✅ CORRIGIDO: sendConfig usa endpoint relativo
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

  // ✅ NOVO: Método para verificar se o backend está respondendo
  public async checkBackendHealth(): Promise<boolean> {
    try {
      await this.ping();
      return true;
    } catch (error) {
      console.error('[Processador] Backend health check failed:', error);
      return false;
    }
  }

  // ✅ NOVO: Método para aguardar o backend ficar pronto
  public async waitForBackendReady(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (await this.checkBackendHealth()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2 segundos entre tentativas
    }
    
    return false;
  }

  // ✅ NOVO: Método para upload de arquivo CSV
  public async uploadCSV(file: File): Promise<{ ok: boolean; meta: any; processed: any }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/api/file/upload`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Não definir Content-Type - o browser define automaticamente com boundary para multipart
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Processador] Upload CSV failed:', error);
      throw error;
    }
  }

  // ✅ NOVO: Método para converter CSV legado
  public async convertLegacyCSV(file: File): Promise<{ 
    ok: boolean; 
    rowsProcessed: number;
    rowsConverted: number;
    errors: string[];
    convertedData: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/api/file/convert`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Processador] Convert CSV failed:', error);
      throw error;
    }
  }
} 

// Singleton instance
let globalProcessadorInstance: Processador | null = null;

export function getProcessador(): Processador {
  if (!globalProcessadorInstance) {
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