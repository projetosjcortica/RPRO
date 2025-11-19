import { useEffect, useState, useCallback } from "react";
import { Button, buttonVariants } from "./components/ui/button";
import { Loader2, Play, Square, Scale, ArrowBigDown, ArrowBigUp, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import FiltrosAmendoimBar from "./components/FiltrosAmendoim";
import AmendoimConfig from "./components/AmendoimConfig";
import { AmendoimExport } from "./components/AmendoimExport";
import toastManager from "./lib/toastManager";
import { format as formatDateFn } from "date-fns";
import { cn } from "./lib/utils";
import { getProcessador } from "./Processador";
import { Separator } from "./components/ui/separator";
import useAuth from "./hooks/useAuth";
import { resolvePhotoUrl } from "./lib/photoUtils";
import {
  ChartEntradaSaidaPorHorario,
  ChartRendimentoPorDia,
  ChartFluxoSemanal,
  ChartEficienciaPorTurno,
  ChartPerdaAcumulada,
} from "./components/AmendoimCharts";
import { Pagination, PaginationContent, PaginationItem } from "./components/ui/pagination";

interface AmendoimRecord {
  id: number;
  tipo: "entrada" | "saida";
  dia: string;
  hora: string;
  codigoProduto: string;
  codigoCaixa: string;
  nomeProduto: string;
  peso: number;
  balanca?: string;
  createdAt: string;
}

// Componente para renderizar gráficos do AmendoimCharts com dados filtrados
function AmendoimChartsContainer({ 
  filtros, 
  chartType 
}: { 
  filtros: any; 
  chartType: 'entradaSaidaPorHorario' | 'fluxoSemanal' | 'eficienciaPorTurno';
}) {
  const [dadosChart, setDadosChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          ...(filtros.dataInicio && { dataInicio: filtros.dataInicio }),
          ...(filtros.dataFim && { dataFim: filtros.dataFim }),
        });
        
        const response = await fetch(`http://localhost:3000/api/amendoim/analise?${params}`);
        const dados = await response.json();
        
        setDadosChart(dados[chartType] || []);
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
        setDadosChart([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [filtros.dataInicio, filtros.dataFim, chartType]);

  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!dadosChart || dadosChart.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-sm">Sem dados para exibir</div>
          <div className="text-xs mt-1">Ajuste os filtros e tente novamente</div>
        </div>
      </div>
    );
  }

  // Renderizar o gráfico apropriado
  switch (chartType) {
    case 'entradaSaidaPorHorario':
      return <ChartEntradaSaidaPorHorario dados={dadosChart} />;
    case 'fluxoSemanal':
      return <ChartFluxoSemanal dados={dadosChart} />;
    case 'eficienciaPorTurno':
      return <ChartEficienciaPorTurno dados={dadosChart} />;
    default:
      return <div>Gráfico não encontrado</div>;
  }
}
console.log(AmendoimChartsContainer.name);

interface Estatisticas {
  totalRegistros: number;
  pesoTotal: number;
  produtosUnicos: number;
  caixasUtilizadas: number;
  primeiraData?: string;
  ultimaData?: string;
  primeiraHora?: string;
  ultimaHora?: string;
}

interface MetricasRendimento {
  pesoEntrada: number;
  pesoSaida: number;
  rendimentoPercentual: number;
  perda: number;
  perdaPercentual: number;
  primeiraData?: string;
  ultimaData?: string;
  primeiraHora?: string;
  ultimaHora?: string;
}

interface DadosAnalise {
  entradaSaidaPorHorario: Array<{ hora: number; entrada: number; saida: number }>;
  rendimentoPorDia: Array<{ dia: string; entrada: number; saida: number; rendimento: number }>;
  fluxoSemanal: Array<{ diaSemana: string; entrada: number; saida: number }>;
  eficienciaPorTurno: Array<{ turno: string; entrada: number; saida: number; rendimento: number }>;
  perdaAcumulada: Array<{ dia: string; perdaDiaria: number; perdaAcumulada: number }>;
}

interface FiltrosAmendoim {
  dataInicio?: string;
  dataFim?: string;
  codigoProduto?: string;
  nomeProduto?: string;
  tipo?: "entrada" | "saida";
}

