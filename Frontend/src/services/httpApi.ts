// HTTP API client to replace WebSocket-based Processador
import axios, { AxiosInstance } from 'axios';

export interface FilterOptions {
  dateStart?: string;
  dateEnd?: string;
  formula?: string;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface TableDataResult {
  rows: any[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ChartDataResult {
  chartData: any[];
  total: number;
  metadata?: any;
}

export class HttpApiClient {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL = 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('HTTP API Error:', error);
        throw error;
      }
    );
  }

  // Basic connectivity
  async ping(): Promise<{ pong: boolean; ts: string }> {
    const response = await this.api.get('/api/ping');
    return response.data;
  }

  // Backup operations
  async listBackups(): Promise<any> {
    const response = await this.api.get('/api/backup/list');
    return response.data;
  }

  // File processing
  async processFile(filePath: string): Promise<{ meta: any; rowsCount: number }> {
    const response = await this.api.get('/api/file/process', {
      params: { filePath }
    });
    return response.data;
  }

  // IHM operations
  async fetchLatestFromIHM(ip: string, user = 'anonymous', password = ''): Promise<any> {
    const response = await this.api.get('/api/ihm/fetchLatest', {
      params: { ip, user, password }
    });
    return response.data;
  }

  // Report data - main table pagination
  async getTableData(
    page = 1, 
    pageSize = 300, 
    filters?: FilterOptions,
    includeProducts = false
  ): Promise<TableDataResult> {
    const params: any = {
      page,
      pageSize,
      includeProducts: includeProducts.toString()
    };

    if (filters) {
      if (filters.dateStart) params.dateStart = filters.dateStart;
      if (filters.dateEnd) params.dateEnd = filters.dateEnd;
      if (filters.formula) params.formula = filters.formula;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortDir) params.sortDir = filters.sortDir;
    }

