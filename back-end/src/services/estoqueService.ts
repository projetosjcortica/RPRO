import { BaseService } from '../core/baseService';
import { AppDataSource } from './dbService';
import { Estoque } from '../entities/Estoque';
import { MovimentacaoEstoque, TipoMovimentacao } from '../entities/MovimentacaoEstoque';
import { MateriaPrima } from '../entities/MateriaPrima';
import { Repository, Between, LessThanOrEqual, MoreThan } from 'typeorm';
import { Row } from '../entities/Row';

/**
 * Interface para relatório de consumo
 */
interface ConsumoMateriaPrima {
  materiaPrimaId: string;
  nome: string;
  totalConsumido: number;
  quantidadeBatidas: number;
  mediaPorBatida: number;
  periodo: { inicio: Date; fim: Date };
}

/**
 * Interface para projeção de estoque
 */
interface ProjecaoEstoque {
  materiaPrimaId: string;
  nome: string;
  estoqueAtual: number;
  consumoMedioDiario: number;
  diasRestantes: number;
  dataEstimadaFalta: Date | null;
  necessidadeReposicao: boolean;
  quantidadeSugerida: number;
}

/**
 * Interface para estatísticas de estoque
 */
interface EstatisticasEstoque {
  totalItens: number;
  itensAbaixoMinimo: number;
  itensAcimaMaximo: number;
  valorTotalEstoque: number;
  itensInativos: number;
  taxaRotatividade: number;
}

/**
 * Serviço de gerenciamento de estoque aprimorado.
 * Responsável por gerenciar estoque, projeções e análises.
 */
export class EstoqueService extends BaseService {
  private estoqueRepo: Repository<Estoque>;
  private movimentacaoRepo: Repository<MovimentacaoEstoque>;
  private materiaPrimaRepo: Repository<MateriaPrima>;
  private rowRepo: Repository<Row>;

  constructor() {
    super('EstoqueService');
    this.estoqueRepo = AppDataSource.getRepository(Estoque);
    this.movimentacaoRepo = AppDataSource.getRepository(MovimentacaoEstoque);
    this.materiaPrimaRepo = AppDataSource.getRepository(MateriaPrima);
    this.rowRepo = AppDataSource.getRepository(Row);
  }

  /**
   * Inicializa o estoque para uma matéria-prima
   */
  async inicializarEstoque(materiaPrimaId: string, quantidadeInicial: number = 0, minimo: number = 0, maximo: number = 0): Promise<Estoque> {
    // Verifica se já existe estoque para essa matéria-prima
    const estoqueExistente = await this.estoqueRepo.findOne({
      where: { materia_prima_id: materiaPrimaId }
    });

    if (estoqueExistente) {
      return estoqueExistente;
    }

    // Verifica se a matéria-prima existe
    const materiaPrima = await this.materiaPrimaRepo.findOne({
      where: { id: materiaPrimaId }
    });

    if (!materiaPrima) {
      throw new Error(`Matéria-prima com ID ${materiaPrimaId} não encontrada`);
    }

    // Cria um novo estoque
    const novoEstoque = this.estoqueRepo.create({
      materia_prima_id: materiaPrimaId,
      quantidade: quantidadeInicial,
      quantidade_minima: minimo,
      quantidade_maxima: maximo,
      materiaPrima: materiaPrima
    });

    await this.estoqueRepo.save(novoEstoque);

    // Registra a movimentação inicial se houver quantidade
    if (quantidadeInicial > 0) {
      await this.registrarMovimentacao(
        materiaPrimaId,
        TipoMovimentacao.ENTRADA,
        quantidadeInicial,
        0,
        quantidadeInicial,
        'Estoque inicial',
        'Sistema'
      );
    }

    return novoEstoque;
  }

