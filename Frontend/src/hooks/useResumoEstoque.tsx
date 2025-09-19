import { useState, useEffect, useCallback } from 'react';
import { useEstoque } from './useEstoque';

export interface ResumoEstoqueData {
  totalProdutos: number;
  totalEstoqueBaixo: number;
  valorTotalEstoque: number;
  categoriaMaisUsada: string;
  categoriasMaisEstoque: { categoria: string; quantidade: number }[];
  atualizadoEm: string;
}

interface UseResumoEstoqueOptions {
  atualizacaoAutomatica?: boolean;
  intervaloAtualizacao?: number; // em milissegundos
}

export function useResumoEstoque(options: UseResumoEstoqueOptions = {}) {
  const [resumo, setResumo] = useState<ResumoEstoqueData | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);
  
  // Usamos o hook existente para obter dados do estoque
  const { estoque, estoqueBaixo, carregarEstoque, carregarEstoqueBaixo } = useEstoque();

  // Função para calcular o resumo a partir dos dados do estoque
  const calcularResumo = useCallback(() => {
    if (!estoque || estoque.length === 0) {
      setCarregando(false);
      return;
    }

    try {
      // Calcular métricas
      const totalProdutos = estoque.length;
      const totalEstoqueBaixo = estoqueBaixo.length;
      
      // Calcular valor total do estoque (exemplo)
      let valorTotal = 0;
      estoque.forEach(item => {
        // Aqui poderia usar o valor real do produto se disponível
        // Por enquanto, só somamos as quantidades
        valorTotal += item.quantidade;
      });
      
      // Encontrar categorias mais frequentes
      const categorias: Record<string, number> = {};
      estoque.forEach(item => {
        const categoria = item.materiaPrima.categoria || 'Sem categoria';
        if (!categorias[categoria]) {
          categorias[categoria] = 0;
        }
        categorias[categoria] += item.quantidade;
      });
      
      // Ordenar categorias por quantidade
      const categoriasMaisEstoque = Object.entries(categorias)
        .map(([categoria, quantidade]) => ({ categoria, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 3); // Top 3 categorias
      
      // Categoria mais usada
      const categoriaMaisUsada = categoriasMaisEstoque.length > 0 
        ? categoriasMaisEstoque[0].categoria 
        : 'Nenhuma';
      
      // Criar objeto de resumo
      const resumoCalculado: ResumoEstoqueData = {
        totalProdutos,
        totalEstoqueBaixo,
        valorTotalEstoque: valorTotal,
        categoriaMaisUsada,
        categoriasMaisEstoque,
        atualizadoEm: new Date().toISOString()
      };
      
      setResumo(resumoCalculado);
      setErro(null);
    } catch (error) {
      console.error('Erro ao calcular resumo do estoque:', error);
      setErro('Falha ao calcular o resumo do estoque.');
    } finally {
      setCarregando(false);
    }
  }, [estoque, estoqueBaixo]);

  // Função para atualizar o resumo
  const atualizarResumo = useCallback(async () => {
    setCarregando(true);
    try {
      await carregarEstoque();
      await carregarEstoqueBaixo();
      // O calcularResumo será chamado pelos useEffects abaixo
    } catch (error) {
      console.error('Erro ao atualizar dados de estoque:', error);
      setErro('Falha ao atualizar os dados de estoque.');
      setCarregando(false);
    }
  }, [carregarEstoque, carregarEstoqueBaixo]);

  // Recalcular o resumo quando os dados do estoque mudarem
  useEffect(() => {
    calcularResumo();
  }, [estoque, estoqueBaixo, calcularResumo]);

  // Configurar atualização automática se habilitada
  useEffect(() => {
    let intervalo: number | undefined;
    
    if (options.atualizacaoAutomatica) {
      intervalo = window.setInterval(() => {
        atualizarResumo();
      }, options.intervaloAtualizacao || 60000); // 60 segundos padrão
    }

    // Cleanup
    return () => {
      if (intervalo) {
        clearInterval(intervalo);
      }
    };
  }, [options.atualizacaoAutomatica, options.intervaloAtualizacao, atualizarResumo]);

  // Inicializar os dados
  useEffect(() => {
    atualizarResumo();
  }, [atualizarResumo]);

  return {
    resumo,
    carregando,
    erro,
    atualizarResumo
  };
}