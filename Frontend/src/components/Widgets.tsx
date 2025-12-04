/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Pie, PieChart, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { ChartType } from "../home";

type Entry = {
  Nome: string;
  values: number[];
  Dia?: string;
  Hora?: string;
  Form1?: number;
  Form2?: number;
};

type ChartDatum = {
  name: string;
  value: number;
  count?: number;
  unit?: string;
  average?: number;
};

import { DASHBOARD_COLORS as COLORS } from "../lib/colors";
// import { he } from "date-fns/locale";

// Intentionally do NOT cache chart data in memory to ensure charts always show
// the most up-to-date production numbers. The paginate endpoint still uses
// server-side cache for performance; charts must bypass caches.
// (We keep a small fallback to use in case of network error below.)
const chartDataCache: Record<string, { data: ChartDatum[], stats: any, timestamp: number }> = {};

// Hook para buscar dados do backend
export const useChartData = (chartType: ChartType, config?: any) => {
  const [data, setData] = useState<ChartDatum[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
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

      // Construir parâmetros de consulta (parâmetros simples)
      const params = new URLSearchParams();
  // advancedFilters key will be composed later once params are filled

      try {
        setLoading(true);
        setError(null);
        // Só adiciona parâmetros se não forem vazios ou undefined
        // Use both 'nomeFormula' and legacy 'formula' keys so backend endpoints accept either
        if (filtersObj?.nomeFormula && String(filtersObj.nomeFormula).trim()) {
          params.set('nomeFormula', String(filtersObj.nomeFormula));
          // also set 'formula' for backend routes that expect that param
          params.set('formula', String(filtersObj.nomeFormula));
        }
        if (filtersObj?.formula && String(filtersObj.formula).trim()) params.set('formula', String(filtersObj.formula));
        if (filtersObj?.dataInicio && String(filtersObj.dataInicio).trim()) params.set('dataInicio', String(filtersObj.dataInicio));
        if (filtersObj?.dataFim && String(filtersObj.dataFim).trim()) params.set('dataFim', String(filtersObj.dataFim));
        if (filtersObj?.codigo && String(filtersObj.codigo).trim()) params.set('codigo', String(filtersObj.codigo));
        if (filtersObj?.numero && String(filtersObj.numero).trim()) params.set('numero', String(filtersObj.numero));

    // Do NOT use in-memory cache for charts by default. Always fetch fresh.
  const now = Date.now();
        
        // If advancedFilters present, add as a JSON-encoded query parameter to the URL
        let url = `http://localhost:3000/api/chartdata/${chartType}`;
        const qs = params.toString();
        if (qs) url += `?${qs}`;
        if (advancedFilters) {
          const enc = encodeURIComponent(JSON.stringify(advancedFilters));
          url += (qs ? '&' : '?') + `advancedFilters=${enc}`;
        }
  console.log(`[useChartData] Fetching ${chartType} with filters:`, filtersObj, 'advancedFilters:', advancedFilters);
  console.log(`[useChartData] Fetching from: ${url}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // Aumentado para 20 segundos timeout
        
        try {
          const res = await fetch(url, { 
            signal: controller.signal,
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          clearTimeout(timeoutId);
          
          console.log(`[useChartData] Response status: ${res.status} ${res.statusText}`);
          
          if (!res.ok) throw new Error(`Erro HTTP ${res.status} ${res.statusText}`);
          
          const body = await res.json();
          if (!isMounted) return;
          
          console.log(`[useChartData] ${chartType} response body:`, body);
          
          // Verificar se os dados estão realmente presentes
          if (!body || !body.chartData) {
            console.warn(`[useChartData] Resposta inválida ou vazia para ${chartType}`);
            throw new Error("Dados inválidos ou incompletos");
          }
          
          // Garantir que o chartData seja um array válido
          const chartData = Array.isArray(body.chartData) ? body.chartData : [];
          
          console.log(`[useChartData] ${chartType} chartData:`, chartData);
          
          // Verificar se o array tem elementos
          if (chartData.length === 0) {
            console.warn(`[useChartData] Array vazio de chartData para ${chartType}`);
          }
          
          // Store a fallback snapshot (not used for actual display) in case of subsequent network errors
          const advKeyForStore = advancedFilters ? encodeURIComponent(JSON.stringify(advancedFilters)) : '';
          const computedCacheKey = `${chartType}:${qs}:adv:${advKeyForStore}`;
          chartDataCache[computedCacheKey] = {
            data: chartData,
            stats: body,
            timestamp: now,
          };

          // Always set fresh data from server
          setData(chartData);
          setStats(body);
          setRetryCount(0);
        } catch (innerError) {
          console.error(`[useChartData] Erro na requisição fetch: ${innerError}`);
          throw innerError;
        }
      } catch (err: any) {
        if (!isMounted) return;
        
        console.error(`[useChartData] Erro ao buscar dados de ${chartType}:`, err);
        
        // Tentar novamente até 3 vezes em caso de erro de rede
        if (retryCount < 3 && (err.name === 'AbortError' || err.message.includes('network') || err.message.includes('failed'))) {
          setRetryCount(prev => prev + 1);
          console.log(`[useChartData] Tentando novamente (${retryCount + 1}/3)...`);
          retryTimeout = setTimeout(() => {
            if (isMounted) fetchData();
          }, 2000); // espera 2 segundos antes de tentar novamente
          return;
        }
        
        setError(err.message || 'Erro ao carregar dados');
        
        // Se houver dados em cache, usar mesmo vencido em caso de erro
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
          console.log(`[useChartData] Usando cache de fallback devido a erro`);
          setData(cachedItem.data);
          setStats(cachedItem.stats);
          
          // Definir um tempo mais longo para tentar novamente em segundo plano
          retryTimeout = setTimeout(() => {
            if (isMounted) {
              console.log('[useChartData] Tentando atualização em segundo plano');
              fetchData();
            }
          }, 8000); // Tenta novamente após 8 segundos
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
    
    // Limpeza ao desmontar componente
    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [chartType, JSON.stringify({ filters: config && config.filters ? config.filters : config, advancedFilters: config && config.advancedFilters ? config.advancedFilters : (config && config.filters ? config.filters.advancedFilters : null) }), retryCount]);

  // Função para forçar atualização manual
  const refetch = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  return { data, loading, stats, error, refetch };
};

// Tooltip customizado
const CustomTooltip = ({ active, payload, stats, unit: customUnit }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const value = data.value || 0;
  const count = data.count || stats?.totalRecords || 0;
  const average = data.average || 0;
  const unit = customUnit || data.unit || 'kg';
  
  const total = stats?.total || payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[200px] pointer-events-none">
      <div className="border-b border-gray-200 pb-2 mb-2">
        <p className="text-xs text-gray-500 font-bold" title={data.name}>
          {data.name.length > 30 ? `${data.name.substring(0, 30)}...` : data.name}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-red-600">
          {value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} {unit}
        </p>
        {count > 0 && (
          <p className="text-xs text-gray-500">Registros: {count}</p>
        )}

        {average > 0 && (
          <p className="text-xs text-gray-500">
            Média: {average.toFixed(2)} {unit}
          </p>
        )}
        <p className="text-xs text-gray-500">{percentage}% do total</p>
      </div>
    </div>
  );
};

// Tooltip compacto para gráfico de horários
// const CompactBarTooltip = ({ active, payload, stats }: any) => {
//   if (!active || !payload || !payload.length) return null;

//   const data = payload[0].payload;
//   const value = data.value || 0;
//   const count = data.count || 0;
//   const average = data.average || 0;
  
//   const total = stats?.total || 0;
//   const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

//   return (
//     <div className="bg-gray-900 text-white rounded px-3 py-2 shadow-lg">
//       <div className="font-bold text-sm mb-1 border-b border-gray-700 pb-1">{data.name}</div>
//       <div className="space-y-0.5">
//         <div className="text-sm font-semibold text-red-400">
//           {value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg
//         </div>
//         {count > 0 && (
//           <div className="text-xs text-gray-300">
//             Registros: {count}
//           </div>
//         )}
//         {average > 0 && (
//           <div className="text-xs text-gray-300">
//             Média: {average.toFixed(2)} kg
//           </div>
//         )}
//         <div className="text-xs text-gray-400">
//           {percentage}% do total
//         </div>
//       </div>
//     </div>
//   );
// };

// Tooltip compacto para donut (interno)
const CompactDonutTooltip = ({ active, payload, stats }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const value = data.value || 0;
  const unit = data.unit || 'kg';
  
  const total = stats?.total || payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-gray-900 text-white rounded px-2 py-1 text-xs shadow-lg">
      <div className="font-semibold max-w-[120px]" title={data.name}>
        {data.name.length > 15 ? `${data.name.substring(0, 15)}...` : data.name}
      </div>
      <div className="text-[10px]">
        {value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} {unit} • {percentage}%
      </div>
    </div>
  );
};

// COMPONENTE: DonutChart
export const DonutChartWidget = React.memo(({ chartType = "produtos", config, highlightName, onSliceHover, onSliceLeave, compact = false, title, fetchUrl, unit }: { chartType?: ChartType; config?: any; highlightName?: string | null; onSliceHover?: (name: string) => void; onSliceLeave?: () => void; compact?: boolean; title?: string; fetchUrl?: string; unit?: string }) => {
  // Se fetchUrl for fornecido, usar fetch direto; caso contrário, usar useChartData
  const [directData, setDirectData] = useState<ChartDatum[]>([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [directStats, setDirectStats] = useState<any>(null);
  const [directError, setDirectError] = useState<string | null>(null);

  useEffect(() => {
    if (!fetchUrl) return;
    
    const fetchData = async () => {
      setDirectLoading(true);
      setDirectError(null);
      try {
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        setDirectData(body.chartData || []);
        setDirectStats(body);
      } catch (err: any) {
        setDirectError(err.message);
      } finally {
        setDirectLoading(false);
      }
    };
    
    fetchData();
  }, [fetchUrl]);

  const hookResult = useChartData(chartType, config);
  
  const data = fetchUrl ? directData : hookResult.data;
  const loading = fetchUrl ? directLoading : hookResult.loading;
  const stats = fetchUrl ? directStats : hookResult.stats;
  const error = fetchUrl ? directError : hookResult.error;
  const refetch = hookResult.refetch;
  const [retryAttempt, setRetryAttempt] = useState(0);

  // ✅ OTIMIZAÇÃO: Memoizar cálculos pesados
  const displayTotal = useMemo(() => {
    if (!data || !Array.isArray(data)) return 0;
    return data.reduce((s, d) => s + (d.value || 0), 0);
  }, [data]);
    console.log(displayTotal);

  // ✅ OTIMIZAÇÃO: Callbacks memoizados
  const handleMouseLeave = useCallback((e: any) => {
    const toElement = e.relatedTarget as HTMLElement;
    if (!toElement?.classList.contains('recharts-sector')) {
      onSliceLeave?.();
      const tooltipEl = document.querySelector('.recharts-tooltip-wrapper');
      if (tooltipEl) {
        (tooltipEl as HTMLElement).style.visibility = 'hidden';
      }
    }
  }, [onSliceLeave]);

  // Efeito para tentar recarregar automaticamente em caso de erro
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    if (error && (!data || data.length === 0) && retryAttempt < 3) {
      timeoutId = setTimeout(() => {
        refetch();
        setRetryAttempt(prev => prev + 1);
      }, 3000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [error, data, retryAttempt, refetch]);
  
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3"></div>
          <div className="text-sm text-gray-500">Carregando dados...</div>
        </div>
      </div>
    );
  }
  
  if (error && (!data || data.length === 0)) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-gray-500">Atualizando dados...</div>
        </div>
      </div>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0 || data.every(item => !item.value)) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center text-gray-500 text-sm">
          Nenhum dado disponível para exibição
        </div>
      </div>
    );
  }

  const displayTitle = title || "Gráfico";
  const displayUnit = unit || data[0]?.unit || 'kg';

  return (
    <div className="h-full w-full relative">
      {/* Título do gráfico */}
      {title && (
        <div className="text-sm font-semibold text-gray-700 mb-2">
          {displayTitle}
        </div>
      )}
      
      {!compact && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs 3xl:text-lg text-gray-500">Total</div>
            <div className=" text-sm  3xl:text-2xl font-bold text-red-600">
              {(stats?.total ?? data.reduce((s, d) => s + d.value, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
            </div>
            <div className="text-xs 3xl:text-lg text-gray-500">{displayUnit}</div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <PieChart >
          <Pie  
            data={data}
            cx="50%"
            cy="50%"
            // preciso que ele aumente ou diminua o tamanho do gráfico mediante a responsividade]
            innerRadius={compact?"40%":"50%"} 
            outerRadius={compact?"70%":"80%"} 
            dataKey="value"
            labelLine={false}
            onMouseLeave={handleMouseLeave}
            isAnimationActive={false}

          >
            {data.map((d, index) => {
              const isHighlighted = !!highlightName && d.name === highlightName;
              const dimmed = !!highlightName && d.name !== highlightName;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={dimmed ? 0.35 : 1}
                  stroke={isHighlighted ? '#111827' : '#ffffff'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  onMouseEnter={() => {
                    const tooltipEl = document.querySelector('.recharts-tooltip-wrapper');
                    if (tooltipEl) {
                      (tooltipEl as HTMLElement).style.visibility = 'visible';
                      (tooltipEl as HTMLElement).style.opacity = '1';
                    }
                    onSliceHover?.(d.name);
                  }}
                />
              );
            })}
          </Pie>
          <Tooltip 
            content={compact ? <CompactDonutTooltip stats={stats} /> : <CustomTooltip stats={stats} />}
            cursor={{ fill: 'transparent' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

// COMPONENTE: BarChart
export const BarChartWidget = React.memo(({ chartType = "formulas", config, title, fetchUrl, unit }: { chartType?: ChartType; config?: any; title?: string; fetchUrl?: string; unit?: string }) => {
  // Se fetchUrl for fornecido, usar fetch direto; caso contrário, usar useChartData
  const [directData, setDirectData] = useState<ChartDatum[]>([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [directStats, setDirectStats] = useState<any>(null);
  const [directError, setDirectError] = useState<string | null>(null);

  useEffect(() => {
    if (!fetchUrl) return;
    
    const fetchData = async () => {
      setDirectLoading(true);
      setDirectError(null);
      try {
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        setDirectData(body.chartData || []);
        setDirectStats(body);
      } catch (err: any) {
        setDirectError(err.message);
      } finally {
        setDirectLoading(false);
      }
    };
    
    fetchData();
  }, [fetchUrl]);

  const hookResult = useChartData(chartType, config);
  
  const data = fetchUrl ? directData : hookResult.data;
  const loading = fetchUrl ? directLoading : hookResult.loading;
  const stats = fetchUrl ? directStats : hookResult.stats;
  const error = fetchUrl ? directError : hookResult.error;
  const refetch = hookResult.refetch;
  const [retryAttempt, setRetryAttempt] = useState(0);
  
  // Efeito para tentar recarregar automaticamente em caso de erro
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    if (error && (!data || data.length === 0) && retryAttempt < 5) {
      timeoutId = setTimeout(() => {
        console.log(`[BarChartWidget] Tentativa automática de recarga #${retryAttempt + 1}`);
        refetch();
        setRetryAttempt(prev => prev + 1);
      }, Math.min(3000 + (retryAttempt * 1000), 10000)); // Backoff progressivo, máximo 10s
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [error, data, retryAttempt, refetch]);
  
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3"></div>
          <div className="text-sm text-gray-500">Carregando dados...</div>
        </div>
      </div>
    );
  }
  
  // Em caso de erro, mostrar mensagem sutil (retentativas já estão configuradas no useEffect)
  if (error && (!data || data.length === 0)) {
    console.warn(`[BarChartWidget] Erro ao carregar dados: ${error}`);
    
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-gray-500">Atualizando dados...</div>
        </div>
      </div>
    );
  }

  // Validação adicional para garantir que temos um array válido com dados reais
  if (!data || !Array.isArray(data) || data.length === 0 || data.every(item => !item.value)) {
    console.warn(`[BarChartWidget] Dados vazios ou inválidos para ${chartType}:`, data);
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center text-gray-500 text-sm">
          Nenhum dado disponível para este período
        </div>
      </div>
    );
  }

  if (chartType === "formulas") {
    data.sort((a, b) => b.value - a.value);
  }

  // Determinar labels baseado no chartType
  const getAxisLabels = () => {
    switch (chartType) {
      case "horarios":
        return { xLabel: "Hora", yLabel: "Produção (kg)" };
      case "formulas":
        return { xLabel: "Fórmula", yLabel: "Quantidade (kg)" };
      case "produtos":
        return { xLabel: "Produto", yLabel: "Quantidade (kg)" };
      default:
        return { xLabel: "", yLabel: "Valor (kg)" };
    }
  };

  const { xLabel, yLabel } = getAxisLabels();

  console.log(xLabel, yLabel);
  
  // Usar tooltip compacto para horários
  const isHorarios = chartType === "horarios";
  console.log(isHorarios);

  const displayTitle = title || "Produção (kg)";
  const displayUnit = unit || "kg";

  return (
    <div className="h-[31dvh] flex flex-col relative">
      <div className="text-gray-700 font-semibold z-10">
        {displayTitle}
      </div>
      <ResponsiveContainer  width="100%" height="100%">
        <BarChart data={data} layout="horizontal" margin={{ left: 20, top: 35 }}>
          <YAxis type="number" dataKey="value" />
          <XAxis type="category" dataKey="name" width={60} />
          <Tooltip content={<CustomTooltip stats={stats} unit={displayUnit} />} />
          <Bar dataKey="value" fill="#ff2626ff" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// COMPONENTE: WeeklyChart
export const WeeklyChartWidget = React.memo(({ rows, weekStart }: { rows: Entry[] | null, weekStart?: Date }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    if (weekStart) return weekStart;
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
  });

  // Sincronizar com weekStart externo
  useEffect(() => {
    if (weekStart) {
      setCurrentWeekStart(weekStart);
    }
  }, [weekStart]);

  const parseDia = (dia?: string): Date | null => {
    if (!dia) return null;
    const s = dia.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00');
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
      const parts = s.split('/');
      let y = parts[2];
      if (y.length === 2) y = String(2000 + Number(y));
      return new Date(Number(y), Number(parts[1]) - 1, Number(parts[0]));
    }
    const dt = new Date(s);
    return !isNaN(dt.getTime()) ? dt : null;
  };

  const weekData = useMemo(() => {
    if (!rows) return [];
    
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const totals = Array(7).fill(0);
    
    const startOfWeek = new Date(currentWeekStart);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    for (const r of rows) {
      if (!r.Dia) continue;
      const date = parseDia(r.Dia);
      if (!date) continue;
      
      if (date >= startOfWeek && date <= endOfWeek) {
        const dayIndex = date.getDay();
        // Somar TODOS os valores da linha (Prod_1 até Prod_40), não apenas o primeiro
        let rowTotal = 0;
        if (r.values && Array.isArray(r.values)) {
          for (let i = 0; i < r.values.length; i++) {
            const val = Number(r.values[i]);
            rowTotal += isNaN(val) ? 0 : val;
          }
        }
        totals[dayIndex] += rowTotal;
      }
    }
    
    return weekdays.map((name, idx) => ({ name, value: totals[idx] }));
  }, [rows, currentWeekStart]);

  return (
    <div className="h-[90%] flex flex-col relative">
      <div className=" text-gray-700 font-semibold z-10">
        Produção (kg)
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData} margin={{ top: 35 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#ff2626ff" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
 