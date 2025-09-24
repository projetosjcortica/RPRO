import { useEffect, useState } from "react";
import { FilterOptions, ReportRow } from "../components/types";

export function useReportData(filtros: FilterOptions, page: number, pageSize: number) {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(page || 1));
        params.set("pageSize", String(pageSize || 100));

        // Map frontend filtros to backend query params
        if ((filtros as any).nomeFormula) params.set("formula", String((filtros as any).nomeFormula));
        if ((filtros as any).dataInicio) params.set("dataInicio", String((filtros as any).dataInicio));
        if ((filtros as any).dataFim) params.set("dataFim", String((filtros as any).dataFim));
        if ((filtros as any).codigo) params.set("codigo", String((filtros as any).codigo));
        if ((filtros as any).numero) params.set("numero", String((filtros as any).numero));

        const url = `/api/relatorio/paginate?${params.toString()}`;
        const res = await fetch(url, { method: "GET", signal });
        if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status} ${res.statusText}`);
        const body = await res.json();

        setDados(Array.isArray(body.rows) ? body.rows : []);
        setTotal(Number(body.total) || 0);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error("Erro ao buscar dados:", err);
        setError(err.message || "Erro ao buscar dados");
        setDados([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  // Use serialized filtros to avoid needless re-runs when object identity changes
  }, [JSON.stringify(filtros), page, pageSize]);

  return { dados, loading, error, total };
}