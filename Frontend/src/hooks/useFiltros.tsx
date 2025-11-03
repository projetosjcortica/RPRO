import { useState, useEffect, useMemo } from 'react';
import { getDefaultReportDateRange } from '../lib/reportDefaults';

// Tipos originais de filtros
export interface Filtros {
  dataInicio: string;
  dataFim: string;
  nomeFormula: string;
  codigo?: string;
  numero?: string;
  categoria?: string;
  coluna?: string;
  valorMin?: number;
  valorMax?: number;
}

/**
 * Hook para filtrar dados de tabela/relatório
 * Permite busca por data, nome da fórmula, categoria, intervalo de valores
 */
export const useFiltros = () => {
  const [filtros, setFiltros] = useState<Filtros>(() => {
    const { dataInicio, dataFim } = getDefaultReportDateRange();
    return {
      dataInicio,
      dataFim,
      nomeFormula: '',
    };
  });

  // Informações de produtos do localStorage
  const [produtosInfo, setProdutosInfo] = useState<Record<string, any>>({});
  
  // Carrega informações de produtos do localStorage
  useEffect(() => {
    try {
      const produtosInfoRaw = localStorage.getItem('produtosInfo');
      if (produtosInfoRaw) {
        const produtosInfoObj = JSON.parse(produtosInfoRaw);
        setProdutosInfo(produtosInfoObj);
      }
    } catch (error) {
      console.error('Erro ao carregar informações de produtos:', error);
    }
  }, []);

  // Lista de categorias disponíveis
  const categorias = useMemo(() => {
    const categoriasSet = new Set<string>();
    
    // Extrai categorias dos produtos definidos
    Object.keys(produtosInfo).forEach(colKey => {
      if (produtosInfo[colKey]?.categoria) {
        categoriasSet.add(produtosInfo[colKey].categoria);
      }
    });
    
    return Array.from(categoriasSet).sort();
  }, [produtosInfo]);

  // Helper: parse plain date strings (YYYY-MM-DD or DD-MM-YYYY) into local Date
  const parseToLocalDate = (input: any): Date => {
    if (!input) return new Date(NaN);
    const s = String(input).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
      const [d, m, y] = s.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    // fallback to Date constructor
    return new Date(s);
  };

  const handleFiltroChange = (nome: keyof Filtros, valor: string | number) => {
    setFiltros(prev => ({
      ...prev,
      [nome]: valor
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      nomeFormula: ''
    });
  };

  /**
   * Filtra um conjunto de dados com base nos filtros definidos
   * @param dados Dados a serem filtrados
   * @returns Dados filtrados
   */
  const filtrarDados = <T extends Record<string, any>>(dados: T[]): T[] => {
    if (!dados || dados.length === 0) {
      return [];
    }
    
    let resultado = [...dados];
    
    // Filtro por nome da fórmula/registro
    if (filtros.nomeFormula && filtros.nomeFormula.trim()) {
      const nomeBusca = filtros.nomeFormula.toLowerCase().trim();
      
      // Verifica se possui um campo 'formula' ou 'nome' para filtrar
      if (dados[0].hasOwnProperty('formula')) {
        resultado = resultado.filter(registro => 
          registro.formula?.toLowerCase().includes(nomeBusca)
        );
      } else if (dados[0].hasOwnProperty('nome')) {
        resultado = resultado.filter(registro => 
          registro.nome?.toLowerCase().includes(nomeBusca)
        );
      }
    }
    
    // Filtro por intervalo de datas
    if (filtros.dataInicio || filtros.dataFim) {
      resultado = resultado.filter(registro => {
        // Verifica se o registro tem um campo de data
        if (!registro.data && !registro.timestamp && !registro.date) {
          return true; // Mantém registros sem data
        }
        
        // Determina qual campo usar como data
        let dataRegistro: Date | null = null;
        
        if (registro.data) {
          dataRegistro = parseToLocalDate(registro.data);
        } else if (registro.timestamp) {
          dataRegistro = parseToLocalDate(registro.timestamp);
        } else if (registro.date) {
          dataRegistro = parseToLocalDate(registro.date);
        }
        
        if (!dataRegistro) return true;
        
        // Verifica limite inferior (data início)
        if (filtros.dataInicio) {
          const dataInicio = parseToLocalDate(filtros.dataInicio);
          if (dataRegistro < dataInicio) return false;
        }
        
        // Verifica limite superior (data fim)
        if (filtros.dataFim) {
          const dataFim = parseToLocalDate(filtros.dataFim);
          dataFim.setHours(23, 59, 59, 999); // Final do dia
          if (dataRegistro > dataFim) return false;
        }
        
        return true;
      });
    }
    
    // Filtragem por categoria
    if (filtros.categoria) {
      // Colunas que possuem a categoria selecionada
      const colunasCategoria = Object.keys(produtosInfo).filter(
        colKey => produtosInfo[colKey]?.categoria === filtros.categoria
      );
      
      // Filtra registros que tenham valores nessas colunas
      if (colunasCategoria.length > 0) {
        resultado = resultado.filter(registro => {
          return colunasCategoria.some(coluna => 
            registro[coluna] !== undefined && registro[coluna] !== null && registro[coluna] !== 0
          );
        });
      }
    }
    
    // Filtragem por coluna específica
    if (filtros.coluna) {
      // Filtra por intervalo de valores em uma coluna específica
      if (filtros.valorMin !== undefined || filtros.valorMax !== undefined) {
        resultado = resultado.filter(registro => {
          const valor = Number(registro[filtros.coluna || '']);
          
          if (isNaN(valor)) return false;
          
          if (filtros.valorMin !== undefined && filtros.valorMax !== undefined) {
            return valor >= filtros.valorMin && valor <= filtros.valorMax;
          } else if (filtros.valorMin !== undefined) {
            return valor >= filtros.valorMin;
          } else if (filtros.valorMax !== undefined) {
            return valor <= filtros.valorMax;
          }
          
          return true;
        });
      }
    }
    
    return resultado;
  };

  return {
    filtros,
    categorias,
    produtosInfo,
    handleFiltroChange,
    limparFiltros,
    filtrarDados
  };
};