import { dbService, AppDataSource } from './dbService';
import { Relatorio } from '../entities/Relatorio';
import { BaseService } from '../core/baseService';

/**
 * Serviço para popular o banco de dados com dados de teste
 */
export class DataPopulationService extends BaseService {
  constructor() {
    super('DataPopulationService');
  }

  /**
   * Gera dados de teste para o relatório
   * @param quantidade Quantidade de registros a serem gerados
   * @param config Configurações para geração dos dados
   * @returns Os dados gerados e inseridos no banco
   */
  async populateRelatorio(
    quantidade: number, 
    config: {
      formula1?: number;
      formula2?: number;
      dataInicial?: string;
      dataFinal?: string;
      areas?: string[];
      nomePrefixo?: string;
    } = {}
  ): Promise<{ insertedCount: number; sampleData: Relatorio[] }> {
    await dbService.init();
    const repo = AppDataSource.getRepository(Relatorio);
    
    // Validar parâmetros
    const count = Math.min(Math.max(1, quantidade), 1000); // Limitar entre 1 e 1000
    
    // Valores padrão se não informados
    const formula1 = config.formula1 || 1;
    const formula2 = config.formula2 || 2;
    const nomePrefixo = config.nomePrefixo || 'Teste';
    
    // Datas
    const dataAtual = new Date();
    const dataInicial = config.dataInicial ? new Date(config.dataInicial) : new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1);
    const dataFinal = config.dataFinal ? new Date(config.dataFinal) : new Date();
    
    // Garantir que dataFinal é maior ou igual a dataInicial
    if (dataFinal < dataInicial) {
      dataFinal.setTime(dataInicial.getTime());
    }
    
    // Áreas disponíveis
    const areas = config.areas && config.areas.length > 0 
      ? config.areas 
      : ['A1', 'A2', 'A3', 'B1', 'B2', 'C1'];
    
    // Gerar registros
    const registros: Relatorio[] = [];
    
    for (let i = 0; i < count; i++) {
      // Gerar data aleatória entre dataInicial e dataFinal
      const randomTime = dataInicial.getTime() + Math.random() * (dataFinal.getTime() - dataInicial.getTime());
      const randomDate = new Date(randomTime);
      
      // Formatar data como string (YYYY-MM-DD)
      const dia = randomDate.toISOString().split('T')[0];
      
      // Formatar hora como string (HH:MM:SS)
      const hora = [
        String(randomDate.getHours()).padStart(2, '0'),
        String(randomDate.getMinutes()).padStart(2, '0'),
        String(randomDate.getSeconds()).padStart(2, '0')
      ].join(':');
      
      // Selecionar área aleatória
      const area = areas[Math.floor(Math.random() * areas.length)];
      
      // Valores aleatórios para Form1 e Form2 (com pequena variação)
      const form1Variation = (Math.random() * 0.5 + 0.75); // Entre 0.75 e 1.25
      const form2Variation = (Math.random() * 0.5 + 0.75); // Entre 0.75 e 1.25
      
      const registro = new Relatorio();
      registro.Dia = dia;
      registro.Hora = hora;
      registro.Nome = `${nomePrefixo}_${i + 1}`;
      registro.Form1 = formula1 * form1Variation;
      registro.Form2 = formula2 * form2Variation;
      registro.Area = area;
      registro.AreaDescricao = `Área ${area}`;
      registro.processedFile = `test_population_${new Date().getTime()}.csv`;
      
      registros.push(registro);
    }
    
    // Salvar no banco de dados
    const savedData = await repo.save(registros);
    
    // Retornar informações sobre a operação
    return {
      insertedCount: savedData.length,
      sampleData: savedData.slice(0, 5) // Retornar apenas os 5 primeiros como amostra
    };
  }
}

// Instância singleton
export const dataPopulationService = new DataPopulationService();