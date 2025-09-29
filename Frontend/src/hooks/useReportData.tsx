import { useCallback, useEffect, useState } from "react";
import { FilterOptions, ReportRow } from "../components/types";

export function useReportData(filtros: FilterOptions, page: number, pageSize: number) {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [reloadFlag, setReloadFlag] = useState(0);

  const refetch = useCallback(() => {
    setReloadFlag((flag) => flag + 1);
  }, []);

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

        const url = `http://localhost:3000/api/relatorio/paginate?${params.toString()}`;
        const res = await fetch(url, { method: "GET", signal });
        if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status} ${res.statusText}`);
        const body = await res.json();
        const newRows = Array.isArray(body.rows) ? body.rows as any[] : [];

        const getLastTimestamp = (arr: any[]) => {
          if (!Array.isArray(arr) || arr.length === 0) return '';
          for (let i = arr.length - 1; i >= 0; i--) {
            const r = arr[i];
            if (r && (r.Dia || r.Hora)) {
              const d = String(r.Dia || '').trim();
              const h = String(r.Hora || '').trim();
              if (d || h) return `${d}T${h}`;
            }
          }
          return '';
        };

        const lastNew = getLastTimestamp(newRows);
        const lastCurrent = getLastTimestamp(dados as any[]);

        if (newRows.length !== dados.length || lastNew !== lastCurrent) {
          setDados(newRows);
          setTotal(Number(body.total) || 0);
        }
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
  }, [JSON.stringify(filtros), page, pageSize, reloadFlag]);

  return { dados, loading, error, total, refetch };
}