    const response = await this.api.get('/api/relatorio/paginate', { params });
    return response.data;
  }

  // Database operations
  async listBatches(): Promise<{ items: any[]; total: number; page: number; pageSize: number }> {
    const response = await this.api.get('/api/db/listBatches');
    return response.data;
  }

  async setupMateriaPrima(items: any[]): Promise<any> {
    const response = await this.api.post('/api/db/setupMateriaPrima', { items });
    return response.data;
  }

  async getMateriaPrima(): Promise<any[]> {
    const response = await this.api.get('/api/db/getMateriaPrima');
    return response.data;
  }

  async syncLocalToMain(limit = 500): Promise<{ synced: number }> {
    const response = await this.api.get('/api/db/syncLocalToMain', {
      params: { limit }
    });
    return response.data;
  }

  // Summary/Resume operations
  async getResumo(filters?: {
    areaId?: string;
    formula?: string;
    dateStart?: string;
    dateEnd?: string;
  }): Promise<any> {
    const params: any = {};
    if (filters) {
      if (filters.areaId) params.areaId = filters.areaId;
      if (filters.formula) params.formula = filters.formula;
      if (filters.dateStart) params.dateStart = filters.dateStart;
      if (filters.dateEnd) params.dateEnd = filters.dateEnd;
    }

    const response = await this.api.get('/api/resumo', { params });
    return response.data;
  }

  // Mock operations
  async getMockStatus(): Promise<{ enabled: boolean }> {
    const response = await this.api.get('/api/mock/status');
    return response.data;
  }

  async toggleMock(enabled: boolean): Promise<{ enabled: boolean }> {
    const response = await this.api.post('/api/mock/toggle', { enabled });
    return response.data;
  }

  async getMockRelatorios(params?: any): Promise<any> {
    const response = await this.api.get('/api/mock/relatorios', { params });
    return response.data;
  }

  async getMockMaterias(): Promise<any[]> {
    const response = await this.api.get('/api/mock/materias');
    return response.data;
  }

  // Unit conversion operations
  async converterUnidade(valor: number, de: number, para: number): Promise<{
    original: number;
    convertido: number;
    de: number;
    para: number;
  }> {
    const response = await this.api.get('/api/unidades/converter', {
      params: { valor, de, para }
    });
    return response.data;
  }

  async normalizarParaKg(valores: any, unidades: any): Promise<{
    valoresOriginais: any;
    valoresNormalizados: any;
    unidades: any;
  }> {
    const response = await this.api.post('/api/unidades/normalizarParaKg', {
      valores,
      unidades
    });
    return response.data;
  }

  // Data population
  async populateDatabase(tipo = 'relatorio', quantidade = 10, config = {}): Promise<any> {
    const response = await this.api.post('/api/db/populate', {
      tipo,
      quantidade,
      config
    });
    return response.data;
  }

  // Collector operations
  async startCollector(): Promise<{ started: boolean }> {
    const response = await this.api.get('/api/collector/start');
    return response.data;
  }

  async stopCollector(): Promise<{ stopped: boolean }> {
    const response = await this.api.get('/api/collector/stop');
    return response.data;
  }

  // WebSocket status operations (for monitoring legacy WS if needed)
  async getWsStatus(): Promise<{ port: number; clients: number; loop: boolean }> {
    const response = await this.api.get('/api/ws/status');
    return response.data;
  }

  async startWsLoop(periodMs?: number): Promise<any> {
    const params = periodMs ? { periodMs } : {};
    const response = await this.api.get('/api/ws/loop/start', { params });
    return response.data;
  }

  async stopWsLoop(): Promise<any> {
    const response = await this.api.get('/api/ws/loop/stop');
    return response.data;
  }

  // Estoque operations (pass-through to backend handlers)
  async estoqueOperation(operation: string, payload: any = {}): Promise<any> {
    const response = await this.api.post(`/api/estoque/${operation}`, payload);
    return response.data;
  }

  // Generic estoque shortcuts
  async listarEstoque(): Promise<any> {
    return this.estoqueOperation('listar');
  }

  async obterEstoque(materiaPrimaId: string): Promise<any> {
    return this.estoqueOperation('obter', { materiaPrimaId });
  }

  async adicionarEstoque(materiaPrimaId: string, quantidade: number, observacoes?: string): Promise<any> {
    return this.estoqueOperation('adicionar', { materiaPrimaId, quantidade, observacoes });
  }

  async removerEstoque(materiaPrimaId: string, quantidade: number, observacoes?: string): Promise<any> {
    return this.estoqueOperation('remover', { materiaPrimaId, quantidade, observacoes });
  }

  async ajustarEstoque(materiaPrimaId: string, novaQuantidade: number, observacoes?: string): Promise<any> {
    return this.estoqueOperation('ajustar', { materiaPrimaId, novaQuantidade, observacoes });
  }

  // Compatibility methods to match Processador interface
  async sendWithConnectionCheck(command: string, payload?: any): Promise<any> {
    // Map common commands to HTTP endpoints
    switch (command) {
      case 'ping':
        return this.ping();
      case 'backup.list':
        return this.listBackups();
      case 'relatorio.paginate':
        return this.getTableData(payload?.page, payload?.pageSize, payload);
      case 'db.getMateriaPrima':
        return this.getMateriaPrima();
      case 'mock.getStatus':
        return this.getMockStatus();
      case 'mock.setStatus':
        return this.toggleMock(payload?.enabled);
      case 'collector.start':
        return this.startCollector();
      case 'collector.stop':
        return this.stopCollector();
      case 'materiaprima.getConfig':
        return this.getMateriaPrima();
      default:
        throw new Error(`Command not implemented in HTTP API: ${command}`);
    }
  }

  // Connection check (always returns true for HTTP)
  async checkConnection(): Promise<boolean> {
    try {
      await this.ping();
      return true;
    } catch {
      return false;
    }
  }

  // Method to get materia prima labels (matching existing endpoint)
  async getMateriaPrimaLabels(): Promise<any> {
    const response = await this.api.get('/api/materiaprima/labels');
    return response.data;
  }
}

// Singleton instance
let httpApiInstance: HttpApiClient | null = null;

export function getHttpApi(baseURL?: string): HttpApiClient {
  if (!httpApiInstance) {
    httpApiInstance = new HttpApiClient(baseURL);
  }
  return httpApiInstance;
}

export function setHttpApi(baseURL: string): HttpApiClient {
  httpApiInstance = new HttpApiClient(baseURL);
  return httpApiInstance;
}

export function clearHttpApi(): void {
  httpApiInstance = null;
}