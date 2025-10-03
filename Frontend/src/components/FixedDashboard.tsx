import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DonutChartWidget,
  BarChartWidget,
  WeeklyChartWidget,
} from "./Widgets";
import ProductsTable from './ProductsTable';
import { useEffect, useState } from 'react';
import { getProcessador } from '../Processador';

type Entry = {
  Nome: string;
  values: number[];
  Dia?: string;
  Hora?: string;
  Form1?: number;
  Form2?: number;
};

interface FixedDashboardProps {
  rows: Entry[] | null;
  filters?: any;
}

export default function FixedDashboard({ rows, filters }: FixedDashboardProps) {
  // Sidebar will show backend resumo data (more accurate and normalized)
  const [resumo, setResumo] = useState<any | null>(null);
  const [loadingResumo, setLoadingResumo] = useState(false);
  const [resumoError, setResumoError] = useState<string | null>(null);

  const periodText = (() => {
    if (!filters) return "Todos os períodos";
    const s = filters.dataInicio || "";
    const e = filters.dataFim || "";
    if (s && e) return `${s} → ${e}`;
    if (s) return `Desde ${s}`;
    if (e) return `Até ${e}`;
    return "Todos os períodos";
  })();

  useEffect(() => {
    let mounted = true;
    const fetchResumo = async () => {
      setLoadingResumo(true);
      setResumoError(null);
      try {
        const proc = getProcessador();
        // Processador.getResumo expects (areaId?, nomeFormula?, dataInicio?, dataFim?, codigo?, numero?)
        const result = await proc.getResumo(undefined, filters?.nomeFormula || undefined, filters?.dataInicio || undefined, filters?.dataFim || undefined, filters?.codigo || undefined, filters?.numero || undefined);
        if (mounted) setResumo(result || null);
      } catch (err: any) {
        console.error('Erro ao buscar resumo:', err);
        if (mounted) setResumoError(String(err?.message || err));
      } finally {
        if (mounted) setLoadingResumo(false);
      }
    };

    fetchResumo();
    return () => { mounted = false; };
  }, [filters]);
 

  return (
    <div className="w-full h-full p-4 space-y-6 bg-gray-50 scrollbar-custom overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 scrollbar-custom overflow-hidden">
        {/* Main area - 8 columns */}
        <div className="lg:col-span-8 space-y-6 ">
          {/* First row: Formulas Donut */}
          <Card className="bg-white shadow-md border border-indigo-50 rounded-xl overflow-hidden h-[400px]">
            <CardHeader className="border-b border-gray-100 pb-2 pt-3 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <CardTitle className="text-sm font-semibold text-gray-900">Análise de Fórmulas</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Período:</span>
                  <span className="text-xs font-medium text-gray-700">{periodText}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col h-[calc(100%-40px)]">
              <div className="flex-1 min-h-[250px]">
                <DonutChartWidget chartType="formulas" config={{ filters }} />
              </div>
            </CardContent>
          </Card>

          {/* Second row: Products & Hours */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card className="bg-white shadow-md border border-indigo-50 rounded-xl overflow-hidden h-[400px]">
              <CardHeader className="border-b border-gray-100 pb-2 pt-3 px-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <CardTitle className="text-sm font-semibold text-gray-900">Horário de Produção</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col h-[calc(100%-40px)]">
                <div className="flex-1 min-h-[250px]">
                  <BarChartWidget chartType="formulas" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Third row: Weekly Chart */}
          <Card className="bg-white shadow-md border border-indigo-50 rounded-xl overflow-hidden h-[400px]">
            <CardHeader className="border-b border-gray-100 pb-2 pt-3 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <CardTitle className="text-sm font-semibold text-gray-900">Produção Semanal</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col h-[calc(100%-40px)]">
              <div className="flex-1 min-h-[250px]">
                <WeeklyChartWidget rows={rows} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 4 columns */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white shadow-md border border-indigo-50 rounded-xl overflow-hidden">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <CardTitle className="text-sm font-semibold">Resumo de Produção</CardTitle>
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  {new Date().toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long',
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600">
                    {loadingResumo ? (
                      '...'
                    ) : resumo && typeof resumo.totalPesos === 'number' ? (
                      Number(resumo.totalPesos).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                    ) : (
                      '—'
                    )}
                  </div>
                  <div className="text-gray-600 font-medium">Total Produzido (kg)</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600">
                    {loadingResumo ? '...' : resumo && typeof resumo.batitdasTotais === 'number' ? resumo.batitdasTotais : '—'}
                  </div>
                  <div className="text-gray-600 font-medium">Batidas</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4"> 
                <div className="mb-3 text-sm text-gray-700">
                  Período: <span className="font-medium">{periodText}</span>
                </div>

                {resumoError ? (
                  <div className="text-sm text-red-600">Erro ao carregar resumo: {resumoError}</div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-700">Horas: <span className="font-medium">{resumo?.horaInicial || '—'} — {resumo?.horaFinal || '—'}</span></div>
                    <div className="text-sm text-gray-700">Período: <span className="font-medium">{resumo?.periodoInicio ? resumo.periodoInicio : '—'} → {resumo?.periodoFim ? resumo.periodoFim : '—'}</span></div>

                    {/* First/Last day ranges */}
                    {resumo?.firstDayRange?.date && (
                      <div className="text-sm text-gray-700">{resumo.firstDayRange.date} → {resumo.firstDayRange.firstTime || '—'} &nbsp;&gt;&gt;&nbsp; {resumo.firstDayRange.lastTime || '—'}</div>
                    )}
                    {resumo?.lastDayRange?.date && (
                      <div className="text-sm text-gray-700">{resumo.lastDayRange.date} → {resumo.lastDayRange.firstTime || '—'} &nbsp;&gt;&gt;&nbsp; {resumo.lastDayRange.lastTime || '—'}</div>
                    )}

                    <div>
                      <div className="text-xs text-gray-500 mb-2">Fórmulas mais usadas</div>
                      <div className="space-y-2">
                        {loadingResumo ? (
                          <div className="text-sm text-gray-500">Carregando...</div>
                        ) : (
                          (resumo && resumo.formulasUtilizadas) ? (
                            Object.values(resumo.formulasUtilizadas as any).slice(0,5).map((f: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="truncate pr-2">{f.nome || f.numero || '—'}</div>
                                <div className="font-medium">{f.somatoriaTotal != null ? Number(f.somatoriaTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : f.quantidade}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-500">Nenhuma fórmula</div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <ProductsTable filters={filters} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Production Metrics */}
          {/* <Card className="bg-white shadow-md border border-indigo-50 rounded-xl overflow-hidden">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                <CardTitle className="text-sm font-semibold">Indicadores de Produção</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-700">Eficiência</div>
                  <div className="text-red-600 font-bold">86,5%</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-700">OEE (Overall Equipment Effectiveness)</div>
                  <div className="text-red-600 font-bold">78,2%</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-700">Tempo de parada</div>
                  <div className="text-red-600 font-bold">4,2h</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="text-gray-700">Custo médio</div>
                  <div className="text-red-600 font-bold">R$ 14,80/kg</div>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}