  /**
   * Registra uma movimentação de estoque
   */
  async registrarMovimentacao(
    materiaPrimaId: string,
    tipo: TipoMovimentacao,
    quantidade: number,
    quantidadeAnterior: number,
    quantidadeAtual: number,
    observacoes?: string,
    responsavel?: string,
    documentoReferencia?: string
  ): Promise<MovimentacaoEstoque> {
    // Verifica se a matéria-prima existe
    const materiaPrima = await this.materiaPrimaRepo.findOne({
      where: { id: materiaPrimaId }
    });

    if (!materiaPrima) {
      throw new Error(`Matéria-prima com ID ${materiaPrimaId} não encontrada`);
    }

    // Cria a movimentação
    const movimentacao = this.movimentacaoRepo.create({
      materia_prima_id: materiaPrimaId,
      tipo,
      quantidade,
      quantidade_anterior: quantidadeAnterior,
      quantidade_atual: quantidadeAtual,
      observacoes,
      responsavel,
      documento_referencia: documentoReferencia,
      materiaPrima
    });

    return this.movimentacaoRepo.save(movimentacao);
  }

  /**
   * Adiciona quantidade ao estoque
   */
  async adicionarEstoque(
    materiaPrimaId: string,
    quantidade: number,
    observacoes?: string,
    responsavel?: string,
    documentoReferencia?: string
  ): Promise<Estoque> {
    // Verifica se existe estoque para essa matéria-prima
    let estoque = await this.estoqueRepo.findOne({
      where: { materia_prima_id: materiaPrimaId }
    });

    // Se não existe, inicializa
    if (!estoque) {
      estoque = await this.inicializarEstoque(materiaPrimaId);
    }

    const quantidadeAnterior = estoque.quantidade;
    const quantidadeAtual = quantidadeAnterior + quantidade;

    // Atualiza o estoque
    estoque.quantidade = quantidadeAtual;
    await this.estoqueRepo.save(estoque);

    // Registra a movimentação
    await this.registrarMovimentacao(
      materiaPrimaId,
      TipoMovimentacao.ENTRADA,
      quantidade,
      quantidadeAnterior,
      quantidadeAtual,
      observacoes,
      responsavel,
      documentoReferencia
    );

    return estoque;
  }

  /**
   * Remove quantidade do estoque
   */
  async removerEstoque(
    materiaPrimaId: string,
    quantidade: number,
    observacoes?: string,
    responsavel?: string,
    documentoReferencia?: string
  ): Promise<Estoque> {
    // Verifica se existe estoque para essa matéria-prima
    let estoque = await this.estoqueRepo.findOne({
      where: { materia_prima_id: materiaPrimaId }
    });

    // Se não existe, inicializa
    if (!estoque) {
      estoque = await this.inicializarEstoque(materiaPrimaId);
    }

    const quantidadeAnterior = estoque.quantidade;
    
    // Verifica se há estoque suficiente
    if (quantidadeAnterior < quantidade) {
      throw new Error(`Estoque insuficiente para a matéria-prima. Disponível: ${quantidadeAnterior}, Solicitado: ${quantidade}`);
    }
    
    const quantidadeAtual = quantidadeAnterior - quantidade;

    // Atualiza o estoque
    estoque.quantidade = quantidadeAtual;
    await this.estoqueRepo.save(estoque);

    // Registra a movimentação
    await this.registrarMovimentacao(
      materiaPrimaId,
      TipoMovimentacao.SAIDA,
      quantidade,
      quantidadeAnterior,
      quantidadeAtual,
      observacoes,
      responsavel,
      documentoReferencia
    );

    return estoque;
  }

