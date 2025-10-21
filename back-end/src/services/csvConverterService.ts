import fs from 'fs';
import path from 'path';
import { BaseService } from '../core/baseService';

/**
 * Serviço para converter CSVs legados para o novo formato
 * 
 * Formato Legado:
 * - Datas: DD/MM/YY ou DD-MM-YY
 * - Separador: pode ser ; ou ,
 * - Encoding: pode ser latin1 ou windows-1252
 * 
 * Novo Formato:
 * - Datas: YYYY-MM-DD
 * - Separador: ,
 * - Encoding: UTF-8
 */
export class CSVConverterService extends BaseService {
  constructor() {
    super('CSVConverterService');
  }

  /**
   * Detecta o delimitador do CSV
   */
  private detectDelimiter(sample: string): string {
    const candidates = [',', ';', '\t'];
    let best = ',';
    let bestScore = -1;
    
    for (const c of candidates) {
      const counts = sample.split('\n').slice(0, 5).map((l: string) => 
        (l.match(new RegExp(`\\${c}`, 'g')) || []).length
      );
      const score = counts.reduce((a, b) => a + b, 0);
      if (score > bestScore) { 
        bestScore = score; 
        best = c; 
      }
    }
    
    return best;
  }

  /**
   * Normaliza uma data de formato legado para YYYY-MM-DD
   */
  private normalizeDate(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    
    const s = String(dateStr).trim();
    if (!s) return null;

    // Já está no formato correto
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // DD/MM/YY ou DD-MM-YY ou DD/MM/YYYY ou DD-MM-YYYY
    const ddmmMatch = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
    if (ddmmMatch) {
      let [_, dd, mm, yy] = ddmmMatch;
      dd = dd.padStart(2, '0');
      mm = mm.padStart(2, '0');
      
      // Converter ano de 2 dígitos para 4
      if (yy.length === 2) {
        const yearNum = parseInt(yy, 10);
        // Se ano < 50, assume 20xx, senão 19xx
        yy = yearNum < 50 ? `20${yy}` : `19${yy}`;
      }
      
      return `${yy}-${mm}-${dd}`;
    }

    // YYYY/MM/DD ou YYYY-MM-DD
    const yyyymmMatch = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if (yyyymmMatch) {
      const [_, yyyy, mm, dd] = yyyymmMatch;
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }

    console.warn(`[CSVConverter] Formato de data não reconhecido: ${s}`);
    return null;
  }

