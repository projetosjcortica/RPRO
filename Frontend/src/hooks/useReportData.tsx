import { useCallback, useEffect, useState } from "react";
import { FilterOptions, ReportRow } from "../components/types";

// Cache para armazenar resultados recentes de consultas
const reportDataCache: Record<string, { data: ReportRow[], total: number, timestamp: number }> = {};

export function useReportData(filtros: FilterOptions, page: number, pageSize: number) {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const refetch = useCallback(() => {
    setReloadFlag((flag) => flag + 1);
  }, []);

  // Prefetch function - carrega dados em segundo plano sem afetar o estado
  const prefetchData = useCallback(async (prefetchPage: number) => {
    try {
      const params = new URLSearchParams();
      params.set("page", String(prefetchPage || 1));
      params.set("pageSize", String(pageSize || 100));

      // Map frontend filtros to backend query params
      if ((filtros as any).nomeFormula) params.set("formula", String((filtros as any).nomeFormula));
      if ((filtros as any).dataInicio) params.set("dataInicio", String((filtros as any).dataInicio));
      if ((filtros as any).dataFim) params.set("dataFim", String((filtros as any).dataFim));
      if ((filtros as any).codigo) params.set("codigo", String((filtros as any).codigo));
      if ((filtros as any).numero) params.set("numero", String((filtros as any).numero));

      const cacheKey = `${params.toString()}-${prefetchPage}-${pageSize}`;
      
      // Se já estiver em cache, não precisa buscar novamente
      if (reportDataCache[cacheKey]) return;
      
      console.log(`[useReportData] Prefetching página ${prefetchPage}`);
      const url = `http://localhost:3000/api/relatorio/paginate?${params.toString()}`;
      
      const res = await fetch(url, { 
        method: "GET", 
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      if (!res.ok) return;
      
      const body = await res.json();
      const newRows = Array.isArray(body.rows) ? body.rows as any[] : [];
      const newTotal = Number(body.total) || 0;
      
      // Atualizar cache
      reportDataCache[cacheKey] = {
        data: newRows,
        total: newTotal,
        timestamp: Date.now()
      };
    } catch (err) {
      // Ignora erros no prefetch
      console.log(`[useReportData] Prefetch falhou para página ${prefetchPage}`);
    }
  }, [filtros, pageSize]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const fetchData = async () => {
      if (!isMounted) return;
      
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

        // Criar chave de cache
        const cacheKey = `${params.toString()}-${page}-${pageSize}`;
        
        // Verificar cache (válido por 2 minutos)
        const now = Date.now();
        const cachedItem = reportDataCache[cacheKey];
        if (cachedItem && (now - cachedItem.timestamp < 120000)) {
          console.log(`[useReportData] Usando cache para página ${page}`);
          setDados(cachedItem.data);
          setTotal(cachedItem.total);
          setLoading(false);
          return;
        }

        const url = `http://localhost:3000/api/relatorio/paginate?${params.toString()}`;
        console.log(`[useReportData] Fetching page ${page} with filters:`, filtros);
        
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos timeout
        
        const res = await fetch(url, { 
          method: "GET", 
          signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status} ${res.statusText}`);
        
        const body = await res.json();
        if (!isMounted) return;
        
        const newRows = Array.isArray(body.rows) ? body.rows as any[] : [];
        const newTotal = Number(body.total) || 0;

        // Função auxiliar para obter o timestamp do último registro
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

        // Verificar se os dados são diferentes dos já existentes
        const lastNew = getLastTimestamp(newRows);
        const lastCurrent = getLastTimestamp(dados as any[]);
        const dataChanged = newRows.length !== dados.length || lastNew !== lastCurrent;

        if (dataChanged) {
          setDados(newRows);
          setTotal(newTotal);
          
          // Atualizar cache
          reportDataCache[cacheKey] = {
            data: newRows,
            total: newTotal,
            timestamp: now
          };
        }
        
        setRetryCount(0);
      
      // Prefetch próximas páginas em segundo plano
      if (page > 1) {
        setTimeout(() => prefetchData(page - 1), 300);
      }
      setTimeout(() => prefetchData(page + 1), 100);
      setTimeout(() => prefetchData(page + 2), 500);
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
          }, 2000); // espera 2 segundos antes de tentar novamente
          return;
        }
        
        setError(err.message || "Erro ao buscar dados");
        
        // Verificar se há dados em cache para esta página
        const paramsForCache = new URLSearchParams();
        if ((filtros as any).nomeFormula) paramsForCache.set("formula", String((filtros as any).nomeFormula));
        if ((filtros as any).dataInicio) paramsForCache.set("dataInicio", String((filtros as any).dataInicio));
        if ((filtros as any).dataFim) paramsForCache.set("dataFim", String((filtros as any).dataFim));
        if ((filtros as any).codigo) paramsForCache.set("codigo", String((filtros as any).codigo));
        if ((filtros as any).numero) paramsForCache.set("numero", String((filtros as any).numero));
        const cacheKey = `${paramsForCache.toString()}-${page}-${pageSize}`;
        const cachedItem = reportDataCache[cacheKey];
        if (cachedItem) {
          console.log('[useReportData] Usando cache vencido devido a erro');
          setDados(cachedItem.data);
          setTotal(cachedItem.total);
        } else {
          setDados([]);
          setTotal(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  // Use serialized filtros to avoid needless re-runs when object identity changes
  }, [JSON.stringify(filtros), page, pageSize, reloadFlag, retryCount, prefetchData]);

  return { dados, loading, error, total, refetch };
}