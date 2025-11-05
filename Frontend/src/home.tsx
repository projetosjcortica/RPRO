import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
import HomeRelatorio from "./components/HomeRelatorio";
// Amendoim: render charts directly in Home when módulo for amendoim
import { 
  ChartEntradaSaidaPorHorario,
  ChartFluxoSemanal,
  ChartEficienciaPorTurno,
} from './components/AmendoimCharts';
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

  // Dados específicos por gráfico
  const [dadosHorarios, setDadosHorarios] = useState<any[]>([]);
  const [dadosSemanal, setDadosSemanal] = useState<any[]>([]);
  const [dadosTurnos, setDadosTurnos] = useState<any[]>([]);

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
      <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
        <div className="flex-1 overflow-y-auto thin-red-scrollbar">
          <div className="p-4 space-y-4">
            {/* Linha: Horário de Produção e Produção Semanal (com controles) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Horário de Produção */}
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[400px] 3xl:h-[500px]">
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
              <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[400px] 3xl:h-[500px]">
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

            {/* Eficiência por Turno */}
            <Card className="shadow-lg border border-gray-200 rounded-xl overflow-hidden h-[400px] 3xl:h-[500px]">
              <CardHeader className="border-b border-gray-100 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900">Eficiência por Turno</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={"w-47 justify-start text-left font-normal border border-black " + (!turnosDateRange && "text-gray-400") }>
                          {turnosDateRange?.from ? (
                            turnosDateRange.to ? (
                              <>{formatDate(turnosDateRange.from, 'dd/MM/yy')} - {formatDate(turnosDateRange.to, 'dd/MM/yy')}</>
                            ) : (
                              formatDate(turnosDateRange.from, 'dd/MM/yy')
                            )
                          ) : (
                            <span>Selecione um Período</span>
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2" side="right" align="start" sideOffset={10} alignOffset={-45} onInteractOutside={applyTurnosFilters}>
                        <Calendar
                          mode="range"
                          locale={pt}
                          defaultMonth={turnosDateRange?.from}
                          selected={turnosDateRange}
                          onSelect={handleTurnosDateChange}
                          numberOfMonths={1}
                        />
                        <div className="flex gap-2 mt-2 px-1">
                          <Button variant="outline" onClick={clearTurnosFilters} size="sm" className="flex-1">
                            Ontem
                          </Button>
                          <Button onClick={applyTurnosFilters} size="sm" className="flex-1">
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
                  <ChartEficienciaPorTurno dados={dadosTurnos} bare />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return <HomeRelatorio />;
}