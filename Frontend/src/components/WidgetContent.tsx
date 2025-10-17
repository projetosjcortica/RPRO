import { useMemo, useState, useEffect, useCallback } from "react";
import { Pie, PieChart, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import type { ChartType } from "../home";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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

interface WidgetContentProps {
  type: string;
  rows: Entry[] | null;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
  config?: any;
}

// Cache para armazenar os resultados de consultas anteriores
const chartDataCache: Record<string, { data: ChartDatum[], stats: any, timestamp: number }> = {};

// Hook para buscar dados do backend
const useChartData = (chartType: ChartType, filters?: any) => {
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
      
        const params = new URLSearchParams();
        if (filters?.formula) params.set('formula', String(filters.formula));
        if (filters?.dataInicio) params.set('dataInicio', String(filters.dataInicio));
        if (filters?.dataFim) params.set('dataFim', String(filters.dataFim));
        if (filters?.codigo) params.set('codigo', String(filters.codigo));
        if (filters?.numero) params.set('numero', String(filters.numero));

      try {
        setLoading(true);
        setError(null)

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
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
        
        const res = await fetch(url, { 
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
        
        const body = await res.json();
        if (!isMounted) return;
        
        // Garantir que o chartData seja um array
        const chartData = Array.isArray(body.chartData) ? body.chartData : [];
        
        // Preparar objeto stats
        const statsData = {
          total: body.total,
          totalRecords: body.totalRecords,
          peakHour: body.peakHour,
          peakDay: body.peakDay,
        };
        
        // Atualizar cache
        chartDataCache[cacheKey] = {
          data: chartData,
          stats: statsData,
          timestamp: now
        };
        
        console.log(`[useChartData] ${chartType} response:`, body);
        setData(chartData);
        setStats(statsData);
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

    fetchData();
    
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

// Funções de agregação
function aggregate(rows: Entry[]): ChartDatum[] {
  const valid = rows.filter(r => r && r.Nome && Array.isArray(r.values) && r.values.length > 0);
  const sums: Record<string, number> = {};
  for (const r of valid) {
    const key = r.Nome;
    const v = Number(r.values[0] ?? r.Form1 ?? 0);
    sums[key] = (sums[key] || 0) + v;
  }
  return Object.entries(sums).map(([name, value]) => ({ name, value }));
}

function aggregateProducts(rows: Entry[]): ChartDatum[] {
  const valid = rows.filter(r => r && Array.isArray(r.values) && r.values.length > 0);
  const productSums: Record<string, number> = {};
  for (const r of valid) {
    r.values.forEach((value, index) => {
      const productKey = `Produto ${index + 1}`;
      const v = Number(value ?? 0);
      if (v <= 0) return;
      productSums[productKey] = (productSums[productKey] || 0) + v;
    });
  }
  return Object.entries(productSums).map(([name, value]) => ({ name, value }));
}

function aggregateByHour(rows: Entry[]): ChartDatum[] {
  const hourSums: Record<string, number> = {};
  for (const r of rows) {
    if (!r.Hora) continue;
    const hour = r.Hora.split(':')[0];
    const v = Number(r.values?.[0] ?? r.Form1 ?? 0);
    if (isNaN(v) || v <= 0) continue;
    hourSums[`${hour}h`] = (hourSums[`${hour}h`] || 0) + v;
  }
  return Object.entries(hourSums)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));
}

// Tooltip customizado com estatísticas extras
const CustomTooltip = ({ active, payload, label, stats }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  const entry = payload[0];
  const dataPoint = entry.payload;
  
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[200px]">
      <div className="border-b border-gray-200 pb-2 mb-2">
        <p className="text-sm font-bold text-gray-900">{label}</p>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs font-medium text-gray-700">{entry.name || "Produção"}</span>
        </div>
        
        <div className="pl-5 space-y-1">
          <p className="text-sm font-bold text-red-600">
            {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
          </p>
          
          {dataPoint.count && (
            <p className="text-xs text-gray-500">
              {dataPoint.count} registro{dataPoint.count !== 1 ? 's' : ''}
            </p>
          )}
          
          {dataPoint.average && (
            <p className="text-xs text-gray-500">
              Média: {dataPoint.average.toFixed(2)} kg
            </p>
          )}
          
          {dataPoint.unit && (
            <p className="text-xs text-gray-500">
              Unidade: {dataPoint.unit}
            </p>
          )}
          
          {stats?.total && (
            <p className="text-xs text-gray-500">
              {((entry.value / stats.total) * 100).toFixed(1)}% do total
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function WidgetContent({ type, rows, chartType = "produtos", onChartTypeChange, config }: WidgetContentProps) {
  // Usar hook para buscar dados do backend (mais otimizado)
  const { data: apiData, loading: apiLoading, stats, error, refetch } = useChartData(chartType, config?.filters);

  // Fallback: usar agregação local se rows estiver disponível e apiData vazio
  const localData = useMemo(() => {
    if (!rows || apiData.length > 0) return [];
    switch (chartType) {
      case "formulas":
        return aggregate(rows);
      case "produtos":
        return aggregateProducts(rows);
      case "horarios":
        return aggregateByHour(rows);
      default:
        return [];
    }
  }, [rows, chartType, apiData]);

  const data = apiData.length > 0 ? apiData : localData;
  
  // Renderizar estado de erro
  if (error && data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-2 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Erro ao carregar dados
        </div>
        <p className="text-gray-500 text-sm mb-3 text-center">
          Não foi possível carregar os dados do gráfico.
        </p>
        <button 
          onClick={() => refetch()} 
          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Tentar novamente
        </button>
      </div>
    );
  }

  // Widget: Gráfico Donut
  if (type === "donut-chart") {
    return (
      <div className="h-full flex flex-col">
        {onChartTypeChange && (
          <div className="mb-2">
            <Select value={chartType} onValueChange={(v) => onChartTypeChange(v as ChartType)}>
              <SelectTrigger className="h-7 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="formulas">Fórmulas</SelectItem>
                  <SelectItem value="produtos">Produtos</SelectItem>
                  <SelectItem value="horarios">Horários</SelectItem>
                  <SelectItem value="diasSemana">Dias da Semana</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          {apiLoading ? (
            <div className="text-gray-400 text-sm">Carregando...</div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip stats={stats} />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  innerRadius="45%"
                  labelLine={false}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400 text-sm">Sem dados</div>
          )}
        </div>
      </div>
    );
  }

  // Widget: Gráfico de Barras
  if (type === "bar-chart") {
    return (
      <div className="h-full flex flex-col">
        {onChartTypeChange && (
          <div className="mb-2">
            <Select value={chartType} onValueChange={(v) => onChartTypeChange(v as ChartType)}>
              <SelectTrigger className="h-7 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="formulas">Fórmulas</SelectItem>
                  <SelectItem value="produtos">Produtos</SelectItem>
                  <SelectItem value="horarios">Horários</SelectItem>
                  <SelectItem value="diasSemana">Dias da Semana</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex-1">
          {apiLoading ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">Carregando...</div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip stats={stats} />} />
                <Bar dataKey="value" fill="#ff2626ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">Sem dados</div>
          )}
        </div>
        {stats && stats.peakHour && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Pico: {stats.peakHour}
          </div>
        )}
        {stats && stats.peakDay && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Pico: {stats.peakDay}
          </div>
        )}
      </div>
    );
  }

  // Widget: Card de Estatística (usando endpoint de stats)
  if (type === "stats-card") {
    const [statsData, setStatsData] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
      const fetchStats = async () => {
        try {
          setStatsLoading(true);
          const params = new URLSearchParams();
          if (config?.filters?.formula) params.set('formula', String(config.filters.formula));
          if (config?.filters?.dataInicio) params.set('dataInicio', String(config.filters.dataInicio));
          if (config?.filters?.dataFim) params.set('dataFim', String(config.filters.dataFim));
          if (config?.filters?.codigo) params.set('codigo', String(config.filters.codigo));
          if (config?.filters?.numero) params.set('numero', String(config.filters.numero));

          const url = `http://localhost:3000/api/chartdata/stats?${params.toString()}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const body = await res.json();
          setStatsData(body);
        } catch (err) {
          console.error('Erro ao buscar estatísticas:', err);
        } finally {
          setStatsLoading(false);
        }
      };

      fetchStats();
    }, [JSON.stringify(config?.filters)]);

    const total = statsData?.totalGeral ?? (rows ? rows.reduce((sum, r) => {
      const v = Number(r.values?.[0] ?? r.Form1 ?? 0);
      return sum + (isNaN(v) ? 0 : v);
    }, 0) : 0);

    const recordCount = statsData?.totalRecords ?? rows?.length ?? 0;

    return (
      <div className="h-full flex flex-col justify-center items-center p-2">
        {statsLoading ? (
          <div className="text-gray-400 text-sm">Carregando...</div>
        ) : (
          <>
            <div className="text-xs text-gray-600 mb-1">Total Geral</div>
            <div className="text-2xl font-bold text-gray-900">
              {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} kg
            </div>
            <div className="text-sm text-gray-500 mt-1">{recordCount} registros</div>
            {statsData?.uniqueDays && (
              <div className="text-xs text-gray-400 mt-1">{statsData.uniqueDays} dias</div>
            )}
          </>
        )}
      </div>
    );
  }

  // Widget: Card de Métrica (usando endpoint de stats)
  if (type === "metric-card") {
    const [statsData, setStatsData] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
      const fetchStats = async () => {
        try {
          setStatsLoading(true);
          const params = new URLSearchParams();
          if (config?.filters?.formula) params.set('formula', String(config.filters.formula));
          if (config?.filters?.dataInicio) params.set('dataInicio', String(config.filters.dataInicio));
          if (config?.filters?.dataFim) params.set('dataFim', String(config.filters.dataFim));
          if (config?.filters?.codigo) params.set('codigo', String(config.filters.codigo));
          if (config?.filters?.numero) params.set('numero', String(config.filters.numero));

          const url = `http://localhost:3000/api/chartdata/stats?${params.toString()}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          const body = await res.json();
          setStatsData(body);
        } catch (err) {
          console.error('Erro ao buscar estatísticas:', err);
        } finally {
          setStatsLoading(false);
        }
      };

      fetchStats();
    }, [JSON.stringify(config?.filters)]);

    const count = statsData?.uniqueFormulas ?? (rows ? new Set(rows.map(r => r.Nome)).size : 0);
    const average = statsData?.average ?? 0;

    return (
      <div className="h-full flex flex-col justify-center items-center p-2">
        {statsLoading ? (
          <div className="text-gray-400 text-sm">Carregando...</div>
        ) : (
          <>
            <div className="text-xs text-gray-600 mb-1">Fórmulas Únicas</div>
            <div className="text-3xl font-bold text-red-600">{count}</div>
            {average > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Média: {average.toFixed(2)} kg
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Widget: Gráfico Semanal com Navegação
  if (type === "weekly-chart") {
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day;
      return new Date(now.setDate(diff));
    });

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

    const formatWeekRange = () => {
      const start = new Date(currentWeekStart);
      const end = new Date(currentWeekStart);
      end.setDate(end.getDate() + 6);
      
      const formatDate = (d: Date) => {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
      };
      
      return `${formatDate(start)} → ${formatDate(end)}`;
    };

    const goToPrevWeek = () => {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(newStart.getDate() - 7);
      setCurrentWeekStart(newStart);
    };

    const goToNextWeek = () => {
      const newStart = new Date(currentWeekStart);
      newStart.setDate(newStart.getDate() + 7);
      setCurrentWeekStart(newStart);
    };

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goToPrevWeek}
            className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
          >
            ◀
          </button>
          <span className="text-xs font-medium text-gray-700">
            {formatWeekRange()}
          </span>
          <button
            onClick={goToNextWeek}
            className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
          >
            ▶
          </button>
        </div>
        
        <div className="flex-1">
          {weekData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip stats={stats} />} />
                <Bar dataKey="value" fill="#ff2626ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Sem dados para esta semana
            </div>
          )}
        </div>
      </div>
    );
  }

  // Widget: Gráfico de Linha (Tendência ao longo do tempo)
  if (type === "line-chart") {
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
    
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
    
    const lineData = useMemo(() => {
      if (!rows) return [];
      
      const now = new Date();
      const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - daysBack);
      
      const dailyTotals: Record<string, number> = {};
      
      for (const r of rows) {
        if (!r.Dia) continue;
        const date = parseDia(r.Dia);
        if (!date || date < startDate) continue;
        
        const dateKey = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        const v = Number(r.values?.[0] ?? r.Form1 ?? 0);
        dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + (isNaN(v) ? 0 : v);
      }
      
      return Object.entries(dailyTotals)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
          const [dayA, monthA] = a.name.split('/').map(Number);
          const [dayB, monthB] = b.name.split('/').map(Number);
          return monthA !== monthB ? monthA - monthB : dayA - dayB;
        });
    }, [rows, timeRange]);

    return (
      <div className="h-full flex flex-col">
        <div className="mb-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lineData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9 }} 
                  angle={-45} 
                  textAnchor="end" 
                  height={50}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip stats={stats} />} />
                <Bar dataKey="value" fill="#ff2626ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Sem dados para o período
            </div>
          )}
        </div>
      </div>
    );
  }

  // Widget: Análise Customizada (Comparação multi-gráfico)
  if (type === "custom-analysis") {
    const [analysisType, setAnalysisType] = useState<"top10" | "comparison" | "distribution">("top10");
    
    const analysisData = useMemo(() => {
      if (!rows) return [];
      
      if (analysisType === "top10") {
        // Top 10 fórmulas por volume
        const sums: Record<string, number> = {};
        for (const r of rows) {
          if (!r.Nome) continue;
          const v = Number(r.values?.[0] ?? r.Form1 ?? 0);
          sums[r.Nome] = (sums[r.Nome] || 0) + (isNaN(v) ? 0 : v);
        }
        return Object.entries(sums)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);
      }
      
      if (analysisType === "comparison") {
        // Comparação produtos vs horários (simplificado)
        return aggregateByHour(rows).slice(0, 8);
      }
      
      if (analysisType === "distribution") {
        // Distribuição por faixas de valor
        const ranges = [
          { name: "0-100kg", min: 0, max: 100, count: 0 },
          { name: "100-500kg", min: 100, max: 500, count: 0 },
          { name: "500-1000kg", min: 500, max: 1000, count: 0 },
          { name: ">1000kg", min: 1000, max: Infinity, count: 0 },
        ];
        
        for (const r of rows) {
          const v = Number(r.values?.[0] ?? r.Form1 ?? 0);
          if (isNaN(v) || v <= 0) continue;
          
          for (const range of ranges) {
            if (v >= range.min && v < range.max) {
              range.count++;
              break;
            }
          }
        }
        
        return ranges.map(r => ({ name: r.name, value: r.count }));
      }
      
      return [];
    }, [rows, analysisType]);

    return (
      <div className="h-full flex flex-col">
        <div className="mb-2">
          <Select value={analysisType} onValueChange={(v: any) => setAnalysisType(v)}>
            <SelectTrigger className="h-7 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="top10">🏆 Top 10 Fórmulas</SelectItem>
                <SelectItem value="comparison">📊 Análise por Horário</SelectItem>
                <SelectItem value="distribution">📈 Distribuição por Faixa</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          {analysisData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisData} layout={analysisType === "top10" ? "vertical" : "horizontal"}>
                {analysisType === "top10" ? (
                  <>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={80} />
                  </>
                ) : (
                  <>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} />
                  </>
                )}
                <Tooltip content={<CustomTooltip stats={stats} />} />
                <Bar dataKey="value" fill="#ff2626ff" radius={analysisType === "top10" ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Sem dados para análise
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {analysisType === "top10" && "Maiores volumes de produção"}
          {analysisType === "comparison" && "Produção por horário do dia"}
          {analysisType === "distribution" && "Distribuição de registros por faixa"}
        </div>
      </div>
    );
  }

  // Widget: Tabela de Dados
  if (type === "table") {
    const [sortBy, setSortBy] = useState<"nome" | "valor" | "dia">("valor");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    
    const sortedRows = useMemo(() => {
      if (!rows) return [];
      
      const sorted = [...rows].sort((a, b) => {
        if (sortBy === "nome") {
          return sortOrder === "asc" 
            ? a.Nome.localeCompare(b.Nome)
            : b.Nome.localeCompare(a.Nome);
        }
        if (sortBy === "valor") {
          const aVal = Number(a.values?.[0] ?? a.Form1 ?? 0);
          const bVal = Number(b.values?.[0] ?? b.Form1 ?? 0);
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        if (sortBy === "dia") {
          return sortOrder === "asc"
            ? (a.Dia || "").localeCompare(b.Dia || "")
            : (b.Dia || "").localeCompare(a.Dia || "");
        }
        return 0;
      });
      
      return sorted.slice(0, 50);
    }, [rows, sortBy, sortOrder]);

    const toggleSort = (column: "nome" | "valor" | "dia") => {
      if (sortBy === column) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(column);
        setSortOrder("desc");
      }
    };

    return (
      <div className="h-full flex flex-col">
        <div className="mb-2 text-xs text-gray-500">
          {rows?.length || 0} registros • Mostrando top 50
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th 
                  className="px-2 py-1 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("nome")}
                >
                  Nome {sortBy === "nome" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-2 py-1 text-right cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("valor")}
                >
                  Valor {sortBy === "valor" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th 
                  className="px-2 py-1 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort("dia")}
                >
                  Dia {sortBy === "dia" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-2 py-1 text-left">Hora</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-1">{row.Nome}</td>
                  <td className="px-2 py-1 text-right font-medium">
                    {(row.values?.[0] || row.Form1 || 0).toFixed(2)} kg
                  </td>
                  <td className="px-2 py-1">{row.Dia || "-"}</td>
                  <td className="px-2 py-1 text-gray-500">{row.Hora || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
      Widget não configurado
    </div>
  );
}
