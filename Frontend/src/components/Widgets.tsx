/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState, useEffect, useCallback } from "react";
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

// Cache para armazenar os resultados de consultas anteriores
const chartDataCache: Record<string, { data: ChartDatum[], stats: any, timestamp: number }> = {};

// Hook para buscar dados do backend
export const useChartData = (chartType: ChartType, filters?: any) => {
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
      
      try {
        setLoading(true);
        setError(null);
        
        // Construir parâmetros de consulta
        const params = new URLSearchParams();
        // Só adiciona parâmetros se não forem vazios ou undefined
        if (filters?.nomeFormula && String(filters.nomeFormula).trim()) params.set('nomeFormula', String(filters.nomeFormula));
        if (filters?.formula && String(filters.formula).trim()) params.set('formula', String(filters.formula));
        if (filters?.dataInicio && String(filters.dataInicio).trim()) params.set('dataInicio', String(filters.dataInicio));
        if (filters?.dataFim && String(filters.dataFim).trim()) params.set('dataFim', String(filters.dataFim));
        if (filters?.codigo && String(filters.codigo).trim()) params.set('codigo', String(filters.codigo));
        if (filters?.numero && String(filters.numero).trim()) params.set('numero', String(filters.numero));

        // Criar chave de cache usando tipo de gráfico e parâmetros
        const cacheKey = `${chartType}:${params.toString()}`;
        
        // Verificar cache (válido por 1 minuto)
        const now = Date.now();
        const cachedItem = chartDataCache[cacheKey];
        if (cachedItem && (now - cachedItem.timestamp < 60000)) {
          console.log(`[useChartData] Usando cache para ${chartType}`);
          setData(cachedItem.data);
          setStats(cachedItem.stats);
          setLoading(false);
          return;
        }
        
        const url = `http://localhost:3000/api/chartdata/${chartType}?${params.toString()}`;
        console.log(`[useChartData] Fetching ${chartType} with filters:`, filters);
        
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
          
          // Atualizar cache
          chartDataCache[cacheKey] = {
            data: chartData,
            stats: body,
            timestamp: now
          };
          
          setData(chartData);
        } catch (innerError) {
          console.error(`[useChartData] Erro na requisição fetch: ${innerError}`);
          throw innerError;
        }
        setStats(body);
        setRetryCount(0);
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
        const cacheKey = `${chartType}:${params.toString()}`;
        const cachedItem = chartDataCache[cacheKey];
        if (cachedItem) {
          console.log(`[useChartData] Usando cache vencido devido a erro`);
          setData(cachedItem.data);
          setStats(cachedItem.stats);
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
  }, [chartType, JSON.stringify(filters), retryCount]);

  // Função para forçar atualização manual
  const refetch = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  return { data, loading, stats, error, refetch };
};

// Tooltip customizado
const CustomTooltip = ({ active, payload, stats }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const value = data.value || 0;
  const count = data.count || stats?.totalRecords || 0;
  const average = data.average || 0;
  const unit = data.unit || 'kg';
  
  const total = stats?.total || payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[200px]">
      <div className="border-b border-gray-200 pb-2 mb-2">
        <p className="text-xs text-gray-500 font-bold">{data.name}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-red-600">
          {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {unit}
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
//           {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
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
      <div className="font-semibold truncate max-w-[120px]">{data.name}</div>
      <div className="text-[10px]">
        {value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} {unit} • {percentage}%
      </div>
    </div>
  );
};

// COMPONENTE: DonutChart
export function DonutChartWidget({ chartType = "produtos", config, highlightName, onSliceHover, onSliceLeave, compact = false }: { chartType?: ChartType; config?: any; highlightName?: string | null; onSliceHover?: (name: string) => void; onSliceLeave?: () => void; compact?: boolean }) {
  const { data, loading, stats, error, refetch } = useChartData(chartType, config?.filters);

  // Log para depurar a renderização do gráfico
  console.log(`[DonutChartWidget] Rendering ${chartType}: loading=${loading}, error=${error}, data=`, data);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  if (error && (!data || data.length === 0)) {
    console.warn(`[DonutChartWidget] Erro ao carregar dados: ${error}`);
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-red-500 text-sm mb-2">Erro ao carregar dados</div>
        <button 
          onClick={() => refetch()} 
          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-md"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Validação adicional para garantir que temos um array válido com dados reais
  if (!data || !Array.isArray(data) || data.length === 0 || data.every(item => !item.value)) {
    console.warn(`[DonutChartWidget] Dados vazios ou inválidos para ${chartType}:`, data);
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Nenhum dado disponível para exibição
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {/* <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 rounded-br-lg text-xs font-semibold z-10 shadow-md">
        Medida em KG
      </div> */}
      {!compact && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* center total */}
          <div className="text-center">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-bold text-red-600">
              {(stats?.total ?? data.reduce((s, d) => s + d.value, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-500">{(data[0]?.unit) ?? 'kg'}</div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={compact ? 50 : 70}
            outerRadius={compact ? 80 : 110}
            dataKey="value"
            labelLine={false}
            onMouseLeave={() => onSliceLeave?.()}
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
                  onMouseEnter={() => onSliceHover?.(d.name)}
                />
              );
            })}
          </Pie>
          <Tooltip content={compact ? <CompactDonutTooltip stats={stats} /> : <CustomTooltip stats={stats} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// COMPONENTE: BarChart
export function BarChartWidget({ chartType = "formulas", config }: { chartType?: ChartType; config?: any }) {
  const { data, loading, stats, error, refetch } = useChartData(chartType, config?.filters);

  // Log para depurar a renderização do gráfico
  console.log(`[BarChartWidget] Rendering ${chartType}: loading=${loading}, error=${error}, data=`, data);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  if (error && (!data || data.length === 0)) {
    console.warn(`[BarChartWidget] Erro ao carregar dados: ${error}`);
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-red-500 text-sm mb-2">Erro ao carregar dados</div>
        <button 
          onClick={() => refetch()} 
          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs rounded-md"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Validação adicional para garantir que temos um array válido com dados reais
  if (!data || !Array.isArray(data) || data.length === 0 || data.every(item => !item.value)) {
    console.warn(`[BarChartWidget] Dados vazios ou inválidos para ${chartType}:`, data);
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Nenhum dado disponível para exibição
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

  return (
    <div className="h-full w-full relative">
      <div className="text-gray-700 font-semibold z-10">
        Produção (kg)
      </div>
      <ResponsiveContainer  width="100%" height="87%">
        <BarChart data={data} layout="horizontal" margin={{ left: 20, top: 35 }}>
          <YAxis type="number" dataKey="value" />
          <XAxis type="category" dataKey="name" width={60} />
          <Tooltip content={<CustomTooltip stats={stats} />} />
          <Bar dataKey="value" fill="#ff2626ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// COMPONENTE: WeeklyChart
export function WeeklyChartWidget({ rows, weekStart }: { rows: Entry[] | null, weekStart?: Date }) {
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
        const v = Number(r.values?.[0] ?? r.Form1 ?? 0);
        totals[dayIndex] += isNaN(v) ? 0 : v;
      }
    }
    
    return weekdays.map((name, idx) => ({ name, value: totals[idx] }));
  }, [rows, currentWeekStart]);

  return (
    <div className="h-full flex flex-col relative">
      <div className=" text-gray-700 font-semibold z-10">
        Produção (kg)
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={weekData} margin={{ top: 35 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#ff2626ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
 