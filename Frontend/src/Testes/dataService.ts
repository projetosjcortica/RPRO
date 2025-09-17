import { api } from "./api";
import { mockRows } from "./mockData";
import { Filtros } from "../components/types";

const USE_MOCK = true; // 👈 em casa = true | no escritório = false

export interface Produto {
  Dia:string;
  Hora:string;
  Nome:string;
  Form1:number;
  Form2:number;
  values:number[];
}

export async function getData(filtros: Filtros): Promise<Produto[]> {
  if (USE_MOCK) {
    // Simula delay
    await new Promise((res) => setTimeout(res, 400));

    let filtered: Produto[] = [...mockRows];

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
    const { data } = await api.get<Produto[]>("/dados", { params: filtros });
    return data;
  }
}