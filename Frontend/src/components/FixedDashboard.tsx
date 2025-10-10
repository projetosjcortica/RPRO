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
import { format as formatDateFn, format as formatDate } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Button } from './ui/button';
import { pt } from 'date-fns/locale';

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

  // Local UI state for independent date pickers and applied filters for each chart
  const [donutDateRange, setDonutDateRange] = useState<any>(undefined);
  const [donutFilters, setDonutFilters] = useState<any>({ dataInicio: filters?.dataInicio || '', dataFim: filters?.dataFim || '' });

  const [horariosDateRange, setHorariosDateRange] = useState<any>(undefined);
  const [horariosFilters, setHorariosFilters] = useState<any>({ dataInicio: filters?.dataInicio || '', dataFim: filters?.dataFim || '' });

  const [weeklyDateRange, setWeeklyDateRange] = useState<any>(undefined);
  const [weeklyFilters, setWeeklyFilters] = useState<any>({ dataInicio: filters?.dataInicio || '', dataFim: filters?.dataFim || '' });

  // Per-chart handlers
  const handleDonutDateChange = (range: any) => setDonutDateRange(range);
  const applyDonutFilters = () => {
    if (donutDateRange?.from && donutDateRange?.to) {
      const start = formatDate(donutDateRange.from, 'yyyy-MM-dd');
      const end = formatDate(donutDateRange.to, 'yyyy-MM-dd');
      setDonutFilters(prev => ({ ...prev, dataInicio: start, dataFim: end }));
    } else {
      setDonutFilters(prev => ({ ...prev, dataInicio: '', dataFim: '' }));
    }
  };
  const clearDonutFilters = () => { setDonutDateRange(undefined); setDonutFilters(prev => ({ ...prev, dataInicio: '', dataFim: '' })); };

  const handleHorariosDateChange = (range: any) => setHorariosDateRange(range);
  const applyHorariosFilters = () => {
    if (horariosDateRange?.from && horariosDateRange?.to) {
      const start = formatDate(horariosDateRange.from, 'yyyy-MM-dd');
      const end = formatDate(horariosDateRange.to, 'yyyy-MM-dd');
      setHorariosFilters(prev => ({ ...prev, dataInicio: start, dataFim: end }));
    } else {
      setHorariosFilters(prev => ({ ...prev, dataInicio: '', dataFim: '' }));
    }
  };
  const clearHorariosFilters = () => { setHorariosDateRange(undefined); setHorariosFilters(prev => ({ ...prev, dataInicio: '', dataFim: '' })); };

  const handleWeeklyDateChange = (range: any) => setWeeklyDateRange(range);
  const applyWeeklyFilters = () => {
    if (weeklyDateRange?.from && weeklyDateRange?.to) {
      const start = formatDate(weeklyDateRange.from, 'yyyy-MM-dd');
      const end = formatDate(weeklyDateRange.to, 'yyyy-MM-dd');
      setWeeklyFilters(prev => ({ ...prev, dataInicio: start, dataFim: end }));
    } else {
      setWeeklyFilters(prev => ({ ...prev, dataInicio: '', dataFim: '' }));
    }
  };
  const clearWeeklyFilters = () => { setWeeklyDateRange(undefined); setWeeklyFilters(prev => ({ ...prev, dataInicio: '', dataFim: '' })); };

  console.log(loadingResumo)

  const makePeriodText = (filt: any) => {
    const effective = { ...(filters || {}), ...(filt || {}) };
    if (!effective) return "Todos os períodos";
    const s = effective.dataInicio || "";
    const e = effective.dataFim || "";
    if (s && e) return `${s} → ${e}`;
    if (s) return `Desde ${s}`;
    if (e) return `Até ${e}`;
    return "Todos os períodos";
  };

  useEffect(() => {
    let mounted = true;
    const fetchResumo = async () => {
      setLoadingResumo(true);
      setResumoError(null);
      try {
        const proc = getProcessador();
        // Processador.getResumo expects (areaId?, nomeFormula?, dataInicio?, dataFim?, codigo?, numero?)
        // resumo follows the dashboard-level `filters` prop (not per-chart filters)
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


  // helper to filter rows by provided date range (dataInicio/dataFim are strings)
  const filterRowsByDateRange = (inputRows: Entry[] | null, overrideFilters?: any) => {
    if (!inputRows) return null;
    const effective = { ...(filters || {}), ...(overrideFilters || {}) };
    const s = effective?.dataInicio;
    const e = effective?.dataFim;
    if (!s && !e) return inputRows;

    const parseDate = (raw?: string | null) => {
      if (!raw) return null;
      const v = String(raw).trim();
      // yyyy-mm-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + 'T00:00:00');
      // dd-mm-yyyy or dd/mm/yyyy
      if (/^\d{2}[-\/]\d{2}[-\/]\d{4}$/.test(v)) {
        const sep = v.includes('/') ? '/' : '-';
        const parts = v.split(sep);
        const d = Number(parts[0]);
        const m = Number(parts[1]);
        const y = Number(parts[2]);
        return new Date(y, m - 1, d);
      }
      const parsed = new Date(v);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    const start = parseDate(s) || null;
    const end = parseDate(e) || null;

    return inputRows.filter((r) => {
      if (!r.Dia) return false;
      const d = parseDate(r.Dia);
      if (!d) return false;
      if (start && d < start) return false;
      if (end) {
        // include whole day for end date
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (d > endOfDay) return false;
      }
      return true;
    });
  };

  const filteredRowsForWeek = filterRowsByDateRange(rows, weeklyFilters);

  return (
    <div className="w-full h-full p-4 scrollbar-custom overflow-hidden">
      <div className="flex gap-6 justify-between scrollbar-custom overflow-hidden">
        <div className="flex w-full space-y-6 flex-col">
          {/* First row: Formulas Donut */}
          <Card className=" shadow-md border border-indigo-50 rounded-xl overflow-hidden h-90 w-full ">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <CardTitle className="text-sm font-semibold text-gray-900">Análise de Fórmulas</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={"w-47 justify-start text-left font-normal border border-black " + (!donutDateRange && "text-gray-400") }>
                        {donutDateRange?.from ? (
                          donutDateRange.to ? (
                            <>{formatDate(donutDateRange.from, 'dd/MM/yy')} - {formatDate(donutDateRange.to, 'dd/MM/yy')}</>
                          ) : (
                            formatDate(donutDateRange.from, 'dd/MM/yyyy')
                          )
                        ) : (
                          <span>Selecione um Período</span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <Calendar
                        mode="range"
                        locale={pt}
                        defaultMonth={donutDateRange?.from}
                        selected={donutDateRange}
                        onSelect={handleDonutDateChange}
                        numberOfMonths={1}
                      />
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" onClick={clearDonutFilters}>Limpar</Button>
                        <Button onClick={applyDonutFilters}>Aplicar</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent className=" flex flex-col h-[calc(100%-40px)]">
              <div className="flex-1 min-h-[250px]">
                <DonutChartWidget chartType="formulas" config={{ filters: { ...(filters || {}), ...(donutFilters || {}) } }} />
              </div>
            </CardContent>
          </Card>

          {/* Second row: Products & Hours */}
          <div className="flex gap-6">
            <Card className="shadow-md border border-indigo-50 rounded-xl overflow-hidden w-1/2 h-87 3xl:h-136">
              <CardHeader className="border-b border-gray-100 ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                    <CardTitle className="text-sm font-semibold text-gray-900">Horário de Produção</CardTitle>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={"w-47 justify-start text-left font-normal border border-black " + (!horariosDateRange && "text-gray-400") }>
                          {horariosDateRange?.from ? (
                            horariosDateRange.to ? (
                              <>{formatDate(horariosDateRange.from, 'dd/MM/yy')} - {formatDate(horariosDateRange.to, 'dd/MM/yy')}</>
                            ) : (
                              formatDate(horariosDateRange.from, 'dd/MM/yyyy')
                            )
                          ) : (
                            <span>Selecione um Período</span>
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <Calendar
                          mode="range"
                          locale={pt}
                          defaultMonth={horariosDateRange?.from}
                          selected={horariosDateRange}
                          onSelect={handleHorariosDateChange}
                          numberOfMonths={1}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" onClick={clearHorariosFilters}>Limpar</Button>
                          <Button onClick={applyHorariosFilters}>Aplicar</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 flex flex-col h-[calc(100%-40px)]">
                <div className="flex-1 min-h-[250px]">
                  <BarChartWidget chartType="horarios" config={{ filters: { ...(filters || {}), ...(horariosFilters || {}) } }} />
                </div>
              </CardContent>
            </Card>
          

            {/* Third row: Weekly Chart */}
            <Card className="bg-white shadow-md border border-indigo-50 rounded-xl overflow-hidden h-87 w-1/2 3xl:h-136 ">
              <CardHeader className="border-b border-gray-100 ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                    <CardTitle className="text-sm font-semibold text-gray-900">Produção Semanal</CardTitle>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={"w-47 justify-start text-left font-normal border border-black " + (!weeklyDateRange && "text-gray-400") }>
                          {weeklyDateRange?.from ? (
                            weeklyDateRange.to ? (
                              <>{formatDate(weeklyDateRange.from, 'dd/MM/yy')} - {formatDate(weeklyDateRange.to, 'dd/MM/yy')}</>
                            ) : (
                              formatDate(weeklyDateRange.from, 'dd/MM/yyyy')
                            )
                          ) : (
                            <span>Selecione um Período</span>
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto">
                        <Calendar
                          mode="range"
                          locale={pt}
                          defaultMonth={weeklyDateRange?.from}
                          selected={weeklyDateRange}
                          onSelect={handleWeeklyDateChange}
                          numberOfMonths={1}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" onClick={clearWeeklyFilters}>Limpar</Button>
                          <Button onClick={applyWeeklyFilters}>Aplicar</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardHeader>
              <CardContent className=" flex flex-col h-[calc(100%-40px)]">
                <div className="flex-1 min-h-[250px]">
                  <WeeklyChartWidget rows={filteredRowsForWeek} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Sidebar  */}
        <div className=" w-130 space-y-6 max-h-screen md:max-h-[calc(100vh-2rem)] overflow-auto thin-red-scrollbar">
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
                      <div className="w-80 h-28 max-h-28 rounded-lg flex flex-col justify-center p-2 shadow-md/16">
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
                      <div className=" w-80 h-28 max-h-28 rounded-lg flex flex-col justify-center shadow-md/16">
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