import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
import HomeRelatorio from "./components/HomeRelatorio";
// Amendoim: render charts directly in Home when módulo for amendoim
import { 
  ChartEntradaSaidaPorHorario,
  ChartFluxoSemanal,
  // ChartEficienciaPorTurno,
  // ChartRendimentoPorDia,
} from './components/AmendoimCharts';
import { DonutChartWidget } from './components/Widgets';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "./components/ui/popover";
import { Calendar } from "./components/ui/calendar";
import { Button } from "./components/ui/button";
import { CalendarIcon } from "lucide-react";
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

  console.log(handleTurnosDateChange.name, applyTurnosFilters.name, clearTurnosFilters.name);

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

  // Saídas por Produto (últimos 30 dias por padrão)
  const [produtosDateRange, setProdutosDateRange] = useState<any>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return { from: thirtyDaysAgo, to: today };
  });
  const [produtosFilters, setProdutosFilters] = useState<any>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return { 
      dataInicio: formatDate(thirtyDaysAgo, 'yyyy-MM-dd'), 
      dataFim: formatDate(today, 'yyyy-MM-dd') 
    };
  });
  const handleProdutosDateChange = (range: any) => {
    if (!range) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      setProdutosDateRange({ from: thirtyDaysAgo, to: today });
      return;
    }
    setProdutosDateRange(range);
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
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setProdutosDateRange({ from: thirtyDaysAgo, to: today });
    setProdutosFilters({ 
      dataInicio: formatDate(thirtyDaysAgo, 'yyyy-MM-dd'), 
      dataFim: formatDate(today, 'yyyy-MM-dd') 
    });
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
  const [dadosEntradaPorDia, setDadosEntradaPorDia] = useState<any[]>([]);
  const [dadosSaidaPorDia, setDadosSaidaPorDia] = useState<any[]>([]);
  // Per-card date ranges and filters for testing
  const [entradaDateRange, setEntradaDateRange] = useState<any>(() => ({ ...weeklyDateRange }));
  const [entradaFilters, setEntradaFilters] = useState<any>(() => ({ dataInicio: weeklyFilters.dataInicio, dataFim: weeklyFilters.dataFim }));
  const [saidaDateRange, setSaidaDateRange] = useState<any>(() => ({ ...weeklyDateRange }));
  const [saidaFilters, setSaidaFilters] = useState<any>(() => ({ dataInicio: weeklyFilters.dataInicio, dataFim: weeklyFilters.dataFim }));

  console.log(dadosTurnos, comparativo, dadosRendimento30);

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

  // Fetch entrada and saida data per day (instead of just sums)
  useEffect(() => {
    if (tipoHome !== 'amendoim') return;
    const fetchDadosPorDia = async () => {
      try {
        const eStart = entradaFilters?.dataInicio;
        const eEnd = entradaFilters?.dataFim;
        const sStart = saidaFilters?.dataInicio;
        const sEnd = saidaFilters?.dataFim;

        // Fetch entrada data
        if (eStart && eEnd) {
          const urlEntrada = `http://localhost:3000/api/amendoim/analise?dataInicio=${encodeURIComponent(eStart)}&dataFim=${encodeURIComponent(eEnd)}`;
          const resEntrada = await fetch(urlEntrada);
          if (resEntrada.ok) {
            const dataEntrada = await resEntrada.json();
            // rendimentoPorDia contains { dia, entrada, saida, rendimento }
            const dadosEntrada = (dataEntrada.rendimentoPorDia || []).map((d: any) => ({
              dia: d.dia,
              valor: d.entrada || 0
            }));
            setDadosEntradaPorDia(dadosEntrada);
            // Calculate sum
            const sum = dadosEntrada.reduce((acc: number, d: any) => acc + d.valor, 0);
            setEntradaSum(sum);
          } else {
            setDadosEntradaPorDia([]);
            setEntradaSum(null);
          }
        } else {
          setDadosEntradaPorDia([]);
          setEntradaSum(null);
        }

        // Fetch saida data
        if (sStart && sEnd) {
          const urlSaida = `http://localhost:3000/api/amendoim/analise?dataInicio=${encodeURIComponent(sStart)}&dataFim=${encodeURIComponent(sEnd)}`;
          const resSaida = await fetch(urlSaida);
          if (resSaida.ok) {
            const dataSaida = await resSaida.json();
            const dadosSaida = (dataSaida.rendimentoPorDia || []).map((d: any) => ({
              dia: d.dia,
              valor: d.saida || 0
            }));
            setDadosSaidaPorDia(dadosSaida);
            // Calculate sum
            const sum = dadosSaida.reduce((acc: number, d: any) => acc + d.valor, 0);
            setSaidaSum(sum);
          } else {
            setDadosSaidaPorDia([]);
            setSaidaSum(null);
          }
        } else {
          setDadosSaidaPorDia([]);
          setSaidaSum(null);
        }

        // Calculate comparativo (rendimento) from the fetched data
        if (eStart && eEnd && sStart && sEnd) {
          const totalEntrada = entradaSum || 0;
          const totalSaida = saidaSum || 0;
          setComparativo({
            entradaCurrent: totalEntrada,
            saidaCurrent: totalSaida,
            entradaPrev: 0,
            saidaPrev: 0,
          });
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
        <div className="flex-1 overflow-hidden ">
          <div className="p-4 space">

<<<<<<< HEAD
            {/* Grid com 3 colunas: Saídas por Produto (2 cols, linha 1) + Rendimento (1 col, 2 linhas) + Entrada/Saída (1 col cada, linha 2) */}
            <div className="grid grid-cols-3 grid-rows-2 gap-4 mb-4">
              {/* Saídas por Produto ocupando 2 colunas na primeira linha */}
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden col-span-2 row-start-1">
                <CardHeader className="border-b border-gray-100 pb-2 px-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Saídas por Produto (comparação)</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={"w-44 justify-start text-left font-normal"}>
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
                            <Button onClick={applyProdutosFilters} size="sm" className="flex-1">
                              Aplicar
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3" style={{ height: 'calc(100% - 60px)' }}>
                  <DonutChartWidget
                    fetchUrl={`http://localhost:3000/api/amendoim/chartdata/produtos?${new URLSearchParams({ ...(produtosFilters?.dataInicio && { dataInicio: produtosFilters.dataInicio }), ...(produtosFilters?.dataFim && { dataFim: produtosFilters.dataFim }), tipo: 'saida' })}`}
                    compact={false}
                    unit="kg"
                  />
                </CardContent>
              </Card>

              {/* Card de Cálculo de Rendimento - coluna 3, ocupando 2 linhas */}
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden col-start-3 row-span-2">
                <CardHeader className="border-b border-gray-100 pb-3 px-3">
                  <CardTitle className="text-base font-semibold text-gray-900">Cálculo de Rendimento</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-4">
                  {(entradaSum !== null && saidaSum !== null) && (entradaSum > 0 || saidaSum > 0) ? (
                    <div className="space-y-4">
                      {/* Porcentagem de Aproveitamento */}
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">Aproveitamento</div>
                        <div className="text-4xl font-bold text-green-700">
                          {entradaSum > 0 
                            ? ((saidaSum / entradaSum) * 100).toFixed(2)
                            : '0.00'}%
                        </div>
                      </div>

                      {/* Entrada e Saída */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-xs text-gray-600 font-medium mb-1">Entrada</div>
                          <div className="text-lg font-bold text-red-700">
                            {entradaSum.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs text-gray-600 font-medium mb-1">Saída</div>
                          <div className="text-lg font-bold text-blue-700">
                            {saidaSum.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                          </div>
                        </div>
                      </div>

                      {/* Perda */}
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">Perda de Material</div>
                        <div className="text-xl font-bold text-orange-700">
                          {(entradaSum - saidaSum).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
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

              {/* Segunda linha: Entrada e Saída lado a lado (colunas 1 e 2, linha 2) */}
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden col-start-1 row-start-2">
=======
            {/* Período: Entrada / Saída (comparativo) + Donut de Saídas por produto */}
            <div className="grid grid-cols-3 gap-4 mb-4 ">
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[350px]">
>>>>>>> cf9261d9b53b3689154d0bc955a5ff103c23cb8c
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
                <CardContent className="p-2 h-[220px]">
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
                          formatter={(value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`}
                        />
                        <Bar dataKey="valor" fill="#ef4444" name="Entrada" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">
                      {entradaSum === null ? 'Carregando...' : 'Sem dados para o período'}
                    </div>
                  )}
                </CardContent>
              </Card>

<<<<<<< HEAD
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden col-start-2 row-start-2">
=======
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[350px]">
>>>>>>> cf9261d9b53b3689154d0bc955a5ff103c23cb8c
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
                <CardContent className="p-2 h-[220px]">
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
                          formatter={(value: number) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`}
                        />
                        <Bar dataKey="valor" fill="#6b7280" name="Saída" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-gray-500">
                      {saidaSum === null ? 'Carregando...' : 'Sem dados para o período'}
                    </div>
                  )}
                </CardContent>
              </Card>
<<<<<<< HEAD
            </div>

            {/* Últimos 30 dias: linha com entradas e saídas comparadas */}
            

            {/* Now render the Horário de Produção and Produção Semanal side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Horário de Produção */}
=======

              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[350px]">
                <CardHeader className="border-b border-gray-100 pt-2 h-17">
                  <CardTitle className="text-base font-semibold text-gray-900">Cálculo de Rendimento</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 h-[calc(100%-60px)]">
                  {(entradaSum !== null && saidaSum !== null) && (entradaSum > 0 || saidaSum > 0) ? (
                    <div className="space-y-4">
                      {/* Porcentagem de Aproveitamento */}
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-1">Aproveitamento</div>
                        <div className="text-4xl font-bold text-green-700">
                          {entradaSum > 0 
                            ? ((saidaSum / entradaSum) * 100).toFixed(2)
                            : '0.00'}%
                        </div>
                      </div>

                      {/* Entrada e Saída */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-xs text-gray-600 font-medium mb-1">Entrada</div>
                          <div className="text-lg font-bold text-red-700">
                            {entradaSum.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs text-gray-600 font-medium mb-1">Saída</div>
                          <div className="text-lg font-bold text-blue-700">
                            {saidaSum.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
                          </div>
                        </div>
                      </div>

                      {/* Perda */}
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-xs text-gray-600 font-medium mb-1">Perda de Material</div>
                        <div className="text-xl font-bold text-orange-700">
                          {(entradaSum - saidaSum).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg
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

              
            </div>

            {/* Gráficos de barras Entrada e Saída + Card de Rendimento */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                   

              {/* Card de Cálculo de Conflito/Rendimento */}
              
              <Card className="shadow-lg border border-gray-200 rounded-xl mt-0 overflow-hidden h-[380px] 3xl:h-[420px]">
                <CardHeader className="border-b border-gray-100 h-18 pt-2">
                  <CardTitle className="text-base font-semibold text-gray-900">Saídas por Produto (comparação)</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 h-[calc(100%-60px)]">
                  <DonutChartWidget
                    fetchUrl={`http://localhost:3000/api/amendoim/chartdata/produtos?${new URLSearchParams({ ...(weeklyFilters?.dataInicio && { dataInicio: weeklyFilters.dataInicio }), ...(weeklyFilters?.dataFim && { dataFim: weeklyFilters.dataFim }), tipo: 'saida' })}`}
                    compact
                    unit="kg"
                  />
                </CardContent>
              </Card>
              
              
>>>>>>> cf9261d9b53b3689154d0bc955a5ff103c23cb8c
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
                <CardHeader className="border-b border-gray-100 pb-3 h-17">                  <div className="flex items-center justify-between">
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

            {/* Últimos 30 dias: linha com entradas e saídas comparadas */}
            

            {/* Now render the Horário de Produção and Produção Semanal side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Horário de Produção */}
              
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <HomeRelatorio />;
}