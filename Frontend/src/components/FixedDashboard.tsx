import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DonutChartWidget,
  BarChartWidget,
  WeeklyChartWidget,
} from "./Widgets";
import ProductsTable from './ProductsTable';
import { useEffect, useState } from 'react';
import { getProcessador } from '../Processador';
import { Separator } from "./ui/separator";
import { format as formatDateFn } from 'date-fns';

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

  console.log(loadingResumo)

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
 
const formatShortDate = (raw?: string | null) => {
    if (!raw) return "";
    const s = String(raw).trim();
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split('-').map(Number);
        return formatDateFn(new Date(y, m - 1, d), 'dd/MM/yy');
      }
      if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
        const [d, m, y] = s.split('-').map(Number);
        return formatDateFn(new Date(y, m - 1, d), 'dd/MM/yy');
      }
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) return formatDateFn(parsed, 'dd/MM/yy');
      return s;
    } catch (e) {
      return s;
    }
  };


  return (
    <div className="w-full h-full p-4 scrollbar-custom overflow-hidden">
      <div className="flex gap-6 justify-between scrollbar-custom overflow-hidden">
        {/* Main area - 8 columns */}
        <div className="flex w-full space-y-6 flex-col">
          {/* First row: Formulas Donut */}
          <Card className=" shadow-md border border-indigo-50 rounded-xl overflow-hidden h-[400px] w-full">
            <CardHeader className="border-b border-gray-100 pb-2 pt-3 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <CardTitle className="text-sm font-semibold text-gray-900">Análise de Fórmulas</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">Período:</span>
                  <span className="text-xs text-gray-400">{periodText}</span>
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
          <div className="flex gap-6">
            <Card className="shadow-md border border-indigo-50 rounded-xl overflow-hidden h-[400px] w-full">
              <CardHeader className="border-b border-gray-100 pb-2 pt-3 px-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <CardTitle className="text-sm font-semibold text-gray-900">Horário de Produção</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col h-[calc(100%-40px)]">
                <div className="flex-1 min-h-[250px]">
                  <BarChartWidget chartType="horarios" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Third row: Weekly Chart */}
          <Card className="bg-white shadow-md border border-indigo-50 rounded-xl overflow-hidden h-[400px] w-full">
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

        {/* Sidebar  */}
        <div className=" max-w-100 space-y-6 max-h-screen">
          <Card className="bg-white shadow-md border border-indigo-50 rounded-xl overflow-hidden">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <CardTitle className="text-sm font-semibold">Resumo de Produção</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">

                {resumoError ? (
                  <div className="text-sm text-red-600">Erro ao carregar resumo: {resumoError}</div>
                ) : (
                  <div className="space-y-3 flex flex-col gap-3">
                    <div id="total+horas" className="flex flex-col items-center justify-between mb-6 gap-2">
                      <div className="w-80 h-25 max-h-25 rounded-lg flex flex-col justify-center p-2 shadow-md/16">
                        <p className="text-center text-lg font-bold">Total:  {""}
                          {(resumo && typeof resumo.totalPesos === "number"
                            ? resumo.totalPesos
                            : "..."
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          })} kg
                        </p>
                        <p className="text-center text-sm text-gray-400 font-regular">Batidas:  {""}
                          {resumo && typeof resumo.batitdasTotais === "number"
                            ? resumo.batitdasTotais
                            : "..."}
                        </p>
                      </div>
                      <div className=" w-80 h-25 max-h-25 rounded-lg flex flex-col justify-center shadow-md/16">
                        <p className="text-center font-bold">Período:  {""}</p>
                          <div className="flex flex-row justify-around px-8 gap-4">
                            <div className="flex flex-col justify-center gap-1">
                              <p className="text-center font-bold text-lg">
                                {resumo && resumo.periodoInicio
                                  ? formatShortDate(resumo.periodoInicio)
                                  :  "--/--/--"}
                              </p>
                              <p
                                className="text-center text-sm text-gray-400 font-regular">
                                {resumo?.firstDayRange?.date && (
                                  <div className="text-sm text-gray-400">{resumo.firstDayRange.firstTime || '—'} <Separator orientation="vertical"/> {resumo.firstDayRange.lastTime || '—'}</div>
                                )}
                              </p>
                          </div>
                          
                          <Separator orientation="vertical"/>
                          
                          <div className="flex flex-col justify-center gap-1">
                              
                              <p 
                                className="text-center font-bold text-lg">
                                {resumo && resumo.periodoFim
                                  ? formatShortDate(resumo.periodoFim)
                                  :  "--/--/--"}
                              </p>
                              <p 
                                className="text-center text-sm text-gray-400 font-regular">
                                {resumo?.lastDayRange?.date && (
                                  <div className="text-sm text-gray-400">{resumo.lastDayRange.firstTime || '—'} <Separator orientation="vertical"/> {resumo.lastDayRange.lastTime || '—'}</div>
                                )}
                              </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* <div id="formulas">
                      <div className="text-lg font-medium text-black mb-2">Fórmulas mais usadas</div>
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
                    </div> */}

                    <div id="produtos" className="pt-2 flex flex-col min-h-0">
                      <div className="flex-1 overflow-hidden">
                        <ProductsTable filters={filters} />
                      </div>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}