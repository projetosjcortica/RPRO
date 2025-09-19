import { useState, useCallback } from 'react';
import { apiWs } from '../Testes/api';
import { IS_LOCAL } from '../CFG';

/**
 * Hook para facilitar a conversão de unidades (g/kg)
 */
export function useUnidades() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Converte um valor entre unidades (g/kg)
   * @param valor O valor a ser convertido
   * @param de Unidade de origem (0 = g, 1 = kg)
   * @param para Unidade de destino (0 = g, 1 = kg)
   * @returns O valor convertido
   */
  const converterUnidade = useCallback(async (
    valor: number, 
    de: number, 
    para: number
  ): Promise<number> => {
    setLoading(true);
    setError(null);
    
    try {
      // Se as unidades forem iguais, não precisa converter
      if (de === para) return valor;
      
      if (IS_LOCAL) {
        // Implementação local (sem backend)
        if (de === 0 && para === 1) {
          // g para kg (divide por 1000)
          return valor / 1000;
        } else if (de === 1 && para === 0) {
          // kg para g (multiplica por 1000)
          return valor * 1000;
        }
        
        throw new Error(`Conversão inválida: de ${de} para ${para}`);
      } else {
        // Usa o backend para converter
        const response = await apiWs.unidadesConverter(valor, de, para);
        if (response?.convertido !== undefined) {
          return response.convertido;
        }
        
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao converter unidade');
      console.error('Erro ao converter unidade:', err);
      return valor; // Retorna o valor original em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Normaliza todos os valores para kg
   * @param valores Objeto com valores por coluna
   * @param unidades Objeto com unidades por coluna (0 = g, 1 = kg)
   * @returns Objeto com valores normalizados
   */
  const normalizarParaKg = useCallback(async (
    valores: Record<string, number>,
    unidades: Record<string, number>
  ): Promise<Record<string, number>> => {
    setLoading(true);
    setError(null);
    
    try {
      if (IS_LOCAL) {
        // Implementação local (sem backend)
        const resultado: Record<string, number> = {};
        
        for (const coluna in valores) {
          if (valores.hasOwnProperty(coluna) && unidades.hasOwnProperty(coluna)) {
            const valor = valores[coluna];
            const unidade = unidades[coluna];
            
            // Se for em gramas, converte para kg
            if (unidade === 0) {
              resultado[coluna] = valor / 1000;
            } else {
              resultado[coluna] = valor;
            }
          } else {
            // Mantém o valor original se não houver informação de unidade
            resultado[coluna] = valores[coluna];
          }
        }
        
        return resultado;
      } else {
        // Usa o backend para normalizar
        const response = await apiWs.unidadesNormalizarParaKg(valores, unidades);
        if (response?.valoresNormalizados) {
          return response.valoresNormalizados;
        }
        
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao normalizar valores');
      console.error('Erro ao normalizar valores:', err);
      return valores; // Retorna os valores originais em caso de erro
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    converterUnidade,
    normalizarParaKg,
    loading,
    error
  };
}