  /**
   * Ajusta a quantidade em estoque (inventário)
   */
  async ajustarEstoque(
    materiaPrimaId: string,
    novaQuantidade: number,
    observacoes?: string,
    responsavel?: string
  ): Promise<Estoque> {
    // Verifica se existe estoque para essa matéria-prima
    let estoque = await this.estoqueRepo.findOne({
      where: { materia_prima_id: materiaPrimaId }
    });

    // Se não existe, inicializa
    if (!estoque) {
      estoque = await this.inicializarEstoque(materiaPrimaId, novaQuantidade);
      return estoque;
    }

    const quantidadeAnterior = estoque.quantidade;
    const quantidade = novaQuantidade - quantidadeAnterior; // Pode ser positivo ou negativo

    // Atualiza o estoque
    estoque.quantidade = novaQuantidade;
    await this.estoqueRepo.save(estoque);

    // Registra a movimentação
    await this.registrarMovimentacao(
      materiaPrimaId,
      TipoMovimentacao.AJUSTE,
      Math.abs(quantidade),
      quantidadeAnterior,
      novaQuantidade,
      observacoes || 'Ajuste de inventário',
      responsavel
    );

    return estoque;
  }

  /**
   * Obtém o estoque atual de uma matéria-prima
   */
  async obterEstoque(materiaPrimaId: string): Promise<Estoque | null> {
    return this.estoqueRepo.findOne({
      where: { materia_prima_id: materiaPrimaId },
      relations: ['materiaPrima']
    });
  }

  /**
   * Lista todo o estoque
   */
  async listarEstoque(incluirInativos: boolean = false): Promise<Estoque[]> {
    const where: any = {};
    if (!incluirInativos) {
      where.ativo = true;
    }
    
    return this.estoqueRepo.find({
      where,
      relations: ['materiaPrima'],
      order: {
        materiaPrima: {
          produto: 'ASC'
        }
      }
    });
  }

  /**
   * Lista o histórico de movimentações de uma matéria-prima
   */
  async listarMovimentacoes(
    materiaPrimaId?: string,
    tipo?: TipoMovimentacao,
    dataInicial?: Date,
    dataFinal?: Date
  ): Promise<MovimentacaoEstoque[]> {
    const where: any = {};
    
    if (materiaPrimaId) {
      where.materia_prima_id = materiaPrimaId;
    }
    
    if (tipo) {
      where.tipo = tipo;
    }
    
    if (dataInicial || dataFinal) {
      where.data_movimentacao = {};
      
      if (dataInicial) {
        where.data_movimentacao.gte = dataInicial;
      }
      
      if (dataFinal) {
        where.data_movimentacao.lte = dataFinal;
      }
    }
    
    return this.movimentacaoRepo.find({
      where,
      relations: ['materiaPrima'],
      order: {
        data_movimentacao: 'DESC'
      }
    });
  }

  /**
   * Lista produtos com estoque abaixo do mínimo
   */
  async listarEstoqueBaixo(): Promise<Estoque[]> {
    return this.estoqueRepo
      .createQueryBuilder('estoque')
      .innerJoinAndSelect('estoque.materiaPrima', 'materiaPrima')
      .where('estoque.quantidade < estoque.quantidade_minima')
      .andWhere('estoque.ativo = :ativo', { ativo: true })
      .orderBy('materiaPrima.produto', 'ASC')
      .getMany();
  }

  /**
   * Atualiza os limites de estoque (mínimo e máximo)
   */
  async atualizarLimites(
    materiaPrimaId: string,
    minimo: number,
    maximo: number
  ): Promise<Estoque> {
    let estoque = await this.estoqueRepo.findOne({
      where: { materia_prima_id: materiaPrimaId }
    });

    if (!estoque) {
      estoque = await this.inicializarEstoque(materiaPrimaId, 0, minimo, maximo);
    } else {
      estoque.quantidade_minima = minimo;
      estoque.quantidade_maxima = maximo;
      await this.estoqueRepo.save(estoque);
    }

    return estoque;
  }

