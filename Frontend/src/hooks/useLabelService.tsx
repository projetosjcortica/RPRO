// hooks/useLabelService.ts - ATUALIZADO
import { api } from "../Testes/api";
import { mockLabels } from "../Testes/mockLabel";
import { IS_LOCAL } from "../CFG";
import { ApiResponse } from "../components/types";

export interface ColLabel {
  col_key: string;
  col_name: string;
  unidade?: string;
}

// Interface para resposta de labels
export interface LabelsResponse extends ApiResponse<ColLabel[]> {
  data?: ColLabel[];
  rows?: ColLabel[];
}

// Busca os labels - COM TIPAGEM CORRETA
export async function fetchLabels(): Promise<ColLabel[]> {
  if (IS_LOCAL) {
    const saved = localStorage.getItem("colLabels");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Erro ao parsear localStorage, usando mock", e);
      }
    }
    return mockLabels;
  }
  
  try {
    const response = await api.get<LabelsResponse>("/col_labels");
    
    // Extrai dados com tipagem segura
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data.rows)) {
        return response.data.rows;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    return [];
  } catch (error) {
    console.error("Erro ao buscar labels da API:", error);
    throw new Error("Falha ao carregar labels");
  }
}