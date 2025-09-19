import { api, apiWs } from "./api";
import { mockRows } from "./mockData";
import { Filtros, ReportRow } from "../components/types";

// Função auxiliar para verificar o status do mock
async function isMockEnabled(): Promise<boolean> {
  try {
    const response = await apiWs.mockGetStatus();
    return response?.enabled === true;
  } catch (error) {
    console.error("Erro ao verificar status do mock:", error);
    return false;
  }
}

export async function getData(filtros: Filtros): Promise<ReportRow[]> {
  // Verifica se o modo mock está ativado no backend
  const useMock = await isMockEnabled();
  
  if (useMock) {
    // Simula delay
    await new Promise((res) => setTimeout(res, 400));

    let filtered: ReportRow[] = [...mockRows];

    if (filtros.nomeFormula) {
      filtered = filtered.filter((item) =>
        item.Nome.toLowerCase().includes(filtros.nomeFormula.toLowerCase())
      );
    }
    if (filtros.dataInicio) {
      filtered = filtered.filter((item) => item.Dia >= filtros.dataInicio);
    }
    if (filtros.dataFim) {
      filtered = filtered.filter((item) => item.Dia <= filtros.dataFim);
    }

    return filtered;
  } else {
    const { data } = await api.get<ReportRow[]>("/dados", { params: filtros });
    return data;
  }
}