// components/types.ts - CORREÇÃO COMPLETA
export interface ReportRow {
  Dia: string;
  Hora: string;
  Nome: string;
  Codigo: number;
  Numero: number;
  values: number[];
  
}

export interface ReportData {
  page: number;
  pageSize: number;
  rows: ReportRow[];
}

export interface Filtros {
  dataInicio: string;
  dataFim: string;
  nomeFormula: string;
}

// Interface genérica para resposta da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  page?: number;
  pageSize?: number;
  total?: number;
}

// Interfaces específicas para cada endpoint
export interface ReportApiResponse extends ApiResponse<ReportRow[]> {
  rows?: ReportRow[]; // Para compatibilidade
}
// Interface para ColLabel (mova para cá se não existir)
export interface ColLabel {
  col_key: string;
  col_name: string;
  unidade?: string;
}

