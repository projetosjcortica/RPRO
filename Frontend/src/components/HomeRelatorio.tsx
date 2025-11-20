import { useEffect, useState } from "react";
import FixedDashboard from "./FixedDashboard";

// Tipos básicos
type Entry = {
  Nome: string;
  values: number[];
  Dia?: string;
  Hora?: string;
  Form1?: number;
  Form2?: number;
};

export default function HomeRelatorio() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Entry[] | null>(null);
  const [filtros] = useState<any>({});

  // Fetch chart data from backend
  const fetchChartData = async (f: any) => {
    try {
      setLoading(true);
      
      const loadData = async () => {
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
        return rowsResp;
      };

      await loadData();
    } catch (err) {
      console.error('Falha ao carregar chartdata:', err);
      setRows([]);
      setLoading(false);
    }
  };

  // Load initially and when filtros change
  useEffect(() => {
    void fetchChartData(filtros);
  }, [JSON.stringify(filtros)]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className=" text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-auto">
      <div className="h-full">
        <FixedDashboard rows={rows} filters={filtros} />
      </div>
    </div>
  );
}
