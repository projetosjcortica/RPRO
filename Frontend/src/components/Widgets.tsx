/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState, useEffect } from "react";
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

// Hook para buscar dados do backend
export const useChartData = (chartType: ChartType, filters?: any) => {
  const [data, setData] = useState<ChartDatum[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        // Só adiciona parâmetros se não forem vazios ou undefined
        if (filters?.formula && String(filters.formula).trim()) params.set('formula', String(filters.formula));
        if (filters?.dataInicio && String(filters.dataInicio).trim()) params.set('dataInicio', String(filters.dataInicio));
        if (filters?.dataFim && String(filters.dataFim).trim()) params.set('dataFim', String(filters.dataFim));
        if (filters?.codigo && String(filters.codigo).trim()) params.set('codigo', String(filters.codigo));
        if (filters?.numero && String(filters.numero).trim()) params.set('numero', String(filters.numero));

        const url = `http://localhost:3000/api/chartdata/${chartType}?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        
        setData(body.chartData || []);
        setStats(body);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setData([]);
        setStats(null);
        setLoading(false);
      }
    };

    if (chartType) {
      void fetchData();
    }
  }, [chartType, JSON.stringify(filters)]);

  return { data, loading, stats };
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
  const { data, loading, stats } = useChartData(chartType, config?.filters);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
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
  const { data, loading, stats } = useChartData(chartType, config?.filters);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Nenhum dado disponível
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
    <div className="h-full w-full">
      <ResponsiveContainer  width="100%" height="87%">
        <BarChart data={data} layout="horizontal" margin={{ left: 20 }}>
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
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={weekData}>
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
 