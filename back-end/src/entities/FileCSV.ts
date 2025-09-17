import * as fs from 'fs';
import parserService from '../services/parserService';

/**
 * Classe auxiliar para representar e consultar um CSV carregado.
 * Fornece métodos úteis para acessar linhas por rótulo e iterar sobre linhas.
 */
export default class FileCSV {
  /** Caminho do arquivo CSV (se definido) */
  filePath: string | null = null;
  /** Linhas normalizadas carregadas do CSV */
  rows: any[] = [];
  /** Cabeçalhos detectados (se houver) */
  headers: string[] | null = null;
  // index by label for O(1) lookups
  private indexByLabel: Map<string, any[]> = new Map();

  constructor(filePath?: string) {
    if (filePath) this.filePath = filePath;
  }

  /**
   * Carrega e normaliza o CSV usando `parserService`.
   * Retorna um objeto com o número de linhas lidas.
   */
  async load() {
    if (!this.filePath) throw new Error('filePath not set');
    this.rows = [];
    // delegate to parserService to normalize CSV formats
    const res: any = await parserService.processFile(this.filePath!);
    if (res && Array.isArray(res.rows)) {
      this.rows = res.rows.map((r: any) => ({
        date: r.date || null,
        time: r.time || null,
        label: r.label || r.Nome || null,
        group: r.group || null,
        flag: r.flag || null,
        values: r.values || [],
        datetime: r.datetime || null,
      }));
    }
    this.buildIndex();
    return { rows: this.rows.length };
  }

  /** Serialização para JSON (útil em logs ou respostas) */
  toJSON() {
    return { headers: this.headers, rows: this.rows };
  }

  /** Retorna a linha no índice informado ou null */
  getRow(i: number) {
    return this.rows[i] || null;
  }

  // Rebuild index (useful if rows are mutated externally)
  buildIndex() {
    this.indexByLabel = new Map();
    for (const r of this.rows) {
      if (!r || !r.label) continue;
      const arr = this.indexByLabel.get(r.label) || [];
      arr.push(r);
      this.indexByLabel.set(r.label, arr);
    }
  }

  /** Retorna todas as linhas com o rótulo exato fornecido */
  findByLabel(label: string) {
    return this.indexByLabel.get(label) || [];
  }

  /** Procura a primeira linha cujo rótulo começa com o prefixo informado */
  findFirstLabelLike(prefix: string) {
    for (const [label, arr] of this.indexByLabel.entries()) {
      if (label && label.startsWith(prefix)) return arr[0];
    }
    return null;
  }

  /** Mapeia as linhas usando a função fornecida */
  mapRows(fn: (row: any, idx: number) => any) {
    return this.rows.map(fn);
  }
}
