import { useState, useEffect } from "react";
import { Filtros, ReportRow } from "../components/types";
import { getHttpApi } from "../services/httpApi";

export const useReportData = (
  filtros: Filtros,
  page: number = 1,
  pageSize: number = 300
) => {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

        // Comunicação apenas via HTTP API
        try {
          const httpClient = getHttpApi();
          const result = await httpClient.getTableData(page, pageSize, {
            formula: filtros.nomeFormula || undefined,
            dateStart: filtros.dataInicio || undefined,
            dateEnd: filtros.dataFim || undefined,
          });

          const mapped: ReportRow[] = (result.rows || []).map((r: any) => {
            const values: number[] = [];
            for (let i = 1; i <= 40; i++) {
              const v = r[`Prod_${i}`];
              values.push(typeof v === "number" ? v : v != null ? Number(v) : 0);
            }
            return {
              Dia: r.Dia || "",
              Hora: r.Hora || "",
              Nome: r.Nome || "",
              Codigo: r.Form1 ?? 0,
              Numero: r.Form2 ?? 0,
              values,
            };
          });
          setDados(mapped);
          setTotal(result.total ?? mapped.length);
        } catch (err: any) {
          console.error("Erro ao carregar dados:", err);
          setError("Erro ao carregar dados da API");
          setDados([]);
          setTotal(0);
        } finally {
          setLoading(false);
        }
    }, [filtros, page, pageSize]);

    return { dados, loading, error, total };
};
