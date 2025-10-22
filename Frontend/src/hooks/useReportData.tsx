import { useCallback, useEffect, useState, useRef } from "react";
import { FilterOptions, ReportRow } from "../components/types";

export function useReportData(filtros: FilterOptions, page: number, pageSize: number) {
  // Accept optional sorting via filtros.sortBy and filtros.sortDir
  const sortBy = (filtros as any)?.sortBy || 'Dia';
  const sortDir = (filtros as any)?.sortDir || 'DESC';
  
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => {
    // Always fetch fresh data - no cache
    setReloadFlag((flag) => flag + 1);
  }, []);

  useEffect(() => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;
    let isMounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const fetchData = async () => {
      if (!isMounted) return;
      
      const params = new URLSearchParams();
      params.set("page", String(page || 1));
      params.set("pageSize", String(pageSize || 100));

      // Include sort params so backend returns ordered data
      if (sortBy) params.set('sortBy', String(sortBy));
      if (sortDir) params.set('sortDir', String(sortDir));

      // Map frontend filtros to backend query params
      if ((filtros as any).nomeFormula) params.set("formula", String((filtros as any).nomeFormula));
      if ((filtros as any).dataInicio) params.set("dataInicio", String((filtros as any).dataInicio));
      if ((filtros as any).dataFim) params.set("dataFim", String((filtros as any).dataFim));
      if ((filtros as any).codigo) params.set("codigo", String((filtros as any).codigo));
      if ((filtros as any).numero) params.set("numero", String((filtros as any).numero));

      // Validação básica de filtros: dataInicio <= dataFim
      try {
        const di = (filtros as any).dataInicio;
        const df = (filtros as any).dataFim;
        if (di && df) {
          const d1 = new Date(String(di));
          const d2 = new Date(String(df));
          if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d1 > d2) {
            setLoading(false);
            setDados([]);
            setTotal(0);
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      setLoading(true);
      setError(null);

      try {
        const url = `http://localhost:3000/api/relatorio/paginate?${params.toString()}`;
        
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const res = await fetch(url, { 
          method: "GET", 
          signal,
          headers: { 
            'Cache-Control': 'no-cache',
            'Priority': 'high'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status} ${res.statusText}`);
        
        const body = await res.json();
        if (!isMounted) return;
        
        const newRows = Array.isArray(body.rows) ? body.rows as any[] : [];
        const newTotal = Number(body.total) || 0;

        setDados(newRows);
        setTotal(newTotal);
        setRetryCount(0);
        
      } catch (err: any) {
        if (!isMounted) return;
        if (err.name === 'AbortError') return;
        
        console.error("[useReportData] Erro ao buscar dados:", err);
        
        // Tentar novamente até 3 vezes em caso de erro de rede
        if (retryCount < 3 && (err.name === 'AbortError' || err.message.includes('network') || err.message.includes('failed'))) {
          setRetryCount(prev => prev + 1);
          console.log(`[useReportData] Tentando novamente (${retryCount + 1}/3)...`);
          retryTimeout = setTimeout(() => {
            if (isMounted) fetchData();
          }, 2000);
          return;
        }
        
        setError(err.message || "Erro ao buscar dados");
        setDados([]);
        setTotal(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filtros, page, pageSize, sortBy, sortDir, reloadFlag, retryCount]);

  return { dados, loading, error, total, refetch };
}