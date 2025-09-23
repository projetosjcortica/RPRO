import { useEffect, useState } from "react";
import axios from "axios";
import TableComponent from "./TableComponent";
import { useReportData } from "./hooks/useReportData";
import Products from "./products";
import FiltrosBar from "./components/searchBar";
import { Button, buttonVariants } from "./components/ui/button";
import { Filtros } from "./components/types";
import { fetchLabels, ColLabel } from "./hooks/useLabelService";
import { useMateriaPrima } from "./hooks/useMateriaPrima";
import { syncProductLabels } from "./utils/productSyncHelper";
import { Pagination, PaginationContent, PaginationItem } from "./components/ui/pagination";
import { ChevronsLeft, ChevronsRight, Play, Square, Loader2 } from "lucide-react";
import { cn } from "./lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MyDocument } from "./Pdf";
import { ScrollArea, ScrollBar } from "./components/ui/scroll-area";
import { getHttpApi } from "./services/httpApi";

export default function Report() {
  const [filtros, setFiltros] = useState<Filtros>({
    dataInicio: "",
    dataFim: "",
    nomeFormula: "",
  });

  const [colLabels, setColLabels] = useState<{ [key: string]: string }>({});
  const [view, setView] = useState<'table' | 'product'>('table');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(100);
  
  // Collector state
  const [collectorRunning, setCollectorRunning] = useState<boolean>(false);
  const [collectorLoading, setCollectorLoading] = useState<boolean>(false);

  const { materias } = useMateriaPrima();

  const [tableSelection, setTableSelection] = useState<{
    total: number;
    batidas: number
    horaInicial: string;
    horaFinal: string;
    produtos: { nome: string; qtd: number }[];
  }>({
    total: 0,
    batidas: 0,
    horaInicial: '--:--',
    horaFinal: '--:--',
    produtos: []
  });

  // === CARREGAR LABELS ===
  useEffect(() => {
    const loadLabels = async () => {
      try {
        const syncedLabels = await syncProductLabels();
        if (syncedLabels && Object.keys(syncedLabels).length > 0) {
          setColLabels(syncedLabels);
          return;
        }

        // If you need to sync labels with materia prima, implement logic here or remove this block.
        // Example: If materias contains label info, you can process it here.
        // Otherwise, just remove this block.

        // Busca labels do backend
        const labelsArray: ColLabel[] = await fetchLabels();
        if (labelsArray && labelsArray.length > 0) {
          const labelsObj: { [key: string]: string } = {};
          labelsArray.forEach(l => labelsObj[l.col_key] = l.col_name);
          setColLabels(labelsObj);
        }
      } catch (err) {
        console.error("Erro ao buscar labels:", err);
      }
    };

    loadLabels();
  }, [materias]);

  // === SELEÇÃO DE TABELA ===
  useEffect(() => {
    const handleTableSelection = (e: CustomEvent) => {
      const selectedCells = e.detail || [];
      if (!selectedCells.length) return;

      const rows = new Set<number>();
      const produtos: Record<string, number> = {};
      let totalProdutos = 0;
      let horaInicial = '23:59';
      let horaFinal = '00:00';

      selectedCells.forEach((cell: any) => {
        if (!cell || !cell.row) return;
        rows.add(cell.rowIdx);

        if (cell.colKey?.startsWith('col') && cell.value) {
          const colNum = parseInt(cell.colKey.replace('col', ''), 10);
          if (!isNaN(colNum)) {
            const prodName = colLabels[cell.colKey] || `Produto ${colNum - 5}`;
            const value = parseFloat(cell.value) || 0;
            if (value > 0) {
              produtos[prodName] = (produtos[prodName] || 0) + value;
              totalProdutos += value;
            }
          }
        }

        if (cell.row.Hora) {
          if (cell.row.Hora < horaInicial) horaInicial = cell.row.Hora;
          if (cell.row.Hora > horaFinal) horaFinal = cell.row.Hora;
        }
      });

      const produtosFormatados = Object.entries(produtos)
        .map(([nome, qtd]) => ({ nome, qtd }))
        .sort((a, b) => b.qtd - a.qtd);

      setTableSelection({
        total: totalProdutos,
        batidas: rows.size,
        horaInicial: horaInicial !== '23:59' ? horaInicial : '--:--',
        horaFinal: horaFinal !== '00:00' ? horaFinal : '--:--',
        produtos: produtosFormatados
      });
    };

    window.addEventListener('table-selection', handleTableSelection as EventListener);
    return () => window.removeEventListener('table-selection', handleTableSelection as EventListener);
  }, [colLabels]);

  // === ALTERAR LABELS ===
  const handleLabelChange = async (colKey: string, value: string, unidade?: string) => {
    setColLabels(prev => {
      const newLabels = { ...prev, [colKey]: value };
      return newLabels;
    });

    try {
      await axios.put(`/api/col_labels/${colKey}`, { col_name: value, unidade: unidade || null });
    } catch (error) {
      console.error("Erro ao atualizar label:", error);
    }
  };

  // === FETCH DE DADOS ===
  const { dados, loading, error, total } = useReportData(filtros, page, pageSize);

  // === COLLECTOR FUNCTIONS ===
  const toggleCollector = async () => {
    try {
      setCollectorLoading(true);
      const api = getHttpApi();
      
      if (collectorRunning) {
        await api.stopCollector();
        setCollectorRunning(false);
      } else {
        await api.startCollector();
        setCollectorRunning(true);
      }
    } catch (error) {
      console.error('Erro ao alternar collector:', error);
    } finally {
      setCollectorLoading(false);
    }
  };

  let content;
  if (view === 'table') {
    content = <TableComponent filtros={filtros} colLabels={colLabels} dados={dados} loading={loading} error={error} page={page} pageSize={pageSize} />;
  } else if (view === 'product') {
    content = <Products colLabels={colLabels} setColLabels={setColLabels} onLabelChange={handleLabelChange} />;
  }

  // === PAGINAÇÃO ===
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const maxVisiblePages = 10;
  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  // === soma de total de produtos ===
const totalProdutosUtilizados = dados.reduce((acc, row) => {
  Object.keys(row).forEach(colKey => {
    const colNum = parseInt(colKey.replace('col', ''), 10);
    if (!isNaN(colNum) && colNum >= 6) {
      const value = parseFloat ((row as any)[colKey]) || 0;
      acc += value;
    }
  }); 
  return acc;
}, 0);

  // === Chart data calculation ===
  const chartData = tableSelection.produtos.map(p => ({
    name: p.nome,
    value: p.qtd
  }));

  const formulaSums = dados.reduce((acc, row) => {
    if (row.Nome) {
      acc[row.Nome] = (acc[row.Nome] || 0) + (row.values?.[0] || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  // === RETORNO JSX ===
  return (
    <div className="flex flex-col gap-7 w-full h-full">
      <div className="h-[80dvh] flex flex-row justify-between w-full">
        <div className="flex flex-row items-end gap-2">
          <Button onClick={() => setView('table')}>Relatórios</Button>
          <Button onClick={() => setView('product')}>Produtos</Button>
        </div>
        <div className="flex flex-row items-end justify-end gap-2">
          <FiltrosBar onAplicarFiltros={setFiltros} />
          <Button>Automático</Button>
          <Button 
            onClick={toggleCollector}
            disabled={collectorLoading}
            className={cn(
              "flex items-center gap-2",
              collectorRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            )}
          >
            {collectorLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : collectorRunning ? (
              <Square className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {collectorLoading ? "Processando..." : collectorRunning ? "Parar" : "Recarregar"}
          </Button>
        </div>
      </div>

      <div id="tabela+pag+sideInfo" className="flex flex-row gap-2 justify-start w-full">
        <div className="flex-1 flex flex-col gap-3.5 items-start justify-start h-[80vh] w-[68px]">
          <div className="flex w-full h-[100dvh] overflow-hidden shadow-md/16 flex">
            {content}
          </div>

          {/* PAGINAÇÃO */}
          <div id="pagination" className="flex flex-row items-center justify-end mt-2">
            <Pagination className="flex flex-row justify-end">
              <PaginationContent>
                <PaginationItem>
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1">
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                </PaginationItem>

                {pages.map(p => {
                  const isActive = p === page;
                  return (
                    <PaginationItem key={p}>
                      <button
                        onClick={() => setPage(p)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(buttonVariants({ variant: 'default' }), isActive ? 'bg-red-600 text-white' : 'bg-gray-300 text-black')}
                      >
                        {p}
                      </button>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <button onClick={() => setPage(Math.min(page + 1, totalPages))} disabled={page === totalPages} className="p-1">
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>

        {/* SIDE INFO */}
        <div id="sideinfo" className="h-[74vh] flex flex-col p-2 shadow-md/16 rounded-xs gap-2 flex-shrink-0">
          {/* Componente de Resumo */}

          <div id="quadradoInfo" className="grid grid-cols-2 gap-1 mt-2">
            <div id="total de produtos" className="w-31 h-20 max-h-20 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Total</p>
              <p className="text-center text-lg font-bold">
                {totalProdutosUtilizados.toLocaleString('pt-BR', {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3
                })} kg
              </p>
            </div>
            <div className="w-31 h-20 max-h-20 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Batidas</p>
              <p className="text-center text-lg font-bold">
                {tableSelection.batidas}
              </p>
            </div>
            <div className="w-31 h-20 max-h-20 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Hora inicial</p>
              <p className="text-center text-lg font-bold">
                {tableSelection.horaInicial}
              </p>
            </div>
            <div className="w-31 h-20 max-h-20 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Hora final</p>
              <p className="text-center text-lg font-bold">
                {tableSelection.horaFinal}
              </p>
            </div>
          </div>
          <div id="retanguloProd" className="border rounded flex-grow overflow-auto">
            <ScrollArea>
              <Table className="h-100">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Produtos</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableSelection.produtos.length > 0 ? (
                    tableSelection.produtos.map((produto, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="py-1 px-2">{produto.nome}</TableCell>
                        <TableCell className="py-1 px-2 text-right">
                          {produto.qtd.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} kg
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-gray-500 py-4">
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
                        data={new Date().toLocaleDateString('pt-BR')}
                        empresa="Empresa ABC"
                        chartData={chartData}
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
                onClick={() => window.print()}
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