  /**
   * Calcula consumo de matérias-primas baseado nas batidas registradas
   */
  async calcularConsumo(dataInicio?: Date, dataFim?: Date): Promise<ConsumoMateriaPrima[]> {
    try {
      const whereCondition: any = {};
      
      if (dataInicio && dataFim) {
        whereCondition.datetime = Between(dataInicio, dataFim);
      } else if (dataInicio) {
        whereCondition.datetime = MoreThan(dataInicio);
      } else if (dataFim) {
        whereCondition.datetime = LessThanOrEqual(dataFim);
      }

      const rows = await this.rowRepo.find({
        where: whereCondition,
        order: { datetime: 'ASC' }
      });

      if (rows.length === 0) return [];

      const materiasPrimas = await this.materiaPrimaRepo.find();
      const consumoPorMateria: Map<string, ConsumoMateriaPrima> = new Map();

      for (const row of rows) {
        const valores = row.values;
        if (!valores) continue;
        
        for (let i = 0; i < valores.length; i++) {
          const quantidade = valores[i];
          if (quantidade && quantidade > 0) {
            const materia = materiasPrimas.find(m => m.num === i);
            
            if (materia) {
              const consumoExistente = consumoPorMateria.get(materia.id);
              
              if (consumoExistente) {
                consumoExistente.totalConsumido += quantidade;
                consumoExistente.quantidadeBatidas++;
                consumoExistente.mediaPorBatida = consumoExistente.totalConsumido / consumoExistente.quantidadeBatidas;
              } else {
                const primeiraData = rows[0].datetime || new Date();
                const ultimaData = rows[rows.length - 1].datetime || new Date();
                
                consumoPorMateria.set(materia.id, {
                  materiaPrimaId: materia.id,
                  nome: materia.produto,
                  totalConsumido: quantidade,
                  quantidadeBatidas: 1,
                  mediaPorBatida: quantidade,
                  periodo: {
                    inicio: dataInicio || primeiraData,
                    fim: dataFim || ultimaData
                  }
                });
              }
            }
          }
        }
      }

      return Array.from(consumoPorMateria.values());
    } catch (error) {
      console.error(`[EstoqueService] Erro ao calcular consumo: ${error}`);
      throw error;
    }
  }

  /**
   * Projeta quando o estoque acabará baseado no consumo histórico
   */
  async projetarEstoque(diasHistorico: number = 30): Promise<ProjecaoEstoque[]> {
    try {
      const hoje = new Date();
      const dataInicio = new Date(hoje.getTime() - (diasHistorico * 24 * 60 * 60 * 1000));

      const consumos = await this.calcularConsumo(dataInicio, hoje);
      const estoques = await this.listarEstoque();
      
      const projecoes: ProjecaoEstoque[] = [];

      for (const estoque of estoques) {
        const consumo = consumos.find(c => c.materiaPrimaId === estoque.materia_prima_id);
        
        if (!consumo || consumo.totalConsumido === 0) {
          projecoes.push({
            materiaPrimaId: estoque.materia_prima_id,
            nome: estoque.materiaPrima.produto,
            estoqueAtual: estoque.quantidade,
            consumoMedioDiario: 0,
            diasRestantes: Infinity,
            dataEstimadaFalta: null,
            necessidadeReposicao: estoque.quantidade < estoque.quantidade_minima,
            quantidadeSugerida: Math.max(0, estoque.quantidade_minima - estoque.quantidade)
          });
          continue;
        }

        const diasPeriodo = (consumo.periodo.fim.getTime() - consumo.periodo.inicio.getTime()) / (24 * 60 * 60 * 1000);
        const consumoMedioDiario = consumo.totalConsumido / (diasPeriodo || 1);
        
        const diasRestantes = consumoMedioDiario > 0 ? estoque.quantidade / consumoMedioDiario : Infinity;
        const dataEstimadaFalta = diasRestantes !== Infinity && diasRestantes < 365
          ? new Date(hoje.getTime() + (diasRestantes * 24 * 60 * 60 * 1000))
          : null;
        
        const necessidadeReposicao = diasRestantes < 7 || estoque.quantidade < estoque.quantidade_minima;
        const quantidadeSugerida = necessidadeReposicao
          ? Math.max(estoque.quantidade_maxima - estoque.quantidade, consumoMedioDiario * 30 - estoque.quantidade)
          : 0;

        projecoes.push({
          materiaPrimaId: estoque.materia_prima_id,
          nome: estoque.materiaPrima.produto,
          estoqueAtual: estoque.quantidade,
          consumoMedioDiario,
          diasRestantes,
          dataEstimadaFalta,
          necessidadeReposicao,
          quantidadeSugerida: Math.max(0, quantidadeSugerida)
        });
      }

      return projecoes.sort((a, b) => {
        if (a.diasRestantes === Infinity) return 1;
        if (b.diasRestantes === Infinity) return -1;
        return a.diasRestantes - b.diasRestantes;
      });
    } catch (error) {
      console.error(`[EstoqueService] Erro ao projetar estoque: ${error}`);
      throw error;
    }
  }