  /**
   * Normaliza horário (HH:MM:SS ou HH:MM)
   */
  private normalizeTime(timeStr: string | null | undefined): string | null {
    if (!timeStr) return null;
    
    const s = String(timeStr).trim();
    if (!s) return null;

    // HH:MM:SS
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) {
      const parts = s.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1]}:${parts[2]}`;
    }

    // HH:MM
    if (/^\d{1,2}:\d{2}$/.test(s)) {
      const parts = s.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1]}:00`;
    }

    return s;
  }

  /**
   * Converte um arquivo CSV legado para o novo formato
   */
  async convertLegacyCSV(inputPath: string, outputPath?: string): Promise<{
    success: boolean;
    outputPath: string;
    rowsProcessed: number;
    rowsConverted: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let rowsProcessed = 0;
    let rowsConverted = 0;

    try {
      // Ler arquivo com diferentes encodings
      let raw: string;
      const buffer = fs.readFileSync(inputPath);
      
      // Tentar UTF-8 primeiro
      raw = buffer.toString('utf8');
      
      // Se contiver caracteres de substituição, tentar latin1
      if (raw.includes('\uFFFD')) {
        console.log('[CSVConverter] UTF-8 falhou, tentando latin1...');
        raw = buffer.toString('latin1');
      }

      // Remover BOM se existir
      if (raw.charCodeAt(0) === 0xfeff) {
        raw = raw.slice(1);
      }

      // Normalizar
      try { 
        raw = raw.normalize('NFC'); 
      } catch (e) { 
        // Ignore se não suportado
      }

      // Remover caracteres de controle exceto tab, LF, CR
      raw = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

      // Detectar delimitador
      const delimiter = this.detectDelimiter(raw);
      console.log(`[CSVConverter] Delimitador detectado: "${delimiter}"`);

      // Separar linhas
      const lines = raw.split(/\r?\n/).filter(Boolean);
      console.log(`[CSVConverter] Total de linhas: ${lines.length}`);

      // Processar cada linha
      const convertedRows: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        rowsProcessed++;
        
        try {
          const parts = lines[i].split(delimiter).map(s => s.trim());
          
          // Espera-se: data, hora, nome, form1, form2, prod_1...prod_40
          if (parts.length < 5) {
            errors.push(`Linha ${i + 1}: Campos insuficientes (${parts.length})`);
            continue;
          }

          // Normalizar data
          const normalizedDate = this.normalizeDate(parts[0]);
          if (!normalizedDate) {
            errors.push(`Linha ${i + 1}: Data inválida: ${parts[0]}`);
            continue;
          }

          // Normalizar hora
          const normalizedTime = this.normalizeTime(parts[1]) || parts[1];

          // Nome/Label
          const name = parts[2] || '';

          // Form1 e Form2
          const form1 = parts[3] || '0';
          const form2 = parts[4] || '0';

          // Produtos (Prod_1 a Prod_40)
          const products: string[] = [];
          for (let j = 5; j < 45; j++) {
            const value = parts[j] || '0';
            // Garantir que é um número válido
            const numValue = parseFloat(value.replace(',', '.'));
            products.push(isNaN(numValue) ? '0' : String(numValue));
          }

          // Montar linha convertida (sempre com vírgula como delimitador)
          const convertedLine = [
            normalizedDate,
            normalizedTime,
            name,
            form1,
            form2,
            ...products
          ].join(',');

          convertedRows.push(convertedLine);
          rowsConverted++;

        } catch (err: any) {
          errors.push(`Linha ${i + 1}: Erro ao processar - ${err.message}`);
        }
      }

      // Determinar caminho de saída
      const finalOutputPath = outputPath || inputPath.replace(/\.csv$/i, '_converted.csv');

      // Escrever arquivo convertido
      const outputContent = convertedRows.join('\n');
      fs.writeFileSync(finalOutputPath, outputContent, 'utf8');

      console.log(`[CSVConverter] Conversão concluída: ${rowsConverted}/${rowsProcessed} linhas`);
      console.log(`[CSVConverter] Arquivo salvo em: ${finalOutputPath}`);

      return {
        success: true,
        outputPath: finalOutputPath,
        rowsProcessed,
        rowsConverted,
        errors
      };

    } catch (err: any) {
      console.error('[CSVConverter] Erro fatal na conversão:', err);
      return {
        success: false,
        outputPath: outputPath || '',
        rowsProcessed,
        rowsConverted,
        errors: [...errors, `Erro fatal: ${err.message}`]
      };
    }
  }

  /**
   * Converte múltiplos arquivos CSV de um diretório
   */
  async convertDirectory(dirPath: string, outputDir?: string): Promise<{
    success: boolean;
    filesProcessed: number;
    filesConverted: number;
    results: Array<{
      file: string;
      success: boolean;
      rowsConverted: number;
      errors: string[];
    }>;
  }> {
    const results: Array<{
      file: string;
      success: boolean;
      rowsConverted: number;
      errors: string[];
    }> = [];

    try {
      const files = fs.readdirSync(dirPath);
      const csvFiles = files.filter(f => f.toLowerCase().endsWith('.csv'));

      console.log(`[CSVConverter] Encontrados ${csvFiles.length} arquivos CSV em ${dirPath}`);

      for (const file of csvFiles) {
        const inputPath = path.join(dirPath, file);
        const outputPath = outputDir 
          ? path.join(outputDir, file.replace(/\.csv$/i, '_converted.csv'))
          : path.join(dirPath, file.replace(/\.csv$/i, '_converted.csv'));

        const result = await this.convertLegacyCSV(inputPath, outputPath);

        results.push({
          file,
          success: result.success,
          rowsConverted: result.rowsConverted,
          errors: result.errors
        });
      }

      const filesConverted = results.filter(r => r.success).length;

      return {
        success: true,
        filesProcessed: csvFiles.length,
        filesConverted,
        results
      };

    } catch (err: any) {
      console.error('[CSVConverter] Erro ao processar diretório:', err);
      return {
        success: false,
        filesProcessed: 0,
        filesConverted: 0,
        results: []
      };
    }
  }
}

export const csvConverterService = new CSVConverterService();
