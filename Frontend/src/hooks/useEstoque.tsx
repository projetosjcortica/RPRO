import { useState, useEffect, useCallback } from 'react';
// import { getHttpApi } from '../services/httpApi';
import { getProcessador } from '../Processador';

export interface EstoqueItem {
  id: string;
  materia_prima_id: string;
  quantidade: number;
  quantidade_minima: number;
  quantidade_maxima: number;
  unidade: string;
  ativo: boolean;
  observacoes?: string;
  localizacao?: string;
  criado_em: string;
  atualizado_em: string;
  materiaPrima: {
    id: string;
    num: number;
    produto: string;
    medida: number;
    categoria?: string;
  };
}

export interface MovimentacaoEstoqueItem {
  id: string;
  materia_prima_id: string;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'inventario';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_atual: number;
  unidade: string;
  documento_referencia?: string;
  responsavel?: string;
  observacoes?: string;
  data_movimentacao: string;
  materiaPrima: {
    id: string;
    num: number;
    produto: string;
    medida: number;
    categoria?: string;
  };
}

export const useEstoque = () => {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [estoqueBaixo, setEstoqueBaixo] = useState<EstoqueItem[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoqueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar todos os itens do estoque
  const carregarEstoque = useCallback(async (_incluirInativos = false) => {
    setLoading(true);
    setError(null);
    try {
      const processador = getProcessador();
      const result = await processador.listarEstoque();
      if (result && Array.isArray(result)) {
        setEstoque(result);
      } else {
        setEstoque([]);
      }
    } catch (err) {
      console.error('Erro ao carregar estoque:', err);
      setError('Falha ao carregar dados do estoque');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar itens com estoque abaixo do mínimo
  const carregarEstoqueBaixo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const httpClient = getHttpApi();
      const result = await httpClient.listarEstoqueBaixo();
      if (result && Array.isArray(result)) {
        setEstoqueBaixo(result);
      } else {
        setEstoqueBaixo([]);
      }
    } catch (err) {
      console.error('Erro ao carregar estoque baixo:', err);
      setError('Falha ao carregar dados de estoque baixo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar movimentações de estoque
  const carregarMovimentacoes = useCallback(async (
    materiaPrimaId?: string,
    tipo?: 'entrada' | 'saida' | 'ajuste' | 'inventario',
    dataInicial?: string,
    dataFinal?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const httpClient = getHttpApi();
      const result = await httpClient.listarEstoqueMovimentacoes(materiaPrimaId, tipo, dataInicial, dataFinal);
      if (result && Array.isArray(result)) {
        setMovimentacoes(result);
      } else {
        setMovimentacoes([]);
      }
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
      setError('Falha ao carregar movimentações de estoque');
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar quantidade ao estoque
  const adicionarEstoque = useCallback(async (
    materiaPrimaId: string,
    quantidade: number,
    observacoes?: string,
    responsavel?: string,
    documentoReferencia?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const httpClient = getHttpApi();
      const result = await httpClient.adicionarEstoque(materiaPrimaId, quantidade, {
        observacoes,
        responsavel,
        documentoReferencia
      });
      
      // Atualizar o estoque local após a adição
      carregarEstoque();
      
      return result;
    } catch (err: any) {
      console.error('Erro ao adicionar estoque:', err);
      setError(err?.message || 'Falha ao adicionar ao estoque');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [carregarEstoque]);

  // Remover quantidade do estoque
  const removerEstoque = useCallback(async (
    materiaPrimaId: string,
    quantidade: number,
    observacoes?: string,
    responsavel?: string,
    documentoReferencia?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const httpClient = getHttpApi();
      const result = await httpClient.removerEstoque(materiaPrimaId, quantidade, {
        observacoes,
        responsavel,
        documentoReferencia
      });
      
      // Atualizar o estoque local após a remoção
      carregarEstoque();
      
      return result;
    } catch (err: any) {
      console.error('Erro ao remover estoque:', err);
      setError(err?.message || 'Falha ao remover do estoque');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [carregarEstoque]);

  // Ajustar estoque (inventário)
  const ajustarEstoque = useCallback(async (
    materiaPrimaId: string,
    quantidade: number,
    observacoes?: string,
    responsavel?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const httpClient = getHttpApi();
      const result = await httpClient.ajustarEstoque(materiaPrimaId, quantidade, {
        observacoes,
        responsavel
      });
      
      // Atualizar o estoque local após o ajuste
      carregarEstoque();
      
      return result;
    } catch (err: any) {
      console.error('Erro ao ajustar estoque:', err);
      setError(err?.message || 'Falha ao ajustar estoque');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [carregarEstoque]);

  // Atualizar limites de estoque
  const atualizarLimites = useCallback(async (
    materiaPrimaId: string,
    minimo: number,
    maximo: number,
    localizacao?: string,
    observacoes?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const httpClient = getHttpApi();
      const result = await httpClient.atualizarLimitesEstoque(materiaPrimaId, minimo, maximo, {
        localizacao,
        observacoes
      });
      
      // Atualizar o estoque local após a atualização dos limites
      carregarEstoque();
      
      return result;
    } catch (err: any) {
      console.error('Erro ao atualizar limites:', err);
      setError(err?.message || 'Falha ao atualizar limites de estoque');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [carregarEstoque]);

  // Inicializar estoque para uma matéria-prima
  const inicializarEstoque = useCallback(async (
    materiaPrimaId: string,
    quantidade: number = 0,
    minimo: number = 0,
    maximo: number = 0
  ) => {
    setLoading(true);
    setError(null);
    try {
      const httpClient = getHttpApi();
      const result = await httpClient.inicializarEstoque(materiaPrimaId, quantidade, minimo, maximo);
      
      // Atualizar o estoque local após a inicialização
      carregarEstoque();
      
      return result;
    } catch (err: any) {
      console.error('Erro ao inicializar estoque:', err);
      setError(err?.message || 'Falha ao inicializar estoque');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [carregarEstoque]);

  // Listener para eventos de atualização de estoque
  useEffect(() => {
    const handleEstoqueAtualizado = (event: any) => {
      // Quando receber um evento de atualização, recarregar o estoque
      if (event.type === 'event' && event.event === 'estoque/atualizado') {
        carregarEstoque();
      }
    };

    window.addEventListener('message', handleEstoqueAtualizado);
    
    return () => {
      window.removeEventListener('message', handleEstoqueAtualizado);
    };
  }, [carregarEstoque]);

  // Carregar estoque ao montar o componente
  useEffect(() => {
    carregarEstoque();
  }, [carregarEstoque]);

  return {
    estoque,
    estoqueBaixo,
    movimentacoes,
    loading,
    error,
    carregarEstoque,
    carregarEstoqueBaixo,
    carregarMovimentacoes,
    adicionarEstoque,
    removerEstoque,
    ajustarEstoque,
    atualizarLimites,
    inicializarEstoque
  };
};