  /**
   * Gera estatísticas gerais do estoque
   */
  async gerarEstatisticas(): Promise<EstatisticasEstoque> {
    try {
      const estoques = await this.listarEstoque();
      
      const estatisticas: EstatisticasEstoque = {
        totalItens: estoques.length,
        itensAbaixoMinimo: 0,
        itensAcimaMaximo: 0,
        valorTotalEstoque: 0,
        itensInativos: 0,
        taxaRotatividade: 0
      };

      for (const estoque of estoques) {
        if (!estoque.ativo) {
          estatisticas.itensInativos++;
          continue;
        }

        if (estoque.quantidade < estoque.quantidade_minima) estatisticas.itensAbaixoMinimo++;
        if (estoque.quantidade > estoque.quantidade_maxima) estatisticas.itensAcimaMaximo++;
        estatisticas.valorTotalEstoque += estoque.quantidade;
      }

      const dataInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const movimentacoes = await this.movimentacaoRepo.find({
        where: { tipo: TipoMovimentacao.SAIDA, data_movimentacao: MoreThan(dataInicio) }
      });

      const totalSaidas = movimentacoes.reduce((sum, mov) => sum + Number(mov.quantidade), 0);
      estatisticas.taxaRotatividade = estatisticas.valorTotalEstoque > 0
        ? (totalSaidas / estatisticas.valorTotalEstoque) * 100
        : 0;

      return estatisticas;
    } catch (error) {
      console.error(`[EstoqueService] Erro ao gerar estatísticas: ${error}`);
      throw error;
    }
  }

  /**
   * Gera dados de exemplo para teste
   */
  async gerarDadosExemplo(): Promise<void> {
    try {
      console.log('[EstoqueService] Gerando dados de exemplo para estoque...');

      const materiasPrimas = await this.materiaPrimaRepo.find();

      if (materiasPrimas.length === 0) {
        console.warn('[EstoqueService] Nenhuma matéria-prima encontrada');
        return;
      }

      for (const materia of materiasPrimas) {
        const estoqueExistente = await this.estoqueRepo.findOne({
          where: { materia_prima_id: materia.id }
        });

        if (estoqueExistente) continue;

        const quantidadeInicial = Math.floor(Math.random() * 500) + 100;
        const quantidadeMinima = Math.floor(quantidadeInicial * 0.2);
        const quantidadeMaxima = Math.floor(quantidadeInicial * 2);

        await this.inicializarEstoque(materia.id, quantidadeInicial, quantidadeMinima, quantidadeMaxima);
        console.log(`[EstoqueService] Estoque inicializado: ${materia.produto} - ${quantidadeInicial}kg`);
      }

      console.log('[EstoqueService] Dados de exemplo gerados com sucesso!');
    } catch (error) {
      console.error(`[EstoqueService] Erro ao gerar dados de exemplo: ${error}`);
      throw error;
    }
  }

  // Temporarily disable EstoqueService methods
  // Note: Feature flags can be added to gate responses if needed.
}

export const estoqueService = new EstoqueService();