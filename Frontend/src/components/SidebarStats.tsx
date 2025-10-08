import { useEffect, useState } from "react";

type Filters = Record<string, any> | undefined;

function fmt(n?: number) {
  if (n == null || isNaN(n)) return "0,00";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SidebarStats({ filters }: { filters?: Filters }) {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters?.formula) params.set("formula", String(filters.formula));
        if (filters?.dataInicio) params.set("dataInicio", String(filters.dataInicio));
        if (filters?.dataFim) params.set("dataFim", String(filters.dataFim));
        if (filters?.codigo) params.set("codigo", String(filters.codigo));
        if (filters?.numero) params.set("numero", String(filters.numero));

        const statsRes = await fetch(`http://localhost:3000/api/chartdata/stats?${params.toString()}`);
        const statsBody = statsRes.ok ? await statsRes.json() : null;

        const prodRes = await fetch(`http://localhost:3000/api/chartdata/produtos?${params.toString()}`);
        const prodBody = prodRes.ok ? await prodRes.json() : null;

        // normalize
        setStats(statsBody || {});

        const list = Array.isArray(prodBody?.chartData) ? prodBody.chartData : [];
        const normalized = list
          .map((p: any) => ({ name: p.name ?? p.label ?? "-", value: Number(p.value || 0) }))
          .sort((a: any, b: any) => b.value - a.value)
          .slice(0, 20);

        setProducts(normalized);
      } catch (err) {
        console.error(err);
        setStats(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [JSON.stringify(filters || {})]);

  const total = stats?.total ?? stats?.totalGeral ?? stats?.totalKg ?? 0;
  const batidas = stats?.totalRecords ?? stats?.batidas ?? 0;
  const inicio = stats?.dataInicio || stats?.startDate || filters?.dataInicio || "--";
  const fim = stats?.dataFim || stats?.endDate || filters?.dataFim || "--";

  return (
    <aside className="col-span-12 lg:col-span-3">
      <div className="space-y-4 sticky top-6">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{fmt(total)} kg</div>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
            <div className="bg-gray-50 p-2 rounded">Batidas<br /><span className="font-bold text-gray-800">{batidas}</span></div>
            <div className="bg-gray-50 p-2 rounded">Período inicial<br /><span className="font-bold text-gray-800">{inicio}</span></div>
            <div className="bg-gray-50 p-2 rounded col-span-2">Período final<br /><span className="font-bold text-gray-800">{fim}</span></div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-800">Produtos</div>
            <div className="text-xs text-gray-500">Quantidade</div>
          </div>
          <div className="max-h-[300px] overflow-auto space-y-2">
            {loading ? (
              <div className="text-sm text-gray-500">Carregando...</div>
            ) : products.length ? (
              products.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="text-gray-700 truncate pr-2">{p.name}</div>
                  <div className="text-gray-900 font-medium">{fmt(p.value)} kg</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">Nenhum produto</div>
            )}
          </div>

          <div className="mt-4">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">Gerar PDF</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
