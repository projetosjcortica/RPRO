import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { format as formatDateFn } from 'date-fns';

import { MyDocument } from "./Pdf";
import { usePersistentForm } from './config';

import { pdf } from "@react-pdf/renderer";
import TableComponent from "./TableComponent";
import Products from "./products";
import { getProcessador } from "./Processador";
import { useReportData } from "./hooks/useReportData";
import { cn } from "./lib/utils";
// product labels are persisted server-side now
// import { usePDFRedirect } from "./hooks/usePDFRedirect";

import {
  ChevronsLeft,
  ChevronsRight,
  Play,
  Square,
  Loader2,
  X,
} from "lucide-react";
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
import { ScrollArea, ScrollBar } from "./components/ui/scroll-area";
import { Button, buttonVariants } from "./components/ui/button";
import { Filtros } from "./components/types";
import FiltrosBar from "./components/searchBar";
// import { MyDocument } from "./Pdf";
import { useRuntimeConfig } from "./hooks/useRuntimeConfig";

interface ComentarioRelatorio {
  texto: string;
  data?: string;

}

export default function Report() {
  // const { handleLegacyPDFClick } = usePDFRedirect();
  
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
  const [novoComentario, setNovoComentario] = useState<string>('');
  const [mostrarEditorComentario, setMostrarEditorComentario] = useState<boolean>(false);

  const [tableSelection, setTableSelection] = useState<{
  periodoInicio: string | undefined;
  periodoFim: string | undefined;
  total: number;
  batidas: number;
  horaInicial: string;
  horaFinal: string;
  formulas: { numero: number; nome: string; quantidade: number; porcentagem: number; somatoriaTotal: number }[];
  produtos: { nome: string; qtd: number; colKey?: string; unidade?: string }[];
}>({
  periodoInicio: undefined,
  periodoFim: undefined,
  total: 0,
  batidas: 0,
  horaInicial: "--:--",
  horaFinal: "--:--",
  produtos: [],
  formulas: []
});

  const [resumo, setResumo] = useState<any | null>(null);
  const [resumoReloadFlag, setResumoReloadFlag] = useState(0);
  const runtime = useRuntimeConfig();
  const { dados, loading, error, total, refetch } = useReportData(filtros, page, pageSize);
  const { formData: profileConfigData } = usePersistentForm("profile-config");
  const autoRefreshTimer = useRef<number | null>(null);
  const prevCollectorRunning = useRef<boolean>(false);

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

  // Efeitos para side info
  useEffect(() => {
    
    console.log(sideInfo);
    
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
  // const [sideInfo, setSideInfo] = useState<{ granja: string; proprietario: string }>({ granja: 'Granja', proprietario: 'Proprietario' });
  // Fetch resumo sempre que os filtros mudarem
  useEffect(() => {
    let mounted = true;
    const fetchResumo = async () => {
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
          (filtros && filtros.codigo !== undefined && filtros.codigo !== '') ? filtros.codigo : undefined,
          (filtros && filtros.numero !== undefined && filtros.numero !== '') ? filtros.numero : undefined,
        );
        if (!mounted) return;
        setResumo(result || null);
      } catch (err) {
        console.error("Erro ao buscar resumo:", err);
        if (mounted) setResumo(null);
      }
    };

    fetchResumo();
    return () => { mounted = false; };
  }, [filtros, resumoReloadFlag]);

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
    // console.log("RESUMO BACKEND:", resumo);
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
        periodoInicio: resumo.periodoInicio || "--:--",
        periodoFim: resumo.periodoFim || "--:--",
        horaInicial: resumo.periodoInicio || "--:--",
        horaFinal: resumo.periodoFim || "--:--",
        formulas: formulasFromResumo,
        produtos: Object.entries(resumo.usosPorProduto).map(([key, val]: any) => {
          const produtoId = "col" + (Number(key.split("Produto_")[1]) + 5);
          const nome = produtosInfo[produtoId]?.nome || key;
          return {
            colKey: produtoId,
            nome,
            qtd: Number(val.quantidade) ?? 0,
            unidade: val.unidade || "kg",
          };
        }),
      });
    }
  }, [resumo, produtosInfo]);

  // Funções de comentários
  const adicionarComentario = () => {
    if (!novoComentario.trim()) return;
    
    const comentario: ComentarioRelatorio = {
      texto: novoComentario.trim(),
      data: new Date().toLocaleString('pt-BR'),
    };
    
    setComentarios(prev => [...prev, comentario]);
    setNovoComentario('');
    setMostrarEditorComentario(false);
  };

  const removerComentario = (index: number) => {
    setComentarios(prev => prev.filter((_, i) => i !== index));
  };

  // Funções existentes
  const handleAplicarFiltros = (novosFiltros: Filtros) => {
    setPage(1);
    setFiltros(novosFiltros);
  };

  const formatShortDate = (raw?: string | null) => {
    if (!raw) return "";
    const s = String(raw).trim();
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split('-').map(Number);
        return formatDateFn(new Date(y, m - 1, d), 'dd/MM/yy');
      }
      if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
        const [d, m, y] = s.split('-').map(Number);
        return formatDateFn(new Date(y, m - 1, d), 'dd/MM/yy');
      }
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) return formatDateFn(parsed, 'dd/MM/yy');
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
        const res = await fetch("http://localhost:3000/api/collector/start", { method: "GET" });
        if (!res.ok) throw new Error("Falha ao iniciar o coletor.");
        const payload = await res.json().catch(() => ({}));
        if (payload && payload.started === false) {
          await fetchCollectorStatus();
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
    }
  };

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
    const load = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/materiaprima/labels');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const parsed: Record<string, any> = {};
        Object.entries(data).forEach(([colKey, val]: any) => {
          const medida = typeof val.medida === 'number' ? val.medida : Number(val.medida || 1);
          const numMatch = colKey.match(/^col(\d+)$/);
          const num = numMatch ? Number(numMatch[1]) - 5 : undefined;
          parsed[colKey] = { nome: val.produto || `Produto ${num}`, unidade: medida === 0 ? 'g' : 'kg', num };
        });
        setProdutosInfo(parsed);
      } catch (e) {
        console.warn('Failed to load product labels from backend', e);
      }
    };
    load();
    
    const onProdutosUpdated = () => {
      try {
        const raw = localStorage.getItem('produtosInfo');
        if (raw) {
          try {
            const parsedLocal = JSON.parse(raw);
            const parsedObj: Record<string, any> = {};
            Object.keys(parsedLocal).forEach((colKey) => {
              const val = parsedLocal[colKey];
              parsedObj[colKey] = { nome: val?.nome || `Produto`, unidade: val?.unidade || 'kg' };
            });
            setProdutosInfo(parsedObj);
          } catch (err) {}
        }
        setFiltros((prev) => ({ ...prev }));
        setPage((p) => Math.max(1, p));
      } catch (err) {}
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
    if (unidade === 'g') return valor / 1000;
    return valor;
  };

    const handlePrint = async () => {
    const blob = await pdf(
      <MyDocument
        total={Number(tableSelection.total) || 0}
        batidas={Number(tableSelection.batidas) || 0}
        periodoInicio={tableSelection.horaInicial}
        periodoFim={tableSelection.horaFinal}
        formulas={tableSelection.formulas}
        produtos={tableSelection.produtos} // ← Aqui passam os produtos
        data={new Date().toLocaleDateString("pt-BR")}
        empresa={runtime.get('nomeCliente')}
        comentarios={comentarios}
      />
    ).toBlob();
    
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open("", "_blank"); 
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head><title>Print PDF</title></head>
        <body style="margin:0">
          <iframe src="${blobUrl}" style="width:100%;height:100vh;" frameborder="0"></iframe>
        </body>
      </html>
    `);
    printWindow.document.close();

    const iframe = printWindow.document.querySelector("iframe");
    iframe?.addEventListener("load", () => {
      printWindow.focus();
      printWindow.print(); 
    });
  };

  const displayProducts = useMemo(() => {
    if (resumo && resumo.usosPorProduto && Object.keys(resumo.usosPorProduto).length > 0) {
      let produtoId, label; 
      return Object.entries(resumo.usosPorProduto).map(([key, val]: any) => {
        produtoId = "col" + (Number(key.split("Produto_")[1]) + 5);
        label = produtosInfo[produtoId]?.nome || key;
        return {
          colKey: produtoId,
          nome: label,
          qtd: Number(val.quantidade) || 0,
        };
      });
    }
    return tableSelection.produtos.map((p, idx) => ({
      colKey: `col${idx + 1}`,
      nome: p.nome,
      qtd: p.qtd,
      unidade: "kg",
    }));
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
      <div className="h-[80dvh] flex flex-row justify-between w-full">
        <div className="flex flex-row items-end gap-2">
          <Button onClick={() => setView("table")}>Relatórios</Button>
          <Button onClick={() => setView("product")}>Produtos</Button>
        </div>
        <div className="flex flex-col items-end justify-end gap-2">
          <div className="flex flex-row items-end gap-2">
            <FiltrosBar onAplicarFiltros={handleAplicarFiltros} />
            <Button
              onClick={handleCollectorToggle}
              disabled={collectorLoading}
              className={cn(
                "flex items-center gap-2",
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
                ? "Processando..."
                : collectorRunning
                ? "Parar coleta"
                : "Iniciar coleta"}
            </Button>
          </div>
          {/* <div className="flex flex-col items-end gap-1 text-right">
            {collectorRunning && !collectorLoading && (
              <div className="flex flex-row items-center gap-2 text-xs text-emerald-600">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Atualizando em tempo real</span>
              </div>
            )}
            {collectorError && (
              <span className="text-xs text-red-500 max-w-[240px]">
                {collectorError}
              </span>
            )}
          </div> */}
        </div>
      </div>

      <div className="flex flex-row gap-2 justify-start w-full">
        <div className="flex-1 flex flex-col gap-3.5 items-start justify-start h-[80vh] w-[68px]">
          <div className="flex w-full h-[100dvh] overflow-hidden shadow-md/16 flex">
            {content}
          </div>

          {/* Paginação */}
          <div className="flex flex-row items-center justify-end mt-2">
            <Pagination className="flex flex-row justify-end">
              <PaginationContent>
                <PaginationItem>
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="p-1"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                </PaginationItem>

                {pages.map((p) => {
                  const isActive = p === page;
                  return (
                    <PaginationItem key={p}>
                      <button
                        onClick={() => setPage(p)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          buttonVariants({ variant: "default" }),
                          isActive
                            ? "bg-red-600 text-white"
                            : "bg-gray-300 text-black"
                        )}
                      >
                        {p}
                      </button>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <button
                    onClick={() => setPage(Math.min(page + 1, totalPages))}
                    disabled={page === totalPages}
                    className="p-1"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        {/* Side Info */}
        <div className="h-[74vh] flex flex-col p-2 shadow-md/16 rounded-xs gap-2 flex-shrink-0">
          {/* Informações Gerais */}
          <div className="grid grid-cols-2 gap-1 mt-2">
            <div className="w-fit-content h-22 max-h-22 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Total</p>
              <p className="text-center text-lg font-bold">
                {(resumo && typeof resumo.totalPesos === "number"
                  ? resumo.totalPesos
                  : tableSelection.total
                ).toLocaleString("pt-BR", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })} kg
              </p>
            </div>
            <div className=" h-22 max-h-22 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Batidas</p>
              <p className="text-center text-lg font-bold">
                {resumo && typeof resumo.batitdasTotais === "number"
                  ? resumo.batitdasTotais
                  : tableSelection.batidas}
              </p>
            </div>
            <div className=" h-22 max-h-22 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Periodo inicial</p>
              <p className="text-center text-lg font-bold">
                {resumo && resumo.periodoInicio
                  ? formatShortDate(resumo.periodoInicio)
                  : tableSelection.horaInicial}
              </p>
            </div>
            <div className=" h-22 max-h-22 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Periodo final</p>
              <p className="text-center text-lg font-bold">
                {resumo && resumo.periodoFim
                  ? formatShortDate(resumo.periodoFim)
                  : tableSelection.horaFinal}
              </p>
            </div>
          </div>

          {/* Produtos */}
          <div className="border rounded flex-grow overflow-auto scrollbar-custom">
            <ScrollArea>
              <Table className="h-100">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Produtos</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                                  {displayProducts && displayProducts.length > 0 ? (
                    displayProducts.map((produto, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="py-1 px-2">
                          {produto.nome}
                        </TableCell>
                        <TableCell className="py-1 px-2 text-right">
                          {Number(converterValor(Number(produto.qtd), produto.colKey)).toLocaleString("pt-BR", {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                          })}{" "}
                          {(produto.colKey && produtosInfo[produto.colKey]?.unidade) || "kg"}
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
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>

          {/* Impressão e Comentários */}
          <div className="flex flex-col text-center gap-2 mt-6">
            <p>Importar/Imprimir</p>
            <div className="flex flex-row gap-2 justify-center">
              <Button onClick={handlePrint} className="gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Gerar PDF
              </Button>
            </div>

            {/* Seção de Comentários */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center justify-center">
                <p className="font-medium"></p>
                <Button 
                  onClick={() => setMostrarEditorComentario(!mostrarEditorComentario)}
                  size="sm"
                >
                  {mostrarEditorComentario ? 'Cancelar' : '+ Adicionar Comentário'}
                </Button>
              </div>

              {/* Editor de Comentário */}
              {mostrarEditorComentario && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <textarea
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Digite seu comentário sobre este relatório..."
                    className="w-full p-2 border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button 
                      onClick={() => setMostrarEditorComentario(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={adicionarComentario}
                      disabled={!novoComentario.trim()}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              )}

              {/* Lista de Comentários */}
              {comentarios.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-custom">
                  {comentarios.map((comentario, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-white text-sm relative group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs text-gray-500">
                           {comentario.data}
                        </span>
                        <Button
                          onClick={() => removerComentario(index)}
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-gray-700">{comentario.texto}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}