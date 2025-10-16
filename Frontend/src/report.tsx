import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { format as formatDateFn } from 'date-fns';



import { MyDocument } from "./Pdf";
import { usePersistentForm } from './config';

// import { pdf } from "@react-pdf/renderer";
import TableComponent from "./TableComponent";
import Products from "./products";
import { getProcessador } from "./Processador";
import { useReportData } from "./hooks/useReportData";
import { cn } from "./lib/utils";
import { ExportDropdown } from "./components/ExportDropdown";

import { resolvePhotoUrl } from './lib/photoUtils';
import useAuth from './hooks/useAuth';

import {
  ChevronsLeft,
  ChevronsRight,
  Play,
  Square,
  Loader2,
} from "lucide-react";
import { useGlobalConnection } from './hooks/useGlobalConnection';
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

interface ComentarioRelatorio {
  texto: string;
  data?: string;
}

export default function Report() {
  const { user } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);

  // Obter logo do usuário
  useEffect(() => {
    // Try to load stored report logo path from backend config
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('http://localhost:3000/api/report/logo');
        if (!res.ok) return;
        const js = await res.json().catch(() => ({}));
        const p = js?.path;
        if (p && mounted) {
          const resolved = resolvePhotoUrl(p);
          setLogoUrl(resolved || undefined);
        }
        // If user has a profile photo path and no configured report logo, prefer that
        if (!p && user && (user as any).photoPath && mounted) {
          setLogoUrl(resolvePhotoUrl((user as any).photoPath) || undefined);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [user]);

  // ... restante do código permanece igual até handlePrint ...
  
  const [filtros, setFiltros] = useState<Filtros>({
    dataInicio: "",
    dataFim: "",
    nomeFormula: "",
    codigo: "",
    numero: "",
  });

  const [colLabels, setColLabels] = useState<{ [key: string]: string }>({});
  const [produtosInfo, setProdutosInfo] = useState<
    Record<string, { nome?: string; unidade?: string; num?: number }>
  >({});
  const [view, setView] = useState<"table" | "product">("table");
  // Drawer de gráficos (atrás do sideinfo)
  const [chartsOpen, setChartsOpen] = useState<boolean>(false);
  const [highlightProduto, setHighlightProduto] = useState<string | null>(null);
  const [highlightFormula, setHighlightFormula] = useState<string | null>(null);
  const [sideListMode, setSideListMode] = useState<'produtos' | 'formulas'>('produtos');

  // abre automaticamente ao aplicar filtros/busca
  useEffect(() => {
    if (filtros && (filtros.dataInicio || filtros.dataFim || filtros.nomeFormula || filtros.codigo || filtros.numero)) {
      setChartsOpen(true);
    }
  }, [filtros.dataInicio, filtros.dataFim, filtros.nomeFormula, filtros.codigo, filtros.numero]);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(100);

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

  const [tableSelection, setTableSelection] = useState<{
    periodoInicio: string | undefined;
    periodoFim: string | undefined;
    total: number;
    batidas: number;
    horaInicial: string;
    horaFinal: string;
    formulas: { numero: number; nome: string; quantidade: number; porcentagem: number; somatoriaTotal: number }[];
    produtos: { nome: string; qtd: number; colKey?: string; unidade?: string }[];
    empresa: string;
    usuario: string
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
    usuario: "..."
  });

  const [resumo, setResumo] = useState<any | null>(null);
  const [resumoReloadFlag, setResumoReloadFlag] = useState(0);
  const runtime = useRuntimeConfig();
  const { dados, loading, error, total, refetch } = useReportData(filtros, page, pageSize);
  const { formData: profileConfigData } = usePersistentForm("profile-config");
  const autoRefreshTimer = useRef<number | null>(null);
  const prevCollectorRunning = useRef<boolean>(false);
  const { startConnecting, stopConnecting } = useGlobalConnection();

  const refreshResumo = useCallback(() => {
    setResumoReloadFlag((flag) => flag + 1);
  }, []);

  const fetchCollectorStatus = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/collector/status", { method: "GET" });
      if (!res.ok) throw new Error("Não foi possível obter o status do coletor.");
      const status = await res.json();
      const isRunning = Boolean(status?.running);
      setCollectorRunning(isRunning);
      setCollectorError(status?.lastError ?? null);
    } catch (err) {
      console.error("Erro ao buscar status do coletor:", err);
    }
  }, []);

  // Side info state
  const [sideInfo, setSideInfo] = useState<{ granja: string; proprietario: string }>({ 
    granja: 'Granja', 
    proprietario: 'Proprietario' 
  });
  console.log(sideInfo)
  // Efeitos para side info
  useEffect(() => {
    if (!profileConfigData) return;
    setSideInfo({
      granja: profileConfigData.nomeCliente || 'Granja',
      proprietario: profileConfigData.nomeCliente,
    });
  }, [profileConfigData]);

  useEffect(() => {
    const onCfg = (e: any) => {
      try {
        const name = e?.detail?.nomeCliente;
        if (!name) return;
        setSideInfo(prev => ({ ...prev, granja: name, proprietario: name }));
      } catch (err) {}
    };
    window.addEventListener('profile-config-updated', onCfg as EventListener);
    return () => window.removeEventListener('profile-config-updated', onCfg as EventListener);
  }, []);

  useEffect(() => {
    if (!runtime || runtime.loading) return;
    const p = runtime.get('granja') || runtime.get('nomeCliente') || 'Granja';
    const g = runtime.get('proprietario') || runtime.get('owner') || 'Proprietario';
    setSideInfo({ granja: g, proprietario: p });
  }, [runtime]);

  // Fetch resumo sempre que os filtros mudarem
  // Estados para controle de resumo
  const [resumoError, setResumoError] = useState<string | null>(null);
  const [resumoLoading, setResumoLoading] = useState(false);
  const [resumoRetryCount, setResumoRetryCount] = useState(0);
  
  useEffect(() => {
    let mounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const fetchResumo = async () => {
      if (!mounted) return;
      
      try {
        setResumoLoading(true);
        setResumoError(null);
        
        const processador = getProcessador();
        const dateStart = filtros.dataInicio || undefined;
        const dateEnd = filtros.dataFim || undefined;
        const formula = filtros.nomeFormula || undefined;
        const areaId = (filtros as any).areaId || undefined;

        console.log(`[resumo] Buscando dados com filtros`, filtros);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
        const result = await processador.getResumoWithSignal(
          controller.signal,
          areaId as string | undefined,
          formula as string | undefined,
          dateStart as string | undefined,
          dateEnd as string | undefined,
          (filtros && filtros.codigo !== undefined && filtros.codigo !== '') ? filtros.codigo : undefined,
          (filtros && filtros.numero !== undefined && filtros.numero !== '') ? filtros.numero : undefined,
        );
        
        clearTimeout(timeoutId);
        if (!mounted) return;
        
        console.log(`[resumo] Dados recebidos:`, result);
        setResumo(result || null);
        setResumoRetryCount(0);
      } catch (err: any) {
        if (!mounted) return;
        
        console.error("[resumo] Erro ao buscar dados:", err);
        
        // Tentar novamente até 3 vezes em caso de erro de rede
        if (resumoRetryCount < 3 && (err.name === 'AbortError' || err.message?.includes('network') || err.message?.includes('failed'))) {
          setResumoRetryCount(prev => prev + 1);
          console.log(`[resumo] Tentando novamente (${resumoRetryCount + 1}/3)...`);
          retryTimeout = setTimeout(() => {
            if (mounted) fetchResumo();
          }, 2000); // espera 2 segundos antes de tentar novamente
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
  }, [filtros, resumoReloadFlag, resumoRetryCount]);

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
      const formulasFromResumo = Object.entries(resumo.formulasUtilizadas || {}).map(
        ([nome, data]: [string, any]) => ({
          numero: data.numero ?? 0,
          nome,
          quantidade: data.quantidade ?? 0,
          porcentagem: data.porcentagem ?? 0,
          somatoriaTotal: data.somatoriaTotal ?? 0,
        })
      );

      setTableSelection({
        total: resumo.totalPesos || 0,
        batidas: resumo.batitdasTotais || 0,
        periodoInicio: resumo.periodoInicio || "--/--/--",
        periodoFim: resumo.periodoFim || "--/--/--",
        horaInicial: resumo.horaInicial || "--:--:--",
        horaFinal: resumo.horaFinal || "--:--:--",
        formulas: formulasFromResumo,
        produtos: (() => {
          const items = Object.entries(resumo.usosPorProduto).map(([key, val]: [string, unknown]) => {
            const produtoId = "col" + (Number(String(key).split("Produto_")[1]) + 5);
            const nome = produtosInfo[produtoId]?.nome || key;
            const v = val as Record<string, unknown> | undefined;
            const rawQtd = v?.['quantidade'];
            const qtd = Number(rawQtd ?? 0) || 0;
            const unidade = (v?.['unidade'] as string) || 'kg';
            const idx = Number(String(produtoId).replace(/^col/, "")) || 0;
            return { colKey: produtoId, nome, qtd, unidade, idx };
          });
          items.sort((a, b) => a.idx - b.idx);
          return items.map(({ colKey, nome, qtd, unidade }) => ({ colKey, nome, qtd, unidade }));
        })(),
        empresa:sideInfo.proprietario,
        usuario:user.username
      });
    }
  }, [resumo, produtosInfo, sideInfo.proprietario, user.username]);

  // Funções de comentários
  const removerComentario = (index: number) => {
    setComentarios(prev => prev.filter((_, i) => i !== index));
  };

  // Funções para o ExportDropdown (com ID)
  const handleAddCommentFromModal = (texto: string) => {
    const comentario: ComentarioRelatorio = {
      texto,
      data: new Date().toLocaleString('pt-BR'),
    };
    setComentarios(prev => [...prev, comentario]);
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
    data: c.data || new Date().toLocaleString('pt-BR'),
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
        const [y, m, d] = s.split('-').map(Number);
        return formatDateFn(new Date(y, m - 1, d), 'dd/MM/yyyy');
      }
      if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
        const [d, m, y] = s.split('-').map(Number);
        return formatDateFn(new Date(y, m - 1, d), 'dd/MM/yyyy');
      }
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) return formatDateFn(parsed, 'dd/MM/yyyy');
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
        const res = await fetch("http://localhost:3000/api/collector/stop", { method: "GET" });
        if (!res.ok) throw new Error("Falha ao interromper o coletor.");
        await res.json().catch(() => ({}));
        await fetchCollectorStatus();
        refetch();
        refreshResumo();
      } else {
        // Get current IHM config before starting collector
        let ihmConfig = null;
        try {
          const configRes = await fetch("http://localhost:3000/api/config/ihm-config");
          if (configRes.ok) {
            const configData = await configRes.json();
            ihmConfig = configData.value;
          }
        } catch (e) {
          console.warn("Failed to load IHM config:", e);
        }

        // Start collector with current IHM config
        let res;
        if (ihmConfig && (ihmConfig.ip || ihmConfig.user || ihmConfig.password)) {
          // Send config as POST with body
          startConnecting('Conectando ao coletor...');
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
        } else {
          // Fallback to GET method
          res = await fetch("http://localhost:3000/api/collector/start", { method: "GET" });
        }

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
      refetch();
      refreshResumo();
      autoRefreshTimer.current = window.setInterval(() => {
        refetch();
        refreshResumo();
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
      refetch();
      refreshResumo();
    }
    prevCollectorRunning.current = collectorRunning;
  }, [collectorRunning, refetch, refreshResumo]);

  const onLabelChange = (colKey: string, newName: string, unidade?: string) => {
    setColLabels((prev) => ({ ...prev, [colKey]: newName }));
    setProdutosInfo((prev) => ({
      ...prev,
      [colKey]: { ...(prev[colKey] || {}), nome: newName, unidade: unidade || 'kg' },
    }));

    try {
      const match = colKey.match(/^col(\d+)$/);
      if (match) {
        const colIndex = Number(match[1]);
        const num = colIndex - 5;
        if (!Number.isNaN(num) && num > 0) {
          fetch('http://localhost:3000/api/db/setupMateriaPrima', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ num, produto: newName, medida: unidade === 'g' ? 0 : 1 }] }),
          }).catch(e => console.error('Failed to persist label', e));
        }
      }
    } catch (e) {
      console.warn('Could not persist product label change to backend', e);
    }
  };

  // Load produtosInfo
  useEffect(() => {
    let mounted = true;
    const loadFromBackend = async () => {
      try {
        console.log("[Produtos] Carregando produtos do backend...");
        const res = await fetch('http://localhost:3000/api/materiaprima/labels', {
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store'
        });
        if (!res.ok) {
          console.warn("[Produtos] Erro ao carregar produtos do backend:", res.status);
          return;
        }
        
        const data = await res.json();
        if (!mounted) return;
        
        console.log("[Produtos] Dados recebidos:", data);
        
        if (!data || typeof data !== 'object') {
          console.warn("[Produtos] Dados inválidos recebidos do backend");
          return;
        }
        
        const parsed: Record<string, any> = {};
        Object.entries(data).forEach(([colKey, val]: any) => {
          const medida = typeof val.medida === 'number' ? val.medida : Number(val.medida || 1);
          const numMatch = colKey.match(/^col(\d+)$/);
          const num = numMatch ? Number(numMatch[1]) - 5 : undefined;
          parsed[colKey] = { 
            nome: val.produto || `Produto ${num}`, 
            unidade: medida === 0 ? 'g' : 'kg', 
            num 
          };
        });
        
        console.log("[Produtos] Dados processados:", parsed);
        setProdutosInfo(parsed);
        
        // Salvar no localStorage para uso offline
        localStorage.setItem('produtosInfo', JSON.stringify(parsed));
      } catch (e) {
        console.warn('[Produtos] Falha ao carregar produtos do backend:', e);
        // Em caso de erro, tentar carregar do localStorage
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      try {
        console.log("[Produtos] Tentando carregar do localStorage...");
        const raw = localStorage.getItem('produtosInfo');
        if (raw) {
          const parsedLocal = JSON.parse(raw);
          const parsedObj: Record<string, any> = {};
          Object.keys(parsedLocal).forEach((colKey) => {
            const val = parsedLocal[colKey];
            parsedObj[colKey] = { 
              nome: val?.nome || `Produto`, 
              unidade: val?.unidade || 'kg' 
            };
          });
          console.log("[Produtos] Carregado do localStorage:", parsedObj);
          setProdutosInfo(parsedObj);
        }
      } catch (err) {
        console.error("[Produtos] Erro ao carregar do localStorage:", err);
      }
    };
    
    // Tenta carregar do backend primeiro
    loadFromBackend();
    
    const onProdutosUpdated = () => {
      console.log("[Produtos] Evento de atualização de produtos recebido");
      loadFromBackend();
      // Recarrega os dados da tabela também
      setFiltros((prev) => ({ ...prev }));
      setPage((p) => Math.max(1, p));
    };
    
    window.addEventListener('produtos-updated', onProdutosUpdated as EventListener);
    return () => { 
      window.removeEventListener('produtos-updated', onProdutosUpdated as EventListener); 
      mounted = false; 
    };
  }, []);

  const converterValor = (valor: number, colKey?: string): number => {
    if (typeof valor !== "number") return valor;
    let unidade = produtosInfo[colKey || '']?.unidade || 'kg';
    // Backend retorna valores sempre em kg. Se unidade configurada é 'g', dividimos por 1000
    if (unidade === 'g') return valor / 1000;
    return valor;
  };

  // Função para gerar o documento PDF para preview
  const createPdfDocument = () => {
    // Prepare formula sums and chart data for PDF (prefer formulas from resumo, fallback to produtos or tableSelection)
    const formulaSums: Record<string, number> = (() => {
      const out: Record<string, number> = {};
      try {
        if (resumo && resumo.formulasUtilizadas && Object.keys(resumo.formulasUtilizadas).length > 0) {
          for (const [name, data] of Object.entries(resumo.formulasUtilizadas)) {
            out[name] = Number((data as any)?.somatoriaTotal ?? (data as any)?.quantidade ?? 0) || 0;
          }
        } else if (tableSelection && tableSelection.formulas && tableSelection.formulas.length > 0) {
          for (const f of tableSelection.formulas) {
            out[f.nome] = Number(f.somatoriaTotal ?? f.quantidade ?? 0) || 0;
          }
        }
      } catch (e) {}
      return out;
    })();

    const pdfChartData = (() => {
      const out: { name: string; value: number }[] = [];
      try {
        if (resumo && resumo.formulasUtilizadas && Object.keys(resumo.formulasUtilizadas).length > 0) {
          for (const [name, data] of Object.entries(resumo.formulasUtilizadas)) {
            const v = Number((data as any)?.somatoriaTotal ?? (data as any)?.quantidade ?? 0) || 0;
            out.push({ name, value: v });
          }
        } else if (resumo && resumo.usosPorProduto && Object.keys(resumo.usosPorProduto).length > 0) {
          for (const [key, val] of Object.entries(resumo.usosPorProduto)) {
            const produtoId = "col" + (Number(String(key).split("Produto_")[1]) + 5);
            const nome = produtosInfo[produtoId]?.nome || String(key);
            let v = Number((val as any)?.quantidade ?? 0) || 0;
            const unidade = produtosInfo[produtoId]?.unidade || 'kg';
            if (unidade === 'g') v = v / 1000;
            out.push({ name: nome, value: v });
          }
        } else if (tableSelection && tableSelection.formulas && tableSelection.formulas.length > 0) {
          for (const f of tableSelection.formulas) {
            out.push({ name: f.nome, value: Number(f.somatoriaTotal ?? f.quantidade ?? 0) || 0 });
          }
        } else if (tableSelection && tableSelection.produtos && tableSelection.produtos.length > 0) {
          for (const p of tableSelection.produtos) {
            const v = converterValor(Number(p.qtd) || 0, p.colKey);
            out.push({ name: p.nome, value: Number(v) || 0 });
          }
        }
      } catch (e) {
        // ignore
      }
      return out.sort((a, b) => b.value - a.value).slice(0, 50);
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
        produtos={tableSelection.produtos}
        data={new Date().toLocaleDateString("pt-BR")}
        empresa={sideInfo.proprietario || 'Relatório RPRO'}
        comentarios={comentariosComId}
        chartData={pdfChartData}
        formulaSums={formulaSums}
        usuario={user.username}
        showComments={showPdfComments}
        showCharts={showPdfCharts}
      />
    );
  };

  
  // const handlePrint = async () => {
  //   // Prepare formula sums and chart data for PDF (prefer formulas from resumo, fallback to produtos or tableSelection)
  //   const formulaSums: Record<string, number> = (() => {
  //     const out: Record<string, number> = {};
  //     try {
  //       if (resumo && resumo.formulasUtilizadas && Object.keys(resumo.formulasUtilizadas).length > 0) {
  //         for (const [name, data] of Object.entries(resumo.formulasUtilizadas)) {
  //           out[name] = Number((data as any)?.somatoriaTotal ?? (data as any)?.quantidade ?? 0) || 0;
  //         }
  //       } else if (tableSelection && tableSelection.formulas && tableSelection.formulas.length > 0) {
  //         for (const f of tableSelection.formulas) {
  //           out[f.nome] = Number(f.somatoriaTotal ?? f.quantidade ?? 0) || 0;
  //         }
  //       }
  //     } catch (e) {}
  //     return out;
  //   })();

  //   const pdfChartData = (() => {
  //     const out: { name: string; value: number }[] = [];
  //     try {
  //       if (resumo && resumo.formulasUtilizadas && Object.keys(resumo.formulasUtilizadas).length > 0) {
  //         for (const [name, data] of Object.entries(resumo.formulasUtilizadas)) {
  //           const v = Number((data as any)?.somatoriaTotal ?? (data as any)?.quantidade ?? 0) || 0;
  //           out.push({ name, value: v });
  //         }
  //       } else if (resumo && resumo.usosPorProduto && Object.keys(resumo.usosPorProduto).length > 0) {
  //         for (const [key, val] of Object.entries(resumo.usosPorProduto)) {
  //           const produtoId = "col" + (Number(String(key).split("Produto_")[1]) + 5);
  //           const nome = produtosInfo[produtoId]?.nome || String(key);
  //           let v = Number((val as any)?.quantidade ?? 0) || 0;
  //           const unidade = produtosInfo[produtoId]?.unidade || 'kg';
  //           if (unidade === 'g') v = v / 1000;
  //           out.push({ name: nome, value: v });
  //         }
  //       } else if (tableSelection && tableSelection.formulas && tableSelection.formulas.length > 0) {
  //         for (const f of tableSelection.formulas) {
  //           out.push({ name: f.nome, value: Number(f.somatoriaTotal ?? f.quantidade ?? 0) || 0 });
  //         }
  //       } else if (tableSelection && tableSelection.produtos && tableSelection.produtos.length > 0) {
  //         for (const p of tableSelection.produtos) {
  //           const v = converterValor(Number(p.qtd) || 0, p.colKey);
  //           out.push({ name: p.nome, value: Number(v) || 0 });
  //         }
  //       }
  //     } catch (e) {
  //       // ignore
  //     }
  //     return out.sort((a, b) => b.value - a.value).slice(0, 50);
  //   })();

  // // Debug: log chart payload to the console so we can inspect why charts may be empty
  // console.log('[PDF] chartData:', pdfChartData);
  // console.log('[PDF] formulaSums:', formulaSums);

  // const blob = await pdf(
  //     <MyDocument
  //       logoUrl={logoUrl}
  //       total={Number(tableSelection.total) || 0}
  //       batidas={Number(tableSelection.batidas) || 0}
  //       periodoInicio={tableSelection.periodoInicio}
  //       periodoFim={tableSelection.periodoFim}
  //       horaInicial={tableSelection.horaInicial}
  //       horaFinal={tableSelection.horaFinal}
  //       formulas={tableSelection.formulas}
  //       produtos={tableSelection.produtos}
  //       data={new Date().toLocaleDateString("pt-BR")}
  //       empresa={sideInfo.proprietario || 'Relatório RPRO'}
  //       comentarios={comentariosComId}
  //       chartData={pdfChartData}
  //       formulaSums={formulaSums}
  //       usuario={user.username}
  //       showComments={showPdfComments}
  //       showCharts={showPdfCharts}
  //     />
  //   ).toBlob();
    
  //   const blobUrl = URL.createObjectURL(blob);
  //   const printWindow = window.open("", "_blank", "width=768,height=733"); 
  //   if (!printWindow) return;

  //   printWindow.document.write(`
  //     <html>
  //       <head><title>Print PDF</title></head>
  //       <body style="margin:0">
  //         <iframe src="${blobUrl}" style="width:100%;height:1000vh;" frameborder="0"></iframe>
  //       </body>
  //     </html>
  //   `);
  //   printWindow.document.close();

  //   const iframe = printWindow.document.querySelector("iframe");
  //   iframe?.addEventListener("load", () => {
  //     printWindow.focus();
  //   });
  // };

  const handleExcelExport = async (filters: { nomeFormula?: string; dataInicio?: string; dataFim?: string }) => {
    try {
      const backendPort = 3000;
      const base = `http://localhost:${backendPort}`;
      const params = new URLSearchParams();
      
      if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
      if (filters.dataFim) params.append('dataFim', filters.dataFim);
      if (filters.nomeFormula) params.append('formula', filters.nomeFormula);

      const url = `${base}/api/relatorio/exportExcel?${params.toString()}`;

      const resp = await fetch(url, { method: 'GET' });
      if (!resp.ok) {
        let txt = '';
        try { txt = await resp.text(); } catch {}
        console.error('Falha ao exportar Excel:', txt || resp.statusText);
        return;
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `relatorio_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Erro ao exportar Excel:', err);
    }
  };

  const displayProducts = useMemo(() => {
    if (resumo && resumo.usosPorProduto && Object.keys(resumo.usosPorProduto).length > 0) {
      // Build an array with numeric column index so we can sort it to match the main table
      const items: { colKey: string; nome: string; qtd: number; idx: number }[] = Object.entries(
        resumo.usosPorProduto
      ).map(([key, val]: [string, unknown]) => {
        const produtoId = "col" + (Number(String(key).split("Produto_")[1]) + 5);
        const nome = produtosInfo[produtoId]?.nome || String(key);
        const v = val as Record<string, unknown> | undefined;
        const rawQtd = v?.['quantidade'];
        const qtd = Number(rawQtd ?? 0) || 0;
        const idx = Number(String(produtoId).replace(/^col/, "")) || 0;
        return { colKey: produtoId, nome, qtd, idx };
      });

      // Sort by the numeric part of the column key (col6, col7, ...)
      items.sort((a, b) => a.idx - b.idx);

      return items.map(({ colKey, nome, qtd }) => ({ colKey, nome, qtd }));
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

  // Renderização condicional do conteúdo
  let content;
  if (view === "table") {
    content = (
      <TableComponent
        filtros={filtros}
        colLabels={colLabels}
        dados={dados}
        loading={loading}
        error={error}
        page={page}
        pageSize={pageSize}
        produtosInfo={produtosInfo}
        useExternalData
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
    <div className="flex flex-col gap-7 w-full h-full">
      <div className="h-[10dvh] flex flex-row justify-between w-full">
        <div className="flex flex-row items-end gap-1 h-[10dvh]">
          <Button onClick={() => setView("table")}>Relatórios</Button>
          <Button onClick={() => setView("product")}>Produtos</Button>
        </div>
        <div className="flex flex-col items-end justify-end gap-2">
          <div className="flex flex-row items-end gap-1">
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
              {collectorLoading
                ? <p className="hidden 3xl:flex">Processando...</p>
                : collectorRunning
                ? <p className="hidden 3xl:flex"> Parar coleta</p>
                : <p className="hidden 3xl:flex">Iniciar coleta</p>
              }
            </Button>
          </div>
        </div>
      </div>


      <div className="flex flex-row gap-2 justify-start w-full">
        <div className="flex-1 flex flex-col gap-3.5 items-start justify-start h-[90vh] 3xl:h-196.5 w-[68px]">
          <div className="flex w-full h-[568px] 3xl:h-196.5 overflow-hidden shadow-xl rounded flex border border-gray-300">
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
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setPage(Math.max(1, page - 1));
                      }
                    }}
                    disabled={page === 1 || loading}
                    className="p-1"
                    title="Página anterior"
                  >
                    <ChevronsLeft className="h-4 w-4" />
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
                            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                        // Aplicar feedback visual imediato mesmo antes de dados carregarem
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setPage(Math.min(page + 1, totalPages));
                      }
                    }}
                    disabled={page === totalPages || loading}
                    className="p-1"
                    title="Próxima página"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        {/* Side Info com drawer de gráficos atrás */}
        <div className="relative w-87 h-[70vh] 3xl:h-[74vh] flex flex-col p-2 shadow-xl rounded border border-gray-300 gap-2 flex-shrink-0" style={{ zIndex: 10  }}>
          {/* Drawer de gráficos compacto, por trás do sideinfo */}
          {chartsOpen && (
            <div className="absolute top-0 right-full mr-2 h-full w-96 bg-white border rounded-l-lg shadow-lg overflow-hidden"
                 style={{ zIndex: 5 }}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b ">
                <div className="text-base font-bold text-gray-900">Resumo Visual</div>
              </div>
              <div className="p-4 space-y-4 overflow-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Produtos Donut */}
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="text-sm font-bold text-gray-800">Produtos</div>
                    <div className="text-xs text-gray-600 font-medium mt-0.5">
                      {resumo?.produtosCount ?? (displayProducts?.length || 0)} itens • {(resumo?.totalPesos ?? tableSelection.total).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg
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
                        {setTimeout(() => setResumoRetryCount(prev => prev + 1), 3000) && null}
                      </>
                    )}
                    
                    <DonutChartWidget
                      chartType="produtos"
                      config={{ filters: filtros }}
                      compact
                      highlightName={highlightProduto}
                      onSliceHover={(name) => setHighlightProduto(name)}
                      onSliceLeave={() => setHighlightProduto(null)}
                    />
                  </div>
                </div>

                {/* Fórmulas Donut */}
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="text-sm font-bold text-gray-800">Fórmulas</div>
                    <div className="text-xs text-gray-600 font-medium mt-0.5">
                      {resumo?.formulasUtilizadas ? Object.keys(resumo.formulasUtilizadas).length : (tableSelection.formulas?.length || 0)} fórmulas • {(resumo?.batitdasTotais ?? tableSelection.batidas).toLocaleString('pt-BR')} batidas
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
                        {setTimeout(() => setResumoRetryCount(prev => prev + 1), 3000) && null}
                      </>
                    )}
                    
                    <DonutChartWidget
                      chartType="formulas"
                      config={{ filters: filtros }}
                      compact
                      highlightName={highlightFormula}
                      onSliceHover={(name) => setHighlightFormula(name)}
                      onSliceLeave={() => setHighlightFormula(null)}
                    />
                  </div>
                </div>

                {/* Horários BarChart */}
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="text-sm font-bold text-gray-800">Horários de Produção</div>
                    <div className="text-xs text-gray-600 font-medium mt-0.5">Distribuição por hora</div>
                  </div>
                  <div className="h-[280px] px-3 py-3 relative">
                    {resumoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                      </div>
                    )}
                    
                    {resumoError && (
                      <button 
                        onClick={() => setResumoRetryCount(prev => prev + 1)}
                        className="absolute top-2 right-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md flex items-center z-20"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Recarregar
                      </button>
                    )}
                    
                    <BarChartWidget chartType="horarios" config={{ filters: filtros }} />
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Botão para abrir/fechar drawer (fica colado à esquerda do sideinfo) */}
          <button
            className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-l px-1.5 py-2 shadow hover:bg-gray-50"
            onClick={() => setChartsOpen(s => !s)}
            title={chartsOpen ? 'Ocultar gráficos' : 'Mostrar gráficos'}
            style={{ zIndex: 7 }}
          >
            {chartsOpen ? '▶' : '◀'}
          </button>

          {/* Conteúdo do sideinfo (em cima do drawer) */}
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 gap-2" style={{ zIndex: 15 }}>
            <div className="w-83 h-28 max-h-28 rounded-lg flex flex-col justify-center p-2 shadow-md/16">
              <p className="text-center text-lg font-bold">Total:  {""}
                {(resumo && typeof resumo.totalPesos === "number"
                  ? resumo.totalPesos
                  : tableSelection.total 
                ).toLocaleString("pt-BR", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })} kg
              </p>
              <p className="text-center text-sm text-gray-400 font-regular">Batidas:  {""}
                {resumo && typeof resumo.batitdasTotais === "number"
                  ? resumo.batitdasTotais
                  : tableSelection.batidas}
              </p>
            </div>
            <div className="w-83 h-28 max-h-28 rounded-lg flex flex-col justify-center shadow-md/16">
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
                    <p className="text-center font-bold text-lg">
                      {resumo && resumo.periodoFim
                        ? formatShortDate(resumo.periodoFim)
                        :  "--/--/--"}
                    </p>
                    <p className="text-center text-sm text-gray-400 font-regular">
                      {resumo?.lastDayRange?.date && (
                        <div className="text-sm text-gray-400">{resumo.lastDayRange.firstTime || '—'} <Separator orientation="vertical"/> {resumo.lastDayRange.lastTime || '—'}</div>
                      )}
                    </p>
                </div>
              </div>
            </div>
          </div>

          {/* Produtos */}
            <div className="border border-gray-300 rounded flex-grow overflow-auto thin-red-scrollbar w-full">
              {/* Toggle entre Produtos e Fórmulas */}
              <div className="flex gap-2 p-2 border-b sticky top-0 bg-white z-10">
                <button
                  className={`text-xs px-2 py-1 rounded border ${sideListMode === 'produtos' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  onClick={() => setSideListMode('produtos')}
                >
                  Produtos
                </button>
                <button
                  className={`text-xs px-2 py-1 rounded border ${sideListMode === 'formulas' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  onClick={() => setSideListMode('formulas')}
                >
                  Fórmulas
                </button>
              </div>

              {sideListMode === 'produtos' ? (
                <Table className="h-80 w-full table-fixed">
                  <TableHeader>
                    <TableRow className="bg-gray-200 border">
                      <TableHead className="text-center w-1/2 border-r">Produtos</TableHead>
                      <TableHead className="text-center w-1/2">Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayProducts && displayProducts.length > 0 ? (
                      displayProducts.map((produto, idx) => (
                        <TableRow key={idx}
                          onMouseEnter={() => setHighlightProduto(produto.nome)}
                          onMouseLeave={() => setHighlightProduto(null)}
                          className="hover:bg-gray-50 cursor-default"
                        >
                          <TableCell className="py-1 text-right border-r">
                            <div 
                              className="truncate max-w-full" 
                              title={produto.nome} // Tooltip nativo para mostrar o nome completo
                            >
                              {produto.nome}
                            </div>
                          </TableCell>
                          <TableCell className="py-1 text-right">
                            {Number(converterValor(Number(produto.qtd), produto.colKey)).toLocaleString("pt-BR", {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3,
                            })} {(produto.colKey && produtosInfo[produto.colKey]?.unidade) || "kg"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-gray-500 py-4">Nenhum produto selecionado</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <Table className="h-100 w-full table-fixed">
                  <TableHeader>
                    <TableRow className="bg-gray-200 border">
                      <TableHead className="text-center w-1/2 border-r">Fórmulas</TableHead>
                      <TableHead className="text-center w-1/2">Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(resumo && resumo.formulasUtilizadas && Object.keys(resumo.formulasUtilizadas).length > 0
                      ? Object.entries(resumo.formulasUtilizadas).map(([nome, data]: any) => ({ nome, valor: Number(data?.somatoriaTotal ?? data?.quantidade ?? 0) }))
                      : (tableSelection.formulas || []).map((f) => ({ nome: f.nome, valor: Number(f.somatoriaTotal ?? f.quantidade ?? 0) }))
                    ).map((f, idx) => (
                      <TableRow key={idx}
                        onMouseEnter={() => setHighlightFormula(f.nome)}
                        onMouseLeave={() => setHighlightFormula(null)}
                        className="hover:bg-gray-50 cursor-default"
                      >
                        <TableCell className="py-1 text-right border-r">
                          <div className="truncate max-w-full" title={f.nome}>
                            {f.nome}
                          </div>
                        </TableCell>
                        <TableCell className="py-1 text-right">{f.valor.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg</TableCell>
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}