// src/hooks/useReportData.tsx
import { useState, useEffect, useCallback } from "react";
import { Filtros, ReportRow } from "../components/types";
import { getProcessador, FilterOptions } from "../Processador";

// Função auxiliar para mapear uma linha bruta para ReportRow
const mapRawRowToReportRow = (rawRow: any): ReportRow => {
  const values: number[] = [];
  // Assumindo que os produtos vão de Prod_1 até Prod_40 conforme backend.md
  for (let i = 1; i <= 40; i++) {
    const v = rawRow[`Prod_${i}`];
    values.push(typeof v === "number" ? v : (v != null ? Number(v) : 0));
  }

  return {
    Dia: rawRow.Dia || "",
    Hora: rawRow.Hora || "",
    Nome: rawRow.Nome || "",
    Codigo: rawRow.Codigo ?? 0,
    Numero: rawRow.Numero ?? 0, 
    values: rawRow.values ?? values,
  };
};

export const useReportData = (
  filtros: Filtros,
  page: number = 1,
  pageSize: number = 100
) => {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
    (async () => {

    try {
      const processador = getProcessador(); // Usa a instância padrão

      // Chama o endpoint correto via sendWithConnectionCheck
      const result = await processador.relatorioPaginate(page, pageSize, filtros as FilterOptions);

      if (result && Array.isArray(result.rows)) {
        const mappedRows: ReportRow[] = result.rows.map(mapRawRowToReportRow);
        setDados(mappedRows);
        setTotal(result.total);
      } else {
        throw new Error("Formato de resposta inesperado do backend. Resposta: " + JSON.stringify(result));
      }
    } catch (err: any) {
      console.error("[useReportData] Erro ao carregar dados:", err);
      setError(err.message || "Falha ao conectar com o servidor ou erro ao carregar dados.");
      setDados([]); // Limpa dados antigos em caso de erro
      setTotal(0);
    }
    })()


  // Retorna um objeto com os dados, estado e uma função para rebuscar
  return { dados, loading, error, total };
};