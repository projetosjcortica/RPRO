import { wsbridge } from '../websocket/WebSocketBridge';
import { Relatorio } from '../entities/Relatorio';
import { MateriaPrima } from '../entities/MateriaPrima';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

/**
 * Service to manage mock data functionality
 */
class MockService {
  private mockEnabled: boolean = false;
  private mockConfig: Record<string, any> = {
    enableAutoPopulate: false,
    mockRelatorioCount: 50,
    mockMateriaPrimaCount: 10
  };
  
  // Cache de dados mock gerados
  private mockRelatorioCache: Relatorio[] | null = null;
  private mockMateriaPrimaCache: MateriaPrima[] | null = null;

  constructor() {
    // Register WebSocket commands
    this.registerHandlers();
  }

  /**
   * Register WebSocket handlers for mock data control
   */
  private registerHandlers() {
    // Get mock status
    wsbridge.register('mock.getStatus', async () => {
      return {
        enabled: this.mockEnabled,
        config: this.mockConfig
      };
    });

    // Enable or disable mock mode
    wsbridge.register('mock.setStatus', async (payload: { enabled: boolean }) => {
      this.mockEnabled = payload.enabled;
      
      // Broadcast change event to all clients
      wsbridge.sendEvent('mock.statusChanged', { enabled: this.mockEnabled });
      
      return { success: true, enabled: this.mockEnabled };
    });

    // Configure specific mock settings
    wsbridge.register('mock.configure', async (payload: Record<string, any>) => {
      this.mockConfig = {
        ...this.mockConfig,
        ...payload
      };
      
      // Limpar cache se houver mudança na configuração que afeta os dados
      if (payload.mockRelatorioCount || payload.mockMateriaPrimaCount) {
        this.clearCache();
      }
      
      return { success: true, config: this.mockConfig };
    });
    
    // Obter dados mock de relatório
    wsbridge.register('mock.getRelatorios', async (params: any) => {
      if (!this.mockEnabled) {
        return { error: 'Mock mode is disabled', status: 400 };
      }
      
      // Página e tamanho da página
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      
      // Filtros
      const formula = params?.formula;
      const dateStart = params?.dateStart;
      const dateEnd = params?.dateEnd;
      
      // Gerar ou usar cache
      const relatorios = this.getMockRelatorios();
      
      // Aplicar filtros
      let filtered = [...relatorios];
      
      if (formula) {
        const formulaNum = Number(formula);
        if (!isNaN(formulaNum)) {
          filtered = filtered.filter(r => 
            Math.abs((r.Form1 || 0) - formulaNum) < 0.1 || 
            Math.abs((r.Form2 || 0) - formulaNum) < 0.1
          );
        } else {
          filtered = filtered.filter(r => 
            (r.Nome || '').includes(formula) || 
            (r.processedFile || '').includes(formula)
          );
        }
      }
      
      if (dateStart) {
        filtered = filtered.filter(r => (r.Dia || '') >= dateStart);
      }
      
      if (dateEnd) {
        filtered = filtered.filter(r => (r.Dia || '') <= dateEnd);
      }
      
      // Calcular total e paginar
      const total = filtered.length;
      const startIndex = (page - 1) * pageSize;
      const rows = filtered.slice(startIndex, startIndex + pageSize);
      
      return { rows, total, page, pageSize };
    });
    
    // Obter dados mock de matéria prima
    wsbridge.register('mock.getMateriasPrimas', async () => {
      if (!this.mockEnabled) {
        return { error: 'Mock mode is disabled', status: 400 };
      }
      
      return this.getMockMateriasPrimas();
    });
  }
  
