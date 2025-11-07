import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
import HomeRelatorio from "./components/HomeRelatorio";
// Amendoim: render charts directly in Home when módulo for amendoim
import { 
  ChartEntradaSaidaPorHorario,
  ChartFluxoSemanal,
  ChartEficienciaPorTurno,
  ChartRendimentoPorDia,
} from './components/AmendoimCharts';
import { DonutChartWidget } from './components/Widgets';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "./components/ui/popover";
import { Calendar } from "./components/ui/calendar";
import { Button } from "./components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format as formatDate } from "date-fns";
import { pt } from "date-fns/locale";
// HomeAmendoim removido do render; charts renderizados diretamente aqui quando amendoim
import useAuth from "./hooks/useAuth";

export type ChartType = "formulas" | "produtos" | "horarios" | "diasSemana";

/**
 * Componente Home inteligente que renderiza diferentes dashboards
 * baseado no tipo de usuário/módulo ativo.
 */
export default function Home() {
  // const location = useLocation();
  const [tipoHome, setTipoHome] = useState<"relatorio" | "amendoim">("relatorio");
  // Removidos dados/métricas gerenciais do topo
  const { user } = useAuth();
  // Estados para seleção removidos (interface seguirá o padrão do dashboard de ração)
  // Datas globais removidas do cabeçalho; usaremos filtros por gráfico.

  useEffect(() => {
    // Definir tipo de home baseado no tipo do usuário (preferência absoluta)
    if (user?.userType === 'amendoim') {
      setTipoHome('amendoim');
    } else {
      setTipoHome('relatorio');
    }
  }, [user]);

  // Buscar dados agregados para cards (usar semana atual por padrão)
  // (efeito definido mais abaixo após weeklyFilters)

  // ================= Estilos e estados por gráfico (como no dashboard de ração) =================
  // Horários (range - por padrão ontem)
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
  const handleHorariosDateChange = (range: any) => {
    if (!range) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      setHorariosDateRange({ from: y, to: y });
      return;
    }
    setHorariosDateRange(range);
  };
  const applyHorariosFilters = () => {
    if (horariosDateRange?.from) {
      const start = formatDate(horariosDateRange.from, 'yyyy-MM-dd');
      const end = horariosDateRange.to ? formatDate(horariosDateRange.to, 'yyyy-MM-dd') : start;
      setHorariosFilters({ dataInicio: start, dataFim: end });
    } else {
      setHorariosFilters({ dataInicio: '', dataFim: '' });
    }
  };
  const clearHorariosFilters = () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    setHorariosDateRange({ from: y, to: y });
    const ds = formatDate(y, 'yyyy-MM-dd');
    setHorariosFilters({ dataInicio: ds, dataFim: ds });
  };

  // Semanal (semana atual, domingo-sábado)
  const [weeklyDateRange, setWeeklyDateRange] = useState<any>(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - (day === 0 ? 0 : day));
    const end = new Date(today);
    end.setDate(today.getDate() + (day === 0 ? 6 : 6 - day));
    return { from: start, to: end };
  });
  const [weeklyFilters, setWeeklyFilters] = useState<any>(() => {
    const today = new Date();
    const day = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - (day === 0 ? 0 : day));
    const end = new Date(today);
    end.setDate(today.getDate() + (day === 0 ? 6 : 6 - day));
    return { dataInicio: formatDate(start, 'yyyy-MM-dd'), dataFim: formatDate(end, 'yyyy-MM-dd') };
  });
  const handleWeeklyDateChange = (date?: Date) => {
    if (!date) {
      const today = new Date();
      const dow = today.getDay();
      const start = new Date(today);
      start.setDate(today.getDate() - dow);
      const end = new Date(today);
      end.setDate(today.getDate() + (6 - dow));
      setWeeklyDateRange({ from: start, to: end });
      setWeeklyFilters({ dataInicio: formatDate(start, 'yyyy-MM-dd'), dataFim: formatDate(end, 'yyyy-MM-dd') });
      return;
    }
    const dow = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - (dow === 0 ? 0 : dow));
    const end = new Date(date);
    end.setDate(date.getDate() + (dow === 0 ? 6 : 6 - dow));
    setWeeklyDateRange({ from: start, to: end });
    setWeeklyFilters({ dataInicio: formatDate(start, 'yyyy-MM-dd'), dataFim: formatDate(end, 'yyyy-MM-dd') });
  };
  const clearWeeklyFilters = () => handleWeeklyDateChange(undefined);

  // Turnos (range simples: usar mesma lógica do horários por padrão)
  const [turnosDateRange, setTurnosDateRange] = useState<any>(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return { from: y, to: y };
  });
  const [turnosFilters, setTurnosFilters] = useState<any>(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const ds = formatDate(y, 'yyyy-MM-dd');
    return { dataInicio: ds, dataFim: ds };
  });
  const handleTurnosDateChange = (range: any) => setTurnosDateRange(range);
  const applyTurnosFilters = () => {
    if (turnosDateRange?.from) {
      const start = formatDate(turnosDateRange.from, 'yyyy-MM-dd');
      const end = turnosDateRange.to ? formatDate(turnosDateRange.to, 'yyyy-MM-dd') : start;
      setTurnosFilters({ dataInicio: start, dataFim: end });
    } else {
      setTurnosFilters({ dataInicio: '', dataFim: '' });
    }
  };
  const clearTurnosFilters = () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    setTurnosDateRange({ from: y, to: y });
    const ds = formatDate(y, 'yyyy-MM-dd');
    setTurnosFilters({ dataInicio: ds, dataFim: ds });
  };

  // Per-card handlers for Entrada
  const handleEntradaDateChange = (range: any) => {
    if (!range) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      setEntradaDateRange({ from: y, to: y });
      return;
    }
    setEntradaDateRange(range);
  };
  const applyEntradaFilters = () => {
    if (entradaDateRange?.from) {
      const start = formatDate(entradaDateRange.from, 'yyyy-MM-dd');
      const end = entradaDateRange.to ? formatDate(entradaDateRange.to, 'yyyy-MM-dd') : start;
      setEntradaFilters({ dataInicio: start, dataFim: end });
    } else {
      setEntradaFilters({ dataInicio: '', dataFim: '' });
    }
  };
  const clearEntradaFilters = () => {
    setEntradaDateRange({ ...weeklyDateRange });
    setEntradaFilters({ dataInicio: weeklyFilters.dataInicio, dataFim: weeklyFilters.dataFim });
  };

  // Per-card handlers for Saída
  const handleSaidaDateChange = (range: any) => {
    if (!range) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      setSaidaDateRange({ from: y, to: y });
      return;
    }
    setSaidaDateRange(range);
  };
  const applySaidaFilters = () => {
    if (saidaDateRange?.from) {
      const start = formatDate(saidaDateRange.from, 'yyyy-MM-dd');
      const end = saidaDateRange.to ? formatDate(saidaDateRange.to, 'yyyy-MM-dd') : start;
      setSaidaFilters({ dataInicio: start, dataFim: end });
    } else {
      setSaidaFilters({ dataInicio: '', dataFim: '' });
    }
  };
  const clearSaidaFilters = () => {
    setSaidaDateRange({ ...weeklyDateRange });
    setSaidaFilters({ dataInicio: weeklyFilters.dataInicio, dataFim: weeklyFilters.dataFim });
  };

  // Dados específicos por gráfico
  const [dadosHorarios, setDadosHorarios] = useState<any[]>([]);
  const [dadosSemanal, setDadosSemanal] = useState<any[]>([]);
  const [dadosTurnos, setDadosTurnos] = useState<any[]>([]);
  // New: entrada/saida period charts and comparativo
  const [comparativo, setComparativo] = useState<any>(null);
  const [dadosRendimento30, setDadosRendimento30] = useState<any[]>([]);
  const [entradaSum, setEntradaSum] = useState<number | null>(null);
  const [saidaSum, setSaidaSum] = useState<number | null>(null);
  // Per-card date ranges and filters for testing
  const [entradaDateRange, setEntradaDateRange] = useState<any>(() => ({ ...weeklyDateRange }));
  const [entradaFilters, setEntradaFilters] = useState<any>(() => ({ dataInicio: weeklyFilters.dataInicio, dataFim: weeklyFilters.dataFim }));
  const [saidaDateRange, setSaidaDateRange] = useState<any>(() => ({ ...weeklyDateRange }));
  const [saidaFilters, setSaidaFilters] = useState<any>(() => ({ dataInicio: weeklyFilters.dataInicio, dataFim: weeklyFilters.dataFim }));

  // Fetch por gráfico
  const fetchAnaliseFor = async (fi: { dataInicio?: string; dataFim?: string }) => {
    const params = new URLSearchParams({ ...(fi.dataInicio ? { dataInicio: fi.dataInicio } : {}), ...(fi.dataFim ? { dataFim: fi.dataFim } : {}) });
    const url = `http://localhost:3000/api/amendoim/analise?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };

  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    (async () => {
      try {
        console.log('[DEBUG HORÁRIOS] Buscando com filtros:', horariosFilters);
        const data = await fetchAnaliseFor(horariosFilters);
        console.log('[DEBUG HORÁRIOS] Dados recebidos:', data);
        console.log('[DEBUG HORÁRIOS] Array entradaSaidaPorHorario:', data?.entradaSaidaPorHorario);
        setDadosHorarios(data?.entradaSaidaPorHorario || []);
      } catch (err) {
        console.error('Erro ao buscar dados horários:', err);
        setDadosHorarios([]);
      }
    })();
  }, [tipoHome, horariosFilters?.dataInicio, horariosFilters?.dataFim]);

  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    (async () => {
      try {
        console.log('[DEBUG SEMANAL] Buscando com filtros:', weeklyFilters);
        const data = await fetchAnaliseFor(weeklyFilters);
        console.log('[DEBUG SEMANAL] Dados recebidos:', data);
        console.log('[DEBUG SEMANAL] Array fluxoSemanal:', data?.fluxoSemanal);
        setDadosSemanal(data?.fluxoSemanal || []);
      } catch (err) {
        console.error('Erro ao buscar dados semanais:', err);
        setDadosSemanal([]);
      }
    })();
  }, [tipoHome, weeklyFilters?.dataInicio, weeklyFilters?.dataFim]);

  // Fetch comparativo: compare selected weeklyFilters period vs previous period
  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    const fetchComparativo = async () => {
      try {
        const start = weeklyFilters?.dataInicio;
        const end = weeklyFilters?.dataFim;
        if (!start || !end) {
          setComparativo(null);
          return;
        }
        const s = new Date(start + 'T00:00:00');
        const e = new Date(end + 'T23:59:59');
        const days = Math.round((e.getTime() - s.getTime()) / (24 * 3600 * 1000)) + 1;

        const prevEnd = new Date(s);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - (days - 1));

        const fmt = (d: Date) => formatDate(d, 'yyyy-MM-dd');

        const urlCurr = `http://localhost:3000/api/amendoim/metricas/rendimento?dataInicio=${encodeURIComponent(start)}&dataFim=${encodeURIComponent(end)}`;
        const urlPrev = `http://localhost:3000/api/amendoim/metricas/rendimento?dataInicio=${fmt(prevStart)}&dataFim=${fmt(prevEnd)}`;

        const [resCurr, resPrev] = await Promise.all([fetch(urlCurr), fetch(urlPrev)]);
        if (!resCurr.ok || !resPrev.ok) {
          setComparativo(null);
          return;
        }
        const curr = await resCurr.json();
        const prev = await resPrev.json();

        setComparativo({
          entradaCurrent: Number(curr.pesoEntrada || 0),
          saidaCurrent: Number(curr.pesoSaida || 0),
          entradaPrev: Number(prev.pesoEntrada || 0),
          saidaPrev: Number(prev.pesoSaida || 0),
        });
      } catch (err) {
        console.error('Erro ao buscar comparativo:', err);
        setComparativo(null);
      }
    };
    void fetchComparativo();
  }, [tipoHome, weeklyFilters?.dataInicio, weeklyFilters?.dataFim]);

  // Fetch entrada and saida sums separately and sum them (calls estatisticas per tipo)
  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    const fetchSums = async () => {
      try {
        const eStart = entradaFilters?.dataInicio;
        const eEnd = entradaFilters?.dataFim;
        const sStart = saidaFilters?.dataInicio;
        const sEnd = saidaFilters?.dataFim;

        if (!eStart || !eEnd) setEntradaSum(null);
        if (!sStart || !sEnd) setSaidaSum(null);

        const promises: Promise<Response>[] = [];
        if (eStart && eEnd) promises.push(fetch(`http://localhost:3000/api/amendoim/estatisticas?dataInicio=${encodeURIComponent(eStart)}&dataFim=${encodeURIComponent(eEnd)}&tipo=entrada`));
        if (sStart && sEnd) promises.push(fetch(`http://localhost:3000/api/amendoim/estatisticas?dataInicio=${encodeURIComponent(sStart)}&dataFim=${encodeURIComponent(sEnd)}&tipo=saida`));

        const results = await Promise.all(promises);
        let idx = 0;
        if (eStart && eEnd) {
          const resEntrada = results[idx++];
          if (resEntrada.ok) {
            const jEntrada = await resEntrada.json();
            setEntradaSum(Number(jEntrada.pesoTotal || 0));
          } else {
            setEntradaSum(null);
          }
        }

        if (sStart && sEnd) {
          const resSaida = results[idx++ - (eStart && eEnd ? 0 : 0)];
          if (resSaida.ok) {
            const jSaida = await resSaida.json();
            setSaidaSum(Number(jSaida.pesoTotal || 0));
          } else {
            setSaidaSum(null);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar sums entrada/saida:', err);
        setEntradaSum(null);
        setSaidaSum(null);
      }
    };
    void fetchSums();
  }, [tipoHome, entradaFilters?.dataInicio, entradaFilters?.dataFim, saidaFilters?.dataInicio, saidaFilters?.dataFim]);

  // Fetch last 30 days rendimento (for line chart)
  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    (async () => {
      try {
        const today = new Date();
        const prev = new Date();
        prev.setDate(prev.getDate() - 29);
        const url = `http://localhost:3000/api/amendoim/analise?dataInicio=${formatDate(prev, 'yyyy-MM-dd')}&dataFim=${formatDate(today, 'yyyy-MM-dd')}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        setDadosRendimento30(body.rendimentoPorDia || []);
      } catch (err) {
        console.error('Erro ao buscar rendimento 30 dias:', err);
        setDadosRendimento30([]);
      }
    })();
  }, [tipoHome]);

  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    (async () => {
      try {
        console.log('[DEBUG TURNOS] Buscando com filtros:', turnosFilters);
        const data = await fetchAnaliseFor(turnosFilters);
        console.log('[DEBUG TURNOS] Dados recebidos:', data);
        console.log('[DEBUG TURNOS] Array eficienciaPorTurno:', data?.eficienciaPorTurno);
        setDadosTurnos(data?.eficienciaPorTurno || []);
      } catch (err) {
        console.error('Erro ao buscar dados turnos:', err);
        setDadosTurnos([]);
      }
    })();
  }, [tipoHome, turnosFilters?.dataInicio, turnosFilters?.dataFim]);

  // Removido fetch agregado para cards gerenciais

  // Seleção de gráficos removida nesta interface

  // Removido código de debug

  // Renderizar home específica baseado no tipo
  if (tipoHome === "amendoim") {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-auto ">
          <div className="p-4 space">
            {/* Top: 3 Donut charts */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[300]">
                <CardHeader className="border-b border-gray-100 pb-2 px-3">
                  <CardTitle className="text-sm font-semibold">Produtos (comparação)</CardTitle>
                </CardHeader>
                <CardContent className="p-3 h-[250px]">
                  <DonutChartWidget
                    fetchUrl={`http://localhost:3000/api/amendoim/chartdata/produtos?${new URLSearchParams({ ...(weeklyFilters?.dataInicio && { dataInicio: weeklyFilters.dataInicio }), ...(weeklyFilters?.dataFim && { dataFim: weeklyFilters.dataFim }) })}`}
                    compact
                    unit="kg"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[300]">
                <CardHeader className="border-b border-gray-100 pb-2 px-3">
                  <CardTitle className="text-sm font-semibold">Caixas (comparação)</CardTitle>
                </CardHeader>
                <CardContent className="p-3 h-[250px]">
                  <DonutChartWidget
                    fetchUrl={`http://localhost:3000/api/amendoim/chartdata/caixas?${new URLSearchParams({ ...(weeklyFilters?.dataInicio && { dataInicio: weeklyFilters.dataInicio }), ...(weeklyFilters?.dataFim && { dataFim: weeklyFilters.dataFim }) })}`}
                    compact
                    unit="kg"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[300]">
                <CardHeader className="border-b border-gray-100 pb-2 px-3">
                  <CardTitle className="text-sm font-semibold">Entrada x Saída</CardTitle>
                </CardHeader>
                <CardContent className="p-3 h-[250px]">
                  <DonutChartWidget
                    fetchUrl={`http://localhost:3000/api/amendoim/chartdata/entradaSaida?${new URLSearchParams({ ...(weeklyFilters?.dataInicio && { dataInicio: weeklyFilters.dataInicio }), ...(weeklyFilters?.dataFim && { dataFim: weeklyFilters.dataFim }) })}`}
                    compact
                    unit="kg"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Período: Entrada / Saída (comparativo) + Donut de Saídas por produto */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[300px]">
                <CardHeader className="border-b border-gray-100 pb-2 px-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Entrada (período selecionado)</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={"w-44 justify-start text-left font-normal"}>
                            {entradaDateRange?.from ? (
                              entradaDateRange.to ? (
                                <>{formatDate(entradaDateRange.from, 'dd/MM/yy')} - {formatDate(entradaDateRange.to, 'dd/MM/yy')}</>
                              ) : (
                                formatDate(entradaDateRange.from, 'dd/MM/yy')
                              )
                            ) : (
                              <span>Período</span>
                            )}
                            <CalendarIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" side="right" align="start" sideOffset={10} alignOffset={-45}>
                          <Calendar
                            mode="range"
                            locale={pt}
                            defaultMonth={entradaDateRange?.from}
                            selected={entradaDateRange}
                            onSelect={handleEntradaDateChange}
                            numberOfMonths={1}
                          />
                          <div className="flex gap-2 mt-2 px-1">
                            <Button variant="outline" onClick={clearEntradaFilters} size="sm" className="flex-1">
                              Limpar
                            </Button>
                            <Button onClick={applyEntradaFilters} size="sm" className="flex-1">
                              Aplicar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 h-[220px] flex items-center justify-center">
                  <div className="text-center">
                    {entradaSum === null ? (
                      <div className="text-sm text-gray-500">Carregando...</div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-red-600">{entradaSum.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg</div>
                        <div className="text-xs text-gray-500 mt-1">Total do período selecionado</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[300px]">
                <CardHeader className="border-b border-gray-100 pb-2 px-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Saída (período selecionado)</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={"w-44 justify-start text-left font-normal"}>
                            {saidaDateRange?.from ? (
                              saidaDateRange.to ? (
                                <>{formatDate(saidaDateRange.from, 'dd/MM/yy')} - {formatDate(saidaDateRange.to, 'dd/MM/yy')}</>
                              ) : (
                                formatDate(saidaDateRange.from, 'dd/MM/yy')
                              )
                            ) : (
                              <span>Período</span>
                            )}
                            <CalendarIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" side="right" align="start" sideOffset={10} alignOffset={-45}>
                          <Calendar
                            mode="range"
                            locale={pt}
                            defaultMonth={saidaDateRange?.from}
                            selected={saidaDateRange}
                            onSelect={handleSaidaDateChange}
                            numberOfMonths={1}
                          />
                          <div className="flex gap-2 mt-2 px-1">
                            <Button variant="outline" onClick={clearSaidaFilters} size="sm" className="flex-1">
                              Limpar
                            </Button>
                            <Button onClick={applySaidaFilters} size="sm" className="flex-1">
                              Aplicar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 h-[220px] flex items-center justify-center">
                  <div className="text-center">
                    {saidaSum === null ? (
                      <div className="text-sm text-gray-500">Carregando...</div>
                    ) : (
                      <div>
                        <div className="text-3xl font-bold text-gray-700">{saidaSum.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg</div>
                        <div className="text-xs text-gray-500 mt-1">Total do período selecionado</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[300px]">
                <CardHeader className="border-b border-gray-100 pb-2 px-3">
                  <CardTitle className="text-sm font-semibold">Saídas por Produto (comparação)</CardTitle>
                </CardHeader>
                <CardContent className="p-3 h-[220px]">
                  <DonutChartWidget
                    fetchUrl={`http://localhost:3000/api/amendoim/chartdata/produtos?${new URLSearchParams({ ...(weeklyFilters?.dataInicio && { dataInicio: weeklyFilters.dataInicio }), ...(weeklyFilters?.dataFim && { dataFim: weeklyFilters.dataFim }), tipo: 'saida' })}`}
                    compact
                    unit="kg"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Comparativo simples: diferença entre período selecionado e período anterior */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="shadow-sm border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500">Comparativo (período vs anterior)</div>
                <div className="text-lg font-bold text-red-600 mt-2">
                  {comparativo ? (
                    <>
                      <div>Entrada: {(comparativo.entradaCurrent - comparativo.entradaPrev).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg</div>
                      <div className="text-sm text-gray-500">(Atual: {comparativo.entradaCurrent.toLocaleString('pt-BR')}, Anterior: {comparativo.entradaPrev.toLocaleString('pt-BR')})</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">Sem dados</div>
                  )}
                </div>
              </Card>
              <Card className="shadow-sm border border-gray-200 rounded-lg p-3">
                <div className="text-xs text-gray-500">Comparativo (Saída)</div>
                <div className="text-lg font-bold text-gray-700 mt-2">
                  {comparativo ? (
                    <>
                      <div>Saída: {(comparativo.saidaCurrent - comparativo.saidaPrev).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg</div>
                      <div className="text-sm text-gray-500">(Atual: {comparativo.saidaCurrent.toLocaleString('pt-BR')}, Anterior: {comparativo.saidaPrev.toLocaleString('pt-BR')})</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">Sem dados</div>
                  )}
                </div>
              </Card>
              <div />
            </div>

            {/* Últimos 30 dias: linha com entradas e saídas juntos */}
            <div className="mb-4">
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[300px]">
                <CardHeader className="border-b border-gray-100 pb-3 px-3">
                  <CardTitle className="text-base font-semibold text-gray-900">Últimos 30 dias — Entradas e Saídas</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 h-[calc(100%-60px)]">
                  <div className="w-full h-[240px]">
                    {/* Reuse ChartRendimentoPorDia which displays entrada+saida per day */}
                    <ChartRendimentoPorDia dados={dadosRendimento30} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Now render the Horário de Produção and Produção Semanal side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Horário de Produção */}
              <Card className="shadow-lg border border-gray-200 rounded-xl mt-0 overflow-hidden h-[380px] 3xl:h-[420px]">
                <CardHeader className="border-b border-gray-100 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-900">Horário de Produção</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={"w-47 justify-start text-left font-normal border border-black " + (!horariosDateRange && "text-gray-400") }>
                            {horariosDateRange?.from ? (
                              horariosDateRange.to ? (
                                <>{formatDate(horariosDateRange.from, 'dd/MM/yy')} - {formatDate(horariosDateRange.to, 'dd/MM/yy')}</>
                              ) : (
                                formatDate(horariosDateRange.from, 'dd/MM/yy')
                              )
                            ) : (
                              <span>Selecione um Período</span>
                            )}
                            <CalendarIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" side="right" align="start" sideOffset={10} alignOffset={-45} onInteractOutside={applyHorariosFilters}>
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
                              Ontem
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
                <CardContent className="pt-4 h-[calc(100%-60px)]">
                  <div className="w-full h-full">
                    <ChartEntradaSaidaPorHorario dados={dadosHorarios} bare />
                  </div>
                </CardContent>
              </Card>

              {/* Produção Semanal */}
              <Card className="shadow-lg border border-gray-200 rounded-xl mt-0 overflow-hidden h-[380px] 3xl:h-[420px]">
                <CardHeader className="border-b border-gray-100 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-900">Produção Semanal</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const prevWeekStart = new Date(weeklyDateRange.from);
                          prevWeekStart.setDate(prevWeekStart.getDate() - 7);
                          handleWeeklyDateChange(prevWeekStart);
                        }}
                        className="h-8 px-1.5"
                      >
                        ←
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={"w-44 justify-start text-left font-normal border border-black " + (!weeklyDateRange && "text-gray-400")}>
                            {weeklyDateRange?.from && weeklyDateRange?.to ? (
                              <>{formatDate(weeklyDateRange.from, 'dd/MM/yy')} - {formatDate(weeklyDateRange.to, 'dd/MM/yy')}</>
                            ) : (
                              <span>Selecione uma semana</span>
                            )}
                            <CalendarIcon className=" h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" side="right" align="start" sideOffset={10} alignOffset={-45}>
                          <Calendar
                            mode="single"
                            locale={pt}
                            selected={weeklyDateRange?.from}
                            onSelect={(date) => handleWeeklyDateChange(date as Date)}
                            numberOfMonths={1}
                            modifiers={{
                              weekRange: (date: Date) => {
                                if (!weeklyDateRange?.from) return false;
                                const start = new Date(weeklyDateRange.from);
                                start.setHours(0,0,0,0);
                                const end = new Date(start);
                                end.setDate(end.getDate() + 6);
                                end.setHours(23,59,59,999);
                                return date >= start && date <= end;
                              }
                            }}
                            modifiersStyles={{
                              weekRange: { backgroundColor: 'rgb(254 202 202)', color: 'rgb(127 29 29)', fontWeight: 'bold' }
                            }}
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
                        className="h-8 px-1.5"
                      >
                           →
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 h-[calc(100%-60px)]">
                  <div className="w-full h-full">
                    <ChartFluxoSemanal dados={dadosSemanal} bare />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <HomeRelatorio />;
}