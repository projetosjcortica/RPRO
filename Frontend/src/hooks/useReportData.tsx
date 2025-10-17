import { useCallback, useEffect, useState, useRef } from "react";
import { FilterOptions, ReportRow } from "../components/types";

// Cache para armazenar resultados recentes de consultas
const reportDataCache: Record<string, { data: ReportRow[], total: number, timestamp: number }> = {};
const CACHE_DURATION = 600000; // 10 minutos (aumentado)
const MAX_CACHE_SIZE = 50; // Aumentado para manter mais páginas em cache
const prefetchQueue = new Set<string>(); // Fila de prefetch para evitar duplicatas

export function useReportData(filtros: FilterOptions, page: number, pageSize: number) {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => {
    setReloadFlag((flag) => flag + 1);
  }, []);

  // Limpar cache antigo
  const cleanOldCache = useCallback(() => {
    const now = Date.now();
    const keys = Object.keys(reportDataCache);
    
    // Remover entradas expiradas
    keys.forEach(key => {
      if (now - reportDataCache[key].timestamp > CACHE_DURATION) {
        delete reportDataCache[key];
      }
    });
    
    // Se ainda estiver muito grande, remover as mais antigas
    const remainingKeys = Object.keys(reportDataCache);
    if (remainingKeys.length > MAX_CACHE_SIZE) {
      remainingKeys
        .sort((a, b) => reportDataCache[a].timestamp - reportDataCache[b].timestamp)
        .slice(0, remainingKeys.length - MAX_CACHE_SIZE)
        .forEach(key => delete reportDataCache[key]);
    }
  }, []);

  // Prefetch function - carrega dados em segundo plano sem afetar o estado
  const prefetchData = useCallback(async (prefetchPage: number, priority: 'high' | 'low' = 'low') => {
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
      
      // Evitar prefetch duplicado
      if (prefetchQueue.has(cacheKey)) return;
      
      // Se já estiver em cache e for recente, não precisa buscar novamente
      const now = Date.now();
      if (reportDataCache[cacheKey] && (now - reportDataCache[cacheKey].timestamp < CACHE_DURATION)) {
        return;
      }
      
      prefetchQueue.add(cacheKey);
      
      const url = `http://localhost:3000/api/relatorio/paginate?${params.toString()}`;
      
      const res = await fetch(url, { 
        method: "GET",
        priority: priority === 'high' ? 'high' : 'low', // Priorizar requisições importantes
        headers: { 'Cache-Control': 'no-cache' }
      } as any);
      
      prefetchQueue.delete(cacheKey);
      
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
      
      cleanOldCache();
    } catch (err) {
      const cacheKey = `${new URLSearchParams().toString()}-${prefetchPage}-${pageSize}`;
      prefetchQueue.delete(cacheKey);
      // Ignora erros no prefetch
    }
  }, [filtros, pageSize, cleanOldCache]);

  useEffect(() => {
    // Cancelar requisição anterior se existir
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

      // Map frontend filtros to backend query params
      if ((filtros as any).nomeFormula) params.set("formula", String((filtros as any).nomeFormula));
      if ((filtros as any).dataInicio) params.set("dataInicio", String((filtros as any).dataInicio));
      if ((filtros as any).dataFim) params.set("dataFim", String((filtros as any).dataFim));
      if ((filtros as any).codigo) params.set("codigo", String((filtros as any).codigo));
      if ((filtros as any).numero) params.set("numero", String((filtros as any).numero));

      // Criar chave de cache
      const cacheKey = `${params.toString()}-${page}-${pageSize}`;
      
      // Verificar cache - INSTANTÂNEO sem loading
      const now = Date.now();
      const cachedItem = reportDataCache[cacheKey];
      if (cachedItem && (now - cachedItem.timestamp < CACHE_DURATION)) {
        // Atualização INSTANTÂNEA - sem loading
        setDados(cachedItem.data);
        setTotal(cachedItem.total);
        setError(null);
        
        // Prefetch agressivo em background - páginas próximas imediatamente
        queueMicrotask(() => {
          if (page > 1) prefetchData(page - 1, 'high');
          prefetchData(page + 1, 'high');
          // Páginas mais distantes com prioridade baixa
          if (page > 2) prefetchData(page - 2, 'low');
          prefetchData(page + 2, 'low');
          if (page > 3) prefetchData(page - 3, 'low');
          prefetchData(page + 3, 'low');
        });
        
        return;
      }

      // Só mostra loading se não tiver cache
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
      
        // Prefetch agressivo de páginas próximas
        queueMicrotask(() => {
          if (page > 1) prefetchData(page - 1, 'high');
          prefetchData(page + 1, 'high');
          if (page > 2) prefetchData(page - 2, 'low');
          prefetchData(page + 2, 'low');
          if (page > 3) prefetchData(page - 3, 'low');
          prefetchData(page + 3, 'low');
        });
        
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