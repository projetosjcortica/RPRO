import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import FilterBar, { type FilterConfig, type FilterValues } from "./components/FilterBar";
import FixedDashboard from "./components/FixedDashboard";

// Tipos básicos
type Entry = {
  Nome: string;
  values: number[];
  Dia?: string;
  Hora?: string;
  Form1?: number;
  Form2?: number;
};

export type ChartType = "formulas" | "produtos" | "horarios" | "diasSemana";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Entry[] | null>(null);
  const [filtros, setFiltros] = useState<FilterValues>({});

  // Fetch chart data from backend (mantido para compatibilidade)
  const fetchChartData = async (f: FilterValues) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (f.formula) params.set('formula', String(f.formula));
      if (f.dataInicio) params.set('dataInicio', String(f.dataInicio));
      if (f.dataFim) params.set('dataFim', String(f.dataFim));
      if (f.codigo) params.set('codigo', String(f.codigo));
      if (f.numero) params.set('numero', String(f.numero));

      const url = `http://localhost:3000/api/chartdata?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const rowsResp = Array.isArray(body.rows) ? body.rows as Entry[] : [];
      setRows(rowsResp);
      setLoading(false);
    } catch (err) {
      console.error('Falha ao carregar chartdata:', err);
      setRows([]);
      setLoading(false);
    }
  };

  // Configuração dos filtros
  const filterConfig: FilterConfig[] = [
    {
      key: "codigo",
      label: "Código",
      type: "select",
      placeholder: "Todos os códigos",
      fetchOptions: async () => {
        try {
          const res = await fetch("http://localhost:3000/api/filtrosAvaliable");
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data.codigos) ? data.codigos.map((c: any) => String(c)) : [];
        } catch {
          return [];
        }
      },
    },
    {
      key: "numero",
      label: "Número",
      type: "select",
      placeholder: "Todos os números",
      fetchOptions: async () => {
        try {
          const res = await fetch("http://localhost:3000/api/filtrosAvaliable");
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data.numeros) ? data.numeros.map((n: any) => String(n)) : [];
        } catch {
          return [];
        }
      },
    },
    {
      key: "daterange",
      label: "Período",
      type: "daterange",
    },
  ];

  // Load initially and when filtros change
  useEffect(() => {
    void fetchChartData(filtros);
  }, [JSON.stringify(filtros)]);

  // Renderizar o layout conforme o esboço
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-auto">
      <div className="max-w-[1920px] mx-auto p-4 md:p-6">
        {/* Painel de Filtros (sempre visível no topo) */}
         
        {/* Dashboard Fixo */}
        <FixedDashboard rows={rows} filters={filtros} />
      </div>
    </div>
  );
}