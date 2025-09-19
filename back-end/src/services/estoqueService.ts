import { BaseService } from '../core/baseService';
import { AppDataSource } from './dbService';
import { Estoque } from '../entities/Estoque';
import { MovimentacaoEstoque, TipoMovimentacao } from '../entities/MovimentacaoEstoque';
import { MateriaPrima } from '../entities/MateriaPrima';
import { Repository } from 'typeorm';

/**
 * Serviço de gerenciamento de estoque.
 * Responsável por gerenciar o estoque de matérias-primas.
 */
export class EstoqueService extends BaseService {
  private estoqueRepo: Repository<Estoque>;
  private movimentacaoRepo: Repository<MovimentacaoEstoque>;
  private materiaPrimaRepo: Repository<MateriaPrima>;

  constructor() {
    super('EstoqueService');
    this.estoqueRepo = AppDataSource.getRepository(Estoque);
    this.movimentacaoRepo = AppDataSource.getRepository(MovimentacaoEstoque);
    this.materiaPrimaRepo = AppDataSource.getRepository(MateriaPrima);
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
}

export const estoqueService = new EstoqueService();