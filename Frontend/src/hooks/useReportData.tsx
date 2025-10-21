import { useCallback, useEffect, useState, useRef } from "react";
import { FilterOptions, ReportRow } from "../components/types";
import { toast } from 'react-toastify';
import toastManager from '../lib/toastManager';

// Cache para armazenar resultados recentes de consultas
const reportDataCache: Record<string, { data: ReportRow[], total: number, timestamp: number, dataChecksum?: string }> = {};
const CACHE_DURATION = 600000; // 10 minutos (aumentado)
const MAX_CACHE_SIZE = 50; // Aumentado para manter mais páginas em cache
const prefetchQueue = new Set<string>(); // Fila de prefetch para evitar duplicatas

export function useReportData(filtros: FilterOptions, page: number, pageSize: number) {
  // Accept optional sorting via filtros.sortBy and filtros.sortDir
  const sortBy = (filtros as any)?.sortBy || 'Dia';
  const sortDir = (filtros as any)?.sortDir || 'DESC';
  
  console.log('[useReportData] sortBy:', sortBy, 'sortDir:', sortDir); // Debug log
  
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [reloadFlag, setReloadFlag] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingToastRef = useRef<any>(null);

  const clearCache = useCallback(() => {
    // Limpar TODO o cache de relatório
    Object.keys(reportDataCache).forEach(key => delete reportDataCache[key]);
    console.log('[useReportData] Cache limpo completamente');
  }, []);

  const refetch = useCallback((forceClearCache = false) => {
    if (forceClearCache) {
      clearCache();
    }
    setReloadFlag((flag) => flag + 1);
  }, [clearCache]);

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

  // Use a simple object to track the last seen reloadFlag across this fetch invocation
  const reloadSeenRef = { value: reloadFlag } as { value: number };
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
            toast.warning('Filtros inválidos: a data de início é posterior à data fim. Ajuste os filtros.');
            setLoading(false);
            setDados([]);
            setTotal(0);
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      // Criar chave de cache
      const cacheKey = `${params.toString()}-${page}-${pageSize}`;
      
      // Verificar cache - INSTANTÂNEO sem loading
      const now = Date.now();
      const cachedItem = reportDataCache[cacheKey];
  const forceNetwork = reloadFlag !== reloadSeenRef.value; // if reloadFlag changed, force network
      if (cachedItem && !forceNetwork && (now - cachedItem.timestamp < CACHE_DURATION)) {
        // Atualização INSTANTÂNEA - sem loading
        setDados(cachedItem.data);
        setTotal(cachedItem.total);
        setError(null);
        // Show cache info only once per session per query shape
        try { toastManager.showInfoOnce(`cache-hit-${cacheKey}`, 'Dados carregados (cache)'); } catch(e){}
        
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
      // show loading toast
      try {
        loadingToastRef.current = toastManager.showLoading(`loading-${cacheKey}`, 'Carregando informações...');
      } catch (e) {}
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
        // mark that we've observed this reloadFlag
        reloadSeenRef.value = reloadFlag;
        
        setRetryCount(0);
        // update toast to success/info
        try {
          if (loadingToastRef.current !== null) {
              toastManager.updateSuccess(`loading-${cacheKey}`, newRows.length > 0 ? 'Dados carregados' : 'Nenhum resultado encontrado para os filtros selecionados');
              loadingToastRef.current = null;
            }
        } catch (e) {}
      
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
        try {
          if (loadingToastRef.current !== null) {
            toastManager.updateError(`loading-${cacheKey}`, 'Erro ao carregar dados. Verifique filtros e conexão.');
            loadingToastRef.current = null;
          }
        } catch (e) {}
        
  // Verificar se há dados em cache para esta página
  const paramsForCache = new URLSearchParams();
        if ((filtros as any).nomeFormula) paramsForCache.set("formula", String((filtros as any).nomeFormula));
        if ((filtros as any).dataInicio) paramsForCache.set("dataInicio", String((filtros as any).dataInicio));
        if ((filtros as any).dataFim) paramsForCache.set("dataFim", String((filtros as any).dataFim));
        if ((filtros as any).codigo) paramsForCache.set("codigo", String((filtros as any).codigo));
        if ((filtros as any).numero) paramsForCache.set("numero", String((filtros as any).numero));
        const cacheKeyForCache = `${paramsForCache.toString()}-${page}-${pageSize}`;
        const cachedItem = reportDataCache[cacheKeyForCache];
        if (cachedItem) {
          console.log('[useReportData] Usando cache vencido devido a erro');
          setDados(cachedItem.data);
          setTotal(cachedItem.total);
          try { toastManager.showInfoOnce(`cache-fallback-${cacheKeyForCache}`, 'Usando dados em cache devido a erro de rede'); } catch(e){}
        } else {
          setDados([]);
          setTotal(0);
          try { toastManager.showWarningOnce(`no-data-${cacheKeyForCache}`, 'Nenhum dado disponível para os filtros selecionados'); } catch(e){}
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    // Start silent checksum poller to detect background DB changes and update silently
    let pollerId: number | null = null;
    const startChecksumPoller = () => {
      pollerId = window.setInterval(async () => {
        try {
          const csRes = await fetch('http://localhost:3000/api/cache/paginate/checksum');
          if (!csRes.ok) return;
          const csBody = await csRes.json();
          const remoteChecksum = csBody?.checksum;
          // Rebuild the params to compute the same cache key used by fetch flow
          const paramsLocal = new URLSearchParams();
          paramsLocal.set('page', String(page || 1));
          paramsLocal.set('pageSize', String(pageSize || 100));
          if ((filtros as any).nomeFormula) paramsLocal.set('formula', String((filtros as any).nomeFormula));
          if ((filtros as any).dataInicio) paramsLocal.set('dataInicio', String((filtros as any).dataInicio));
          if ((filtros as any).dataFim) paramsLocal.set('dataFim', String((filtros as any).dataFim));
          if ((filtros as any).codigo) paramsLocal.set('codigo', String((filtros as any).codigo));
          if ((filtros as any).numero) paramsLocal.set('numero', String((filtros as any).numero));

          const cacheKey = `${paramsLocal.toString()}-${page}-${pageSize}`;
          const cached = reportDataCache[cacheKey];
          if (!cached || cached.dataChecksum !== remoteChecksum) {
            // fetch fresh page quietly
            const res = await fetch(`http://localhost:3000/api/relatorio/paginate?${paramsLocal.toString()}`, { method: 'GET', headers: { 'Cache-Control': 'no-cache' } } as any);
            if (!res.ok) return;
            const body = await res.json();
            const newRows = Array.isArray(body.rows) ? body.rows as any[] : [];
            const newTotal = Number(body.total) || 0;
            // update cache and UI silently (no loading toast)
            reportDataCache[cacheKey] = { data: newRows, total: newTotal, timestamp: Date.now(), dataChecksum: body.checksum };
            // Apply minimal UI update only if changed
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
              setTotal(newTotal);
            }
          }
        } catch (e) {
          // ignore
        }
      }, 5000);
    };

    startChecksumPoller();

    return () => {
      isMounted = false;
      controller.abort();
      if (retryTimeout) clearTimeout(retryTimeout);
      if (pollerId) window.clearInterval(pollerId);
    };
  // Use serialized filtros to avoid needless re-runs when object identity changes
  // Explicitly include sortBy/sortDir to ensure refetch when sorting changes
  }, [JSON.stringify(filtros), page, pageSize, reloadFlag, retryCount, prefetchData, sortBy, sortDir]);

  return { dados, loading, error, total, refetch, clearCache };
}