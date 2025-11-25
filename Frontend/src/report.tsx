import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { format as formatDateFn } from "date-fns";

import { MyDocument } from "./Pdf";
import { usePersistentForm } from "./config";

// import { pdf } from "@react-pdf/renderer";
import TableComponent from "./TableComponent";
import Products from "./products";
import { getProcessador } from "./Processador";
import { useReportData } from "./hooks/useReportData";
import { cn } from "./lib/utils";
import { ExportDropdown } from "./components/ExportDropdown";

import { resolvePhotoUrl } from "./lib/photoUtils";
import useAuth from "./hooks/useAuth";

import {
  ChevronLeft,
  ChevronRight,
  Play,
  Square,
  Loader2,
} from "lucide-react";
import { useGlobalConnection } from "./hooks/useGlobalConnection";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "./components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { Button, buttonVariants } from "./components/ui/button";
import { Filtros } from "./components/types";
import FiltrosBar from "./components/searchBar";
import { useRuntimeConfig } from "./hooks/useRuntimeConfig";
import { Separator } from "./components/ui/separator";
import { DonutChartWidget, BarChartWidget } from "./components/Widgets";
import { RefreshButton } from "./components/RefreshButton";
import toastManager from './lib/toastManager';
import { getDefaultReportDateRange } from "./lib/reportDefaults";
import useAdvancedFilters from './hooks/useAdvancedFilters';

interface ComentarioRelatorio {
  texto: string;
  data?: string;
}

