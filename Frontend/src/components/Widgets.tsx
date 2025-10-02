import { useMemo, useState, useEffect } from "react";
import { Pie, PieChart, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
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

const COLORS = ["#ff2626ff", "#5e5e5eff", "#d4d4d4ff", "#ffa8a8ff", "#1b1b1bff"];

// Hook para buscar dados do backend
const useChartData = (chartType: ChartType, filters?: any) => {
  const [data, setData] = useState<ChartDatum[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters?.formula) params.set('formula', String(filters.formula));
        if (filters?.dataInicio) params.set('dataInicio', String(filters.dataInicio));
        if (filters?.dataFim) params.set('dataFim', String(filters.dataFim));
        if (filters?.codigo) params.set('codigo', String(filters.codigo));
        if (filters?.numero) params.set('numero', String(filters.numero));

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
const CustomTooltip = ({ active, payload, label, stats }: any) => {
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
        <p className="text-sm font-bold text-gray-900">{label}</p>
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

// COMPONENTE: DonutChart
export function DonutChartWidget({ chartType = "produtos", config }: { chartType?: ChartType; config?: any }) {
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

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            labelLine={false}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip stats={stats} />} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// COMPONENTE: BarChart
export function BarChartWidget({ chartType = "horarios", config }: { chartType?: ChartType; config?: any }) {
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
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={60} />
          <Tooltip content={<CustomTooltip stats={stats} />} />
          <Bar dataKey="value" fill="#ff2626ff" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// COMPONENTE: WeeklyChart
export function WeeklyChartWidget({ rows }: { rows: Entry[] | null }) {
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
    return `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')} → ${end.getDate().toString().padStart(2, '0')}/${(end.getMonth() + 1).toString().padStart(2, '0')}`;
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
      <div className="flex items-center justify-between mb-3 px-2">
        <button
          onClick={goToPrevWeek}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Semana anterior"
        >
          <span className="text-xl">◀</span>
        </button>
        <span className="text-sm font-medium text-gray-700">{formatWeekRange()}</span>
        <button
          onClick={goToNextWeek}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Próxima semana"
        >
          <span className="text-xl">▶</span>
        </button>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
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

// COMPONENTE: Table
export function TableWidget({ rows }: { rows: Entry[] | null }) {
  const [sortBy, setSortBy] = useState<'nome' | 'valor' | 'dia'>('valor');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const tableData = useMemo(() => {
    if (!rows) return [];

    const mapped = rows.map(r => ({
      nome: (r.Nome || 'Sem nome').toString(),
      valor: Number(r.values?.[0] ?? r.Form1 ?? 0),
      dia: r.Dia || '',
      hora: r.Hora || ''
    })).filter(item => item.valor > 0);

    const total = mapped.reduce((s, it) => s + it.valor, 0) || 0.000001;

    const data = mapped.map(it => ({ ...it, percent: (it.valor / total) * 100 }));

    data.sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'valor') return (a.valor - b.valor) * modifier;
      if (sortBy === 'nome') return a.nome.localeCompare(b.nome) * modifier;
      if (sortBy === 'dia') return a.dia.localeCompare(b.dia) * modifier;
      return 0;
    });

    // Return top 20 for simplicity
    return data.slice(0, 20);
  }, [rows, sortBy, sortOrder]);

  const toggleSort = (col: 'nome' | 'valor' | 'dia') => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  if (!tableData.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            <th 
              className="px-3 py-2 text-left cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSort('nome')}
            >
              Nome {sortBy === 'nome' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-3 py-2 text-right cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSort('valor')}
            >
              Valor {sortBy === 'valor' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-3 py-2 text-right">% do total</th>
            <th 
              className="px-3 py-2 text-center cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => toggleSort('dia')}
            >
              Dia {sortBy === 'dia' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-3 py-2 text-center">Hora</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="px-3 py-2 max-w-[220px] truncate">{item.nome}</td>
              <td className="px-3 py-2 text-right font-medium text-red-600">
                {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
              </td>
              <td className="px-3 py-2 text-right text-gray-600">{item.percent.toFixed(1)}%</td>
              <td className="px-3 py-2 text-center text-gray-600">{item.dia}</td>
              <td className="px-3 py-2 text-center text-gray-600">{item.hora}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
