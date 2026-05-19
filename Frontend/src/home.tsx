import { useEffect, useRef, useState } from "react";
// import { useLocation } from "react-router-dom";
import HomeRelatorio from "./components/HomeRelatorio";
// Amendoim: render charts directly in Home when módulo for amendoim
import { 
  ChartEntradaSaidaPorHorario,
  ChartFluxoSemanal,
} from './components/AmendoimCharts';
import { DonutChartWidget } from './components/Widgets';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "./components/ui/popover";
import { Calendar } from "./components/ui/calendar";
import { Button } from "./components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format as formatDate } from "date-fns";
import { pt } from "date-fns/locale";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
// HomeAmendoim removido do render; charts renderizados diretamente aqui quando amendoim
import useAuth from "./hooks/useAuth";
import { useNotify } from "./hooks/useNotifications";
import { trackAction } from "./lib/activityTracker";
// ActivityLogPanel removido - logs agora são apenas internos via activityTracker

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
  const notify = useNotify();
  // Estados para seleção removidos (interface seguirá o padrão do dashboard de ração)
  // Datas globais removidas do cabeçalho; usaremos filtros por gráfico.

  useEffect(() => {
    // Definir tipo de home baseado no tipo do usuário (preferência absoluta)
    if (user?.userType === 'amendoim') {
      setTipoHome('amendoim');
      trackAction('Home: Acessou dashboard Amendoim');
    } else {
      setTipoHome('relatorio');
      trackAction('Home: Acessou dashboard Relatório');
    }
  }, [user]);

  // Notificação de boas-vindas na primeira montagem
  useEffect(() => {
    const displayName = user?.displayName || user?.username;
    if (displayName) {
      notify.info('Bem-vindo', `Olá, ${displayName}!`, 'home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    return { 
      dataInicio: dateStr, 
      dataFim: dateStr,
      turnoInicio: 0,
      turnoFim: 23
    };
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
      setHorariosFilters({ 
        dataInicio: start, 
        dataFim: end,
        turnoInicio: 0,
        turnoFim: 23
      });
    } else {
      setHorariosFilters({ 
        dataInicio: '', 
        dataFim: '',
        turnoInicio: 0,
        turnoFim: 23
      });
    }
  };
  const clearHorariosFilters = () => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    setHorariosDateRange({ from: y, to: y });
    const ds = formatDate(y, 'yyyy-MM-dd');
    setHorariosFilters({ dataInicio: ds, dataFim: ds, turnoInicio: 0, turnoFim: 23 });
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
    return { 
      dataInicio: formatDate(start, 'yyyy-MM-dd'), 
      dataFim: formatDate(end, 'yyyy-MM-dd'),
      turnoInicio: 0,
      turnoFim: 23
    };
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
      setWeeklyFilters({ dataInicio: formatDate(start, 'yyyy-MM-dd'), dataFim: formatDate(end, 'yyyy-MM-dd'), turnoInicio: 0, turnoFim: 23 });
      return;
    }
    const dow = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - (dow === 0 ? 0 : dow));
    const end = new Date(date);
    end.setDate(date.getDate() + (dow === 0 ? 6 : 6 - dow));
    setWeeklyDateRange({ from: start, to: end });
    setWeeklyFilters({
      dataInicio: formatDate(start, 'yyyy-MM-dd'),
      dataFim: formatDate(end, 'yyyy-MM-dd'),
      turnoInicio: 0,
      turnoFim: 23,
    });
  };
  const clearWeeklyFilters = () => handleWeeklyDateChange(undefined);

  // Saídas por Produto: usar DatePicker shadcn com padrão últimos 30 dias
  const [produtosDateRange, setProdutosDateRange] = useState<any>(() => {
    const hoje = new Date();
    const inicio = new Date();
    // últimos 30 dias (inclui hoje)
    inicio.setDate(hoje.getDate() - 29);
    return { from: inicio, to: hoje };
  });

  const [produtosFilters, setProdutosFilters] = useState<any>(() => {
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 29);
    const fmt = (d: Date) => formatDate(d, 'yyyy-MM-dd');
    return { dataInicio: fmt(inicio), dataFim: fmt(hoje) };
  });

  const handleProdutosDateChange = (range: any) => {
    // Calendar onSelect can return a single Date, a range { from, to }, or undefined
    if (!range) {
      const hoje = new Date();
      const inicio = new Date();
      inicio.setDate(hoje.getDate() - 29);
      setProdutosDateRange({ from: inicio, to: hoje });
      return;
    }

    // If user clicked a single day, DayPicker may pass a Date object
    if (range instanceof Date) {
      setProdutosDateRange({ from: range, to: range });
      return;
    }

    // If it's a range-like object, normalize to { from, to }
    const from = range?.from || range?.start || null;
    const to = range?.to || range?.end || null;
    if (from && !to) {
      setProdutosDateRange({ from, to: from });
      return;
    }
    setProdutosDateRange({ from, to });
  };

  const applyProdutosFilters = () => {
    if (produtosDateRange?.from) {
      const start = formatDate(produtosDateRange.from, 'yyyy-MM-dd');
      const end = produtosDateRange.to ? formatDate(produtosDateRange.to, 'yyyy-MM-dd') : start;
      setProdutosFilters({ dataInicio: start, dataFim: end });
    } else {
      setProdutosFilters({ dataInicio: '', dataFim: '' });
    }
  };

  const clearProdutosFilters = () => {
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 29);
    setProdutosDateRange({ from: inicio, to: hoje });
    setProdutosFilters({ dataInicio: formatDate(inicio, 'yyyy-MM-dd'), dataFim: formatDate(hoje, 'yyyy-MM-dd') });
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
      setEntradaFilters({ dataInicio: start, dataFim: end, turnoInicio: 0, turnoFim: 23 });
    } else {
      setEntradaFilters({ dataInicio: '', dataFim: '' });
    }
  };
  const clearEntradaFilters = () => {
    setEntradaDateRange({ ...weeklyDateRange });
    setEntradaFilters({ dataInicio: weeklyFilters.dataInicio, dataFim: weeklyFilters.dataFim, turnoInicio: weeklyFilters.turnoInicio, turnoFim: weeklyFilters.turnoFim });
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
      setSaidaFilters({ dataInicio: start, dataFim: end, turnoInicio: 0, turnoFim: 23 });
    } else {
      setSaidaFilters({ dataInicio: '', dataFim: '' });
    }
  };
  const clearSaidaFilters = () => {
    setSaidaDateRange({ ...weeklyDateRange });
    setSaidaFilters({ dataInicio: weeklyFilters.dataInicio, dataFim: weeklyFilters.dataFim, turnoInicio: weeklyFilters.turnoInicio, turnoFim: weeklyFilters.turnoFim });
  };

  // Dados específicos por gráfico
  const [dadosHorarios, setDadosHorarios] = useState<any[]>([]);
  const [dadosSemanal, setDadosSemanal] = useState<any[]>([]);
  const [entradaSum, setEntradaSum] = useState<number | null>(null);
  const [saidaSum, setSaidaSum] = useState<number | null>(null);
  const [dadosEntradaPorDia, setDadosEntradaPorDia] = useState<any[]>([]);
  const [dadosSaidaPorDia, setDadosSaidaPorDia] = useState<any[]>([]);
  const analiseRequestsRef = useRef<Map<string, Promise<any>>>(new Map());
  const [entradaDateRange, setEntradaDateRange] = useState<any>(() => ({ ...weeklyDateRange }));
  const [entradaFilters, setEntradaFilters] = useState<any>(() => ({ dataInicio: weeklyFilters.dataInicio, dataFim: weeklyFilters.dataFim, turnoInicio: weeklyFilters.turnoInicio, turnoFim: weeklyFilters.turnoFim }));
  const [saidaDateRange, setSaidaDateRange] = useState<any>(() => ({ ...weeklyDateRange }));
  const [saidaFilters, setSaidaFilters] = useState<any>(() => ({ dataInicio: weeklyFilters.dataInicio, dataFim: weeklyFilters.dataFim, turnoInicio: weeklyFilters.turnoInicio, turnoFim: weeklyFilters.turnoFim }));

  // Função auxiliar para calcular os últimos 30 dias
  const getUltimos30Dias = () => {
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 30);
    return {
      dataInicio: formatDate(inicio, 'yyyy-MM-dd'),
      dataFim: formatDate(hoje, 'yyyy-MM-dd'),
    };
  };

  // Garantir que os gráficos sempre iniciem com os últimos 30 dias
  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    
    const ultimos30 = getUltimos30Dias();
    const inicio = new Date(ultimos30.dataInicio + 'T00:00:00');
    const fim = new Date(ultimos30.dataFim + 'T00:00:00');
    
    // Atualizar filtros para últimos 30 dias (exceto produção semanal)
    setHorariosDateRange({ from: inicio, to: fim });
    setHorariosFilters({
      ...ultimos30,
      turnoInicio: 0,
      turnoFim: 23,
    });
    
    // weeklyFilters mantém seu comportamento original (semana atual)
    
    setEntradaDateRange({ from: inicio, to: fim });
    setEntradaFilters(ultimos30);
    
    setSaidaDateRange({ from: inicio, to: fim });
    setSaidaFilters(ultimos30);
  }, [tipoHome]);

  // Fetch por gráfico
  const fetchAnaliseByUrl = async (url: string) => {
    const inFlight = analiseRequestsRef.current.get(url);
    if (inFlight) {
      return inFlight;
    }

    const request = (async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })();

    analiseRequestsRef.current.set(url, request);

    try {
      return await request;
    } finally {
      analiseRequestsRef.current.delete(url);
    }
  };

  const fetchAnaliseFor = async (fi: { 
    dataInicio?: string; 
    dataFim?: string;
    turnoInicio?: number;
    turnoFim?: number;
  }) => {
    const params = new URLSearchParams({
      ...(fi.dataInicio ? { dataInicio: fi.dataInicio } : {}),
      ...(fi.dataFim ? { dataFim: fi.dataFim } : {}),
      ...(fi.turnoInicio !== undefined ? { turnoInicio: String(fi.turnoInicio) } : {}),
      ...(fi.turnoFim !== undefined ? { turnoFim: String(fi.turnoFim) } : {}),
    });

    const url = `http://localhost:3000/api/amendoim/analise?${params.toString()}`;
    return fetchAnaliseByUrl(url);
  };

  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    (async () => {
      try {
        const data = await fetchAnaliseFor(horariosFilters);
        setDadosHorarios(data?.entradaSaidaPorHorario || []);
      } catch (err) {
        console.error('Erro ao buscar dados horários:', err);
        setDadosHorarios([]);
      }
    })();
  }, [tipoHome, horariosFilters?.dataInicio, horariosFilters?.dataFim, horariosFilters?.turnoInicio, horariosFilters?.turnoFim]);

  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    (async () => {
      try {
        const data = await fetchAnaliseFor(weeklyFilters);
        setDadosSemanal(data?.fluxoSemanal || []);
      } catch (err) {
        console.error('Erro ao buscar dados semanais:', err);
        setDadosSemanal([]);
      }
    })();
  }, [tipoHome, weeklyFilters?.dataInicio, weeklyFilters?.dataFim, weeklyFilters?.turnoInicio, weeklyFilters?.turnoFim]);

  // Fetch comparativo: compare selected weeklyFilters period vs previous period
  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    const fetchComparativo = async () => {
      try {
        const start = weeklyFilters?.dataInicio;
        const end = weeklyFilters?.dataFim;
        if (!start || !end) {
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
          return;
        }
      } catch (err) {
        console.error('Erro ao buscar comparativo:', err);
      }
    };
    void fetchComparativo();
  }, [tipoHome, weeklyFilters?.dataInicio, weeklyFilters?.dataFim]);

  // Fetch entrada and saida data per day (instead of just sums)
  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    const fetchDadosPorDia = async () => {
      try {
        const eStart = entradaFilters?.dataInicio;
        const eEnd = entradaFilters?.dataFim;
        const sStart = saidaFilters?.dataInicio;
        const sEnd = saidaFilters?.dataFim;
        const [entradaResult, saidaResult] = await Promise.allSettled([
          eStart && eEnd
            ? fetchAnaliseFor({ dataInicio: eStart, dataFim: eEnd, turnoInicio: 0, turnoFim: 23 })
            : Promise.resolve(null),
          sStart && sEnd
            ? fetchAnaliseFor({ dataInicio: sStart, dataFim: sEnd, turnoInicio: 0, turnoFim: 23 })
            : Promise.resolve(null),
        ]);

        let totalEntrada = 0;
        let totalSaida = 0;

        if (entradaResult.status === 'fulfilled' && entradaResult.value) {
          const dadosEntrada = (entradaResult.value.rendimentoPorDia || []).map((d: any) => ({
            dia: d.dia,
            valor: d.entrada || 0,
          }));
          totalEntrada = dadosEntrada.reduce((acc: number, d: any) => acc + d.valor, 0);
          setDadosEntradaPorDia(dadosEntrada);
          setEntradaSum(totalEntrada);
        } else {
          setDadosEntradaPorDia([]);
          setEntradaSum(null);
        }

        if (saidaResult.status === 'fulfilled' && saidaResult.value) {
          const dadosSaida = (saidaResult.value.rendimentoPorDia || []).map((d: any) => ({
            dia: d.dia,
            valor: d.saida || 0,
          }));
          totalSaida = dadosSaida.reduce((acc: number, d: any) => acc + d.valor, 0);
          setDadosSaidaPorDia(dadosSaida);
          setSaidaSum(totalSaida);
        } else {
          setDadosSaidaPorDia([]);
          setSaidaSum(null);
        }

      } catch (err) {
        console.error('Erro ao buscar dados por dia:', err);
        setDadosEntradaPorDia([]);
        setDadosSaidaPorDia([]);
        setEntradaSum(null);
        setSaidaSum(null);
      }
    };
    void fetchDadosPorDia();
  }, [tipoHome, entradaFilters?.dataInicio, entradaFilters?.dataFim, saidaFilters?.dataInicio, saidaFilters?.dataFim]);

  // Fetch last 30 days rendimento (for line chart)
  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    (async () => {
      try {
        const prev = new Date();
        prev.setDate(prev.getDate() - 29);
      } catch (err) {
        console.error('Erro ao buscar rendimento 30 dias:', err);
      }
    })();
  }, [tipoHome]);

  // Removido fetch agregado para cards gerenciais

  // Seleção de gráficos removida nesta interface

  // Removido código de debug

  // Renderizar home específica baseado no tipo
  if (tipoHome === "amendoim") {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-auto 3xl:overflow-hidden py-4 3xl:pb-0">
          <div className=" space">

            {/* Período: Entrada / Saída (comparativo) + Donut de Saídas por produto */}
            <div className="grid 3xl:grid-cols-3 3xl:grid-rows-2 grid-cols-2 grid-rows-3 gap-4 2xl:gap-y-4 mb-4 2xl:mb-0">
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[380px] 3xl:h-[48dvh]">
                <CardHeader className="border-b border-gray-100 pb-2 px-3 h-14">
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
                            <Button onClick={applyEntradaFilters} size="sm" className="flex-1 active:bg-red-600/50">
                              Aplicar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className=" h-[calc(100%-60px)]">
                  {dadosEntradaPorDia.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosEntradaPorDia} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="dia" 
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ fontSize: 12 }}
                          formatter={(value: number) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg`}
                        />
                        <Bar dataKey="valor" fill="#ef4444" name="Entrada" isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">
                      {entradaSum === null ? 'Carregando...' : 'Sem dados para o período'}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[380px] 3xl:h-[48dvh]">
                <CardHeader className="border-b border-gray-100 px-3 h-14">
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
                            <Button onClick={applySaidaFilters} size="sm" className="flex-1 active:bg-red-600/50">
                              Aplicar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)]">
                  {dadosSaidaPorDia.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosSaidaPorDia} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="dia" 
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ fontSize: 12 }}
                          formatter={(value: number) => `${value.toLocaleString('pt-BR', {minimumFractionDigits:3, maximumFractionDigits: 3 })} kg`}
                        />
                        <Bar dataKey="valor" fill="#6b7280" name="Saída" isAnimationActive={false}  />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">
                      {saidaSum === null ? 'Carregando...' : 'Sem dados para o período'}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[380px] 3xl:h-[48dvh]">
                <CardHeader className="border-b border-gray-100 px-3 h-14">
                  <CardTitle className="text-base font-semibold text-gray-900">Cálculo de Rendimento</CardTitle>
                </CardHeader>
                <CardContent className=" h-[calc(100%-60px)]">
                  {(entradaSum !== null && saidaSum !== null) && (entradaSum > 0 || saidaSum > 0) ? (
                    <div className="space-y-4 h-full">
                      {/* Porcentagem de Aproveitamento */}
                      <div className="bg-white rounded-lg pb-4 shadow-md flex flex-col items-center 3xl:h-1/3 justify-center">
                        <div className=" text-sm xl:text-base 4xl:text-lg text-gray-500 font-medium">Aproveitamento</div>
                        <div className="text-xl xl:text-4xl 4xl:text-6xl font-bold">
                          {entradaSum > 0 
                            ? ((saidaSum / entradaSum) * 100).toFixed(2)
                            : '0.00'}%
                        </div>
                      </div>

                      {/* Entrada e Saída */}
                      <div className="grid grid-cols-2 gap-2 h-1/4">
                        <div className="shadow-md flex flex-col justify-center items-start rounded-lg p-4">
                          <div className="text-sm xl:text-base 4xl:text-lg text-gray-500 font-medium">Entrada</div>
                          <div className="text-sm xl:text-lg 4xl:text-xl font-bold">
                            {entradaSum.toLocaleString('pt-BR', {  minimumFractionDigits:3, maximumFractionDigits: 3 })} kg
                          </div>
                        </div>
                        <div className="shadow-md flex flex-col justify-center items-start rounded-lg p-4">
                          <div className="text-sm xl:text-base 4xl:text-lg text-gray-500 font-medium">Saída</div>
                          <div className="text-sm xl:text-lg 4xl:text-xl font-bold">
                            {saidaSum.toLocaleString('pt-BR', {  minimumFractionDigits:3, maximumFractionDigits: 3 })} kg
                          </div>
                        </div>
                      </div>

                      {/* Perda */}
                      <div className="shadow-md flex flex-col justify-center items-start rounded-lg p-5 h-1/3">
                        <div className="text-base text-red-600 font-medium 4xl:text-lg">Perda de Material</div>
                        <div className="text-xl font-bold text-red-800 4xl:text-5xl">
                          {(entradaSum - saidaSum).toLocaleString('pt-BR', { minimumFractionDigits:3, maximumFractionDigits: 3 })} kg
                          <span className="text-sm ml-2">
                            ({entradaSum > 0 
                              ? (((entradaSum - saidaSum) / entradaSum) * 100).toFixed(2)
                              : '0.00'}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      {entradaSum === null || saidaSum === null ? 'Carregando...' : 'Selecione os períodos de Entrada e Saída'}
                    </div>
                  )}
                </CardContent>
              </Card>

              
                   

              {/* Card de Cálculo de Conflito/Rendimento */}
              
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[380px] 3xl:h-[48dvh]">
                <CardHeader className="border-b border-gray-100 pb-2 px-3 h-14">
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
                            <Button onClick={applyHorariosFilters} size="sm" className="flex-1 active:bg-red-600/50">
                              Aplicar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className=" h-[calc(100%-60px)]">
                  <div className="w-full h-full">
                    <ChartEntradaSaidaPorHorario dados={dadosHorarios} bare />
                  </div>
                </CardContent>
              </Card>

              {/* Produção Semanal */}
              <Card className="shadow-lg border border-gray-200 rounded-xl mt-0 overflow-hidden h-[380px] 3xl:h-[48dvh]">
                <CardHeader className="border-b border-gray-100 pb-3 h-14">
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
                        className="h-8 px-1.5 hidden xl:flex"
                      >
                         <ChevronLeft/>
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
                        className="h-8 px-1.5 hidden xl:flex"
                      >
                           <ChevronRight />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className=" h-[calc(100%-60px)]">
                  <div className="w-full h-full">
                    <ChartFluxoSemanal dados={dadosSemanal} bare />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border border-gray-200 rounded-xl mt-0 overflow-hidden h-[380px] 3xl:h-[48dvh]">
                <CardHeader className="border-b border-gray-100 pb-2 px-3 h-14">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-900">Produtos</CardTitle>
                    <div className="flex items-center gap-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={"w-44 justify-start text-left font-normal " + (!produtosDateRange && "text-gray-400")}>
                            {produtosDateRange?.from ? (
                              produtosDateRange.to ? (
                                <>{formatDate(produtosDateRange.from, 'dd/MM/yy')} - {formatDate(produtosDateRange.to, 'dd/MM/yy')}</>
                              ) : (
                                formatDate(produtosDateRange.from, 'dd/MM/yy')
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
                            defaultMonth={produtosDateRange?.from}
                            selected={produtosDateRange}
                            onSelect={handleProdutosDateChange}
                            numberOfMonths={1}
                          />
                          <div className="flex gap-2 mt-2 px-1">
                            <Button variant="outline" onClick={clearProdutosFilters} size="sm" className="flex-1">
                              Limpar
                            </Button>
                            <Button onClick={applyProdutosFilters} size="sm" className="flex-1 active:bg-red-600/50">
                              Aplicar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[calc(100%-60px)]">
                  <DonutChartWidget
                    fetchUrl={(() => {
                      // Build params but ensure single-day ranges include that day by expanding dataFim by +1 day
                      const paramsObj: any = {};
                      if (produtosFilters?.dataInicio) paramsObj.dataInicio = produtosFilters.dataInicio;
                      if (produtosFilters?.dataFim) {
                        // If same day, expand to next day to be inclusive in backend queries that treat end as exclusive
                        if (produtosFilters.dataInicio && produtosFilters.dataInicio === produtosFilters.dataFim) {
                          const parts = produtosFilters.dataFim.split('-').map(Number);
                          if (parts.length === 3) {
                            const d = new Date(parts[0], parts[1] - 1, parts[2]);
                            d.setDate(d.getDate() + 1);
                            const y = d.getFullYear();
                            const m = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            paramsObj.dataFim = `${y}-${m}-${day}`;
                          } else {
                            paramsObj.dataFim = produtosFilters.dataFim;
                          }
                        } else {
                          paramsObj.dataFim = produtosFilters.dataFim;
                        }
                      }
                      paramsObj.tipo = 'saida';
                      const url = `http://localhost:3000/api/amendoim/chartdata/produtos?${new URLSearchParams(paramsObj).toString()}`;
                      return url;
                    })()}
                    compact
                    showLegend
                    unit="kg"
                  />
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
