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

  // Inicializar com o dia anterior
  const [horariosDateRange, setHorariosDateRange] = useState<any>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return { from: yesterday, to: yesterday };
  });
  
  const [horariosFilters, setHorariosFilters] = useState<any>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = formatDate(yesterday, 'yyyy-MM-dd');
    return { dataInicio: dateStr, dataFim: dateStr };
  });

  // Inicializar com a semana atual
  const [weeklyDateRange, setWeeklyDateRange] = useState<any>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
    return { from: startOfWeek, to: endOfWeek };
  });
  
  const [weeklyFilters, setWeeklyFilters] = useState<any>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
    return {
      dataInicio: formatDate(startOfWeek, 'yyyy-MM-dd'),
      dataFim: formatDate(endOfWeek, 'yyyy-MM-dd')
    };
  });

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

  const handleHorariosDateChange = (range: any) => {
    if (!range) {
      // Voltar para o dia anterior
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setHorariosDateRange({ from: yesterday, to: yesterday });
      return;
    }
    setHorariosDateRange(range);
  };
  
  const applyHorariosFilters = () => {
    if (horariosDateRange?.from) {
      const start = formatDate(horariosDateRange.from, 'yyyy-MM-dd');
      const end = horariosDateRange.to 
        ? formatDate(horariosDateRange.to, 'yyyy-MM-dd')
        : formatDate(horariosDateRange.from, 'yyyy-MM-dd');
      setHorariosFilters(prev => ({ ...prev, dataInicio: start, dataFim: end }));
    } else {
      setHorariosFilters(prev => ({ ...prev, dataInicio: '', dataFim: '' }));
    }
  };
  
  const clearHorariosFilters = () => { 
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setHorariosDateRange({ from: yesterday, to: yesterday });
    const dateStr = formatDate(yesterday, 'yyyy-MM-dd');
    setHorariosFilters(prev => ({ ...prev, dataInicio: dateStr, dataFim: dateStr }));
  };

  const handleWeeklyDateChange = (date: Date | undefined) => {
    if (!date) {
      // Voltar para a semana atual
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
      
      const weekRange = { from: startOfWeek, to: endOfWeek };
      setWeeklyDateRange(weekRange);
      
      const start = formatDate(startOfWeek, 'yyyy-MM-dd');
      const end = formatDate(endOfWeek, 'yyyy-MM-dd');
      setWeeklyFilters(prev => ({ ...prev, dataInicio: start, dataFim: end }));
      return;
    }
    // Calcular início e fim da semana (domingo a sábado)
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + (6 - dayOfWeek));
    
    const weekRange = { from: startOfWeek, to: endOfWeek };
    setWeeklyDateRange(weekRange);
    
    // Aplicar filtros imediatamente
    const start = formatDate(startOfWeek, 'yyyy-MM-dd');
    const end = formatDate(endOfWeek, 'yyyy-MM-dd');
    setWeeklyFilters(prev => ({ ...prev, dataInicio: start, dataFim: end }));
  };
  
  const clearWeeklyFilters = () => { 
    // Voltar para a semana atual
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
    
    const weekRange = { from: startOfWeek, to: endOfWeek };
    setWeeklyDateRange(weekRange);
    
    const start = formatDate(startOfWeek, 'yyyy-MM-dd');
    const end = formatDate(endOfWeek, 'yyyy-MM-dd');
    setWeeklyFilters(prev => ({ ...prev, dataInicio: start, dataFim: end }));
  };

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

  // Floating right sidebar with donuts and interactive highlight
  const [sideOpen, setSideOpen] = useState<boolean>(false);
  const [highlightProduto, setHighlightProduto] = useState<string | null>(null);
  const [highlightFormula, setHighlightFormula] = useState<string | null>(null);

  // Open sidebar automatically when filters change (search performed)
  useEffect(() => {
    if (filters && Object.keys(filters).some(k => !!(filters as any)[k])) {
      setSideOpen(true);
    }
  }, [JSON.stringify(filters)]);

  return (
    <div className="w-full h-full p-4 scrollbar-custom overflow-hidden relative">
      <div className="flex gap-6 justify-between scrollbar-custom overflow-hidden pr-[0px] md:pr-[0px]">
        <div className="flex w-full space-y-6 flex-col mr-0 md:mr-[0px]">
          {/* First row: Formulas Donut */}
          <Card className=" shadow-md border border-indigo-50 rounded-xl overflow-hidden h-[400px] w-full">
            <CardHeader className="border-b border-gray-100 pb-2 pt-3 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <CardTitle className="text-sm font-semibold text-gray-900">Análise de Fórmulas</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={"w-44 justify-start text-left font-normal border border-black " + (!donutDateRange && "text-gray-400") }>
                        {donutDateRange?.from ? (
                          donutDateRange.to ? (
                            <>{formatDate(donutDateRange.from, 'dd/MM/yy')} - {formatDate(donutDateRange.to, 'dd/MM/yy')}</>
                          ) : (
                            formatDate(donutDateRange.from, 'dd/MM/yyyy')
                          )
                        ) : (
                          <span>Período</span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="end">
                      <Calendar
                        mode="range"
                        locale={pt}
                        defaultMonth={donutDateRange?.from}
                        selected={donutDateRange}
                        onSelect={handleDonutDateChange}
                        numberOfMonths={1}
                      />
                      <div className="flex gap-2 mt-2 px-1">
                        <Button variant="outline" onClick={clearDonutFilters} size="sm" className="flex-1">
                          Limpar
                        </Button>
                        <Button onClick={applyDonutFilters} size="sm" className="flex-1">
                          Aplicar
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <span className="text-xs text-gray-400">{makePeriodText(donutFilters)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col h-[calc(100%-40px)]">
              <div className="flex-1 min-h-[250px]">
                <DonutChartWidget chartType="formulas" config={{ filters: { ...(filters || {}), ...(donutFilters || {}) } }} />
              </div>
            </CardContent>
          </Card>

          {/* Second row: Horarios & Weekly */}
          <div className="flex gap-6">
            <Card className="shadow-md border border-indigo-50 rounded-xl overflow-hidden h-[400px] w-1/2">
              <CardHeader className="border-b border-gray-100 pb-2 pt-3 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                    <CardTitle className="text-sm font-semibold text-gray-900">Horário de Produção</CardTitle>
                    {horariosDateRange?.from && (
                      <span className="text-xs text-gray-500 font-normal">
                        ({formatDate(horariosDateRange.from, 'dd/MM')}
                        {horariosDateRange.to && horariosDateRange.to.getTime() !== horariosDateRange.from.getTime() 
                          ? ` - ${formatDate(horariosDateRange.to, 'dd/MM')}` 
                          : ''})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={"w-44 justify-start text-left font-normal border border-black " + (!horariosDateRange && "text-gray-400") }>
                          {horariosDateRange?.from ? (
                            horariosDateRange.to ? (
                              <>{formatDate(horariosDateRange.from, 'dd/MM/yy')} - {formatDate(horariosDateRange.to, 'dd/MM/yy')}</>
                            ) : (
                              formatDate(horariosDateRange.from, 'dd/MM/yy')
                            )
                          ) : (
                            <span>Selecione o período</span>
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="end">
                        <Calendar
                          mode="range"
                          locale={pt}
                          defaultMonth={horariosDateRange?.from}
                          selected={horariosDateRange}
                          onSelect={handleHorariosDateChange}
                          numberOfMonths={1}
                        />
                        <div className="flex gap-2 mt-2 px-1">
                          <Button variant="outline" onClick={clearHorariosFilters} size="sm" className="flex-1">
                            Dia Anterior
                          </Button>
                          <Button onClick={applyHorariosFilters} size="sm" className="flex-1">
                            Aplicar
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col h-[calc(100%-60px)]">
                <div className="flex-1 min-h-[250px]">
                  <BarChartWidget chartType="horarios" config={{ filters: { ...(filters || {}), ...(horariosFilters || {}) } }} />
                </div>
              </CardContent>
            </Card>

            {/* Third row: Weekly Chart */}
            <Card className="bg-white shadow-md border border-indigo-50 rounded-xl overflow-hidden h-[400px] w-1/2">
              <CardHeader className="border-b border-gray-100 pb-2 pt-3 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                    <CardTitle className="text-sm font-semibold text-gray-900">Produção Semanal</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const prevWeekStart = new Date(weeklyDateRange.from);
                        prevWeekStart.setDate(prevWeekStart.getDate() - 7);
                        handleWeeklyDateChange(prevWeekStart);
                      }}
                      className="h-8 px-2"
                    >
                      ← Anterior
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={"w-44 justify-start text-left font-normal border border-black " + (!weeklyDateRange && "text-gray-400")}>
                          {weeklyDateRange?.from && weeklyDateRange?.to ? (
                            <>{formatDate(weeklyDateRange.from, 'dd/MM/yy')} - {formatDate(weeklyDateRange.to, 'dd/MM/yy')}</>
                          ) : (
                            <span>Selecione uma semana</span>
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" align="end">
                        <Calendar
                          mode="single"
                          locale={pt}
                          selected={weeklyDateRange?.from}
                          onSelect={(date) => handleWeeklyDateChange(date)}
                          numberOfMonths={1}
                        />
                        <div className="flex gap-2 mt-2 px-1">
                          <Button variant="outline" onClick={clearWeeklyFilters} size="sm" className="w-full">
                            Semana Atual
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const nextWeekStart = new Date(weeklyDateRange.from);
                        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
                        handleWeeklyDateChange(nextWeekStart);
                      }}
                      className="h-8 px-2"
                    >
                      Próxima →
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex flex-col h-[calc(100%-60px)]">
                <div className="flex-1 min-h-[250px]">
                  <WeeklyChartWidget rows={filteredRowsForWeek} weekStart={weeklyDateRange?.from} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
  {/* Sidebar estático à esquerda (resumo + produtos) */}
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
                      <div className="w-full h-28 max-h-28 rounded-lg flex flex-col justify-center p-2 shadow-md/16">
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
                     

                    <div id="produtos" className="pt-2 flex flex-col min-h-0">
                      <div className="flex-1 overflow-hidden">
                        <ProductsTable
                          filters={filters}
                          onHoverName={(name) => setHighlightProduto(name)}
                          onLeave={() => setHighlightProduto(null)}
                        />
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