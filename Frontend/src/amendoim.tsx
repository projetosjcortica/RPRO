import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Loader2, Upload, Play, Square, Scale, Settings } from "lucide-react";
import { DonutChartWidget, BarChartWidget } from "./components/Widgets";
import FiltrosAmendoimBar from "./components/FiltrosAmendoim";
import AmendoimConfig from "./components/AmendoimConfig";
import toastManager from "./lib/toastManager";
import { format as formatDateFn } from "date-fns";
import { cn } from "./lib/utils";
import { useCallback } from "react";
import { useGlobalConnection } from "./hooks/useGlobalConnection";

interface AmendoimRecord {
  id: number;
  tipo: "entrada" | "saida";
  dia: string;
  hora: string;
  codigoProduto: string;
  codigoCaixa: string;
  nomeProduto: string;
  peso: number;
  createdAt: string;
}

interface Estatisticas {
  totalRegistros: number;
  pesoTotal: number;
  produtosUnicos: number;
  caixasUtilizadas: number;
}

interface MetricasRendimento {
  pesoEntrada: number;
  pesoSaida: number;
  rendimentoPercentual: number;
  perda: number;
  perdaPercentual: number;
}

interface FiltrosAmendoim {
  dataInicio?: string;
  dataFim?: string;
  codigoProduto?: string;
  nomeProduto?: string;
  tipo?: "entrada" | "saida";
}

