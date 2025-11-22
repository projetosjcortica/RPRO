import { useState, useEffect, useCallback } from 'react';
import type { ChartType, ChartDatum, ChartStats } from '../types/chart.types';

// Intentionally do NOT cache chart data in memory to ensure charts always show
// the most up-to-date production numbers. The paginate endpoint still uses
// server-side cache for performance; charts must bypass caches.
const chartDataCache: Record<string, { data: ChartDatum[], stats: any, timestamp: number }> = {};

interface UseChartDataResult {
    data: ChartDatum[];
    loading: boolean;
    stats: ChartStats | null;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook to fetch chart data from backend
 * @param chartType - Type of chart (produtos, formulas, horarios, weekly)
 * @param config - Filter configuration object
 * @returns Chart data, loading state, stats, error, and refetch function
 */
export const useChartData = (chartType: ChartType, config?: any): UseChartDataResult => {
    const [data, setData] = useState<ChartDatum[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<ChartStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        let retryTimeout: ReturnType<typeof setTimeout> | null = null;

        const fetchData = async () => {
            if (!isMounted) return;

            // Accept either a plain filters object or a config object with { filters, advancedFilters }
            const filtersObj = config && typeof config === 'object' && config.filters ? config.filters : config || {};
            const advancedFilters = config && typeof config === 'object' && config.advancedFilters ? config.advancedFilters : (filtersObj && filtersObj.advancedFilters) ? filtersObj.advancedFilters : null;

            // Build query parameters
            const params = new URLSearchParams();

            try {
                setLoading(true);
                setError(null);

                // Add filter parameters
                if (filtersObj?.nomeFormula && String(filtersObj.nomeFormula).trim()) {
                    params.set('nomeFormula', String(filtersObj.nomeFormula));
                    params.set('formula', String(filtersObj.nomeFormula));
                }
                if (filtersObj?.formula && String(filtersObj.formula).trim()) params.set('formula', String(filtersObj.formula));
                if (filtersObj?.dataInicio && String(filtersObj.dataInicio).trim()) params.set('dataInicio', String(filtersObj.dataInicio));
                if (filtersObj?.dataFim && String(filtersObj.dataFim).trim()) params.set('dataFim', String(filtersObj.dataFim));
                if (filtersObj?.codigo && String(filtersObj?.codigo).trim()) params.set('codigo', String(filtersObj.codigo));
                if (filtersObj?.numero && String(filtersObj.numero).trim()) params.set('numero', String(filtersObj.numero));

                const now = Date.now();

                // Build URL
                let url = `http://localhost:3001/api/chartdata/${chartType}`;
                const qs = params.toString();
                if (qs) url += `?${qs}`;
                if (advancedFilters) {
                    const enc = encodeURIComponent(JSON.stringify(advancedFilters));
                    url += (qs ? '&' : '?') + `advancedFilters=${enc}`;
                }

                console.log(`[useChartData] Fetching ${chartType} from: ${url}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000);

                try {
                    const res = await fetch(url, {
                        signal: controller.signal,
                        headers: { 'Cache-Control': 'no-cache' }
                    });

                    clearTimeout(timeoutId);

                    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

                    const body = await res.json();
                    if (!isMounted) return;

                    if (!body || !body.chartData) {
                        throw new Error("Invalid or empty data");
                    }

                    const chartData = Array.isArray(body.chartData) ? body.chartData : [];

                    // Store fallback snapshot
                    const advKeyForStore = advancedFilters ? encodeURIComponent(JSON.stringify(advancedFilters)) : '';
                    const computedCacheKey = `${chartType}:${qs}:adv:${advKeyForStore}`;
                    chartDataCache[computedCacheKey] = {
                        data: chartData,
                        stats: body,
                        timestamp: now,
                    };

                    setData(chartData);
                    setStats(body);
                    setRetryCount(0);
                } catch (innerError) {
                    console.error(`[useChartData] Fetch error:`, innerError);
                    throw innerError;
                }
            } catch (err: any) {
                if (!isMounted) return;

                console.error(`[useChartData] Error fetching ${chartType}:`, err);

                // Retry up to 3 times for network errors
                if (retryCount < 3 && (err.name === 'AbortError' || err.message.includes('network') || err.message.includes('failed'))) {
                    setRetryCount(prev => prev + 1);
                    console.log(`[useChartData] Retrying (${retryCount + 1}/3)...`);
                    retryTimeout = setTimeout(() => {
                        if (isMounted) fetchData();
                    }, 2000);
                    return;
                }

                setError(err.message || 'Error loading data');

                // Use cached data as fallback
                const fallbackParams = new URLSearchParams();
                if (filtersObj?.nomeFormula && String(filtersObj.nomeFormula).trim()) {
                    fallbackParams.set('nomeFormula', String(filtersObj.nomeFormula));
                    fallbackParams.set('formula', String(filtersObj.nomeFormula));
                }
                if (filtersObj?.formula && String(filtersObj.formula).trim()) fallbackParams.set('formula', String(filtersObj.formula));
                if (filtersObj?.dataInicio && String(filtersObj.dataInicio).trim()) fallbackParams.set('dataInicio', String(filtersObj.dataInicio));
                if (filtersObj?.dataFim && String(filtersObj.dataFim).trim()) fallbackParams.set('dataFim', String(filtersObj.dataFim));
                if (filtersObj?.codigo && String(filtersObj.codigo).trim()) fallbackParams.set('codigo', String(filtersObj.codigo));
                if (filtersObj?.numero && String(filtersObj.numero).trim()) fallbackParams.set('numero', String(filtersObj.numero));
                const fallbackAdvKey = advancedFilters ? encodeURIComponent(JSON.stringify(advancedFilters)) : '';
                const fallbackCacheKey = `${chartType}:${fallbackParams.toString()}:adv:${fallbackAdvKey}`;

                const cachedItem = chartDataCache[fallbackCacheKey];
                if (cachedItem) {
                    console.log(`[useChartData] Using fallback cache`);
                    setData(cachedItem.data);
                    setStats(cachedItem.stats);

                    retryTimeout = setTimeout(() => {
                        if (isMounted) {
                            console.log('[useChartData] Background refresh attempt');
                            fetchData();
                        }
                    }, 8000);
                } else {
                    setData([]);
                    setStats(null);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (chartType) {
            void fetchData();
        }

        return () => {
            isMounted = false;
            if (retryTimeout) clearTimeout(retryTimeout);
        };
    }, [chartType, JSON.stringify({ filters: config && config.filters ? config.filters : config, advancedFilters: config && config.advancedFilters ? config.advancedFilters : (config && config.filters ? config.filters.advancedFilters : null) }), retryCount]);

    const refetch = useCallback(() => {
        setRetryCount(prev => prev + 1);
    }, []);

    return { data, loading, stats, error, refetch };
};
