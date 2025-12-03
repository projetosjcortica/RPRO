import { BaseService } from '../core/baseService';

export class UnidadesService extends BaseService {
  constructor() {
    super('UnidadesService');
  }

  /**
   * Converte valores entre unidades de massa
   * @param valor Valor a ser convertido
   * @param de Unidade de origem (0 = g, 1 = kg)
   * @param para Unidade de destino (0 = g, 1 = kg)
   * @returns Valor convertido
   */
  converterUnidades(valor: number, de: number, para: number): number {
    // Se as unidades forem iguais, não precisa converter
    if (de === para) return valor;
    
    // Converter de g para kg (divide por 1000)
    if (de === 0 && para === 1) {
      return valor / 1000;
    }

    // Converter de kg para g (multiplica por 1000)
    if (de === 1 && para === 0) {
      return valor * 1000;
    }
    
    // Se chegou aqui, algo está errado
    throw new Error(`Conversão inválida: de ${de} para ${para}`);
  }
  
  /**
   * Normaliza todos os valores para kg (unidade padrão do sistema)
   * os valores vem em Kg, apenas converter para g se necessário
   * @param valores Objeto com valores por coluna
   * @param unidades Objeto com unidades por coluna (0 = g, 1 = kg)
   * @returns Objeto com valores normalizados em kg
   * @example valores = { col6: 500, col7: 2 }, 
   * unidades = { col6: 0, col7: 1 } 
   * => { col6: 500000, col7: 2 }
   */
  normalizarParaKg(valores: Record<string, number>, unidades: Record<string, number>): Record<string, number> {
    const resultado: Record<string, number> = {};

    for (const coluna in valores) {
      if (valores.hasOwnProperty(coluna) && unidades.hasOwnProperty(coluna)) {
        const valor = valores[coluna];
        const unidade = unidades[coluna];
        
        if (unidade === 0) {
          // unidade 0 = grams, normalize to kg by dividing
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
  }
}

export const unidadesService = new UnidadesService();