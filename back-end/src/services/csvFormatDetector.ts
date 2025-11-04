import { parse } from 'csv-parse/sync';

export type CSVFormat = 'racao' | 'amendoim' | 'unknown';

/**
 * Detecta o formato de um CSV analisando sua estrutura e conteúdo
 */
export class CSVFormatDetector {
  /**
   * Detecta se o CSV é de ração ou amendoim baseado no conteúdo
   * 
   * Formato Ração:
   * - Primeira coluna: Data (YYYY-MM-DD ou DD/MM/YY)
   * - Segunda coluna: Hora (HH:MM:SS)
   * - Terceira coluna: Nome da fórmula (string)
   * - Colunas subsequentes: Form1, Form2, Prod_1..Prod_40 (números)
   * 
   * Formato Amendoim:
   * - Primeira coluna: Data e Hora juntas (DD-MM-YY HH:MM:SS)
   * - Segunda coluna: Irrelevante
   * - Terceira coluna: Código Produto
   * - Quarta coluna: Código Caixa
   * - Quinta coluna: Nome Produto (string com espaços)
   * - Colunas 6-8: Irrelevantes
   * - Nona coluna: Peso (decimal com 3 casas)
   * - Décima coluna: Irrelevante
   * - Décima primeira coluna: Número Balança
   */
  static detect(csvContent: string): CSVFormat {
    try {
      // Parse apenas as primeiras 5 linhas para análise
      const lines = csvContent.split('\n').slice(0, 5).filter(l => l.trim());
      
      if (lines.length === 0) {
        return 'unknown';
      }

      // Tentar parse como CSV
      const records = parse(csvContent, {
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true,
        to: 5, // Apenas primeiras 5 linhas
      });

      if (records.length === 0) {
        return 'unknown';
      }

      const firstRow = records[0];
      
      // Verificar formato de amendoim
      if (this.isAmendoimFormat(firstRow, records)) {
        console.log('[CSVFormatDetector] 🥜 Formato AMENDOIM detectado');
        return 'amendoim';
      }

      // Verificar formato de ração
      if (this.isRacaoFormat(firstRow, records)) {
        console.log('[CSVFormatDetector] 🌾 Formato RAÇÃO detectado');
        return 'racao';
      }

      console.log('[CSVFormatDetector] ❓ Formato DESCONHECIDO');
      return 'unknown';
    } catch (error) {
      console.error('[CSVFormatDetector] Erro ao detectar formato:', error);
      return 'unknown';
    }
  }

  /**
   * Verifica se é formato de amendoim
   * Características:
   * - Primeira coluna tem data e hora juntas (DD-MM-YY HH:MM:SS)
   * - Mínimo de 10 colunas
   * - Nona coluna é um número decimal (peso)
   */
  private static isAmendoimFormat(firstRow: any[], allRows: any[][]): boolean {
    if (!firstRow || firstRow.length < 10) {
      return false;
    }

    const firstCol = String(firstRow[0] || '').trim();
    
    // Verificar se primeira coluna tem data e hora juntas
    // Formato: DD-MM-YY HH:MM:SS ou variações
    const dateTimePattern = /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\s+\d{1,2}:\d{2}(:\d{2})?$/;
    
    if (!dateTimePattern.test(firstCol)) {
      return false;
    }

    // Verificar se nona coluna (índice 8) é um número decimal em múltiplas linhas
    let numericWeightCount = 0;
    for (const row of allRows.slice(0, 3)) {
      if (row.length >= 9) {
        const weightCol = String(row[8] || '').trim().replace(',', '.');
        if (/^\d+\.?\d*$/.test(weightCol)) {
          numericWeightCount++;
        }
      }
    }

    // Se pelo menos 2 das 3 primeiras linhas tem peso numérico, é amendoim
    return numericWeightCount >= 2;
  }

  /**
   * Verifica se é formato de ração
   * Características:
   * - Primeira coluna: data isolada (YYYY-MM-DD ou DD/MM/YY)
   * - Segunda coluna: hora isolada (HH:MM:SS)
   * - Terceira coluna: nome da fórmula (texto)
   * - Muitas colunas numéricas subsequentes (Prod_1..Prod_40)
   */
  private static isRacaoFormat(firstRow: any[], allRows: any[][]): boolean {
    if (!firstRow || firstRow.length < 5) {
      return false;
    }

    const col1 = String(firstRow[0] || '').trim();
    const col2 = String(firstRow[1] || '').trim();
    const col3 = String(firstRow[2] || '').trim();

    // Primeira coluna deve ser data isolada
    const datePattern = /^\d{4}-\d{2}-\d{2}$|^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/;
    if (!datePattern.test(col1)) {
      return false;
    }

    // Segunda coluna deve ser hora isolada
    const timePattern = /^\d{1,2}:\d{2}(:\d{2})?$/;
    if (!timePattern.test(col2)) {
      return false;
    }

    // Terceira coluna deve ser texto (nome da fórmula)
    // Não deve ser apenas números
    if (/^\d+$/.test(col3)) {
      return false;
    }

    // Verificar se tem muitas colunas (ração tem ~43 colunas: Dia, Hora, Nome, Form1, Form2, Prod_1..Prod_40)
    if (firstRow.length < 15) {
      return false;
    }

    // Verificar se colunas após a terceira são predominantemente numéricas
    let numericCount = 0;
    let totalChecked = 0;
    
    for (let i = 3; i < Math.min(firstRow.length, 10); i++) {
      const val = String(firstRow[i] || '').trim();
      if (val !== '') {
        totalChecked++;
        if (/^\d+$/.test(val)) {
          numericCount++;
        }
      }
    }

    // Se mais de 70% das colunas verificadas são numéricas, é ração
    return totalChecked > 0 && (numericCount / totalChecked) >= 0.7;
  }
}