export default function Report() {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [ihmConfig, setIhmConfig] = useState<{ ip: string; user: string; password: string } | null>(null);

  // OTIMIZAÇÃO: Log de performance para monitorar inicialização
  const mountTimeRef = useRef(Date.now());

  // REMOVIDO: Prefetch estava bloqueando renderização (5-11s delay)

  // Obter logo do usuário
  useEffect(() => {
    // Try to load stored report logo path from backend config
    let mounted = true;
    const loadLogo = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/report/logo");
        if (!res.ok) return;
        const js = await res.json().catch(() => ({}));
        const p = js?.path;
        if (p && mounted) {
          const resolved = resolvePhotoUrl(p);
          // append cache-busting timestamp so that updated images are fetched
          setLogoUrl(resolved ? `${resolved}?t=${Date.now()}` : undefined);
        }
        // If user has a profile photo path and no configured report logo, prefer that
        if (!p && user && (user as any).photoPath && mounted) {
          const resolved = resolvePhotoUrl((user as any).photoPath);
          setLogoUrl(resolved ? `${resolved}?t=${Date.now()}` : undefined);
        }
        // If still no logo, but admin set a default user photo, use it
        if (!p && (!user || !(user as any).photoPath) && mounted) {
          const defaultPhoto = localStorage.getItem('default-user-photo');
          if (defaultPhoto) {
            const resolved = resolvePhotoUrl(defaultPhoto);
            setLogoUrl(resolved ? `${resolved}?t=${Date.now()}` : undefined);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    loadLogo();

    // Listen for photo updates from config page
    const handlePhotoUpdate = () => {
      loadLogo();
    };

    window.addEventListener('report-logo-updated', handlePhotoUpdate);
    window.addEventListener('user-photos-updated', handlePhotoUpdate);
    return () => {
      window.removeEventListener('report-logo-updated', handlePhotoUpdate);
      window.removeEventListener('user-photos-updated', handlePhotoUpdate);
      mounted = false;
    };
  }, [user]);

  // Carregar configuração IHM
  useEffect(() => {
    const loadIhmConfig = async () => {
      try {
        const moduleParam = user?.userType === 'amendoim' ? '?module=amendoim' : '';
        const res = await fetch(`http://localhost:3000/api/config/ihm-config${moduleParam}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.value) {
          setIhmConfig(data.value);
        }
      } catch (e) {
        console.warn('Failed to load IHM config:', e);
      }
    };
    loadIhmConfig();
  }, [user]);

  // ... restante do código permanece igual até handlePrint ...

  const [filtros, setFiltros] = useState<Filtros>(() => {
    // Carrega a tela já filtrando os últimos 30 dias por padrão para melhor visualização
    const { dataInicio, dataFim } = getDefaultReportDateRange(29);
    return {
      dataInicio,
      dataFim,
      nomeFormula: "",
      codigo: "",
      numero: "",
    };
  });

  // On mount, apply default date filters (last 30 days) so the report
  // shows a useful, constrained dataset immediately without user action.
  useEffect(() => {
    try {
      const { dataInicio, dataFim } = getDefaultReportDateRange(29);
      const filtrosPadrao: Filtros = {
        dataInicio,
        dataFim,
        nomeFormula: '',
        codigo: '',
        numero: '',
      };

      // Reset to first page and apply the default filtros
      setPage(1);
      setFiltros(filtrosPadrao);
      setChartsOpen(true);
    } catch (e) {
      // ignore
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [colLabels, setColLabels] = useState<{ [key: string]: string }>({});
  const [produtosInfo, setProdutosInfo] = useState<
    Record<string, { nome?: string; unidade?: string; num?: number; ativo?: boolean }>
  >({});
  const [view, setView] = useState<"table" | "product">("table");
  // Drawer de gráficos (atrás do sideinfo)
  const [chartsOpen, setChartsOpen] = useState<boolean>(false);
  const [highlightProduto, setHighlightProduto] = useState<string | null>(null);
  const [highlightFormula, setHighlightFormula] = useState<string | null>(null);
  const [sideListMode, setSideListMode] = useState<"produtos" | "formulas">(
    "produtos"
  );

  // Função de reset de colunas da tabela
  const [resetTableColumns, setResetTableColumns] = useState<(() => void) | null>(null);

  //  my bode washedih
  useEffect(() => {
    if (
      filtros &&
      (filtros.dataInicio ||
        filtros.dataFim ||
        filtros.nomeFormula ||
        filtros.codigo ||
        filtros.numero)
    ) {
      setChartsOpen(true);
    }
  }, [
    filtros.dataInicio,
    filtros.dataFim,
    filtros.nomeFormula,
    filtros.codigo,
    filtros.numero,
  ]);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(100);
  const [sortBy, setSortBy] = useState<string>('Dia');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

  // Collector state
  const [collectorRunning, setCollectorRunning] = useState<boolean>(false);
  const [collectorLoading, setCollectorLoading] = useState<boolean>(false);
  const [collectorError, setCollectorError] = useState<string | null>(null);
  // ensure the variable is considered 'read' to avoid TS unused-variable errors
  void collectorError;

  // Comentários state
  const [comentarios, setComentarios] = useState<ComentarioRelatorio[]>([]);

  // Estados para controle de exibição no PDF
  const [showPdfComments, setShowPdfComments] = useState<boolean>(true);
  const [showPdfCharts, setShowPdfCharts] = useState<boolean>(true);

  // Estado para customização do PDF
  const [pdfCustomization, setPdfCustomization] = useState<{
    fontSize: 'small' | 'medium' | 'large';
    sortOrder: 'alphabetic' | 'silo' | 'most-used';
    formulaSortOrder?: 'alphabetic' | 'code' | 'most-used';
  }>({
    fontSize: 'medium',
    sortOrder: 'alphabetic',
    formulaSortOrder: 'alphabetic',
  });

  const [tableSelection, setTableSelection] = useState<{
    periodoInicio: string | undefined;
    periodoFim: string | undefined;
    total: number;
    batidas: number;
    horaInicial: string;
    horaFinal: string;
    formulas: {
      numero: number;
      nome: string;
      quantidade: number;
      porcentagem: number;
      somatoriaTotal: number;
      batidas?: number;
      codigo?: string;
    }[];
    produtos: {
      nome: string;
      qtd: number;
      colKey?: string;
      unidade?: string;
    }[];
    empresa: string;
    usuario: string;
  }>({
    periodoInicio: undefined,
    periodoFim: undefined,
    total: 0,
    batidas: 0,
    horaInicial: "--:--",
    horaFinal: "--:--",
    produtos: [],
    formulas: [],
    empresa: "...",
    usuario: "...",
  });

  const [resumo, setResumo] = useState<any | null>(null);
  const [resumoReloadFlag, setResumoReloadFlag] = useState(0);
  const runtime = useRuntimeConfig();

  // OTIMIZAÇÃO: Buscar dados imediatamente (paralelo com produtos)
  const [allowDataFetch] = useState(true); // Sempre true para busca paralela

  const { filters: advancedFilters, setFiltersState } = useAdvancedFilters();

  const { dados, loading, error, total, refetch, refetchSilent } = useReportData(
    filtros,
    page,
    pageSize,
    sortBy,
    sortDir,
    allowDataFetch, // Sempre true
    advancedFilters
  );

  // Fallback: quando filtros avançados mudarem, forçar refetch
  useEffect(() => {
    const handler = () => { try { refetch(); } catch (e) { } };
    window.addEventListener('advancedFiltersChanged', handler);
    return () => window.removeEventListener('advancedFiltersChanged', handler);
  }, [refetch]);
  const { formData: profileConfigData } = usePersistentForm("profile-config");
  const autoRefreshTimer = useRef<number | null>(null);
  const prevCollectorRunning = useRef<boolean>(false);
  const wasCollectorRunningRef = useRef<boolean>(false);
  const { startConnecting, stopConnecting } = useGlobalConnection();

  const refreshResumo = useCallback(() => {
    setResumoReloadFlag((flag) => flag + 1);
  }, []);

  // Toggle sort handler for Table headers - OTIMIZADO
  const handleToggleSort = useCallback((col: string) => {
    console.log('[report] handleToggleSort called with col:', col, 'current sortBy:', sortBy);

    // Sistema de ordenação em 3 estados:
    // Estado 1: Ordena DESC (primeira vez)
    // Estado 2: Ordena ASC (segunda vez)
    // Estado 3: Remove ordenação/volta ao padrão (terceira vez)

    if (sortBy === col) {
      if (sortDir === 'DESC') {
        // Segundo clique: muda para ASC
        console.log('[report] Same column, toggling direction to: ASC');
        setSortDir('ASC');
      } else {
        // Terceiro clique: remove ordenação
        console.log('[report] Same column, resetting sort to default (Dia DESC)');
        setSortBy('Dia');
        setSortDir('DESC');
      }
    } else {
      // Primeira vez nesta coluna: ordena DESC
      console.log('[report] New column, setting sortBy to:', col);
      setSortBy(col);
      setSortDir('DESC');
    }

    // Sempre volta para primeira página ao mudar ordenação
    setPage(1);
  }, [sortBy, sortDir]);

  const fetchCollectorStatus = useCallback(async () => {
    try {
      // show a short-lived loading toast while querying
      // toastManager.showLoading('collector-status', 'Verificando status do coletor...');

      const res = await fetch("http://localhost:3000/api/collector/status", {
        method: "GET",
      });
      if (!res.ok) {
        const msg = `Falha ao consultar coletor (HTTP ${res.status}). Verifique backend e rede.`;
        toastManager.updateError('collector-status', msg);
        setCollectorRunning(false);
        setCollectorError(msg);
        return;
      }

      const status = await res.json();
      const isRunning = Boolean(status?.running);
      setCollectorRunning(isRunning);

      const lastError = status?.lastError ?? null;
      setCollectorError(lastError);

      if (lastError) {
        // Categorize and suggest remediation
        let suggestion = 'Verifique conexão com a IHM (IP/porta), credenciais e regras de firewall.';
        if (/ECONNREFUSED|ENOTFOUND|ENETUNREACH|EHOSTUNREACH|ETIMEDOUT/i.test(String(lastError))) {
          suggestion = 'Acesso à IHM recusado ou inacessível. Confirme IP/porta e regras de firewall.';
        } else if (/auth|senha|credential|login/i.test(String(lastError))) {
          suggestion = 'Erro de autenticação. Verifique usuário/senha nas configurações da IHM.';
        } else if (/timeout/i.test(String(lastError))) {
          suggestion = 'Tempo de resposta excedido. Verifique latência de rede e disponibilidade da IHM.';
        }

        // toastManager.updateError('collector-status', `Coletor: ${String(lastError)} — ${suggestion}`);
        console.log('collector-status', `Coletor: ${String(lastError)} — ${suggestion}`)
      } else {
        // toastManager.updateSuccess('collector-status', 'Coletor: online', 1500);
      }
    } catch (err: any) {
      console.error("Erro ao buscar status do coletor:", err);
      const message = err?.message || String(err) || 'Erro desconhecido';
      toastManager.updateError('collector-status', `Erro de comunicação com o coletor: ${message}. Verifique se o backend está rodando e se existe bloqueio de firewall.`);
      setCollectorRunning(false);
      setCollectorError(message);
    }
  }, []);

  // Side info state
  const [sideInfo, setSideInfo] = useState<{
    granja: string;
    proprietario: string;
  }>({
    granja: "Granja",
    proprietario: "Proprietario",
  });

  // Labels for formulas (to display friendly names in side info)
  const [formulaLabels, setFormulaLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/formulas/labels');
        if (!res.ok) return;
        const js = await res.json();
        if (!mounted) return;
        setFormulaLabels(js || {});
      } catch (e) {
        // ignore
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  // Consolidar atualização de sideInfo - evitar múltiplas atualizações
  useEffect(() => {
    let newInfo = { granja: "Granja", proprietario: "Proprietario" };

    // 1. Priorizar dados do perfil (mais recentes)
    if (profileConfigData?.nomeCliente) {
      newInfo = {
        granja: profileConfigData.nomeCliente,
        proprietario: profileConfigData.nomeCliente,
      };
    }
    // 2. Se não houver dados do perfil, usar configs de runtime
    else if (runtime && !runtime.loading) {
      const g = runtime.get("granja") || runtime.get("nomeCliente") || "Granja";
      const p =
        runtime.get("proprietario") || runtime.get("owner") || "Proprietario";
      newInfo = { granja: g, proprietario: p };
    }

    setSideInfo(newInfo);
  }, [profileConfigData, runtime]);

  // Derived view: chips for active advanced filters to show in side info
  type FilterChip = { id: string; label: string; type: string; value: any };


  const activeFilterChips = useMemo(() => {
    if (!advancedFilters) return [] as FilterChip[];
    const chips: FilterChip[] = [];

    // formulas include
    (advancedFilters.includeFormulas || []).forEach((f: number) => {
      const name = formulaLabels[String(f)];
      const label = name ? `${f} — ${name}` : `Formula ${f}`;
      chips.push({ id: `includeFormula:${f}`, label, type: 'includeFormula', value: f });
    });
    // formulas exclude
    (advancedFilters.excludeFormulas || []).forEach((f: number) => {
      const name = formulaLabels[String(f)];
      const label = `Excluir: ${name ? `${f} — ${name}` : `Formula ${f}`}`;
      chips.push({ id: `excludeFormula:${f}`, label, type: 'excludeFormula', value: f });
    });

    // product codes include
    (advancedFilters.includeProductCodes || []).forEach((p: number) => {
      const colKey = `col${p + 5}`;
      const label = colLabels[colKey] || `Produto ${p}`;
      chips.push({ id: `includeProdCode:${p}`, label: `${label} (${p})`, type: 'includeProductCode', value: p });
    });
    // product codes exclude
    (advancedFilters.excludeProductCodes || []).forEach((p: number) => {
      const colKey = `col${p + 5}`;
      const label = colLabels[colKey] || `Produto ${p}`;
      chips.push({ id: `excludeProdCode:${p}`, label: `Excluir: ${label} (${p})`, type: 'excludeProductCode', value: p });
    });

    // product names
    (advancedFilters.includeProductNames || []).forEach((n: string) => chips.push({ id: `includeProdName:${n}`, label: String(n), type: 'includeProductName', value: n }));
    (advancedFilters.excludeProductNames || []).forEach((n: string) => chips.push({ id: `excludeProdName:${n}`, label: `Excluir: ${n}`, type: 'excludeProductName', value: n }));

    // date range
    if (advancedFilters.dateFrom || (filtros && (filtros as any).dataInicio)) {
      const from = advancedFilters.dateFrom || (filtros as any).dataInicio;
      chips.push({ id: `dateFrom:${from}`, label: `De: ${from}`, type: 'dateFrom', value: from });
    }
    if (advancedFilters.dateTo || (filtros && (filtros as any).dataFim)) {
      const to = advancedFilters.dateTo || (filtros as any).dataFim;
      chips.push({ id: `dateTo:${to}`, label: `Até: ${to}`, type: 'dateTo', value: to });
    }

    return chips.slice(0, 20); // limit display
  }, [advancedFilters, formulaLabels, colLabels, filtros]);
  console.log('[report] activeFilterChips:', activeFilterChips);

  const removeChip = useCallback((chip: { type: string; value: any }) => {
    try {
      if (!advancedFilters || !setFiltersState) return;
      const next = { ...advancedFilters } as any;
      switch (chip.type) {
        case 'includeFormula':
          next.includeFormulas = (next.includeFormulas || []).filter((x: number) => x !== Number(chip.value));
          break;
        case 'excludeFormula':
          next.excludeFormulas = (next.excludeFormulas || []).filter((x: number) => x !== Number(chip.value));
          break;
        case 'includeProductCode':
          next.includeProductCodes = (next.includeProductCodes || []).filter((x: number) => x !== Number(chip.value));
          break;
        case 'excludeProductCode':
          next.excludeProductCodes = (next.excludeProductCodes || []).filter((x: number) => x !== Number(chip.value));
          break;
        case 'includeProductName':
          next.includeProductNames = (next.includeProductNames || []).filter((x: string) => String(x) !== String(chip.value));
          break;
        case 'excludeProductName':
          next.excludeProductNames = (next.excludeProductNames || []).filter((x: string) => String(x) !== String(chip.value));
          break;
        case 'dateFrom':
          next.dateFrom = undefined;
          break;
        case 'dateTo':
          next.dateTo = undefined;
          break;
        default:
          break;
      }
      setFiltersState(next);
      // notify listeners to refetch
      try { window.dispatchEvent(new CustomEvent('advancedFiltersChanged', { detail: next })); } catch (e) { }
    } catch (e) {
      console.warn('Failed to remove chip', e);
    }
  }, [advancedFilters, setFiltersState]);
  console.log(removeChip)

  // Listener para eventos explícitos de atualização de configuração
  useEffect(() => {
    const onCfg = (e: any) => {
      try {
        const name = e?.detail?.nomeCliente;
        if (!name) return;
        setSideInfo((prev) => ({ ...prev, granja: name, proprietario: name }));
      } catch (err) { }
    };
    window.addEventListener("profile-config-updated", onCfg as EventListener);
    return () =>
      window.removeEventListener(
        "profile-config-updated",
        onCfg as EventListener
      );
  }, []);

  // Memoizar configuração dos gráficos para evitar recriações desnecessárias
  const chartConfig = useMemo(() => ({ filters: filtros, advancedFilters }), [filtros, advancedFilters]);

  // Fetch resumo sempre que os filtros mudarem
  // Estados para controle de resumo
  const [resumoError, setResumoError] = useState<string | null>(null);
  const [resumoLoading, setResumoLoading] = useState(false);
  const [resumoRetryCount, setResumoRetryCount] = useState(0);

  useEffect(() => {
    // OTIMIZAÇÃO: Buscar resumo em paralelo (não esperar produtos)
    let mounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const fetchResumo = async () => {
      if (!mounted) return;

      try {
        const startTime = Date.now();
        setResumoLoading(true);
        setResumoError(null);

        const processador = getProcessador();
        const dateStart = filtros.dataInicio || undefined;
        const dateEnd = filtros.dataFim || undefined;
        const formula = filtros.nomeFormula || undefined;
        const areaId = (filtros as any).areaId || undefined;

        console.log(`[resumo] Buscando dados com filtros`, filtros);
        console.log(`[resumo] advancedFilters payload:`, advancedFilters);

        // OTIMIZAÇÃO: Remover AbortController que causava cancelamentos em cascata
        const result = await processador.getResumo(
          areaId as string | undefined,
          formula as string | undefined,
          dateStart as string | undefined,
          dateEnd as string | undefined,
          filtros && filtros.codigo !== undefined && filtros.codigo !== ""
            ? filtros.codigo
            : undefined,
          filtros && filtros.numero !== undefined && filtros.numero !== ""
            ? filtros.numero
            : undefined,
          advancedFilters
        );

        if (!mounted) return;

        console.log(`[resumo] ✅ Dados recebidos em`, Date.now() - startTime, 'ms');
        console.log('[resumo] Payload:', result);
        setResumo(result || null);
        setResumoRetryCount(0);
      } catch (err: any) {
        if (!mounted) return;

        console.error("[resumo] ❌ Erro ao buscar dados:", err);

        // Tentar novamente apenas 1 vez para falhas de rede reais
        if (
          resumoRetryCount < 1 &&
          (err.message?.includes("network") || err.message?.includes("fetch"))
        ) {
          setResumoRetryCount((prev) => prev + 1);
          console.log(`[resumo] 🔄 Tentando novamente (${resumoRetryCount + 1}/1)...`);
          retryTimeout = setTimeout(() => {
            if (mounted) fetchResumo();
          }, 1000);
          return;
        }

        setResumoError(err.message || "Erro ao carregar resumo");
      } finally {
        if (mounted) setResumoLoading(false);
      }
    };

    fetchResumo();

    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [filtros, resumoReloadFlag, resumoRetryCount, advancedFilters]);

  useEffect(() => {
    void fetchCollectorStatus();
    const intervalId = window.setInterval(() => {
      void fetchCollectorStatus();
    }, 10000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchCollectorStatus]);

  // Update table selection from resumo
  useEffect(() => {
    if (resumo && resumo.usosPorProduto) {
      const formulasFromResumo = Object.entries(
        resumo.formulasUtilizadas || {}
      ).map(([nome, data]: [string, any]) => ({
        numero: data.numero ?? 0,
        nome,
        quantidade: data.quantidade ?? 0,
        porcentagem: data.porcentagem ?? 0,
        somatoriaTotal: data.somatoriaTotal ?? 0,
        batidas: data.batidas ?? data.quantidade ?? 0,
        codigo: data.codigo || data.numero?.toString() || '',
      }));

      setTableSelection({
        total: resumo.totalPesos || 0,
        batidas: resumo.batitdasTotais || 0,
        periodoInicio: resumo.periodoInicio || "--/--/--",
        periodoFim: resumo.periodoFim || "--/--/--",
        horaInicial: resumo.horaInicial || "--:--:--",
        horaFinal: resumo.lastDayRange.lastTime || "--:--:--",
        formulas: formulasFromResumo,
        produtos: (() => {
          const items = Object.entries(resumo.usosPorProduto).map(
            ([key, val]: [string, unknown]) => {
              const produtoId =
                "col" + (Number(String(key).split("Produto_")[1]) + 5);
              const nome = produtosInfo[produtoId]?.nome || key;
              const v = val as Record<string, unknown> | undefined;
              const rawQtd = v?.["quantidade"];
              const qtd = Number(rawQtd ?? 0) || 0;
              const unidade = (v?.["unidade"] as string) || "kg";
              const idx = Number(String(produtoId).replace(/^col/, "")) || 0;
              return { colKey: produtoId, nome, qtd, unidade, idx };
            }
          );
          items.sort((a, b) => a.idx - b.idx);
          return items.map(({ colKey, nome, qtd, unidade }) => ({
            colKey,
            nome,
            qtd,
            unidade,
          }));
        })(),
        empresa: sideInfo.proprietario,
        usuario: user.username,
      });
    }
  }, [resumo, produtosInfo, sideInfo.proprietario, user.username]);

  // Funções de comentários
  const removerComentario = (index: number) => {
    setComentarios((prev) => prev.filter((_, i) => i !== index));
  };

  // Funções para o ExportDropdown (com ID)
  const handleAddCommentFromModal = (texto: string) => {
    const comentario: ComentarioRelatorio = {
      texto,
      data: new Date().toLocaleString("pt-BR"),
    };
    setComentarios((prev) => [...prev, comentario]);
  };

  const handleRemoveCommentFromModal = (id: string) => {
    const index = parseInt(id);
    if (!isNaN(index)) {
      removerComentario(index);
    }
  };

  // Converter comentários para formato com ID
  const comentariosComId = comentarios.map((c, idx) => ({
    id: String(idx),
    texto: c.texto,
    data: c.data || new Date().toLocaleString("pt-BR"),
  }));

  // Funções existentes
  const handleAplicarFiltros = (novosFiltros: Filtros) => {
    setPage(1);
    setFiltros(novosFiltros);
    setChartsOpen(true); // Abre o drawer ao buscar
  };

  const formatShortDate = (raw?: string | null) => {
    if (!raw) return "";
    const s = String(raw).trim();
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split("-").map(Number);
        return formatDateFn(new Date(y, m - 1, d), "dd/MM/yyyy");
      }
      if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
        const [d, m, y] = s.split("-").map(Number);
        return formatDateFn(new Date(y, m - 1, d), "dd/MM/yyyy");
      }
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) return formatDateFn(parsed, "dd/MM/yyyy");
      return s;
    } catch (e) {
      return s;
    }
  };

  const handleCollectorToggle = async () => {
    if (collectorLoading) return;
    setCollectorLoading(true);
    setCollectorError(null);
    try {
      if (collectorRunning) {
        const res = await fetch("http://localhost:3000/api/collector/stop", {
          method: "GET",
        });
        if (!res.ok) throw new Error("Falha ao interromper o coletor.");
        await res.json().catch(() => ({}));
        await fetchCollectorStatus();
        refetch();
        refreshResumo();
        try { toastManager.updateSuccess('collector-toggle', 'Coletor parado'); } catch (e) { }
      } else {
        // Get current IHM config before starting collector
        let ihmConfig = null;
        try {
          const moduleParam = user?.userType === 'amendoim' ? '?module=amendoim' : '';
          const configRes = await fetch(
            `http://localhost:3000/api/config/ihm-config${moduleParam}`
          );
          if (configRes.ok) {
            const configData = await configRes.json();
            ihmConfig = configData.value;
          }
        } catch (e) {
          console.warn("Failed to load IHM config:", e);
        }

        // Start collector with current IHM config
        let res;
        if (!ihmConfig || !(ihmConfig.ip || ihmConfig.user || ihmConfig.password)) {
          // User actively requested start but no IHM config present: show a single warning and abort.
          try { toastManager.showWarningOnce('collector-toggle', 'IHM não configurada. Configure a IHM em Configurações antes de iniciar a coleta.'); } catch (e) { }
          setCollectorLoading(false);
          return;
        }

        // Send config as POST with body
        startConnecting("Conectando ao coletor...");
        res = await fetch("http://localhost:3000/api/collector/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ip: ihmConfig.ip,
            user: ihmConfig.user,
            password: ihmConfig.password,
          }),
        });

        if (!res.ok) throw new Error("Falha ao iniciar o coletor.");
        const payload = await res.json().catch(() => ({}));
        if (payload && payload.started === true) {
          await fetchCollectorStatus();
          stopConnecting();
          throw new Error(payload?.message || "Coletor não pôde ser iniciado.");
        }
        await fetchCollectorStatus();
        refetch();
        refreshResumo();
      }
    } catch (error) {
      console.error("Erro ao controlar collector:", error);
      setCollectorError(
        error instanceof Error
          ? error.message
          : "Não foi possível comunicar com o coletor."
      );
    } finally {
      setCollectorLoading(false);
      // no-op: global provider handles UI
    }
  };

  const handlePdfModalOpenChange = useCallback(async (open: boolean) => {
    if (open) {
      // Modal opening: if collector is running, pause it
      if (collectorRunning) {
        wasCollectorRunningRef.current = true;
        try {
          const res = await fetch("http://localhost:3000/api/collector/stop");
          if (res.ok) {
            setCollectorRunning(false);
            toastManager.showInfoOnce('pdf-pause', 'Coletor pausado para visualização do PDF');
          }
        } catch (e) {
          console.error("Failed to pause collector for PDF", e);
        }
      } else {
        wasCollectorRunningRef.current = false;
      }
    } else {
      // Modal closing: if it was running before, resume it
      if (wasCollectorRunningRef.current) {
        try {
          const moduleParam = user?.userType === 'amendoim' ? '?module=amendoim' : '';
          const configRes = await fetch(`http://localhost:3000/api/config/ihm-config${moduleParam}`);
          if (configRes.ok) {
            const configData = await configRes.json();
            const cfg = configData.value;
            if (cfg && (cfg.ip || cfg.user)) {
              await fetch("http://localhost:3000/api/collector/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ip: cfg.ip, user: cfg.user, password: cfg.password }),
              });
              setCollectorRunning(true);
              toastManager.updateSuccess('pdf-resume', 'Coletor retomado');
            }
          }
        } catch (e) {
          console.error("Failed to resume collector", e);
          toastManager.updateError('pdf-resume', 'Falha ao retomar coletor');
        }
        wasCollectorRunningRef.current = false;
      }
    }
  }, [collectorRunning, user]);

  // Poll while collector not running to update status; if global provider active, UI shows spinner
  useEffect(() => {
    let intervalId: number | null = null;
    if (!collectorRunning) {
      intervalId = window.setInterval(() => {
        void fetchCollectorStatus();
      }, 2500) as unknown as number;
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [collectorRunning, fetchCollectorStatus]);

  useEffect(() => {
    if (collectorRunning) {
      if (autoRefreshTimer.current) {
        window.clearInterval(autoRefreshTimer.current);
      }
      // Use silent refetches while collector is running to avoid UI flicker
      try { if (typeof refetchSilent === 'function') { refetchSilent(); } else { refetch(); } } catch (e) { }
      // silent resumo fetch (only update if changed)
      const fetchResumoSilent = async () => {
        try {
          const processador = getProcessador();
          const dateStart = filtros.dataInicio || undefined;
          const dateEnd = filtros.dataFim || undefined;
          const formula = filtros.nomeFormula || undefined;
          const areaId = (filtros as any).areaId || undefined;

          const result = await processador.getResumo(
            areaId as string | undefined,
            formula as string | undefined,
            dateStart as string | undefined,
            dateEnd as string | undefined,
            filtros && filtros.codigo !== undefined && filtros.codigo !== "" ? filtros.codigo : undefined,
            filtros && filtros.numero !== undefined && filtros.numero !== "" ? filtros.numero : undefined,
            advancedFilters
          );

          // Only update resumo if changed to avoid re-renders
          try {
            const oldJson = JSON.stringify(resumo || {});
            const newJson = JSON.stringify(result || {});
            if (oldJson !== newJson) {
              setResumo(result || null);
            }
          } catch (e) {
            setResumo(result || null);
          }
        } catch (e) {
          // silent failure: don't set loading/error to avoid flicker
          console.error('fetchResumoSilent error', e);
        }
      };

      fetchResumoSilent();

      autoRefreshTimer.current = window.setInterval(() => {
        try { if (typeof refetchSilent === 'function') { refetchSilent(); } else { refetch(); } } catch (e) { }
        void fetchResumoSilent();
      }, 5000);
    } else if (autoRefreshTimer.current) {
      window.clearInterval(autoRefreshTimer.current);
      autoRefreshTimer.current = null;
    }

    return () => {
      if (autoRefreshTimer.current) {
        window.clearInterval(autoRefreshTimer.current);
        autoRefreshTimer.current = null;
      }
    };
  }, [collectorRunning, refetch, refreshResumo]);

  useEffect(() => {
    if (!collectorRunning && prevCollectorRunning.current) {
      try { if (typeof refetchSilent === 'function') { refetchSilent(); } else { refetch(); } } catch (e) { }
      refreshResumo();
    }
    prevCollectorRunning.current = collectorRunning;
  }, [collectorRunning, refetch, refreshResumo]);

  // Recarregar resumo ao mudar de aba
  useEffect(() => {
    refreshResumo();
  }, [view, refreshResumo]);

  const onLabelChange = (colKey: string, newName: string, unidade?: string) => {
    setColLabels((prev) => ({ ...prev, [colKey]: newName }));
    setProdutosInfo((prev) => ({
      ...prev,
      [colKey]: {
        ...(prev[colKey] || {}),
        nome: newName,
        unidade: unidade || "kg",
      },
    }));

    try {
      const match = colKey.match(/^col(\d+)$/);
      if (match) {
        const colIndex = Number(match[1]);
        const num = colIndex - 5;
        if (!Number.isNaN(num) && num > 0) {
          fetch("http://localhost:3000/api/db/setupMateriaPrima", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: [
                { num, produto: newName, medida: unidade === "g" ? 0 : 1 },
              ],
            }),
          }).catch((e) => console.error("Failed to persist label", e));
        }
        try { toastManager.updateSuccess('label-save', 'Salvando rótulo do produto'); } catch (e) { }
      }
    } catch (e) {
      console.warn("Could not persist product label change to backend", e);
    }
  };

  // Load produtosInfo
  useEffect(() => {
    let mounted = true;

    const loadFromBackend = async () => {
      try {
        const startTime = Date.now();
        const res = await fetch(
          "http://localhost:3000/api/materiaprima/labels"
        );

        if (!res.ok) {
          console.warn(
            "[Produtos] ❌ Erro ao carregar:",
            res.status
          );
          return;
        }

        const data = await res.json();
        if (!mounted) return;

        if (!data || typeof data !== "object") {
          console.warn("[Produtos] ⚠️ Dados inválidos");
          return;
        }

        const parsed: Record<string, any> = {};
        Object.entries(data).forEach(([colKey, val]: any) => {
          const medida =
            typeof val.medida === "number"
              ? val.medida
              : Number(val.medida || 1);
          const numMatch = colKey.match(/^col(\d+)$/);
          const num = numMatch ? Number(numMatch[1]) - 5 : undefined;
          parsed[colKey] = {
            nome: val.produto || `Produto ${num}`,
            unidade: medida === 0 ? "g" : "kg",
            num,
            ativo: val.ativo ?? true, // ⚠️ Incluir status ativo
          };
        });

        const elapsed = Date.now() - startTime;
        console.log(`[Produtos] ✅ ${Object.keys(parsed).length} produtos em ${elapsed}ms`);
        setProdutosInfo(parsed);
      } catch (e) {
        console.warn("[Produtos] ❌ Falha ao carregar:", e);
      }
    };

    // OTIMIZAÇÃO: Buscar diretamente do backend (sem localStorage)
    loadFromBackend();

    // Instead of immediately reloading on `produtos-updated`, mark a pending flag.
    // The actual reload will occur when the user navigates away from the report view,
    // or clicks outside the report area, or explicitly requests rebuilding the reports.
    const onProdutosUpdated = () => {
      console.log('[Produtos] Evento de atualização de produtos recebido - marcando pending');
      try {
        localStorage.setItem('produtos-pending-update', '1');
      } catch (e) { }
    };

    window.addEventListener('produtos-updated', onProdutosUpdated as EventListener);

    // Click outside listener: if user clicks outside the main report container, and there's a pending update, reload produtos
    const handleClickOutside = (e: MouseEvent) => {
      try {
        const pending = localStorage.getItem('produtos-pending-update');
        if (!pending) return;
        // Determine if click is outside the report element
        const reportEl = document.getElementById('ReportRoot');
        if (!reportEl) return;
        const target = e.target as Node;
        if (reportEl.contains(target)) return; // click is inside report, ignore
        // Clicked outside -> perform actual reload and clear pending
        console.log('[Produtos] Click fora do report detectado, aplicando atualizacao pendente');
        loadFromBackend();
        setFiltros((prev) => ({ ...prev }));
        setPage((p) => Math.max(1, p));
        localStorage.removeItem('produtos-pending-update');
      } catch (err) {
        console.warn('Erro ao aplicar produtos pendentes:', err);
      }
    };

    window.addEventListener('click', handleClickOutside as EventListener);

    // Listener para quando produtos são ativados/desativados
    const handleProdutoToggle = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log('[Report] Produto toggle detectado:', detail);

      // Limpar resumo para forçar refetch
      setResumo(null);

      // Recarregar produtos info para pegar novo status ativo
      loadFromBackend();

      // Recarregar dados para refletir mudanças (silencioso para evitar flicker)
      setTimeout(() => {
        try { if (typeof refetchSilent === 'function') { refetchSilent(); } else { refetch(); } } catch (e) { }
        refreshResumo();
      }, 500);
    };
    window.addEventListener('produtos-updated', handleProdutoToggle as EventListener);

    // When leaving the report view (unmount), if there's a pending update, apply it
    const handleBeforeUnload = () => {
      try {
        const pending = localStorage.getItem('produtos-pending-update');
        if (pending) {
          loadFromBackend();
          localStorage.removeItem('produtos-pending-update');
        }
      } catch (e) { }
    };
    window.addEventListener('beforeunload', handleBeforeUnload as EventListener);

    return () => {
      window.removeEventListener('produtos-updated', onProdutosUpdated as EventListener);
      window.removeEventListener('produtos-updated', handleProdutoToggle as EventListener);
      window.removeEventListener('click', handleClickOutside as EventListener);
      window.removeEventListener('beforeunload', handleBeforeUnload as EventListener);
      mounted = false;
    };
  }, []);

  // OTIMIZAÇÃO: Log de performance (produtos carregam em paralelo agora)
  useEffect(() => {
    if (Object.keys(produtosInfo).length > 0) {
      const elapsed = Date.now() - mountTimeRef.current;
      console.log(`[Report] ✅ Produtos carregados em ${elapsed}ms (paralelo)`);
    }
  }, [produtosInfo]);

  const converterValor = (valor: number): number => {
    if (typeof valor !== "number") return valor;
    // O backend /api/resumo retorna valores originais (g se medida=0, kg se medida=1)
    // Já estão no formato correto, apenas retornar
    return valor;
  };

  // Função para gerar o documento PDF para preview
  // Prefetch server-side PDF data (includes products marked ignorarCalculos)
  const [pdfServerData, setPdfServerData] = useState<any | null>(null);
  useEffect(() => {
    let mounted = true;
    const fetchPdfData = async () => {
      try {
        const params = new URLSearchParams();
        if (filtros?.dataInicio) params.set('dataInicio', String(filtros.dataInicio));
        if (filtros?.dataFim) params.set('dataFim', String(filtros.dataFim));
        if (filtros?.nomeFormula) params.set('formula', String(filtros.nomeFormula));
        if (filtros?.codigo) params.set('codigo', String(filtros.codigo));
        if (filtros?.numero) params.set('numero', String(filtros.numero));
        // ask server for full data including ignorarCalculos
        params.set('includeIgnored', 'true');
        const url = `http://localhost:3000/api/relatorio/pdf-data?${params.toString()}`;
        const res = await fetch(url, { method: 'GET', headers: { 'Cache-Control': 'no-cache' } });
        if (!res.ok) return;
        const body = await res.json();
        if (!mounted) return;
        setPdfServerData(body);
      } catch (e) {
        // ignore fetch errors for preview
        console.error('[report] Failed to fetch pdf-data for preview', e);
      }
    };
    void fetchPdfData();
    return () => { mounted = false; };
  }, [filtros?.dataInicio, filtros?.dataFim, filtros?.nomeFormula, filtros?.codigo, filtros?.numero]);

  const createPdfDocument = () => {
    // Prepare formula sums and chart data for PDF (prefer formulas from resumo, fallback to produtos or tableSelection)
    const formulaSums: Record<string, number> = (() => {
      const out: Record<string, number> = {};
      try {
        if (
          resumo &&
          resumo.formulasUtilizadas &&
          Object.keys(resumo.formulasUtilizadas).length > 0
        ) {
          for (const [name, data] of Object.entries(
            resumo.formulasUtilizadas
          )) {
            out[name] =
              Number(
                (data as any)?.somatoriaTotal ?? (data as any)?.quantidade ?? 0
              ) || 0;
          }
        } else if (
          tableSelection &&
          tableSelection.formulas &&
          tableSelection.formulas.length > 0
        ) {
          for (const f of tableSelection.formulas) {
            out[f.nome] = Number(f.somatoriaTotal ?? f.quantidade ?? 0) || 0;
          }
        }
      } catch (e) { }
      return out;
    })();

    const pdfChartData = (() => {
      const out: { name: string; value: number }[] = [];
      try {
        if (
          resumo &&
          resumo.formulasUtilizadas &&
          Object.keys(resumo.formulasUtilizadas).length > 0
        ) {
          for (const [name, data] of Object.entries(
            resumo.formulasUtilizadas
          )) {
            const v =
              Number(
                (data as any)?.somatoriaTotal ?? (data as any)?.quantidade ?? 0
              ) || 0;
            out.push({ name, value: v });
          }
        } else if (
          resumo &&
          resumo.usosPorProduto &&
          Object.keys(resumo.usosPorProduto).length > 0
        ) {
          for (const [key, val] of Object.entries(resumo.usosPorProduto)) {
            const produtoId =
              "col" + (Number(String(key).split("Produto_")[1]) + 5);
            const nome = produtosInfo[produtoId]?.nome || String(key);
            let v = Number((val as any)?.quantidade ?? 0) || 0;
            const unidade = produtosInfo[produtoId]?.unidade || "kg";
            if (unidade === "g") v = v * 1000;
            out.push({ name: nome, value: v });
          }
        } else if (
          tableSelection &&
          tableSelection.formulas &&
          tableSelection.formulas.length > 0
        ) {
          for (const f of tableSelection.formulas) {
            out.push({
              name: f.nome,
              value: Number(f.somatoriaTotal ?? f.quantidade ?? 0) || 0,
            });
          }
        } else if (
          tableSelection &&
          tableSelection.produtos &&
          tableSelection.produtos.length > 0
        ) {
          for (const p of tableSelection.produtos) {
            const v = converterValor(Number(p.qtd) || 0);
            out.push({ name: p.nome, value: Number(v) || 0 });
          }
        }
      } catch (e) {
        // ignore
      }
      return out.sort((a, b) => b.value - a.value);
    })();

    // Preparar dados dos gráficos de donut para produtos
    const produtosDonutData = (() => {
      const out: { name: string; value: number }[] = [];
      try {
        if (tableSelection && tableSelection.produtos && tableSelection.produtos.length > 0) {
          for (const p of tableSelection.produtos) {
            const v = converterValor(Number(p.qtd) || 0);
            out.push({ name: p.nome, value: Number(v) || 0 });
          }
        }
      } catch (e) {
        // ignore
      }
      return out.sort((a, b) => b.value - a.value);
    })();

    // Preparar dados dos gráficos de donut para fórmulas
    const formulasDonutData = (() => {
      const out: { name: string; value: number }[] = [];
      try {
        if (tableSelection && tableSelection.formulas && tableSelection.formulas.length > 0) {
          for (const f of tableSelection.formulas) {
            out.push({
              name: f.nome,
              value: Number(f.somatoriaTotal ?? f.quantidade ?? 0) || 0,
            });
          }
        }
      } catch (e) {
        // ignore
      }
      return out.sort((a, b) => b.value - a.value);
    })();

    // Preparar dados do gráfico de barras de horários
    const horariosBarData = (() => {
      const out: { name: string; value: number }[] = [];
      try {
        if (resumo && resumo.distribuicaoPorHora) {
          // Converter objeto de distribuição por hora em array
          Object.entries(resumo.distribuicaoPorHora).forEach(([hora, valor]) => {
            out.push({
              name: hora,
              value: Number(valor) || 0,
            });
          });
        }
      } catch (e) {
        // ignore
      }
      // Ordenar por hora (formato HH:mm)
      return out.sort((a, b) => a.name.localeCompare(b.name));
    })();

    // Preparar dados do gráfico de produção semanal
    const semanaBarData = (() => {
      const out: { name: string; value: number }[] = [];
      try {
        if (resumo && resumo.distribuicaoPorSemana) {
          Object.entries(resumo.distribuicaoPorSemana).forEach(([semana, valor]) => {
            out.push({
              name: semana,
              value: Number(valor) || 0,
            });
          });
        }
      } catch (e) {
        // ignore
      }
      return out.sort((a, b) => a.name.localeCompare(b.name));
    })();

    // Preparar dados do gráfico de dias da semana
    const diasSemanaBarData = (() => {
      const out: { name: string; value: number }[] = [];
      try {
        if (resumo && resumo.distribuicaoPorDiaSemana) {
          const diasOrdem = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          Object.entries(resumo.distribuicaoPorDiaSemana).forEach(([dia, valor]) => {
            out.push({
              name: dia,
              value: Number(valor) || 0,
            });
          });
          // Ordenar por ordem dos dias da semana
          out.sort((a, b) => {
            const indexA = diasOrdem.indexOf(a.name);
            const indexB = diasOrdem.indexOf(b.name);
            return indexA - indexB;
          });
        }
      } catch (e) {
        // ignore
      }
      return out;
    })();

    // Aplicar ordenação aos produtos baseada em pdfCustomization.sortOrder
    const produtosOrdenados = (() => {
      // Prefer server-provided produtos (includes ignorarCalculos). Fallback to tableSelection.
      const serverProds = Array.isArray(pdfServerData?.produtos) ? pdfServerData.produtos.map((p: any) => ({ nome: p.nome, qtd: p.qtd, unidade: p.unidade })) : null;
      const prods = serverProds ? [...serverProds] : [...tableSelection.produtos];

      if (pdfCustomization.sortOrder === 'alphabetic') {
        return prods.sort((a, b) => a.nome.localeCompare(b.nome));
      } else if (pdfCustomization.sortOrder === 'silo') {
        // Ordenar por colKey (col6 = silo 1, col7 = silo 2, etc)
        return prods.sort((a, b) => {
          const getNumFromKey = (key?: string) => {
            if (!key) return 999;
            const match = key.match(/col(\d+)/);
            return match ? parseInt(match[1]) : 999;
          };
          return getNumFromKey(a.colKey) - getNumFromKey(b.colKey);
        });
      } else if (pdfCustomization.sortOrder === 'most-used') {
        // Ordenar por quantidade (decrescente)
        return prods.sort((a, b) => {
          const qtdA = typeof a.qtd === 'number' ? a.qtd : parseFloat(String(a.qtd)) || 0;
          const qtdB = typeof b.qtd === 'number' ? b.qtd : parseFloat(String(b.qtd)) || 0;
          return qtdB - qtdA;
        });
      }

      return prods;
    })();

    return (
      <MyDocument
        logoUrl={logoUrl}
        total={Number(tableSelection.total) || 0}
        batidas={Number(tableSelection.batidas) || 0}
        periodoInicio={tableSelection.periodoInicio}
        periodoFim={tableSelection.periodoFim}
        horaInicial={tableSelection.horaInicial}
        horaFinal={tableSelection.horaFinal}
        formulas={tableSelection.formulas}
        produtos={produtosOrdenados}
        data={new Date().toLocaleDateString("pt-BR")}
        empresa={sideInfo.proprietario || "Relatório RPRO"}
        // only pass comments to the PDF when the user enabled them in the UI
        comentarios={showPdfComments ? comentariosComId : []}
        chartData={pdfChartData}
        formulaSums={formulaSums}
        usuario={user.username}
        showCharts={showPdfCharts}
        codigoCliente={filtros.codigo || resumo?.codigoCliente}
        codigoPrograma={filtros.numero || resumo?.codigoPrograma}
        produtosChartData={produtosDonutData}
        formulasChartData={formulasDonutData}
        horariosChartData={horariosBarData}
        semanaChartData={semanaBarData}
        diasSemanaChartData={diasSemanaBarData}
        pdfCustomization={pdfCustomization}
      />
    );
  };

  const handleExcelExport = async (filters: {
    nomeFormula?: string;
    dataInicio?: string;
    dataFim?: string;
  }) => {
    try {
      const backendPort = 3000;
      const base = `http://localhost:${backendPort}`;
      const params = new URLSearchParams();

      if (filters.dataInicio) params.append("dataInicio", filters.dataInicio);
      if (filters.dataFim) params.append("dataFim", filters.dataFim);
      if (filters.nomeFormula) params.append("formula", filters.nomeFormula);

      const url = `${base}/api/relatorio/exportExcel?${params.toString()}`;

      const resp = await fetch(url, { method: "GET" });
      if (!resp.ok) {
        let txt = "";
        try {
          txt = await resp.text();
        } catch { }
        console.error("Falha ao exportar Excel:", txt || resp.statusText);
        return;
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;

      // Gerar nome do arquivo com datas dos filtros
      let fileName = "relatorio";
      if (filters.dataInicio) {
        // Converter formato se necessário (YYYY-MM-DD -> DD-MM-YYYY)
        const dataInicio = filters.dataInicio.includes('-')
          ? filters.dataInicio.split('-').reverse().join('-')
          : filters.dataInicio;
        fileName += `_${dataInicio}`;
        if (filters.dataFim) {
          const dataFim = filters.dataFim.includes('-')
            ? filters.dataFim.split('-').reverse().join('-')
            : filters.dataFim;
          fileName += `_${dataFim}`;
        }
      } else {
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        fileName += `_${dia}-${mes}-${ano}`;
      }
      a.download = `${fileName}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Erro ao exportar Excel:", err);
    }
  };

  const displayProducts = useMemo(() => {
    console.log('[displayProducts] Computing with resumo:', resumo);
    if (
      resumo &&
      resumo.usosPorProduto
    ) {
      // Build an array with numeric column index so we can sort it to match the main table
      const items: {
        colKey: string;
        nome: string;
        qtd: number;
        unidade: string;
        idx: number;
      }[] = Object.entries(resumo.usosPorProduto).map(
        ([key, val]: [string, unknown]) => {
          const produtoId =
            "col" + (Number(String(key).split("Produto_")[1]) + 5);
          const nome = produtosInfo[produtoId]?.nome || String(key);
          const v = val as Record<string, unknown> | undefined;
          const rawQtd = v?.["quantidade"];
          const qtd = Number(rawQtd ?? 0) || 0;
          // Buscar unidade do resumo ou do produtosInfo
          const unidade = String(v?.["unidade"] || produtosInfo[produtoId]?.unidade || "kg");
          const idx = Number(String(produtoId).replace(/^col/, "")) || 0;

          // ⚠️ FILTRO: Verificar se produto está ativo
          const isAtivo = produtosInfo[produtoId]?.ativo !== false;

          return { colKey: produtoId, nome, qtd, unidade, idx, isAtivo };
        }
      )
        .filter(item => item.isAtivo); // ⚠️ Remover produtos inativos

      // Sort by the numeric part of the column key (col6, col7, ...)
      items.sort((a, b) => a.idx - b.idx);

      return items.map(({ colKey, nome, qtd, unidade }) => ({ colKey, nome, qtd, unidade }));
    }
    return tableSelection.produtos.map((p, idx) => {
      const inferredCol = p.colKey || `col${idx + 6}`;
      return {
        colKey: inferredCol,
        nome: p.nome,
        qtd: p.qtd,
        unidade: p.unidade || produtosInfo[inferredCol]?.unidade || "kg",
      };
    });
  }, [resumo, tableSelection, produtosInfo]);

  // Callback estável para receber função de reset da tabela
  const handleResetColumnsReady = useCallback((resetFn: () => void) => {
    setResetTableColumns(() => resetFn);
  }, []);

  // Renderização condicional do conteúdo
  let content;

  // OTIMIZAÇÃO: Mostrar loading se produtos ainda não foram carregados
  const isInitializing = !allowDataFetch && Object.keys(produtosInfo).length === 0;

  if (view === "table") {
    content = (
      <TableComponent
        filtros={filtros}
        colLabels={colLabels}
        dados={dados}
        loading={loading || isInitializing}
        error={error}
        page={page}
        pageSize={pageSize}
        produtosInfo={produtosInfo}
        useExternalData
        onResetColumnsReady={handleResetColumnsReady}
        sortBy={sortBy}
        sortDir={sortDir}
        onToggleSort={handleToggleSort}
      />
    );
  } else if (view === "product") {
    content = (
      <Products
        colLabels={colLabels}
        onLabelChange={onLabelChange}
        setColLabels={setColLabels}
      />
    );
  }

  // Paginação
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const maxVisiblePages = 10;
  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex flex-col gap-1.5 w-full h-full">
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-row items-end gap-1">
          <Button
            onClick={() => setView("table")}
            className={view === "table" ? "bg-red-800 border border-gray-300" : ""}
          >
            Relatórios
          </Button>
          <Button
            onClick={() => setView("product")}
            className={view === "product" ? "bg-red-800 border border-gray-300" : ""}
          >
            Produtos
          </Button>
        </div>
        <div className="flex flex-col items-end justify-end gap-1">
          <div className="flex flex-row items-end gap-1 3xl:gap-0">
            <FiltrosBar onAplicarFiltros={handleAplicarFiltros} />
            <Button
              onClick={handleCollectorToggle}
              disabled={collectorLoading}
              className={cn(
                "flex items-center gap-1",
                collectorRunning
                  ? "bg-gray-600 hover:bg-red-700"
                  : "bg-red-600 hover:bg-gray-700"
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
                <p className="md:flex ">Processando...</p>
              ) : collectorRunning ? (
                <p className="md:flex "> Parar coleta</p>
              ) : (
                <p className="md:flex ">Iniciar coleta</p>
              )}
            </Button>
          </div>
        </div>
      </div>

      {view === "table" && resetTableColumns && (
        <div className="flex justify-start">
          <Button
            onClick={resetTableColumns}
            variant="ghost"
            className=" text-gray-500 hover:text-gray-700 hover:underline transition-colors"
          >
            Resetar colunas
          </Button>
        </div>
      )}
      <div className="flex flex-row gap-2 justify-start w-full">
        <div className="flex-1 flex flex-col w-70 items-start justify-start h-fit">
          <div className="flex w-full h-[70vh] 2xl:h-[82vh] 3xl:h-[86vh] overflow-hidden shadow-xl rounded flex border border-gray-300">
            {content}
          </div>

          {/* Paginação */}
          <div className="flex flex-row items-center justify-end mt-2">
            <Pagination className="flex flex-row justify-end">
              <PaginationContent>
                <PaginationItem>
                  <button
                    onClick={() => {
                      if (page !== 1) {
                        // Aplicar feedback visual imediato mesmo antes de dados carregarem
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
                            // Aplicar feedback visual imediato mesmo antes de dados carregarem
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
                {/* 
                pau no seu cu
                se leu seu cu é meu
                 */}
                <PaginationItem>
                  <button
                    onClick={() => {
                      if (page !== totalPages) {
                        // Aplicar feedback visual imediato mesmo antes de dados carregarem
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

        {/* Side Info com drawer de gráficos atrás */}
        <div
          className="relative w-87 h-[70vh] 2xl:h-[82vh] 3xl:h-[86vh] flex flex-col p-2 shadow-xl rounded border border-gray-300 gap-2 flex-shrink-0"
          style={{ zIndex: 10 }}
        >
          {/* Drawer de gráficos compacto, por trás do sideinfo */}
          {chartsOpen && (
            <div
              className="absolute top-0 transition right-full mr-2 h-full w-96 bg-white border rounded-l-lg shadow-lg overflow-hidden"
              style={{ zIndex: 1 }}
            >
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b ">
                  <div className="text-base font-bold text-gray-900">
                    Resumo Visual
                  </div>
                </div>
                <div
                  className="p-4 space-y-4 overflow-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {/* Mensagem quando não há dados */}
                  {(resumo?.produtosCount ?? displayProducts?.length ?? 0) === 0 &&
                    ((resumo?.formulasUtilizadas ? Object.keys(resumo.formulasUtilizadas).length : 0) || (tableSelection.formulas?.length ?? 0)) === 0 &&
                    !(resumo && (resumo.totalPesos > 0 || resumo.batitdasTotais > 0)) && (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-sm font-medium">Nenhum dado encontrado</p>
                          <p className="text-xs mt-1">Ajuste os filtros para ver mais resultados</p>
                        </div>
                      </div>
                    )}

                  {/* Produtos Donut */}
                  {(resumo?.produtosCount ?? displayProducts?.length ?? 0) > 0 && (
                    <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="text-sm font-bold text-gray-800">
                          Produtos
                        </div>
                        <div className="text-xs text-gray-600 font-medium mt-0.5">
                          {resumo?.produtosCount ??
                            (displayProducts?.length || 0)}{" "}
                          itens •{" "}
                          {(
                            resumo?.totalPesos ?? tableSelection.total
                          ).toLocaleString("pt-BR", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          kg
                        </div>
                      </div>
                      <div className="h-[280px] px-3 py-3 relative">
                        {resumoLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                          </div>
                        )}

                        {resumoError && (
                          <>
                            {/* Tentar recarregar automaticamente após um pequeno atraso */}
                            {setTimeout(
                              () => setResumoRetryCount((prev) => prev + 1),
                              3000
                            ) && null}
                          </>
                        )}

                        <DonutChartWidget
                          chartType="produtos"
                          config={chartConfig}
                          compact
                          highlightName={highlightProduto}
                          onSliceHover={(name) => setHighlightProduto(name)}
                          onSliceLeave={() => setHighlightProduto(null)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fórmulas Donut */}
                  {((resumo?.formulasUtilizadas ? Object.keys(resumo.formulasUtilizadas).length : 0) || (tableSelection.formulas?.length ?? 0)) > 0 && (
                    <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="text-sm font-bold text-gray-800">
                          Fórmulas
                        </div>
                        <div className="text-xs text-gray-600 font-medium mt-0.5">
                          {resumo?.formulasUtilizadas
                            ? Object.keys(resumo.formulasUtilizadas).length
                            : tableSelection.formulas?.length || 0}{" "}
                          fórmulas •{" "}
                          {(
                            resumo?.batitdasTotais ?? tableSelection.batidas
                          ).toLocaleString("pt-BR")}{" "}
                          batidas
                        </div>
                      </div>
                      <div className="h-[280px] px-3 py-3 relative">
                        {resumoLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                          </div>
                        )}

                        {resumoError && (
                          <>
                            {/* Tentar recarregar automaticamente após um pequeno atraso */}
                            {setTimeout(
                              () => setResumoRetryCount((prev) => prev + 1),
                              3000
                            ) && null}
                          </>
                        )}

                        <DonutChartWidget
                          chartType="formulas"
                          config={chartConfig}
                          compact
                          highlightName={highlightFormula}
                          onSliceHover={(name) => setHighlightFormula(name)}
                          onSliceLeave={() => setHighlightFormula(null)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Horários BarChart - só renderiza se houver dados */}
                  {resumo && (resumo.totalPesos > 0 || resumo.batitdasTotais > 0) && (
                    <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="text-sm font-bold text-gray-800">
                          Horários de Produção
                        </div>
                        <div className="text-xs text-gray-600 font-medium mt-0.5">
                          Distribuição por hora
                        </div>
                      </div>
                      <div className="h-fit px-2 pt-3 relative">
                        {resumoLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                          </div>
                        )}

                        {resumoError && (
                          <button
                            onClick={() =>
                              setResumoRetryCount((prev) => prev + 1)
                            }
                            className="absolute top-2 right-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md flex items-center z-20"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Recarregar
                          </button>
                        )}

                        <BarChartWidget
                          chartType="horarios"
                          config={chartConfig}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botão para abrir/fechar drawer (fica colado à esquerda do sideinfo) */}
          <button
            className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-l px-1.5 py-2 shadow hover:bg-gray-50"
            onClick={() => setChartsOpen((s) => !s)}
            title={chartsOpen ? "Ocultar gráficos" : "Mostrar gráficos"}
            style={{ zIndex: 7 }}
          >
            {chartsOpen ? "▶" : "◀"}
          </button>

          {/* Conteúdo do sideinfo (em cima do drawer) */}
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 gap-2" style={{ zIndex: 15 }}>
            <div className="w-83 h-28 max-h-28 rounded-lg flex flex-col justify-center p-2 pt-0 shadow-md/16">
              <div className="flex justify-end p-0 m-0">
                <RefreshButton
                  type="ihm"
                  ihmConfig={ihmConfig || undefined}
                  onRefresh={async () => {
                    try { toastManager.showInfoOnce('manual-refresh', 'Recarregando dados frescos...'); } catch (e) { }
                    // Sem cache - sempre busca dados frescos do backend
                    try { refetch(); } catch (err) { }
                    refreshResumo();
                  }}
                  label=""
                  size="default"
                />
              </div>
              <p className="text-center text-lg font-bold">
                Total: {""}
                {(resumo && typeof resumo.totalPesos === "number"
                  ? resumo.totalPesos
                  : tableSelection.total
                ).toLocaleString("pt-BR", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                kg
              </p>
              <p className="text-center text-sm text-gray-400 font-regular">
                Batidas: {""}
                {(resumo && typeof resumo.batidasTotais === "number"
                  ? resumo.batidasTotais
                  : tableSelection.batidas
                ).toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="w-83 h-28 max-h-28 rounded-lg flex flex-col justify-center shadow-md/16">
              <p className="text-center font-bold">Período: {""}</p>
              <div className="flex flex-row justify-around px-8 gap-4">
                <div className="flex flex-col justify-center gap-1">
                  <p className="text-center font-bold text-lg">
                    {resumo && resumo.periodoInicio
                      ? formatShortDate(resumo.periodoInicio)
                      : "--/--/--"}
                  </p>
                  <p className="text-center text-sm text-gray-400 font-regular">
                    {resumo?.firstDayRange?.date && (
                      <div className="text-sm text-gray-400">
                        {resumo.firstDayRange.firstTime || "—"}{" "}
                        <Separator orientation="vertical" />{" "}
                        {resumo.firstDayRange.lastTime || "—"}
                      </div>
                    )}
                  </p>
                </div>

                <Separator orientation="vertical" />

                <div className="flex flex-col justify-center gap-1">
                  <p className="text-center font-bold text-lg">
                    {resumo && resumo.periodoFim
                      ? formatShortDate(resumo.periodoFim)
                      : "--/--/--"}
                  </p>
                  <p className="text-center text-sm text-gray-400 font-regular">
                    {resumo?.lastDayRange?.date && (
                      <div className="text-sm text-gray-400">
                        {resumo.lastDayRange.firstTime || "—"}{" "}
                        <Separator orientation="vertical" />{" "}
                        {resumo.lastDayRange.lastTime || "—"}
                      </div>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Active advanced filters preview */}
            {/* <div className="w-83 rounded-lg p-2 shadow-md/16 bg-white">
            <p className="text-sm font-semibold text-center">Filtros aplicados</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {activeFilterChips.length === 0 && (
                <span className="text-xs text-gray-400">Nenhum filtro avançado ativo</span>
              )}
              {activeFilterChips.map((c, idx) => (
                <div
                  key={c.id || `chip-${idx}`}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700 border"
                  title={String(c.label)}
                >
                  <span className="max-w-[220px] block truncate">{formatShortDate(String(c.label))}</span>
                  <button
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      removeChip({ type: c.type, value: c.value });
                    }}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-800 font-semibold"
                    aria-label={`Remover filtro ${c.label}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div> */}
          </div>

          {/* Produtos */}
          <div className="border border-gray-300 rounded flex-grow overflow-auto thin-red-scrollbar w-full">
            {/* Toggle entre Produtos e Fórmulas */}
            <div className="flex gap-2 p-2 border-b sticky top-0 bg-white z-10">
              <button
                className={`text-xs px-2 py-1 rounded border ${sideListMode === "produtos" ? "bg-red-600 text-white border-red-600" : "bg-gray-100 text-gray-700 border-gray-300"}`}
                onClick={() => setSideListMode("produtos")}
              >
                Produtos
              </button>
              <button
                className={`text-xs px-2 py-1 rounded border ${sideListMode === "formulas" ? "bg-red-600 text-white border-red-600" : "bg-gray-100 text-gray-700 border-gray-300"}`}
                onClick={() => setSideListMode("formulas")}
              >
                Fórmulas
              </button>
            </div>

            {sideListMode === "produtos" ? (
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-gray-100 border">
                    <TableHead className="text-xs font-medium text-center text-gray-700 w-1/2 border-r h-9 px-3">
                      Produtos
                    </TableHead>
                    <TableHead className="text-xs font-medium text-center text-gray-700 w-1/2 h-9 px-3">
                      Quantidade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayProducts && displayProducts.length > 0 ? (
                    displayProducts.map((produto, idx) => (
                      <TableRow
                        key={idx}
                        onMouseEnter={() => setHighlightProduto(produto.nome)}
                        onMouseLeave={() => setHighlightProduto(null)}
                        className="hover:bg-gray-50 cursor-default border-b even:bg-gray-100/100"
                      >
                        <TableCell className="px-3 text-xs text-gray-700 text-md text-right border textborder-r">
                          <div
                            className="truncate"
                            title={produto.nome}
                          >
                            {produto.nome}
                          </div>
                        </TableCell>
                        <TableCell className="px-3  text-xs text-gray-700 text-md text-right border">
                          <div
                            className="truncate"
                          >
                            {(() => {
                              const unidade = produto.unidade ||
                                (produto.colKey && produtosInfo[produto.colKey]?.unidade) ||
                                "kg";
                              // Se for gramas, multiplicar por 1000 para exibir em kg
                              const valorExibicao = unidade === "g"
                                ? produto.qtd
                                : produto.qtd;

                              return (
                                <>
                                  {Number(valorExibicao).toLocaleString("pt-BR", {
                                    minimumFractionDigits: 3,
                                    maximumFractionDigits: 3,
                                  })}{" "}
                                  kg
                                </>
                              );
                            })()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-gray-500 py-4"
                      >
                        Nenhum produto selecionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-gray-100 border">
                    <TableHead className="text-xs font-medium text-center text-gray-700 w-1/2 border-r h-9 px-3">
                      Fórmulas
                    </TableHead>
                    <TableHead className="text-xs font-medium text-center text-gray-700 w-1/2 h-9 px-3">
                      Quantidade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(resumo &&
                    resumo.formulasUtilizadas &&
                    Object.keys(resumo.formulasUtilizadas).length > 0
                    ? Object.entries(resumo.formulasUtilizadas).map(
                      ([nome, data]: any) => ({
                        nome,
                        valor: Number(
                          data?.somatoriaTotal ?? data?.quantidade ?? 0
                        ),
                      })
                    )
                    : (tableSelection.formulas || []).map((f) => ({
                      nome: f.nome,
                      valor: Number(f.somatoriaTotal ?? f.quantidade ?? 0),
                    }))
                  ).map((f, idx) => (
                    <TableRow
                      key={idx}
                      onMouseEnter={() => setHighlightFormula(f.nome)}
                      onMouseLeave={() => setHighlightFormula(null)}
                      className="hover:bg-gray-50 cursor-default border-b even:bg-gray-50/50"
                    >
                      <TableCell className="px-3 text-md text-gray-700 border-r text-right border">
                        <div
                          className="truncate"
                          title={f.nome}
                        >
                          {f.nome}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 text-md text-gray-700 text-right border">
                        <div
                          className="truncate"
                        >
                          {f.valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          })}{" "}
                          kg
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Impressão e Comentários */}
          <div className="flex flex-col fl text-center gap-3 mt-1">
            <div className="flex flex-row gap-2 justify-center">
              <ExportDropdown
                // onPdfExport={handlePrint}
                onExcelExport={handleExcelExport}
                pdfDocument={createPdfDocument()}
                showComments={showPdfComments}
                showCharts={showPdfCharts}
                onToggleComments={() => setShowPdfComments(!showPdfComments)}
                onToggleCharts={() => setShowPdfCharts(!showPdfCharts)}
                comments={comentariosComId}
                onAddComment={handleAddCommentFromModal}
                onRemoveComment={handleRemoveCommentFromModal}
                pdfCustomization={pdfCustomization}
                onPdfCustomizationChange={setPdfCustomization}
                onPdfModalOpenChange={handlePdfModalOpenChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
