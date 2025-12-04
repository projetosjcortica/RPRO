// components/types.ts - CORREÇÃO COMPLETA
export interface ReportRow {
  id?: string;
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

export type FilterOptions = {
  dataInicio?: string;
  dataFim?: string;
  nomeFormula?: string;
  codigo?: string;
  numero?: string;
};

export type Filtros = FilterOptions;

// Interface genérica para resposta da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: ReportRow[] | T;
  message?: string;
  page?: number;
  pageSize?: number;
  total?: number;
}

// Interfaces específicas para cada endpoint
export interface ReportApiResponse extends ApiResponse<ReportRow[]> {
  rows?: ReportRow[]; // Para compatibilidade
}

// Interface para ColLabel
export interface ColLabel {
  col_key: string;
  col_name: string;
  unidade?: string;
}

// Interface para Matéria-Prima
export interface MateriaPrima {
  id: string;
  num: number;
  produto: string;
  medida: number; // 0 = gramas, 1 = kg
  categoria?: string;
}

// Interface para informações de produto no localStorage
export interface ProdutoInfo {
  nome: string;
  unidade: string;
  categoria?: string;
}

// Interface para o mapa de informações de produtos
export interface ProdutosInfoMap {
  [colKey: string]: ProdutoInfo;
}
