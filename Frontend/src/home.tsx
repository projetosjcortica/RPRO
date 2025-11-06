import { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
import HomeRelatorio from "./components/HomeRelatorio";
// Amendoim: render charts directly in Home when módulo for amendoim
import { 
  ChartEntradaSaidaPorHorario,
  ChartFluxoSemanal,
  ChartEficienciaPorTurno,
} from './components/AmendoimCharts';
import { DonutChartWidget, BarChartWidget } from './components/Widgets';
import Amendoim from './amendoim';
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

  // Side-info state reused for relatorio home
  const [chartsOpen, setChartsOpen] = useState(false);

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

  // Render Amendoim page as a standalone component when user/module is amendoim
  if (tipoHome === "amendoim") {
    return <Amendoim />;
  }

  // Render HomeRelatorio with a right-side sideinfo column (charts/donuts)
  return (
    <div className="h-screen flex">
      <div className="flex-1 overflow-auto">
        <HomeRelatorio />
      </div>
      <div className="w-87 3xl:h-[76vh] h-[74vh] flex flex-col p-2 shadow-xl rounded border border-gray-300 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Resumo Visual</div>
          <button className="text-sm text-gray-500" onClick={() => setChartsOpen(s => !s)}>{chartsOpen ? 'Ocultar' : 'Mostrar'}</button>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="space-y-4">
            <div className="border rounded bg-white p-2">
              <div className="text-sm font-bold mb-1">Produtos</div>
              <div className="h-36">
                <DonutChartWidget fetchUrl={`http://localhost:3000/api/amendoim/chartdata/produtos?${new URLSearchParams({ ...(weeklyFilters?.dataInicio && { dataInicio: weeklyFilters.dataInicio }), ...(weeklyFilters?.dataFim && { dataFim: weeklyFilters.dataFim }) })}`} compact unit="kg" />
              </div>
            </div>

            <div className="border rounded bg-white p-2">
              <div className="text-sm font-bold mb-1">Caixas</div>
              <div className="h-36">
                <DonutChartWidget fetchUrl={`http://localhost:3000/api/amendoim/chartdata/caixas?${new URLSearchParams({ ...(weeklyFilters?.dataInicio && { dataInicio: weeklyFilters.dataInicio }), ...(weeklyFilters?.dataFim && { dataFim: weeklyFilters.dataFim }) })}`} compact unit="kg" />
              </div>
            </div>

            <div className="border rounded bg-white p-2">
              <div className="text-sm font-bold mb-1">Entrada x Saída</div>
              <div className="h-36">
                <DonutChartWidget fetchUrl={`http://localhost:3000/api/amendoim/chartdata/entradaSaida?${new URLSearchParams({ ...(weeklyFilters?.dataInicio && { dataInicio: weeklyFilters.dataInicio }), ...(weeklyFilters?.dataFim && { dataFim: weeklyFilters.dataFim }) })}`} compact unit="kg" />
              </div>
            </div>

            {chartsOpen && (
              <div className="border rounded bg-white p-2">
                <div className="text-sm font-bold mb-1">Horários</div>
                <div className="h-44">
                  <BarChartWidget fetchUrl={`http://localhost:3000/api/amendoim/chartdata/horarios?${new URLSearchParams({ ...(weeklyFilters?.dataInicio && { dataInicio: weeklyFilters.dataInicio }), ...(weeklyFilters?.dataFim && { dataFim: weeklyFilters.dataFim }) })}`} unit="kg" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}