  /**
   * Gera dados mock de relatório
   */
  private generateMockRelatorios(count: number = 50): Relatorio[] {
    const relatorios: Relatorio[] = [];
    const dataAtual = new Date();
    const areas = ['A1', 'A2', 'B1', 'B2', 'C1'];
    
    // Obter matérias-primas para consultar unidades
    const materiasPrimas = this.getMockMateriasPrimas();
    
    for (let i = 0; i < count; i++) {
      // Data entre hoje e 30 dias atrás
      const dias = Math.floor(Math.random() * 30);
      const data = new Date(dataAtual.getTime() - dias * 24 * 60 * 60 * 1000);
      const dia = data.toISOString().split('T')[0];
      
      // Hora aleatória
      const hora = [
        String(Math.floor(Math.random() * 24)).padStart(2, '0'),
        String(Math.floor(Math.random() * 60)).padStart(2, '0'),
        String(Math.floor(Math.random() * 60)).padStart(2, '0')
      ].join(':');
      
      // Área aleatória
      const areaIndex = Math.floor(Math.random() * areas.length);
      const area = areas[areaIndex];
      
      // Fórmulas com pequenas variações
      const form1Base = 1 + Math.floor(Math.random() * 3);
      const form2Base = 2 + Math.floor(Math.random() * 3);
      
      const form1Variation = (Math.random() * 0.4) - 0.2; // Entre -0.2 e 0.2
      const form2Variation = (Math.random() * 0.4) - 0.2; // Entre -0.2 e 0.2
      
      // Criar relatório
      const relatorio = new Relatorio();
      relatorio.id = uuidv4();
      relatorio.Dia = dia;
      relatorio.Hora = hora;
      relatorio.Nome = `Mock_${i + 1}`;
      relatorio.Form1 = form1Base + form1Variation;
      relatorio.Form2 = form2Base + form2Variation;
      relatorio.Area = area;
      relatorio.AreaDescricao = `Área ${area}`;
      relatorio.processedFile = `mock_data_${createHash('md5').update(String(i)).digest('hex').substring(0, 8)}.csv`;
      
      // Adicionar produtos com suas unidades (gramas ou kg)
      const numProdutos = Math.floor(Math.random() * 10) + 5; // Entre 5 e 15 produtos
      
      for (let j = 1; j <= 40; j++) {
        if (j <= numProdutos) {
          // Valor aleatório para o produto
          const valor = Math.random() * 100 + 10; // Entre 10 e 110
          relatorio[`Prod_${j}`] = valor;
          
          // Atribuir a unidade com base na matéria-prima correspondente
          // Se não houver matéria-prima correspondente, alterna aleatoriamente
          const materiaPrima = materiasPrimas.find(mp => mp.num === j);
          if (materiaPrima) {
            relatorio[`Unidade_${j}`] = materiaPrima.medida === 0 ? 'g' : 'kg';
          } else {
            relatorio[`Unidade_${j}`] = Math.random() > 0.5 ? 'g' : 'kg';
          }
        } else {
          relatorio[`Prod_${j}`] = 0;
          relatorio[`Unidade_${j}`] = 'kg'; // Valor padrão para produtos vazios
        }
      }
      
      relatorios.push(relatorio);
    }
    
    return relatorios;
  }
  
  /**
   * Gera dados mock de matéria prima
   */
  private generateMockMateriasPrimas(count: number = 10): MateriaPrima[] {
    const materias: MateriaPrima[] = [];
    
    for (let i = 0; i < count; i++) {
      const materiaPrima = new MateriaPrima();
      materiaPrima.id = uuidv4();
      materiaPrima.num = i + 1;
      materiaPrima.produto = `Produto Mock ${i + 1}`;
      materiaPrima.medida = Math.random() > 0.5 ? 1 : 0; // 50% chance de kg ou g
      
      materias.push(materiaPrima);
    }
    
    return materias;
  }
  
  /**
   * Limpa o cache de dados mock
   */
  private clearCache(): void {
    this.mockRelatorioCache = null;
    this.mockMateriaPrimaCache = null;
  }
  
  /**
   * Obtém relatórios mock (do cache ou gerando novos)
   */
  private getMockRelatorios(): Relatorio[] {
    if (!this.mockRelatorioCache) {
      this.mockRelatorioCache = this.generateMockRelatorios(this.mockConfig.mockRelatorioCount || 50);
    }
    return this.mockRelatorioCache;
  }
  
  /**
   * Obtém matérias primas mock (do cache ou gerando novas)
   */
  private getMockMateriasPrimas(): MateriaPrima[] {
    if (!this.mockMateriaPrimaCache) {
      this.mockMateriaPrimaCache = this.generateMockMateriasPrimas(this.mockConfig.mockMateriaPrimaCount || 10);
    }
    return this.mockMateriaPrimaCache;
  }

  /**
   * Check if mock mode is enabled
   */
  public isMockEnabled(): boolean {
    return this.mockEnabled;
  }

  /**
   * Get mock configuration
   */
  public getMockConfig(): Record<string, any> {
    return { ...this.mockConfig };
  }

  /**
   * Enable or disable mock mode
   */
  public toggleMockMode(enable: boolean): { enabled: boolean } {
    this.mockEnabled = enable;
    wsbridge.sendEvent('mock.statusChanged', { enabled: this.mockEnabled });
    return { enabled: this.mockEnabled };
  }
}

// Create singleton instance
export const mockService = new MockService();