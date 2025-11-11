import { useEffect, useState, useCallback } from "react";
import { Button, buttonVariants } from "./components/ui/button";
import { Loader2, Play, Square, Scale, ArrowBigDown, ArrowBigUp, ChevronLeft, ChevronRight } from "lucide-react";
import { DonutChartWidget, BarChartWidget } from "./components/Widgets";
import FiltrosAmendoimBar from "./components/FiltrosAmendoim";
import AmendoimConfig from "./components/AmendoimConfig";
import { AmendoimExport } from "./components/AmendoimExport";
import toastManager from "./lib/toastManager";
import { format as formatDateFn } from "date-fns";
import { cn } from "./lib/utils";
import { Separator } from "./components/ui/separator";
import useAuth from "./hooks/useAuth";
import { resolvePhotoUrl } from "./lib/photoUtils";
import { RefreshButton } from "./components/RefreshButton";
import {
  ChartEntradaSaidaPorHorario,
  ChartRendimentoPorDia,
  ChartFluxoSemanal,
  ChartEficienciaPorTurno,
  ChartPerdaAcumulada,
} from "./components/AmendoimCharts";
import { Pagination, PaginationContent, PaginationItem } from "./components/ui/pagination";
import { IhmSelectionModal } from "./components/IhmSelectionModal";

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

