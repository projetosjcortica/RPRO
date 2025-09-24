import { useEffect, useState } from "react";
import { getProcessador } from "../Processador";
import { FilterOptions, ReportRow } from "../components/types";

export function useReportData(filtros: FilterOptions, page: number, pageSize: number) {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("[useReportData] Buscando dados com:", { page, pageSize, filtros });
        
        const processador = getProcessador();
        const response = await processador.relatorioPaginate(page, pageSize, filtros);

        console.log("[useReportData] Resposta recebida:", {
          total: response.total,
          rows: response.rows?.length || 0
        });

        setDados(response.rows || []);
        setTotal(response.total || 0);

      } catch (err: any) {
        console.error("Erro ao buscar dados:", err);
        setError(err.message || "Erro ao buscar dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filtros, page, pageSize]);

  return { dados, loading, error, total };
}