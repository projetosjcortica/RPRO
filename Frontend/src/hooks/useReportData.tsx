// src/hooks/useReportData.tsx
import { useState, useEffect, useCallback } from "react";
import { Filtros, ReportRow } from "../components/types";
import { getProcessador } from "../Processador";

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
    Codigo: rawRow.Form1 ?? 0, // Mapeando Form1 para Codigo
    Numero: rawRow.Form2 ?? 0, // Mapeando Form2 para Numero
    values,
  };
};

export const useReportData = (
  filtros: Filtros,
  page: number = 1,
  pageSize: number = 300
) => {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const processador = getProcessador(); // Usa a instância padrão

      // Chama o endpoint correto via sendWithConnectionCheck
      const result = await processador.sendWithConnectionCheck('relatorio.paginate', {
        page,
        pageSize,
        formula: filtros.nomeFormula || undefined, // Backend espera 'formula'
        dateStart: filtros.dataInicio || undefined,
        dateEnd: filtros.dataFim || undefined,
        // sortBy e sortDir podem ser adicionados conforme necessário
        // sortBy: 'Dia', // Exemplo
        // sortDir: 'DESC', // Exemplo
      });

      if (result && Array.isArray(result.rows)) {
        const mappedRows: ReportRow[] = result.rows.map(mapRawRowToReportRow);
        setDados(mappedRows);
        setTotal(result.total ?? mappedRows.length);
      } else {
        throw new Error("Formato de resposta inesperado do backend. Resposta: " + JSON.stringify(result));
      }
    } catch (err: any) {
      console.error("[useReportData] Erro ao carregar dados:", err);
      setError(err.message || "Falha ao conectar com o servidor ou erro ao carregar dados.");
      setDados([]); // Limpa dados antigos em caso de erro
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filtros, page, pageSize]); // Dependências corretas

  useEffect(() => {
    fetchData();
  }, [fetchData]); // useEffect depende da função memoizada

  // Retorna um objeto com os dados, estado e uma função para rebuscar
  return { dados, loading, error, total, refetch: fetchData };
};