export default function Amendoim() {
  const [registros, setRegistros] = useState<AmendoimRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [metricasRendimento, setMetricasRendimento] = useState<MetricasRendimento | null>(null);
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  // View atual: 'entrada', 'saida' ou 'comparativo'
  const [viewMode, setViewMode] = useState<"entrada" | "saida" | "comparativo">("entrada");
  
  // Tipo para upload
  const [uploadTipo, setUploadTipo] = useState<"entrada" | "saida">("entrada");

  // Filtros ativos
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAmendoim>({});
  
  // Drawer de gráficos
  const [chartsOpen, setChartsOpen] = useState(false);
  // Modal de configuração
  const [configModalOpen, setConfigModalOpen] = useState(false);
  // Collector
  const [collectorRunning, setCollectorRunning] = useState<boolean>(false);
  const [collectorLoading, setCollectorLoading] = useState<boolean>(false);
  const { startConnecting, stopConnecting } = useGlobalConnection();

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
  const fetchRegistros = async () => {
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
  };

  // Buscar estatísticas
  const fetchEstatisticas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtrosAtivos.dataInicio) params.set('dataInicio', filtrosAtivos.dataInicio);
      if (filtrosAtivos.dataFim) params.set('dataFim', filtrosAtivos.dataFim);
      
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
  };

  // Buscar métricas de rendimento
  const fetchMetricasRendimento = async () => {
    try {
      const params = new URLSearchParams();
      if (filtrosAtivos.dataInicio) params.set('dataInicio', filtrosAtivos.dataInicio);
      if (filtrosAtivos.dataFim) params.set('dataFim', filtrosAtivos.dataFim);

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

  useEffect(() => {
    fetchRegistros();
    fetchEstatisticas();
    if (viewMode === 'comparativo') {
      fetchMetricasRendimento();
    }
  }, [page, filtrosAtivos, viewMode]);

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
        // try get current IHM config
        let ihmConfig = null;
        try {
          const configRes = await fetch("http://localhost:3000/api/config/ihm-config");
          if (configRes.ok) {
            const configData = await configRes.json();
            ihmConfig = configData.value;
          }
        } catch (e) {}

        // Start amendoim collector (will collect both entrada and saida as configured)
        startConnecting("Iniciando coletor Amendoim...");
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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-1.5 w-full h-full">
      {/* Header */}
      <div className="h-[10dvh] flex flex-row justify-between w-full">
        <div className="flex flex-row items-end gap-1 h-[10dvh]">
          {/* Vazio - mantém consistência com Report */}
        </div>
        <div className="flex flex-col items-end justify-end gap-2">
          <div className="flex flex-row items-end gap-1">
            <FiltrosAmendoimBar onAplicarFiltros={handleAplicarFiltros} />
            
            {/* Toggle Entrada/Saída/Comparativo */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
              <Button
                size="sm"
                onClick={() => setViewMode('entrada')}
                className={cn(
                  "h-8 text-xs font-medium transition-all",
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
                  "h-8 text-xs font-medium transition-all",
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
                  "h-8 text-xs font-medium transition-all",
                  viewMode === 'comparativo'
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                )}
              >
                Comparativo
              </Button>
            </div>
            
            {/* Botão de Configuração */}
            <Button
              onClick={() => setConfigModalOpen(true)}
              className="flex items-center gap-1 bg-gray-700 hover:bg-gray-800"
              title="Configurar coleta de amendoim"
            >
              <Settings className="h-4 w-4" />
              <p className="hidden 3xl:flex">Configurar</p>
            </Button>
            
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
                <p className="hidden 3xl:flex">Processando...</p>
              ) : collectorRunning ? (
                <p className="hidden 3xl:flex"> Parar coleta</p>
              ) : (
                <p className="hidden 3xl:flex">Iniciar coleta</p>
              )}
            </Button>
            
            {/* Seletor de tipo de upload */}
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
              <Button
                size="sm"
                onClick={() => setUploadTipo('entrada')}
                className={cn(
                  "h-8 text-xs font-medium transition-all",
                  uploadTipo === 'entrada'
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-transparent text-gray-600 hover:bg-gray-100"
                )}
              >
                Entrada
              </Button>
              <Button
                size="sm"
                onClick={() => setUploadTipo('saida')}
                className={cn(
                  "h-8 text-xs font-medium transition-all",
                  uploadTipo === 'saida'
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-transparent text-gray-600 hover:bg-gray-100"
                )}
              >
                Saída
              </Button>
            </div>
            
            {/* Upload button - mesmo estilo do coletor */}
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label htmlFor="csv-upload">
              <Button disabled={uploading} asChild className="bg-red-600 hover:bg-gray-700">
                <span className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {uploading ? (
                      <p className="hidden 3xl:flex">Enviando...</p>
                    ) : (
                      <p className="hidden 3xl:flex">Enviar CSV</p>
                    )}
                  </div>
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>

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
          <div className="flex w-full h-[74vh] 3xl:h-201 overflow-hidden shadow-xl rounded flex border border-gray-300">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 h-[50vh] w-full text-center">
            <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto" />
            <p className="text-lg font-medium text-gray-700">Carregando dados...</p>
            <p className="text-sm text-gray-500">Os dados estão sendo processados, por favor aguarde.</p>
          </div>
        ) : registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 h-[50vh] w-full text-center">
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
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '90px', minWidth: '90px' }}>
                      Dia
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '70px', minWidth: '70px' }}>
                      Hora
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '120px', minWidth: '120px' }}>
                      Cód. Produto
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '120px', minWidth: '120px' }}>
                      Cód. Caixa
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

                {/* Corpo da tabela */}
                <div>
                  {registros.map((registro, rowIdx) => (
                    <div
                      key={registro.id}
                      className={`flex border-b border-gray-300 hover:bg-gray-50 ${
                        rowIdx % 2 === 0 ? "bg-white" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-center p-2 text-sm border-r border-gray-300" style={{ width: '90px', minWidth: '90px' }}>
                        {formatDate(registro.dia)}
                      </div>
                      <div className="flex items-center justify-center p-2 text-sm border-r border-gray-300" style={{ width: '70px', minWidth: '70px' }}>
                        {registro.hora}
                      </div>
                      <div className="flex items-center justify-end p-2 text-sm border-r border-gray-300" style={{ width: '120px', minWidth: '120px' }}>
                        {registro.codigoProduto}
                      </div>
                      <div className="flex items-center justify-end p-2 text-sm border-r border-gray-300" style={{ width: '120px', minWidth: '120px' }}>
                        {registro.codigoCaixa}
                      </div>
                      <div className="flex items-center justify-start p-2 text-sm border-r border-gray-300 overflow-hidden" style={{ width: '250px', minWidth: '250px' }}>
                        <div className="w-full break-words" style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                          {registro.nomeProduto}
                        </div>
                      </div>
                      <div className="flex items-center justify-end p-2 text-sm border-r border-gray-300" style={{ width: '120px', minWidth: '120px' }}>
                        {Number(registro.peso).toLocaleString('pt-BR', {
                          minimumFractionDigits: 3,
                          maximumFractionDigits: 3,
                        })}
                      </div>
                      <div className="flex items-center justify-center p-2 text-sm border-r border-gray-300" style={{ width: '100px', minWidth: '100px' }}>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          registro.tipo === "entrada" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {registro.tipo.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
          </div>

          {/* Pagination */}
          <div className="flex flex-row items-center justify-end mt-2">
            {totalPages > 1 && (
              <div className="flex gap-2 items-center bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setPage(p => Math.max(1, p - 1));
                  }}
                  disabled={page === 1}
                  className="hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  Anterior
                </Button>
                <div className="flex items-center text-sm text-gray-700 font-medium px-3">
                  Página <span className="mx-1 font-bold text-red-600">{page}</span> de <span className="ml-1 font-bold">{totalPages}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-600">{total} registros</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setPage(p => Math.min(totalPages, p + 1));
                  }}
                  disabled={page === totalPages}
                  className="hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        </div>

      {/* Side Info com drawer de gráficos */}
      <div
        className="relative w-87 3xl:h-[76vh] h-[74vh] flex flex-col p-2 shadow-xl rounded border border-gray-300 gap-2 flex-shrink-0"
        style={{ zIndex: 10 }}
      >
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
                  <div className="h-[280px] px-3 py-3 relative">
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
                  <div className="h-[280px] px-3 py-3 relative">
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
                  <div className="h-[280px] px-3 py-3 relative">
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
          <div className="text-base font-bold mb-3 text-gray-800">Resumo</div>
          
          {/* Card de Métricas de Rendimento (apenas no modo comparativo) */}
          {viewMode === 'comparativo' && metricasRendimento && (
            <div className="mb-4 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4 shadow-lg">
              <div className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Análise de Rendimento
              </div>
              
              <div className="space-y-3">
                {/* Rendimento % - Destaque Principal */}
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="text-xs text-gray-500 font-medium uppercase">Rendimento</div>
                  <div className="text-3xl font-bold text-purple-700">
                    {metricasRendimento.rendimentoPercentual.toFixed(2)}%
                  </div>
                </div>

                {/* Grid Entrada/Saída */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                    <div className="text-xs text-green-600 font-medium">Entrada</div>
                    <div className="text-sm font-bold text-green-800">
                      {metricasRendimento.pesoEntrada.toLocaleString('pt-BR', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })} kg
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                    <div className="text-xs text-blue-600 font-medium">Saída</div>
                    <div className="text-sm font-bold text-blue-800">
                      {metricasRendimento.pesoSaida.toLocaleString('pt-BR', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })} kg
                    </div>
                  </div>
                </div>

                {/* Perda */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <div className="text-xs text-red-600 font-medium">Perda Total</div>
                  <div className="text-lg font-bold text-red-800">
                    {metricasRendimento.perda.toLocaleString('pt-BR', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })} kg
                    <span className="text-sm ml-2">({metricasRendimento.perdaPercentual.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {estatisticas && (
            <div className="space-y-2">
              {/* Peso Total - Destaque */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-lg p-3 shadow-sm">
                <div className="text-xs text-red-700 font-semibold uppercase tracking-wide">Peso Total</div>
                <div className="text-3xl font-bold text-red-800">
                  {estatisticas.pesoTotal.toLocaleString('pt-BR', { 
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })} <span className="text-lg">kg</span>
                </div>
              </div>

              {/* Grid com outros cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs text-gray-500 font-medium">Registros</div>
                  <div className="text-xl font-bold text-gray-800">{estatisticas.totalRegistros}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-xs text-gray-500 font-medium">Produtos</div>
                  <div className="text-xl font-bold text-gray-800">{estatisticas.produtosUnicos}</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs text-gray-500 font-medium">Caixas Utilizadas</div>
                <div className="text-xl font-bold text-gray-800">{estatisticas.caixasUtilizadas}</div>
              </div>
            </div>
          )}
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