export default function Amendoim({ proprietario }: { proprietario?: string } = {}) {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [ihmConfig, setIhmConfig] = useState<{ ip: string; user: string; password: string } | null>(null);
  const [registros, setRegistros] = useState<AmendoimRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [metricasRendimento, setMetricasRendimento] = useState<MetricasRendimento | null>(null);
  const [dadosAnalise, setDadosAnalise] = useState<DadosAnalise | null>(null);
  // resumoProdutos removed from main UI; summary is generated in PDF
  const [comentarios, setComentarios] = useState<{ texto: string; data?: string }[]>([]);
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  // View atual: 'entrada', 'saida' ou 'comparativo'
  const [viewMode, setViewMode] = useState<"entrada" | "saida" | "comparativo">("entrada");
  
  // Tipo para upload
  const [uploadTipo, setUploadTipo] = useState<"entrada" | "saida">("entrada");
 
  

  console.log(error)

  // Filtros ativos (inicializar com últimos 30 dias)
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAmendoim>({});
  
  // Estados para ordenação de colunas
  const [sortColumn, setSortColumn] = useState<'dia' | 'hora' | 'codigoProduto' | 'balanca' | 'nomeProduto' | 'peso' | 'tipo' | null>('dia');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Estados para redimensionamento de colunas
  const DEFAULT_WIDTHS = {
    dia: 100,
    hora: 80,
    codigoProduto: 80,
    balanca: 80,
    nomeProduto: 310,
    peso: 120,
    tipo: 120,
  };
  
  const STORAGE_KEY = "amendoim-table-column-widths";
  
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") return { ...DEFAULT_WIDTHS, ...parsed };
      }
    } catch (e) {
      console.warn("Erro ao carregar larguras das colunas:", e);
    }
    return DEFAULT_WIDTHS;
  });
  
  const [resizing, setResizing] = useState<{
    columnKey: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  
  // Seção de análises expandida
  const [analisesExpanded, setAnalisesExpanded] = useState(false);
  // Modal de configuração
  const [configModalOpen, setConfigModalOpen] = useState(false);
  // Collector
  const [collectorRunning, setCollectorRunning] = useState<boolean>(false);
  const [collectorLoading, setCollectorLoading] = useState<boolean>(false);
  // Modal de seleção de IHM
  const [showIhmModal, setShowIhmModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Obter logo do usuário
  useEffect(() => {
    let mounted = true;
    const loadLogo = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/report/logo");
        if (!res.ok) return;
        const js = await res.json().catch(() => ({}));
        const p = js?.path;
        if (p && mounted) {
          const resolved = resolvePhotoUrl(p);
          setLogoUrl(resolved ? `${resolved}?t=${Date.now()}` : undefined);
        }
        // Se não houver logo configurado e o usuário tem foto, usar a foto do usuário
        if (!p && user && (user as any).photoPath && mounted) {
          const resolved = resolvePhotoUrl((user as any).photoPath);
          setLogoUrl(resolved ? `${resolved}?t=${Date.now()}` : undefined);
        }
      } catch (e) {
        // ignore
      }
    };
    loadLogo();
    return () => { mounted = false; };
  }, [user]);

  // Carregar configuração IHM do amendoim
  useEffect(() => {
    const loadIhmConfig = async () => {
      try {
        console.log('[Amendoim] 🔄 Carregando configuração IHM...');
        const res = await fetch('http://localhost:3000/api/amendoim/config');
        if (!res.ok) {
          console.warn('[Amendoim] ⚠️ Falha ao carregar config:', res.status);
          return;
        }
        const data = await res.json();
        console.log('[Amendoim] 📦 Config recebida:', data);
        
        // Estrutura esperada: { config: {...}, validation: {...} }
        if (data.config) {
          setIhmConfig(data.config);
          console.log('[Amendoim] ✅ IHM Config setada');
        }
        
        // Verificar validação
        if (data.validation) {
          const { isValid, errors, needsIhmSelection } = data.validation;
          console.log('[Amendoim] 🔍 Validação:', { isValid, errors, needsIhmSelection });
          
          if (!isValid) {
            setValidationErrors(errors || []);
            console.log('[Amendoim] ⚠️ Validação falhou:', errors);
            
            // Se precisa selecionar tipo de IHM, mostrar modal
            if (needsIhmSelection) {
              console.log('[Amendoim] 🚨 ABRINDO MODAL DE SELEÇÃO');
              setShowIhmModal(true);
            } else if (errors?.length > 0) {
              // Mostrar erros como notificação
              console.log('[Amendoim] ⚠️ Mostrando erro de validação');
              toastManager.updateError(
                'amendoim-config-validation',
                `Configuração incompleta: ${errors.join(', ')}`
              );
            }
          } else {
            console.log('[Amendoim] ✅ Validação passou');
            setValidationErrors([]);
          }
        } else {
          console.warn('[Amendoim] ⚠️ Sem dados de validação na resposta');
        }
      } catch (e) {
        console.error('[Amendoim] ❌ Erro ao carregar config:', e);
      }
    };
    loadIhmConfig();
  }, []);

  console.log(setAnalisesExpanded.name, setUploadTipo.name, uploading);

  // Handlers para redimensionamento de colunas
  const handleResizeStart = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setResizing({
      columnKey,
      startX: e.clientX,
      startWidth: columnWidths[columnKey] || DEFAULT_WIDTHS.dia,
    });
  }, [columnWidths]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;
    const diff = e.clientX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + diff);
    setColumnWidths((prev) => ({ ...prev, [resizing.columnKey]: newWidth }));
  }, [resizing]);

  const handleResizeEnd = useCallback(() => {
    setResizing(null);
  }, []);

  // Salvar larguras no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnWidths));
    } catch (e) {
      console.warn("Erro ao salvar larguras das colunas:", e);
    }
  }, [columnWidths]);

  // Event listeners para redimensionamento
  useEffect(() => {
    if (resizing) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
      return () => {
        window.removeEventListener("mousemove", handleResizeMove);
        window.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [resizing, handleResizeMove, handleResizeEnd]);

  // Handler para ordenação
  const handleSort = useCallback((column: typeof sortColumn) => {
    console.log('[Amendoim] handleSort - Coluna:', column, '| Atual:', sortColumn, sortDirection);
    
    if (sortColumn === column) {
      // Toggle direction ou reset
      if (sortDirection === 'asc') {
        console.log('[Amendoim] Toggle ASC → DESC');
        setSortDirection('desc');
      } else {
        // Reset para padrão (dia desc)
        console.log('[Amendoim] Reset para Dia DESC');
        setSortColumn('dia');
        setSortDirection('desc');
      }
    } else {
      // Nova coluna: começar com DESC (mais recente/maior primeiro)
      console.log('[Amendoim] Nova coluna:', column, '→ DESC');
      setSortColumn(column);
      setSortDirection('desc');
    }
  }, [sortColumn, sortDirection]);

  // Função para formatar datas
  const formatDate = (raw: string): string => {
    if (!raw) return "";
    const s = String(raw).trim();
    try {
      // Formato DD/MM/YY (ex: 03/11/25 - DO BANCO)
      if (/^\d{2}\/\d{2}\/\d{2}$/.test(s)) {
        const [d, m, y] = s.split("/").map(Number);
        const fullYear = 2000 + y; // Assumir 20xx
        return formatDateFn(new Date(fullYear, m - 1, d), "dd/MM/yyyy");
      }
      // Formato DD-MM-YY (ex: 03-11-25)
      if (/^\d{2}-\d{2}-\d{2}$/.test(s)) {
        const [d, m, y] = s.split("-").map(Number);
        const fullYear = 2000 + y; // Assumir 20xx
        return formatDateFn(new Date(fullYear, m - 1, d), "dd/MM/yyyy");
      }
      // Formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split("-").map(Number);
        return formatDateFn(new Date(y, m - 1, d), "dd/MM/yyyy");
      }
      // Formato DD-MM-YYYY
      if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
        const [d, m, y] = s.split("-").map(Number);
        return formatDateFn(new Date(y, m - 1, d), "dd/MM/yyyy");
      }
      // Fallback: tentar parse direto
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) return formatDateFn(parsed, "dd/MM/yyyy");
    } catch {}
    return s;
  };

  // Buscar registros
  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      // Adicionar filtros aos parâmetros
      if (filtrosAtivos.dataInicio) params.set('dataInicio', filtrosAtivos.dataInicio);
      if (filtrosAtivos.dataFim) params.set('dataFim', filtrosAtivos.dataFim);
      if (filtrosAtivos.codigoProduto) params.set('codigoProduto', filtrosAtivos.codigoProduto);
      if (filtrosAtivos.nomeProduto) params.set('nomeProduto', filtrosAtivos.nomeProduto);
      
      // Adicionar tipo se não estiver no modo comparativo
      // No modo comparativo, não enviamos o tipo para buscar entrada E saída
      if (viewMode !== 'comparativo') {
        params.set('tipo', viewMode);
      }
      
      console.log('[Amendoim] fetchRegistros - ViewMode:', viewMode, '| Tipo enviado:', viewMode !== 'comparativo' ? viewMode : 'ambos');

      // Adicionar ordenação
      if (sortColumn) {
        params.set('sortBy', sortColumn);
        params.set('sortDir', sortDirection === 'asc' ? 'ASC' : 'DESC');
        console.log('[Amendoim] fetchRegistros - Ordenando por:', sortColumn, sortDirection === 'asc' ? 'ASC' : 'DESC');
      }

      const url = `http://localhost:3000/api/amendoim/registros?${params}`;
      console.log('[Amendoim] Buscando:', url);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Erro ao buscar registros: ${res.status}`);
      }

      const data = await res.json();
      setRegistros(data.rows || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filtrosAtivos, viewMode, sortColumn, sortDirection]);

  // Buscar estatísticas
  const fetchEstatisticas = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filtrosAtivos.dataInicio) params.set('dataInicio', filtrosAtivos.dataInicio);
      if (filtrosAtivos.dataFim) params.set('dataFim', filtrosAtivos.dataFim);
      if (filtrosAtivos.codigoProduto) params.set('codigoProduto', filtrosAtivos.codigoProduto);
      if (filtrosAtivos.nomeProduto) params.set('nomeProduto', filtrosAtivos.nomeProduto);
      
      // Adicionar tipo se não estiver no modo comparativo
      if (viewMode !== 'comparativo') {
        params.set('tipo', viewMode);
      }

      const res = await fetch(`http://localhost:3000/api/amendoim/estatisticas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEstatisticas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, [filtrosAtivos, viewMode]);

  // Buscar métricas de rendimento
  const fetchMetricasRendimento = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filtrosAtivos.dataInicio) params.set('dataInicio', filtrosAtivos.dataInicio);
      if (filtrosAtivos.dataFim) params.set('dataFim', filtrosAtivos.dataFim);
      if (filtrosAtivos.codigoProduto) params.set('codigoProduto', filtrosAtivos.codigoProduto);
      if (filtrosAtivos.nomeProduto) params.set('nomeProduto', filtrosAtivos.nomeProduto);

      const res = await fetch(`http://localhost:3000/api/amendoim/metricas/rendimento?${params}`);
      if (res.ok) {
        const data = await res.json();
        setMetricasRendimento(data);
      }
    } catch (err) {
      console.error('Erro ao buscar métricas de rendimento:', err);
      setMetricasRendimento(null);
    }
  }, [filtrosAtivos]);

  // Buscar dados de análise pré-processados
  const fetchDadosAnalise = async () => {
    try {
      const params = new URLSearchParams();
      if (filtrosAtivos.dataInicio) params.set('dataInicio', filtrosAtivos.dataInicio);
      if (filtrosAtivos.dataFim) params.set('dataFim', filtrosAtivos.dataFim);
      if (filtrosAtivos.codigoProduto) params.set('codigoProduto', filtrosAtivos.codigoProduto);
      if (filtrosAtivos.nomeProduto) params.set('nomeProduto', filtrosAtivos.nomeProduto);

      const res = await fetch(`http://localhost:3000/api/amendoim/analise?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDadosAnalise(data);
      }
    } catch (err) {
      console.error('Erro ao buscar dados de análise:', err);
      setDadosAnalise(null);
    }
  };

  // (Resumo por produto agora gerado apenas no PDF; não buscado aqui)

  // Carregar dados iniciais na montagem do componente
  useEffect(() => {
    console.log('[Amendoim] 🚀 Montagem inicial - carregando dados...');
    fetchRegistros();
    fetchEstatisticas();
    fetchDadosAnalise();
    if (viewMode === 'comparativo') {
      fetchMetricasRendimento();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio = apenas na montagem

  // Recarregar dados quando filtros, página, modo ou ordenação mudarem
  useEffect(() => {
    console.log('[Amendoim] useEffect triggered - ViewMode:', viewMode, '| Page:', page);
    fetchRegistros();
    fetchEstatisticas();
    fetchDadosAnalise(); // Carregar dados de análise sempre
    if (viewMode === 'comparativo') {
      console.log('[Amendoim] Modo comparativo - buscando métricas de rendimento');
      fetchMetricasRendimento();
    } else {
      console.log('[Amendoim] Modo', viewMode, '- não busca métricas de rendimento');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filtrosAtivos, viewMode, sortColumn, sortDirection]);

  // resumoTable removed; summary rendering is handled in the PDF component only

  // Helper: render detailed rows com larguras dinâmicas
  function detailedRows(items: AmendoimRecord[]) {
    return (
      <div>
        {items.map((r) => {
          // Manter padrão zebrado independente do modo
          const bgColor = r.id % 2 === 0 ? 'bg-white' : 'bg-gray-50';
          
          return (
            <div key={r.id} className={`flex items-center border-y ${bgColor}`}>
              <div className="border-x py-2 flex justify-center" style={{ width: `${columnWidths.dia}px`, minWidth: `${columnWidths.dia}px` }}>{formatDate(r.dia)}</div>
              <div className="border-x py-2 flex justify-center" style={{ width: `${columnWidths.hora}px`, minWidth: `${columnWidths.hora}px` }}>{r.hora}</div>
              <div className="border-x pr-2 py-2 flex justify-end" style={{ width: `${columnWidths.codigoProduto}px`, minWidth: `${columnWidths.codigoProduto}px` }}>{r.codigoProduto}</div>
              <div className="border-x pr-2 py-2 flex justify-end" style={{ width: `${columnWidths.balanca}px`, minWidth: `${columnWidths.balanca}px` }}>{r.balanca ?? '-'}</div>
              <div className="border-x py-2 pl-2 flex justify-start" style={{ width: `${columnWidths.nomeProduto}px`, minWidth: `${columnWidths.nomeProduto}px`, overflow: 'hidden' }}>{r.nomeProduto}</div>
              <div className="border-x pr-2 py-2 flex justify-end" style={{ width: `${columnWidths.peso}px`, minWidth: `${columnWidths.peso}px` }}>{Number(r.peso || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</div>
              <div className="border-x py-2 flex justify-center" style={{ width: `${columnWidths.tipo}px`, minWidth: `${columnWidths.tipo}px` }}>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  r.tipo === 'entrada' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {r.tipo}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Handler para aplicar filtros
  const handleAplicarFiltros = (filtros: FiltrosAmendoim) => {
    setFiltrosAtivos(filtros);
    setPage(1); // Resetar para primeira página ao aplicar filtros
    // setChartsOpen(true); // Abrir gráficos ao buscar
  };

  const fetchCollectorStatus = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/amendoim/collector/status", { method: "GET" });
      if (!res.ok) return;
      const status = await res.json().catch(() => ({}));
  const isRunning = !!(status && status.running);
  setCollectorRunning(isRunning);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchCollectorStatus();
    const id = window.setInterval(() => void fetchCollectorStatus(), 5000);
    return () => window.clearInterval(id);
  }, [fetchCollectorStatus]);

  // Atualizar dados automaticamente enquanto o coletor estiver rodando
  useEffect(() => {
    if (!collectorRunning) return;
    
    // Atualizar dados a cada 30 segundos quando o coletor está ativo
    // Em vez de tocar o state de filtros (que faz a tabela piscar), chamamos
    // as funções de fetch diretamente para atualizar apenas os dados necessários.
    const intervalId = setInterval(() => {
      console.log('[Amendoim] Atualizando dados automaticamente (coletor ativo) - fetch direto');
      void fetchRegistros();
      void fetchEstatisticas();
      if (viewMode === 'comparativo') void fetchMetricasRendimento();
    }, 30000); // 30 segundos para capturar mudanças do coletor de 1min

    return () => clearInterval(intervalId);
  }, [collectorRunning, fetchRegistros, fetchEstatisticas, fetchMetricasRendimento, viewMode]);

  // Resetar larguras das colunas para padrão
  const resetTableColumns = () => {
    try {
      setColumnWidths(DEFAULT_WIDTHS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WIDTHS));
      // Forçar re-render leve para atualizar UI se necessário
      // (não mexemos nos filtros para evitar piscar a tabela)
    } catch (e) {
      console.warn('[Amendoim] falha ao resetar colunas', e);
    }
  };

  const handleCollectorToggle = async () => {
    if (collectorLoading) return;
  setCollectorLoading(true);
    try {
  if (collectorRunning) {
        const res = await fetch("http://localhost:3000/api/amendoim/collector/stop", { method: "POST" });
        if (!res.ok) throw new Error("Falha ao interromper o coletor.");
        await res.json().catch(() => ({}));
        await fetchCollectorStatus();
        await fetchRegistros();
        await fetchEstatisticas();
        try { toastManager.updateSuccess('collector-toggle', 'Coletor parado'); } catch(e){}
  } else {
        // Verificar se há erros de validação antes de iniciar
        if (validationErrors.length > 0) {
          toastManager.updateError(
            'collector-validation',
            'Configure o sistema antes de iniciar a coleta'
          );
          setShowIhmModal(true);
          setCollectorLoading(false);
          return;
        }
        
  // Start amendoim collector (will collect both entrada and saida as configured)
  try { toastManager.showLoading('collector-toggle', 'Iniciando coletor Amendoim...'); } catch(e){}
        const res = await fetch("http://localhost:3000/api/amendoim/collector/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intervalMinutes: 5 }),
        });
        if (!res.ok) throw new Error("Falha ao iniciar o coletor Amendoim.");
        await res.json().catch(() => ({}));
        await fetchCollectorStatus();
        await fetchRegistros();
        await fetchEstatisticas();
        try { toastManager.updateSuccess('collector-toggle', 'Coletor iniciado'); } catch(e){}
      }
    } catch (error: any) {
      console.error("Erro ao controlar collector:", error);
    } finally {
      setCollectorLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const processador = getProcessador();
      const data = await processador.uploadAmendoimFile(file, uploadTipo);

      if (!data || !data.ok) {
        throw new Error(data?.error || 'Erro ao processar arquivo');
      }

      // Mostrar toast de sucesso
      const mensagemSucesso = `${data.salvos} registro(s) processado(s) com sucesso`;
      try {
        toastManager.updateSuccess('amendoim-upload', mensagemSucesso);
      } catch (e) {
        console.error('Toast error:', e);
      }

      // Recarregar registros após upload bem-sucedido
      if (data.salvos > 0) {
        await fetchRegistros();
        await fetchEstatisticas();
      }
    } catch (err: any) {
      // Mostrar toast de erro
      const mensagemErro = err.message || 'Erro ao enviar arquivo';
      try {
        toastManager.updateError('amendoim-upload', mensagemErro);
      } catch (e) {
        console.error('Toast error:', e);
      }
      setError(mensagemErro);
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  console.log(handleFileUpload.name);

  const totalPages = Math.ceil(total / pageSize);

  // Gerar array de páginas para renderização (mesmo padrão do report.tsx)
  const pages = (() => {
    const maxVisible = 5;
    const result: number[] = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= maxVisible; i++) result.push(i);
      } else if (page >= totalPages - 2) {
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) result.push(i);
      } else {
        for (let i = page - 2; i <= page + 2; i++) result.push(i);
      }
    }
    
    return result;
  })();

  // Log de debug do estado do modal
  console.log('[Amendoim] 🎯 Estado do modal:', { 
    showIhmModal, 
    validationErrors: validationErrors.length,
    ihmConfig: ihmConfig ? 'presente' : 'ausente'
  });
  

  return (
    <div className="flex flex-col gap-12.5 w-full h-full justify-start">
      {/* Header */}
      <div className="h-[10dvh] flex flex-row justify-between w-full">
        <div className="flex flex-row items-end gap-1 h-[10dvh]">
          {/* Resetar colunas: posição alinhada com o relatório (ração) */}
          <div>
            <Button
              onClick={resetTableColumns}
              variant="ghost"
              className=" text-gray-500 hover:text-gray-700 hover:underline transition-colors"
            >
              Resetar colunas
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-end justify-end gap-2">
          <div className="flex flex-row items-end gap-1"> 
            <FiltrosAmendoimBar onAplicarFiltros={handleAplicarFiltros} /> 
            {/* Collector toggle (mesma UI do Report) */}
            <Button
              onClick={handleCollectorToggle}
              disabled={collectorLoading}
              className={cn(
                "flex items-center gap-1",
                collectorRunning ? "bg-gray-600 hover:bg-red-700" : "bg-red-600 hover:bg-gray-700"
              )}
            >
              {collectorLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : collectorRunning ? (
                <Square className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {collectorLoading ? (
                <p> Processando...</p>
              ) : collectorRunning ? (
                <p>  Parar coleta</p>
              ) : (
                <p> Iniciar coleta</p>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Seção de Análises Expandível */} 
       
      {analisesExpanded && dadosAnalise && (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <ChartEntradaSaidaPorHorario dados={dadosAnalise.entradaSaidaPorHorario} />
            <ChartRendimentoPorDia dados={dadosAnalise.rendimentoPorDia} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartFluxoSemanal dados={dadosAnalise.fluxoSemanal} />
            <ChartEficienciaPorTurno dados={dadosAnalise.eficienciaPorTurno} />
            <ChartPerdaAcumulada dados={dadosAnalise.perdaAcumulada} />
          </div>
        </div>
      )}

      <div className="flex flex-row gap-2 justify-start w-full">
          {/* Conteúdo principal */}
          <div className="flex-1 flex flex-col gap-3.5 items-start justify-start h-[90vh] 3xl:h-206 w-[68px]">

          {/* Table */}
          <div className="flex w-full h-[74vh] 3xl:h-[74.90vh] overflow-hidden shadow-xl rounded flex border border-gray-300">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 h-[54vh] w-full text-center">
            <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto" />
            <p className="text-lg font-medium text-gray-700">Carregando dados...</p>
            <p className="text-sm text-gray-500">Os dados estão sendo processados, por favor aguarde.</p>
          </div>
        ) : registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 h-[54vh] w-full text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-semibold text-gray-700">Nenhum registro encontrado</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Ajuste os filtros ou envie um arquivo CSV para visualizar os dados
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col relative">
            <div className=" overflow-auto 2xl:overflow-x-hidden flex-1 thin-red-scrollbar">
              <div className="min-w-max w-full">
                {/* Cabeçalho com ordenação e redimensionamento */}
                <div className="sticky top-0 z-10 bg-gray-200 border-b border-gray-300">
                  <div className="flex">
                    {/* Dia */}
                    <div 
                      className="relative flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors select-none" 
                      style={{ width: `${columnWidths.dia}px`, minWidth: `${columnWidths.dia}px` }}
                      onClick={() => handleSort('dia')}
                    >
                      <span className="flex items-center gap-1 pointer-events-none">
                        Dia
                        {sortColumn === 'dia' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleResizeStart(e, 'dia');
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Hora */}
                    <div 
                      className="relative flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors select-none" 
                      style={{ width: `${columnWidths.hora}px`, minWidth: `${columnWidths.hora}px` }}
                      onClick={() => handleSort('hora')}
                    >
                      <span className="flex items-center gap-1 pointer-events-none">
                        Hora
                        {sortColumn === 'hora' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleResizeStart(e, 'hora');
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Cód. Produto */}
                    <div 
                      className="relative flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors select-none" 
                      style={{ width: `${columnWidths.codigoProduto}px`, minWidth: `${columnWidths.codigoProduto}px` }}
                      onClick={() => handleSort('codigoProduto')}
                    >
                      <span className="flex items-center gap-1 pointer-events-none">
                        Cód. Produto
                        {sortColumn === 'codigoProduto' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleResizeStart(e, 'codigoProduto');
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Balança */}
                    <div 
                      className="relative flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors select-none" 
                      style={{ width: `${columnWidths.balanca}px`, minWidth: `${columnWidths.balanca}px` }}
                      onClick={() => handleSort('balanca')}
                    >
                      <span className="flex items-center gap-1 pointer-events-none">
                        Balança
                        {sortColumn === 'balanca' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleResizeStart(e, 'balanca');
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Nome do Produto */}
                    <div 
                      className="relative flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors select-none" 
                      style={{ width: `${columnWidths.nomeProduto}px`, minWidth: `${columnWidths.nomeProduto}px` }}
                      onClick={() => handleSort('nomeProduto')}
                    >
                      <span className="flex items-center gap-1 pointer-events-none">
                        Nome do Produto
                        {sortColumn === 'nomeProduto' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleResizeStart(e, 'nomeProduto');
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Peso (kg) */}
                    <div 
                      className="relative flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors select-none" 
                      style={{ width: `${columnWidths.peso}px`, minWidth: `${columnWidths.peso}px` }}
                      onClick={() => handleSort('peso')}
                    >
                      <span className="flex items-center gap-1 pointer-events-none">
                        Peso (kg)
                        {sortColumn === 'peso' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleResizeStart(e, 'peso');
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Tipo */}
                    <div 
                      className="relative flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors select-none" 
                      style={{ width: `${columnWidths.tipo}px`, minWidth: `${columnWidths.tipo}px` }}
                      onClick={() => handleSort('tipo')}
                    >
                      <span className="flex items-center gap-1 pointer-events-none">
                        Tipo
                        {sortColumn === 'tipo' ? (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleResizeStart(e, 'tipo');
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>

                {/* Corpo da   — visão detalhada (ordenação aplicada no backend) */}
                <div>
                  {registros && registros.length > 0 ? (
                    detailedRows(registros)
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500">Sem registros para exibir</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}
          </div>

          {/* Pagination */}
          <div className="flex flex-row items-center justify-end mt-2">
            <Pagination className="flex flex-row justify-end">
              <PaginationContent>
                <PaginationItem>
                  <button
                    onClick={() => {
                      if (page !== 1) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setPage(Math.max(1, page - 1));
                      }
                    }}
                    disabled={page === 1 || loading}
                    className="p-1 active:bg-red-500 transition-colors rounded"
                    title="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </PaginationItem>

                {pages.map((p) => {
                  const isActive = p === page;
                  return (
                    <PaginationItem key={p}>
                      <button
                        onClick={() => {
                          if (p !== page) {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            setPage(p);
                          }
                        }}
                        aria-current={isActive ? "page" : undefined}
                        disabled={loading && p !== page}
                        className={cn(
                          buttonVariants({ variant: "default" }),
                          isActive
                            ? "bg-red-600 text-white"
                            : loading && p !== page
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-gray-300 text-black hover:bg-gray-400 transition-colors"
                        )}
                      >
                        {p}
                      </button>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <button
                    onClick={() => {
                      if (page !== totalPages) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setPage(Math.min(page + 1, totalPages));
                      }
                    }}
                    disabled={page === totalPages || loading}
                    className="p-1 active:bg-red-500 transition-colors rounded"
                    title="Próxima página"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

      {/* Side Info com drawer de gráficos */}
      <div
        className="relative w-87 3xl:h-[74.90vh] h-[74vh] flex flex-col shadow-xl rounded border border-gray-300 flex-shrink-0"
        style={{ zIndex: 10 }}
      >
      <div className="flex flex-col p-2 gap-2 justify-center items-center flex-1 overflow-hidden">
      <div className="flex items-center gap-1 h-9 w-fit bg-white rounded-lg border border-black p-1 shadow-sm">
        <Button
          size="sm"
          onClick={() => {
            setViewMode('entrada');
            // Resetar para página 1 ao mudar de modo
            setPage(1);
          }}
          className={cn(
            "h-7 text-xs font-medium transition-all",
            viewMode === 'entrada'
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          )}
        >
          Entrada
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setViewMode('saida');
            // Resetar para página 1 ao mudar de modo
            setPage(1);
          }}
          className={cn(
            "h-7 text-xs font-medium transition-all",
            viewMode === 'saida'
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          )}
        >
          Saída
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setViewMode('comparativo');
            // Resetar para página 1 ao mudar de modo
            setPage(1);
            // Limpar filtros ao entrar no modo comparativo
            setFiltrosAtivos({});
          }}
          className={cn(
            "h-7 text-xs font-medium transition-all",
            viewMode === 'comparativo'
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          )}
        >
          Comparativo
        </Button>
      </div>
        {/* Drawer de gráficos compacto, por trás do sideinfo */}

        {/* Conteúdo do sideinfo - Estatísticas */}
        <div className="flex-1 overflow-auto" style={{ zIndex: 15 }}>
          
          {/* Card de Métricas de Rendimento (apenas no modo comparativo) */}
          {viewMode === 'comparativo' && metricasRendimento && (
            <div className="mb-4 rounded-xl p-4">
              <div className="text-sm font-bold mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4"/>
                Análise de Rendimento
              </div>

              
              
              <div className="space-y-3">
                {/* Rendimento % - Destaque Principal */}
                <div className="bg-white rounded-lg p-3 shadow-md flex flex-col items-center justify-center">
                  <div className="text-sm text-gray-500 font-medium ">Aproveitamento</div>
                  <div className="text-3xl font-bold ">
                    {metricasRendimento.rendimentoPercentual.toFixed(2)}%
                  </div>
                </div>

                {/* Grid Entrada/Saída */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="shadow-md rounded-lg p-2">
                    <div className="text-base font-medium">Entrada</div>
                    <div className="text-lg font-bold">
                      {metricasRendimento.pesoEntrada.toLocaleString('pt-BR', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })} kg
                    </div>
                  </div>
                  <div className="shadow-md rounded-lg p-2">
                    <div className="text-base font-medium">Saída</div>
                    <div className="text-lg font-bold">
                      {metricasRendimento.pesoSaida.toLocaleString('pt-BR', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })} kg
                    </div>
                  </div>
                </div>

                {/* Perda */}
                <div className="shadow-md rounded-lg p-2">
                  <div className="text-lg text-red-600 font-medium">Perda de material</div>
                  <div className="text-2xl font-bold text-red-800">
                    {metricasRendimento.perda.toLocaleString('pt-BR', {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })} kg
                    <span className="text-sm ml-2">({metricasRendimento.perdaPercentual.toFixed(2)}%)</span>
                  </div>
                </div>
                <div className=" rounded-lg p-3 shadow-lg transition-shadow">
                <div className="text-xs text-gray-500 text-center font-medium">Período</div>
                <div className="grid grid-cols-20 rounded-lg h-18">
                  <div className="flex flex-col justify-center items-center col-start-5">
                    <div className="text-md text-center font-bold text-gray-800 flex justify-center items-center col-start-3">
                    {metricasRendimento.primeiraData 
                      ? `${formatDate(metricasRendimento.primeiraData)}`
                      : "Sem registros"}
                    </div>
                    <div className="text-sm font-semibold opacity-50">
                      {metricasRendimento.primeiraHora || ""}
                    </div>
                  </div>
                  <Separator orientation="vertical" className="mt-2 col-start-11"/>
                  
                  <div className="flex flex-col justify-center items-center col-start-16">
                    <div className="text-md text-center font-bold text-gray-800 flex justify-center items-center col-start-3">
                    {metricasRendimento.ultimaData 
                      ? `${formatDate(metricasRendimento.ultimaData)}`
                      : "Sem registros"}
                    </div>
                    <div className="text-sm font-semibold opacity-50">
                      {metricasRendimento.ultimaHora || ""}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}
          
          {viewMode === 'saida' && estatisticas && (
            <div className="space-y-2 p-4">
              <div className="text-sm font-bold mb-3 flex items-center gap-2">
                <ArrowBigUp className="h-4 w-4"/>
                Análise de Saída
              </div>
              {/* Peso Total - Destaque */}
              <div className="bg-gradient-to-r h-25 rounded-lg p-3 shadow-lg flex items-center justify-center ">
                <p className="text-lg text-black font-bold">Total: {""}
                  {estatisticas.pesoTotal.toLocaleString('pt-BR', { 
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })} <span className="text-lg">kg</span>
                </p>
              </div>
              
              <div className="rounded-lg p-3 shadow-lg transition-shadow">
                <div className="text-xs text-gray-500 text-center font-medium">Período</div>
                <div className="grid grid-cols-20 rounded-lg h-18">
                  <div className="flex flex-col justify-center items-center col-start-5">
                    <div className="text-md text-center font-bold text-gray-800 flex justify-center items-center col-start-3">
                    {estatisticas.primeiraData 
                      ? `${formatDate(estatisticas.primeiraData)}`
                      : "Sem registros"}
                    </div>
                    <div className="text-sm font-semibold opacity-50">
                      {estatisticas.primeiraHora || ""}
                    </div>
                  </div>
                  <Separator orientation="vertical" className="mt-2 col-start-11"/>
                  
                  <div className="flex flex-col justify-center items-center col-start-16">
                    <div className="text-md text-center font-bold text-gray-800 flex justify-center items-center col-start-3">
                    {estatisticas.ultimaData 
                      ? `${formatDate(estatisticas.ultimaData)}`
                      : "Sem registros"}
                    </div>
                    <div className="text-sm font-semibold opacity-50">
                      {estatisticas.ultimaHora || ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid com outros cards */}
              <div className="grid grid-cols-12 rounded-lg shadow-lg py-1 px-5 h-26">
                <div className=" col-start-3 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-500 font-medium">Registros</div>
                  <div className="text-xl font-bold text-gray-800">{estatisticas.totalRegistros}</div>
                </div>
                <Separator orientation="vertical" className="col-start-7"/>
                <div className=" col-start-10 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-500 font-medium">Produtos</div>
                  <div className="text-xl font-bold text-gray-800">{estatisticas.produtosUnicos}</div>
                </div>
                
              </div>

              {/* <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs text-gray-500 font-medium">Caixas Utilizadas</div>
                <div className="text-xl font-bold text-gray-800">{estatisticas.caixasUtilizadas}</div>
              </div> */}
            </div>
          )}
          {viewMode === 'entrada' && estatisticas && registros &&  (
           <div className="space-y-2 p-4">
              <div className="text-sm font-bold mb-3 flex items-center gap-2">
                <ArrowBigDown className="h-4 w-4"/>
                Análise de Entrada
              </div>
              {/* Peso Total - Destaque */}
              <div className="bg-gradient-to-r h-25 rounded-lg p-3 shadow-lg flex items-center justify-center ">
                <p className="text-lg text-black font-bold">Total: {""}
                  {estatisticas.pesoTotal.toLocaleString('pt-BR', { 
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })} <span className="text-lg">kg</span>
                </p>
              </div>
              <div className=" rounded-lg p-3 shadow-lg transition-shadow">
                <div className="text-xs text-gray-500 text-center font-medium">Período</div>
                <div className="grid grid-cols-20 rounded-lg h-18">
                  <div className="flex flex-col justify-center items-center col-start-5">
                    <div className="text-md text-center font-bold text-gray-800 flex justify-center items-center col-start-3">
                    {estatisticas.primeiraData 
                      ? `${formatDate(estatisticas.primeiraData)}`
                      : "Sem registros"}
                    </div>
                    <div className="text-sm font-semibold opacity-50">
                      {estatisticas.primeiraHora || ""}
                    </div>
                  </div>
                  <Separator orientation="vertical" className="mt-2 col-start-11"/>
                  
                  <div className="flex flex-col justify-center items-center col-start-16">
                    <div className="text-md text-center font-bold text-gray-800 flex justify-center items-center col-start-3">
                    {estatisticas.ultimaData 
                      ? `${formatDate(estatisticas.ultimaData)}`
                      : "Sem registros"}
                    </div>
                    <div className="text-sm font-semibold opacity-50">
                      {estatisticas.ultimaHora || ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid com outros cards */}
              <div className="grid grid-cols-12 rounded-lg shadow-lg py-1 px-5 h-26">
                <div className=" col-start-3 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-500 font-medium">Registros</div>
                  <div className="text-xl font-bold text-gray-800">{estatisticas.totalRegistros}</div>
                </div>
                <Separator orientation="vertical" className="col-start-7"/>
                <div className=" col-start-10 flex flex-col items-center justify-center">
                  <div className="text-xs text-gray-500 font-medium">Produtos</div>
                  <div className="text-xl font-bold text-gray-800">{estatisticas.produtosUnicos}</div>
                </div>
              </div>

              {/* <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs text-gray-500 font-medium">Caixas Utilizadas</div>
                <div className="text-xl font-bold text-gray-800">{estatisticas.caixasUtilizadas}</div>
              </div> */}
            </div>
          )}
        </div>
        
        {/* Botão de Exportação - Centralizado */}
        <div className="w-full px-2 pb-2 flex justify-center items-center gap-3">
          {(() => {
            const comentariosComId = comentarios.map((c, idx) => ({ id: String(idx), texto: c.texto, data: c.data || new Date().toLocaleString('pt-BR') }));

            return (
              <AmendoimExport
                filtros={{ ...filtrosAtivos, ...(viewMode !== 'comparativo' ? { tipo: viewMode } : {}) }}
                comentarios={comentariosComId}
                onAddComment={(texto) => setComentarios((s) => [...s, { texto, data: new Date().toLocaleString('pt-BR') }])}
                onRemoveComment={(id) => {
                  const index = parseInt(id as string);
                  if (!isNaN(index)) setComentarios((s) => s.filter((_, i) => i !== index));
                }}
                logoUrl={logoUrl}
                proprietario={proprietario}
              />
            );
          })()}
        </div>
      </div>
      </div>
      </div>
      
      {/* Modal de Configuração */}
      <AmendoimConfig
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onSave={() => {
          // Recarregar dados após salvar configuração
          fetchRegistros();
          fetchEstatisticas();
          if (viewMode === 'comparativo') {
            fetchMetricasRendimento();
          }
        }}
      />
    </div>
  );
}