export default function Amendoim() {
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

  // Calcular últimos 7 dias para filtros padrão (para garantir que capture dados recentes)
  const getUltimosDias = () => {
    const hoje = new Date();
    const inicio = new Date();
    inicio.setDate(hoje.getDate() - 7); // Últimos 7 dias
    
    return {
      dataInicio: inicio.toISOString().split('T')[0], // YYYY-MM-DD
      dataFim: hoje.toISOString().split('T')[0],
    };
  };

  // Filtros ativos (inicializar com últimos 7 dias)
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAmendoim>(getUltimosDias());
  
  // Drawer de gráficos
  const [chartsOpen, setChartsOpen] = useState(false);
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

  // Função para formatar datas
  const formatDate = (raw: string): string => {
    if (!raw) return "";
    const s = String(raw).trim();
    try {
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
      if (viewMode !== 'comparativo') {
        params.set('tipo', viewMode);
      }

      const res = await fetch(`http://localhost:3000/api/amendoim/registros?${params}`);
      
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
  }, [page, pageSize, filtrosAtivos, viewMode]);

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
  const fetchMetricasRendimento = async () => {
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
  };

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

  // Recarregar dados quando filtros, página ou modo mudarem
  useEffect(() => {
    fetchRegistros();
    fetchEstatisticas();
    fetchDadosAnalise(); // Carregar dados de análise sempre
    if (viewMode === 'comparativo') {
      fetchMetricasRendimento();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filtrosAtivos, viewMode]);

  // resumoTable removed; summary rendering is handled in the PDF component only

  // Helper: render detailed rows (original registros)
  function detailedRows(items: AmendoimRecord[]) {
    return (
      <div>
        {items.map((r) => (
          <div key={r.id} className={`flex items-center border-y ${r.id % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="border-x py-2 flex justify-center" style={{ width: '100px', minWidth: '100px' }}>{formatDate(r.dia)}</div>
            <div className="border-x py-2 flex justify-center" style={{ width: '80px', minWidth: '80px' }}>{r.hora}</div>
            <div className="border-x pr-2 py-2 flex justify-end" style={{ width: '120px', minWidth: '120px' }}>{r.codigoProduto}</div>
            <div className="border-x pr-2 py-2 flex justify-end" style={{ width: '120px', minWidth: '120px' }}>{r.codigoCaixa}</div>
            <div className="border-x pr-2 py-2 flex justify-end" style={{ width: '80px', minWidth: '80px' }}>{r.balanca ?? '-'}</div>
            <div className="border-x py-2 pl-2 flex justify-start" style={{ width: '250px', minWidth: '250px', overflow: 'hidden' }}>{r.nomeProduto}</div>
            <div className="border-x pr-2 py-2 flex justify-end" style={{ width: '120px', minWidth: '120px' }}>{Number(r.peso || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</div>
            <div className="border-x py-2 flex justify-center" style={{ width: '100/px', minWidth: '100px' }}>{r.tipo}</div>
          </div>
        ))}
      </div>
    );
  }

  // Handler para aplicar filtros
  const handleAplicarFiltros = (filtros: FiltrosAmendoim) => {
    setFiltrosAtivos(filtros);
    setPage(1); // Resetar para primeira página ao aplicar filtros
    setChartsOpen(true); // Abrir gráficos ao buscar
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
    
    // Atualizar dados a cada 30 segundos quando o coletor está ativo (para testes com 1min de coleta)
    const intervalId = setInterval(() => {
      console.log('[Amendoim] Atualizando dados automaticamente (coletor ativo)');
      // Força re-fetch fazendo setState nos filtros (triggers o useEffect principal)
      setFiltrosAtivos(prev => ({ ...prev }));
    }, 30000); // 30 segundos para capturar mudanças do coletor de 1min
    
    return () => clearInterval(intervalId);
  }, [collectorRunning]);

  const handleCollectorToggle = async () => {
    if (collectorLoading) return;
  setCollectorLoading(true);
    try {
      try { toastManager.showInfoOnce('collector-toggle', collectorRunning ? 'Parando coleta...' : 'Iniciando coleta...'); } catch(e){}
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', uploadTipo); // Adiciona tipo ao upload

      const res = await fetch('http://localhost:3000/api/amendoim/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar arquivo');
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
        </div>
        <div className="flex flex-col items-end justify-end gap-2">
          <div className="flex flex-row items-end gap-1">
            {/* Toggle Entrada/Saída/Comparativo */}
            {/* <div className="flex items-center gap-1 h-9 bg-white rounded-lg border border-black p-1 shadow-sm">
              <Button
                size="sm"
                onClick={() => setViewMode('entrada')}
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
                onClick={() => setViewMode('saida')}
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
                onClick={() => setViewMode('comparativo')}
                className={cn(
                  "h-7 text-xs font-medium transition-all",
                  viewMode === 'comparativo'
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                )}
              >
                Comparativo
              </Button>
            </div> */}
            <FiltrosAmendoimBar onAplicarFiltros={handleAplicarFiltros} />
            
            {/* Botão de Configuração */}
            {/* {user?.isAdmin && (
              <Button
                onClick={() => setConfigModalOpen(true)}
                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-800"
                title="Configurar coleta de amendoim"
              >
                <Settings className="h-4 w-4" />
                <p className="hidden 3xl:flex">Configurar</p>
              </Button>
            )} */}

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

            {/* Botão de busca única na IHM */}
            <RefreshButton
              type="amendoim"
              ihmConfig={ihmConfig || undefined}
              onRefresh={async () => {
                await fetchRegistros();
                await fetchEstatisticas();
              }}
              label="Buscar IHM"
              size="default"
            />
          </div>
        </div>
      </div>

      {/* Seção de Análises Expandível */}
      {/* Top donuts: Produtos / Caixas / Entrada x Saída (visível apenas na tela Amendoim) */}
       
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
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              {error}
            </div>
          )}

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
            <div className="overflow-auto flex-1 thin-red-scrollbar">
              <div className="min-w-max w-full">
                {/* Cabeçalho */}
                <div className="sticky top-0 z-10 bg-gray-200 border-b border-gray-300">
                  <div className="flex">
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '100px', minWidth: '100px' }}>
                      Dia
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '80px', minWidth: '80px' }}>
                      Hora
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '120px', minWidth: '120px' }}>
                      Cód. Produto
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '120px', minWidth: '120px' }}>
                      Cód. Caixa
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '80px', minWidth: '80px' }}>
                      Balança
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '250px', minWidth: '250px' }}>
                      Nome do Produto
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '120px', minWidth: '120px' }}>
                      Peso (kg)
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '100px', minWidth: '100px' }}>
                      Tipo
                    </div>
                  </div>
                </div>

                {/* Corpo da tabela — visão detalhada (resumo disponível apenas no PDF) */}
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
                    className="p-1"
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
                    className="p-1"
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
          onClick={() => setViewMode('entrada')}
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
          onClick={() => setViewMode('saida')}
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
          onClick={() => setViewMode('comparativo')}
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
        {chartsOpen && (
          <div
            className="absolute top-0 right-full mr-2 h-full w-96 bg-white border rounded-l-lg shadow-lg overflow-hidden"
            style={{ zIndex: 1 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="text-base font-bold text-gray-900">
                  Gráficos de Amendoim
                </div>
              </div>
              <div
                className="p-4 space-y-4 overflow-auto scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {/* Produtos Donut */}
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="text-sm font-bold text-gray-800">
                      Produtos (Top 20)
                    </div>
                  </div>
                  <div className="h-[420px] px-3 py-3 relative">
                    
                    <DonutChartWidget
                      fetchUrl={`http://localhost:3000/api/amendoim/chartdata/produtos?${new URLSearchParams({
                        ...(filtrosAtivos.dataInicio && { dataInicio: filtrosAtivos.dataInicio }),
                        ...(filtrosAtivos.dataFim && { dataFim: filtrosAtivos.dataFim }),
                        ...(filtrosAtivos.codigoProduto && { codigoProduto: filtrosAtivos.codigoProduto }),
                        ...(viewMode !== 'comparativo' && { tipo: viewMode }),
                      })}`}
                      unit="kg"
                      compact
                    />
                  </div>
                </div>

                {/* Caixas Donut */}
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="text-sm font-bold text-gray-800">
                      Caixas
                    </div>
                  </div>
                  <div className="h-[420px] px-3 py-3 relative">
                    <DonutChartWidget
                      fetchUrl={`http://localhost:3000/api/amendoim/chartdata/caixas?${new URLSearchParams({
                        ...(filtrosAtivos.dataInicio && { dataInicio: filtrosAtivos.dataInicio }),
                        ...(filtrosAtivos.dataFim && { dataFim: filtrosAtivos.dataFim }),
                        ...(filtrosAtivos.codigoProduto && { codigoProduto: filtrosAtivos.codigoProduto }),
                        ...(viewMode !== 'comparativo' && { tipo: viewMode }),
                      })}`}
                      unit="kg"
                      compact
                    />
                  </div>
                </div>

                {/* Horários Bar */}
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="text-sm font-bold text-gray-800">
                      Horários
                    </div>
                  </div>
                  <div className="h-[420px] px-3 py-3 relative">
                    <BarChartWidget
                      fetchUrl={`http://localhost:3000/api/amendoim/chartdata/horarios?${new URLSearchParams({
                        ...(filtrosAtivos.dataInicio && { dataInicio: filtrosAtivos.dataInicio }),
                        ...(filtrosAtivos.dataFim && { dataFim: filtrosAtivos.dataFim }),
                        ...(filtrosAtivos.codigoProduto && { codigoProduto: filtrosAtivos.codigoProduto }),
                        ...(viewMode !== 'comparativo' && { tipo: viewMode }),
                      })}`}
                      unit="kg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botão para abrir/fechar drawer */}
        <button
          className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-l px-1.5 py-2 shadow hover:bg-gray-50"
          onClick={() => setChartsOpen((s) => !s)}
          title={chartsOpen ? "Ocultar gráficos" : "Mostrar gráficos"}
          style={{ zIndex: 7 }}
        >
          {chartsOpen ? "▶" : "◀"}
        </button>

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
                <div className="grid grid-cols-2 gap-2">
                  <div className="shadow-md rounded-lg p-2">
                    <div className="text-xs font-medium">Entrada</div>
                    <div className="text-sm font-bold">
                      {metricasRendimento.pesoEntrada.toLocaleString('pt-BR', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })} kg
                    </div>
                  </div>
                  <div className="shadow-md rounded-lg p-2">
                    <div className="text-xs font-medium">Saída</div>
                    <div className="text-sm font-bold">
                      {metricasRendimento.pesoSaida.toLocaleString('pt-BR', {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })} kg
                    </div>
                  </div>
                </div>

                {/* Perda */}
                <div className="shadow-md rounded-lg p-2">
                  <div className="text-xs text-red-600 font-medium">Perda de material</div>
                  <div className="text-lg font-bold text-red-800">
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
        <div className="w-full px-2 pb-2 flex justify-center">
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
      
      {/* Modal de Seleção de IHM */}
      <IhmSelectionModal
        isOpen={showIhmModal}
        onSelect={async (config) => {
          console.log(`[Amendoim] 🔘 Configuração selecionada:`, config);
          
          try {
            console.log('[Amendoim] 📤 Enviando configuração para o backend...');
            
            // Salvar configuração com o modo e arquivos selecionados
            const updatedConfig = {
              ...ihmConfig,
              modoColeta: config.modo,
              arquivoEntrada: config.arquivoEntrada,
              arquivoSaida: config.arquivoSaida,
            };
            
            console.log('[Amendoim] 📦 Config atualizada:', updatedConfig);
            
            const res = await fetch('http://localhost:3000/api/amendoim/config', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedConfig)
            });
            
            console.log('[Amendoim] 📥 Resposta do POST:', res.status);
            
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              console.error('[Amendoim] ❌ Erro na resposta:', errorData);
              throw new Error(errorData.error || 'Erro ao salvar configuração');
            }
            
            const saveResult = await res.json();
            console.log('[Amendoim] ✅ Configuração salva:', saveResult);
            
            // Recarregar configuração
            console.log('[Amendoim] 🔄 Recarregando configuração...');
            const reloadRes = await fetch('http://localhost:3000/api/amendoim/config');
            const reloadData = await reloadRes.json();
            
            console.log('[Amendoim] 📥 Config recarregada:', reloadData);
            
            if (reloadData.config) {
              setIhmConfig(reloadData.config);
            }
            
            if (reloadData.validation?.isValid) {
              console.log('[Amendoim] ✅ Validação passou - fechando modal');
              setValidationErrors([]);
              setShowIhmModal(false);
              
              const modoTexto = config.modo === "entrada-saida" ? "ENTRADA e SAÍDA"
                : config.modo === "apenas-entrada" ? "apenas ENTRADA"
                : "apenas SAÍDA";
              
              toastManager.updateSuccess(
                'ihm-selection',
                `Configuração salva: Coleta ${modoTexto}`
              );
            } else {
              console.warn('[Amendoim] ⚠️ Validação falhou:', reloadData.validation);
              toastManager.updateError(
                'ihm-selection',
                `Validação falhou: ${reloadData.validation?.errors?.join(', ')}`
              );
            }
          } catch (error: any) {
            console.error('[Amendoim] ❌ Erro ao salvar configuração:', error);
            toastManager.updateError(
              'ihm-selection',
              error.message || 'Erro ao salvar configuração'
            );
          }
        }}
        onCancel={() => {
          console.log('[Amendoim] ❌ Botão Cancelar clicado');
          
          // Não permitir fechar sem selecionar se há erros de validação
          if (validationErrors.length > 0) {
            console.warn('[Amendoim] ⚠️ Tentativa de cancelar com erros pendentes');
            toastManager.updateError(
              'ihm-selection-required',
              'Você precisa configurar o sistema para continuar'
            );
          } else {
            console.log('[Amendoim] ✅ Fechando modal');
            setShowIhmModal(false);
          }
        }}
      />
    </div>
  );
}
