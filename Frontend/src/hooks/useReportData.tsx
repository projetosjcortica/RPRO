import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { FilterOptions, ReportRow } from "../components/types";

export function useReportData(
  filtros: FilterOptions,
  page: number,
  pageSize: number,
  sortBy: string,
  sortDir: 'ASC' | 'DESC',
  allowFetch: boolean = true,
  advancedFilters?: any
) {
  
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [emptyColumns, setEmptyColumns] = useState<any>(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchParamsRef = useRef<string>('');
  const emptyColumnsAbortRef = useRef<AbortController | null>(null);
  
  // OTIMIZAÇÃO: Memoizar parametros para evitar fetches duplicados
  const fetchParams = useMemo(() => ({
    filtros,
    page,
    pageSize,
    sortBy,
    sortDir,
    allowFetch,
    advancedFilters: advancedFilters ? JSON.stringify(advancedFilters) : ''
  }), [filtros, page, pageSize, sortBy, sortDir, allowFetch, advancedFilters ? JSON.stringify(advancedFilters) : '']);

  // Parâmetros para o endpoint de empty-columns (ignorar page/pageSize)
  const emptyColumnsParams = useMemo(() => ({
    filtros,
    advancedFilters: advancedFilters ? JSON.stringify(advancedFilters) : ''
  }), [filtros, advancedFilters ? JSON.stringify(advancedFilters) : '']);

  const refetch = useCallback(() => {
    setReloadFlag((flag) => flag + 1);
  }, []);

  // Silent refetch: fetch data in background without toggling `loading` flag
  const refetchSilent = useCallback(async () => {
    if (!allowFetch) return;

    // Build params similarly to effect
    const params = new URLSearchParams();
    params.set("page", String(page || 1));
    params.set("pageSize", String(pageSize || 100));
    if (sortBy) params.set('sortBy', String(sortBy));
    if (sortDir) params.set('sortDir', String(sortDir));
    if ((filtros as any).nomeFormula) params.set("formula", String((filtros as any).nomeFormula));
    if ((filtros as any).dataInicio) params.set("dataInicio", String((filtros as any).dataInicio));
    if ((filtros as any).dataFim) params.set("dataFim", String((filtros as any).dataFim));
      return;
  }, [allowFetch, page, pageSize, sortBy, sortDir, filtros]);

  useEffect(() => {
    // Criar chave única dos parâmetros atuais
    const currentParams = JSON.stringify(fetchParams);
    
    // Se parâmetros não mudaram, evitar busca apenas quando já temos resultados
    // Caso contrário, permitir re-fetch (ex: primeira montagem com filtros padrão)
    if (currentParams === lastFetchParamsRef.current) {
      // se já temos dados (rows) ou total conhecido, podemos pular a requisição
      // caso contrário (dados vazios), seguir com a busca para aplicar filtros iniciais
      if (Array.isArray(dados) && dados.length > 0) {
        return;
      }
      if (typeof total === 'number' && total > 0) {
        return;
      }
      // else: continue to fetch (we had same params but no data yet)
    }
    
    lastFetchParamsRef.current = currentParams;

    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;
    let isMounted = true;

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
        // Incluir advancedFilters se forem passados (Aplicar agora deve enviar mesmo que não esteja fixado)
        if (advancedFilters) {
          try {
            params.set('advancedFilters', encodeURIComponent(JSON.stringify(advancedFilters)));
          } catch (e) {
            console.warn('Erro ao serializar advancedFilters:', e);
          }
        }

        const url = `http://localhost:3000/api/relatorio/paginate?${params.toString()}`;
        
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const res = await fetch(url, { 
          method: "GET", 
          signal,
          headers: { 
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive', // Reutilizar conexão
            'Accept': 'application/json',
          },
          keepalive: true // Manter conexão ativa
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status} ${res.statusText}`);
        
        const body = await res.json();
        if (!isMounted) return;
        
        const newRows = Array.isArray(body.rows) ? body.rows as any[] : [];
        const newTotal = Number(body.total) || 0;
        const newEmptyColumns = body.emptyColumns || null;

        setDados(newRows);
        setTotal(newTotal);
        setEmptyColumns(newEmptyColumns);
        
      } catch (err: any) {
        if (!isMounted) return;
        if (err.name === 'AbortError') return;
        
        console.error("[useReportData] ❌ Erro:", err.message);
        setError(err.message || "Erro ao buscar dados");
        setDados([]);
        setTotal(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // OTIMIZAÇÃO: Debounce para evitar excesso de requisições durante digitação
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchParams, reloadFlag, allowFetch]);

  // 🔍 Efeito separado: Buscar empty-columns global (baseado em TODOS os dados do período)
  useEffect(() => {
    if (!allowFetch) return;

    if (emptyColumnsAbortRef.current) {
      emptyColumnsAbortRef.current.abort();
    }

    const controller = new AbortController();
    emptyColumnsAbortRef.current = controller;
    const signal = controller.signal;
    let isMounted = true;

    const fetchEmptyColumns = async () => {
      if (!isMounted) return;

      try {
        const params = new URLSearchParams();
        
        // Passar os MESMOS filtros que o paginate
        if ((filtros as any).nomeFormula) params.set("formula", String((filtros as any).nomeFormula));
        if ((filtros as any).dataInicio) params.set("dataInicio", String((filtros as any).dataInicio));
        if ((filtros as any).dataFim) params.set("dataFim", String((filtros as any).dataFim));
        if ((filtros as any).codigo) params.set("codigo", String((filtros as any).codigo));
        if ((filtros as any).numero) params.set("numero", String((filtros as any).numero));

        if (advancedFilters) {
          try {
            params.set('advancedFilters', encodeURIComponent(JSON.stringify(advancedFilters)));
          } catch (e) {
            console.warn('Erro ao serializar advancedFilters para empty-columns:', e);
          }
        }

        const url = `http://localhost:3000/api/relatorio/empty-columns?${params.toString()}`;
        
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const res = await fetch(url, { 
          method: "GET", 
          signal,
          headers: { 
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
          },
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`Erro ao buscar empty-columns: ${res.status}`);
        
        const emptyColsData = await res.json();
        if (!isMounted) return;
        
        setEmptyColumns(emptyColsData);
        
      } catch (err: any) {
        if (!isMounted) return;
        if (err.name === 'AbortError') return;
        
        console.warn("[useReportData] Erro ao buscar empty-columns:", err.message);
        // Não setamos error aqui pois é informação complementar
      }
    };

    // Usar debounce também para este endpoint
    const timeoutId = setTimeout(() => {
      fetchEmptyColumns();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      isMounted = false;
      if (emptyColumnsAbortRef.current) {
        emptyColumnsAbortRef.current.abort();
      }
    };
  }, [emptyColumnsParams, reloadFlag, allowFetch]);

  return { dados, loading, error, total, emptyColumns, refetch, refetchSilent };
}