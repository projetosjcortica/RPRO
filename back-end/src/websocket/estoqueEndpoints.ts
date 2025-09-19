import { estoqueService } from '../services/estoqueService';
import { TipoMovimentacao } from '../entities/MovimentacaoEstoque';

/**
 * Configuração dos endpoints WebSocket para o serviço de estoque
 */
export function configureEstoqueEndpoints(wsb: any) {
  // Listar todo o estoque
  wsb.register('estoque/listar', async (payload: any) => {
    const incluirInativos = payload?.incluirInativos || false;
    const estoque = await estoqueService.listarEstoque(incluirInativos);
    return estoque;
  });

  // Obter estoque de um produto específico
  wsb.register('estoque/obter', async (payload: any) => {
    const { materiaPrimaId } = payload;
    if (!materiaPrimaId) {
      throw new Error('ID da matéria-prima é obrigatório');
    }
    const estoque = await estoqueService.obterEstoque(materiaPrimaId);
    return estoque;
  });

  // Adicionar ao estoque
  wsb.register('estoque/adicionar', async (payload: any) => {
    const { materiaPrimaId, quantidade, observacoes, responsavel, documentoReferencia } = payload;
    
    if (!materiaPrimaId) {
      throw new Error('ID da matéria-prima é obrigatório');
    }
    
    if (!quantidade || quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }
    
    const estoque = await estoqueService.adicionarEstoque(
      materiaPrimaId,
      quantidade,
      observacoes,
      responsavel,
      documentoReferencia
    );
    
    // Envia evento de atualização para todos os clientes
    wsb.sendEvent('estoque/atualizado', { materiaPrimaId, novaQuantidade: estoque.quantidade });
    
    return estoque;
  });

  // Remover do estoque
  wsb.register('estoque/remover', async (payload: any) => {
    const { materiaPrimaId, quantidade, observacoes, responsavel, documentoReferencia } = payload;
    
    if (!materiaPrimaId) {
      throw new Error('ID da matéria-prima é obrigatório');
    }
    
    if (!quantidade || quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }
    
    const estoque = await estoqueService.removerEstoque(
      materiaPrimaId,
      quantidade,
      observacoes,
      responsavel,
      documentoReferencia
    );
    
    // Envia evento de atualização para todos os clientes
    wsb.sendEvent('estoque/atualizado', { materiaPrimaId, novaQuantidade: estoque.quantidade });
    
    return estoque;
  });

  // Ajustar estoque (inventário)
  wsb.register('estoque/ajustar', async (payload: any) => {
    const { materiaPrimaId, quantidade, observacoes, responsavel } = payload;
    
    if (!materiaPrimaId) {
      throw new Error('ID da matéria-prima é obrigatório');
    }
    
    if (quantidade === undefined || quantidade < 0) {
      throw new Error('Quantidade deve ser maior ou igual a zero');
    }
    
    const estoque = await estoqueService.ajustarEstoque(
      materiaPrimaId,
      quantidade,
      observacoes,
      responsavel
    );
    
    // Envia evento de atualização para todos os clientes
    wsb.sendEvent('estoque/atualizado', { materiaPrimaId, novaQuantidade: estoque.quantidade });
    
    return estoque;
  });

  // Atualizar limites de estoque
  wsb.register('estoque/limites', async (payload: any) => {
    const { materiaPrimaId, minimo, maximo } = payload;
    
    if (!materiaPrimaId) {
      throw new Error('ID da matéria-prima é obrigatório');
    }
    
    if (minimo === undefined || minimo < 0) {
      throw new Error('Quantidade mínima deve ser maior ou igual a zero');
    }
    
    if (maximo === undefined || maximo < minimo) {
      throw new Error('Quantidade máxima deve ser maior ou igual à quantidade mínima');
    }
    
    const estoque = await estoqueService.atualizarLimites(
      materiaPrimaId,
      minimo,
      maximo
    );
    
    return estoque;
  });

  // Listar movimentações
  wsb.register('estoque/movimentacoes', async (payload: any) => {
    const { materiaPrimaId, tipo, dataInicial, dataFinal } = payload || {};
    
    let tipoMovimentacao = null;
    if (tipo && Object.values(TipoMovimentacao).includes(tipo)) {
      tipoMovimentacao = tipo;
    }
    
    let dataInicialObj = null;
    if (dataInicial) {
      dataInicialObj = new Date(dataInicial);
    }
    
    let dataFinalObj = null;
    if (dataFinal) {
      dataFinalObj = new Date(dataFinal);
    }
    
    const movimentacoes = await estoqueService.listarMovimentacoes(
      materiaPrimaId,
      tipoMovimentacao,
      dataInicialObj || undefined,
      dataFinalObj || undefined
    );
    
    return movimentacoes;
  });

  // Listar produtos com estoque abaixo do mínimo
  wsb.register('estoque/baixo', async () => {
    return await estoqueService.listarEstoqueBaixo();
  });

  // Inicializar estoque para uma matéria-prima
  wsb.register('estoque/inicializar', async (payload: any) => {
    const { materiaPrimaId, quantidade, minimo, maximo } = payload;
    
    if (!materiaPrimaId) {
      throw new Error('ID da matéria-prima é obrigatório');
    }
    
    const estoque = await estoqueService.inicializarEstoque(
      materiaPrimaId,
      quantidade || 0,
      minimo || 0,
      maximo || 0
    );
    
    return estoque;
  });
}