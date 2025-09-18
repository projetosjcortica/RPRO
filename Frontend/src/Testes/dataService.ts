import { api } from "./api";
import { mockRows } from "./mockData";
import { Filtros, ReportRow } from "../components/types";

const USE_MOCK = true; // 👈 em casa = true | no escritório = false

export async function getData(filtros: Filtros): Promise<ReportRow[]> {
  if (USE_MOCK) {
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