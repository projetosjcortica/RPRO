import { useEffect, useState, useMemo } from "react";
import { format as formatDateFn } from 'date-fns';

import TableComponent from "./TableComponent";
import Products from "./products";
import { getProcessador } from "./Processador";

import { useReportData } from "./hooks/useReportData";

import { cn } from "./lib/utils";
// product labels are persisted server-side now

import {
  ChevronsLeft,
  ChevronsRight,
  Play,
  Square,
  Loader2,
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

import { PDFDownloadLink } from "@react-pdf/renderer";
import { MyDocument } from "./Pdf";

export default function Report() {
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

  // const { materias } = useMateriaPrima();

  const [tableSelection, setTableSelection] = useState<{
  total: number;
  batidas: number;
  horaInicial: string;
  horaFinal: string;
  produtos: { nome: string; qtd: number; colKey?: string; unidade?: string }[];
}>({
  total: 0,
  batidas: 0,
  horaInicial: "--:--",
  horaFinal: "--:--",
  produtos: [],
});

  // Resumo vindo do backend (side info)
  const [resumo, setResumo] = useState<any | null>(null);

  // === FETCH DE DADOS ===
  const handleAplicarFiltros = (novosFiltros: Filtros) => {
    setPage(1); // Reset para primeira página
    setFiltros(novosFiltros);
  };

  const { dados, loading, error, total } = useReportData(
    filtros,
    page,
    pageSize
  );

  // Fetch resumo sempre que os filtros mudarem
  useEffect(() => {
    let mounted = true;
    const fetchResumo = async () => {
      try {
        const processador = getProcessador();
        // Map filtros to resumo params. nomeFormula may be an id or name; backend will coerce to Number if provided.
        const dateStart = filtros.dataInicio || undefined;

        const dateEnd = filtros.dataFim || undefined;
        const formula = filtros.nomeFormula || undefined;
        // areaId is not present in filtros by default, but if exists pass it
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
        // Debug: log applied filters from backend if present
        try {
          console.debug('[resumo] backend result:', result?._appliedFilters, 'matchedRows:', result?._matchedRows);
        } catch (e) {}
        setResumo(result || null);
      } catch (err) {
        console.error("Erro ao buscar resumo:", err);
        if (mounted) setResumo(null);
      } finally {
        // no loading state maintained here
      }
    };

    fetchResumo();
    return () => {
      mounted = false;
    };
  }, [filtros]);

  useEffect(() => {
  if (resumo && resumo.usosPorProduto) {
    setTableSelection({
      total: resumo.totalPesos || 0,
      batidas: resumo.batitdasTotais || 0,
      horaInicial: resumo.horaInicial || "--:--",
      horaFinal: resumo.horaFinal || "--:--",
      produtos: Object.entries(resumo.usosPorProduto).map(([key, val]: any) => {
        const produtoId = "col" + (Number(key.split("Produto_")[1]) + 5);
        const nome = produtosInfo[produtoId]?.nome || key;
        return {
          colKey: produtoId,
          nome,
          qtd: Number(val.quantidade) || 0,
          unidade: val.unidade || "kg",
        };
      }),
    });
  }
}, [resumo, produtosInfo]);

  // Helper to format date strings to dd/MM/yy for user-friendly sideinfo
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


  // === COLLECTOR FUNCTIONS ===
  const handleCollectorToggle = async () => {
    if (collectorLoading) return;

    setCollectorLoading(true);
    try {
      if (collectorRunning) {
        await fetch("/api/collector/stop", { method: "GET" });
        setCollectorRunning(false);
        console.log("Collector parado");
      } else {
        await fetch("/api/collector/start", { method: "GET" });
        setCollectorRunning(true);
        console.log("Collector iniciado");
      }
    } catch (error) {
      console.error("Erro ao controlar collector:", error);
    } finally {
      setCollectorLoading(false);
    }
  };

  // No componente Report, atualize a função onLabelChange:
  const onLabelChange = (colKey: string, newName: string, unidade?: string) => {
    setColLabels((prev) => ({ ...prev, [colKey]: newName }));

    // Update local state immediately
    setProdutosInfo((prev) => ({
      ...prev,
      [colKey]: { ...(prev[colKey] || {}), nome: newName, unidade: unidade || 'kg' },
    }));

    // Also persist change to backend by mapping colKey back to num and sending a save request
    try {
      const match = colKey.match(/^col(\d+)$/);
      if (match) {
        const colIndex = Number(match[1]);
        const num = colIndex - 5; // reverse colOffset used in backend
        if (!Number.isNaN(num) && num > 0) {
          // Send a single-item save to /api/db/setupMateriaPrima with the updated item
          fetch('/api/db/setupMateriaPrima', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ num, produto: newName, medida: unidade === 'g' ? 0 : 1 }] }),
          }).then(async (r) => {
            if (!r.ok) {
              const txt = await r.text();
              console.warn('Failed to persist product label to backend', txt);
            }
          }).catch(e => console.error('Failed to persist label', e));
        }
      }
    } catch (e) {
      console.warn('Could not persist product label change to backend', e);
    }
  };
  
  // Load produtosInfo from localStorage once
  // Load produtosInfo from backend on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/materiaprima/labels');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        // data is mapping colKey -> { produto, medida }
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
    return () => { mounted = false; };
  }, []);

  // Função para converter valores baseado na unidade
  const converterValor = (valor: number, colKey?: string): number => {
    if (typeof valor !== "number") return valor;
    // When backend normalization is applied, values are already in kg for produtos with medida=0 (server divides by 1000)
    // But if we still have local info (e.g., fallback), apply conversion here as safety.
    let unidade = produtosInfo[colKey || '']?.unidade || 'kg';
    if (unidade === 'g') return valor / 1000; // convert grams to kg for internal consistency
    return valor;
  };

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

  // === PAGINAÇÃO ===
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

  // === Chart data calculation ===
  // chartData was previously computed here but is not used in this component.
  // Keep calculations localized where needed (e.g., PDF/Chart components).

  const displayProducts = useMemo(() => {
    if (
      resumo &&
      resumo.usosPorProduto &&
      Object.keys(resumo.usosPorProduto).length > 0
    ) {
      let produtoId, label;
      // console.log("Produtos info:", produtosInfo);

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
    // fallback to tableSelection
    return tableSelection.produtos.map((p, idx) => ({
      colKey: `col${idx + 1}`,
      nome: p.nome,
      qtd: p.qtd,
      unidade: "kg",
    }));
  }, [resumo, tableSelection]);

  const formulaSums = dados.reduce((acc, row) => {
    if (row.Nome) {
      acc[row.Nome] = (acc[row.Nome] || 0) + (row.values?.[0] || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-7 w-full h-full">
      <div className="h-[80dvh] flex flex-row justify-between w-full">
        <div className="flex flex-row items-end gap-2">
          <Button onClick={() => setView("table")}>Relatórios</Button>
          <Button onClick={() => setView("product")}>Produtos</Button>
        </div>
        <div className="flex flex-row items-end justify-end gap-2">
          <FiltrosBar onAplicarFiltros={handleAplicarFiltros} />
          <Button
            onClick={handleCollectorToggle}
            disabled={collectorLoading}
            className={cn(
              "flex items-center gap-2",
              collectorRunning
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-gray-700"
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
              ? "Parar"
              : "Recarregar"}
          </Button>
        </div>
      </div>

      <div
        id="tabela+pag+sideInfo"
        className="flex flex-row gap-2 justify-start w-full"
      >
        <div className="flex-1 flex flex-col gap-3.5 items-start justify-start h-[80vh] w-[68px]">
          <div className="flex w-full h-[100dvh] overflow-hidden shadow-md/16 flex">
            {content}
          </div>

          {/* PAGINAÇÃO */}
          <div
            id="pagination"
            className="flex flex-row items-center justify-end mt-2"
          >
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

        {/* SIDE INFO */}
        <div
          id="sideinfo"
          className="h-[74vh]  flex flex-col p-2 shadow-md/16 rounded-xs gap-2 flex-shrink-0"
        >
          {/* Componente de Resumo */}

          <div id="quadradoInfo" className="grid grid-cols-2 gap-1 mt-2">
            <div
              id="total de produtos"
              className="w-38 h-22 max-h-22 rounded-lg flex flex-col justify-between p-2 shadow-md/16"
            >
              <p className="text-center font-semibold">Total</p>
              <p className="text-center text-lg font-bold">
                {(resumo && typeof resumo.totalPesos === "number"
                  ? resumo.totalPesos
                  : tableSelection.total
                ).toLocaleString("pt-BR", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                kg
              </p>
            </div>
            <div className="w-38 h-22 max-h-22 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Batidas</p>
              <p className="text-center text-lg font-bold">
                {resumo && typeof resumo.batitdasTotais === "number"
                  ? resumo.batitdasTotais
                  : tableSelection.batidas}
              </p>
            </div>
            <div className="w-38 h-22 max-h-22 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Periodo inicial</p>
              <p className="text-center text-lg font-bold">
                {resumo && resumo.periodoInicio
                  ? formatShortDate(resumo.periodoInicio)
                  : tableSelection.horaInicial}
              </p>
            </div>
            <div className="w-38 h-22 max-h-22 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Periodo final</p>
              <p className="text-center text-lg font-bold">
                {resumo && resumo.periodoFim
                  ? formatShortDate(resumo.periodoFim)
                  : tableSelection.horaFinal}
              </p>
            </div>
          </div>
          <div id="retanguloProd" className="border rounded flex-grow overflow-auto scrollbar-custom">
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
          <div id="impressao" className="flex flex-col text-center gap-2 mt-6">
            <p>Importar/Imprimir</p>
            <div id="botões" className="flex flex-row gap-2 justify-center">
              <PDFDownloadLink
                document={
                  <MyDocument
                    total={Number(tableSelection.total) || 0}
                    batidas={Number(tableSelection.batidas) || 0}
                    horaInicio={tableSelection.horaInicial}
                    horaFim={tableSelection.horaFinal}
                    produtos={tableSelection.produtos}
                    data={new Date().toLocaleDateString("pt-BR")}
                    empresa="Empresa ABC"
                    formulaSums={formulaSums}
                  />
                }
                fileName="relatorio.pdf"
              >

                {({ loading }) =>
                  loading ? (
                    <Button className="bg-gray-400 text-white px-4 py-2 rounded">
                      Gerando...
                    </Button>
                  ) : (
                    <Button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                      Baixar PDF
                    </Button>
                  )
                }
              </PDFDownloadLink>
              <Button
                className="w-24 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                onClick={async () => {
                  const { pdf } = await import("@react-pdf/renderer");
                  const { MyDocument } = await import("./Pdf");

                  const blob = await pdf(
                    <MyDocument
                      total={Number(tableSelection.total) || 0}
                      batidas={Number(tableSelection.batidas) || 0}
                      horaInicio={tableSelection.horaInicial}
                      horaFim={tableSelection.horaFinal}
                      produtos={tableSelection.produtos}
                      data={new Date().toLocaleDateString("pt-BR")}
                      empresa="Empresa ABCDE"
                      // chartData={chartData}
                      formulaSums={formulaSums}
                    />
                  ).toBlob();

                  const buffer = await blob.arrayBuffer();
                  const fs = window.require("fs");
                  const path = window.require("path");
                  const os = window.require("os");

                  const filePath = path.join(os.tmpdir(), "relatorio.pdf");
                  fs.writeFileSync(filePath, Buffer.from(buffer));

                  (window as any).electronAPI?.printPDF("/");
                }}
              >
                Imprimir PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
