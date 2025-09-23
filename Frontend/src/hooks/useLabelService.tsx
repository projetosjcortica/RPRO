// hooks/useLabelService.ts - ATUALIZADO
// import { getHttpApi } from "../services/httpApi";
import { ApiResponse } from "../components/types";
import { getProcessador } from "../Processador";

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
  // Try backend first
  try {
    const p = getProcessador();  
    const response = await p.getMateriaPrimaLabels();
    if (response && typeof response === 'object') {
      // Convert backend format to ColLabel format
      const labels: ColLabel[] = [];
      Object.entries(response).forEach(([col_key, info]: [string, any]) => {
        if (info && info.produto) {
          labels.push({
            col_key,
            col_name: info.produto,
            unidade: info.medida === 0 ? 'g' : 'kg'
          });
        }
      });
      return labels;
    }
  } catch (err) {
    // fallback to localStorage productLabels
    const saved = localStorage.getItem("productLabels") || localStorage.getItem("colLabels");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed as ColLabel[];
        if (parsed && typeof parsed === 'object') return Object.entries(parsed).map(([col_key, col_name]: any) => ({ col_key, col_name }));
      } catch (e) {
        console.warn("Erro ao parsear localStorage de labels:", e);
      }
    }
    return [];
  }
  
  return [];
}