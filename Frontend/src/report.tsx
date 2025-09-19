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
import { IS_LOCAL } from "./CFG";
import { Pagination, PaginationContent, PaginationItem } from "./components/ui/pagination";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "./lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MyDocument } from "./Pdf";
import { ScrollArea, ScrollBar } from "./components/ui/scroll-area";
// import { ResumoComponent } from "./components/ResumoComponent";

export default function Report() {
  const [filtros, setFiltros] = useState<Filtros>({
    dataInicio: "",
    dataFim: "",
    nomeFormula: "",
  });

  const [colLabels, setColLabels] = useState<{ [key: string]: string }>({});
  const [view, setView] = useState<'table' | 'product'>('table');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(15);

  // Utiliza o hook para carregar matérias-primas
  const { materias, syncLabelsWithMateriaPrima } = useMateriaPrima();

  // Estado para armazenar o resumo da seleção da tabela
  const [tableSelection, setTableSelection] = useState<{
    total: number;
    batidas: number;
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

  // Carregar labels
  useEffect(() => {
    const loadLabels = async () => {
      try {
        // Primeiro tenta sincronizar com o backend
        const syncedLabels = await syncProductLabels();
        if (syncedLabels && Object.keys(syncedLabels).length > 0) {
          setColLabels(syncedLabels);
          return;
        }

        // Fallback para o método anterior
        // Primeiro, verifica se temos matérias-primas e sincroniza os labels
        if (materias && materias.length > 0) {
          const materiaPrimaLabels = syncLabelsWithMateriaPrima();
          if (materiaPrimaLabels && Object.keys(materiaPrimaLabels).length > 0) {
            setColLabels(materiaPrimaLabels);
            return;
          }
        }

        // Fallback para o método anterior se não tivermos matérias-primas
        // Prioriza localStorage se estiver usando mock
        if (IS_LOCAL) {
          const saved = localStorage.getItem("colLabels");
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed && Object.keys(parsed).length > 0) {
                setColLabels(parsed);
                return;
              }
            } catch (e) {
              console.error("Erro ao parsear colLabels do localStorage:", e);
            }
          }
        }

        const labelsArray: ColLabel[] = await fetchLabels();
        if (labelsArray && labelsArray.length > 0) {
          const labelsObj: { [key: string]: string } = {};
          labelsArray.forEach(l => labelsObj[l.col_key] = l.col_name);
          setColLabels(labelsObj);

          if (IS_LOCAL) localStorage.setItem("colLabels", JSON.stringify(labelsObj));
        }
      } catch (err) {
        console.error("Erro ao buscar labels:", err);
      }
    };

    loadLabels();
  }, [materias]); // Remova syncLabelsWithMateriaPrima da dependência

  // Listener para eventos de seleção da tabela
  useEffect(() => {
    const handleTableSelection = (e: CustomEvent) => {
      const selectedCells = e.detail || [];
      if (!selectedCells.length) {
        return; // Nenhuma célula selecionada
      }

      // Extrair informações relevantes das células selecionadas
      const rows = new Set<number>();
      const produtos: Record<string, number> = {};
  let totalProdutos = 0;
  let horaInicial = '23:59';
  let horaFinal = '00:00';

      // Primeiro passo: identificar todos os dados selecionados
      selectedCells.forEach((cell: any) => {
        if (!cell || !cell.row) return;

        // Rastrear índices de linha
        rows.add(cell.rowIdx);

        // Se for coluna de produto, somar os valores para o resumo
        if (cell.colKey?.startsWith('col') && cell.value) {
          const colNum = parseInt(cell.colKey.replace('col', ''), 10);
          if (!isNaN(colNum)) {
            // Determinar o nome do produto (usar rótulo se disponível ou colKey)
            const prodName = colLabels[cell.colKey] || `Produto ${colNum - 5}`;
            const value = parseFloat(cell.value) || 0;

            if (value > 0) {
              // Acumular por produto
              produtos[prodName] = (produtos[prodName] || 0) + value;
              totalProdutos += value;
            }
          }
        }

        // Verificar horário inicial/final se esta célula contiver informação de hora
        if (cell.row.Hora) {
          if (cell.row.Hora < horaInicial) horaInicial = cell.row.Hora;
          if (cell.row.Hora > horaFinal) horaFinal = cell.row.Hora;
        }

        // Verificar área se disponível (atualmente não armazenada)
      });

      // área extraída, pode ser utilizada localmente se necessário

      // Segundo passo: formatar o resumo para exibição
      const produtosFormatados = Object.entries(produtos)
        .map(([nome, qtd]) => ({ nome, qtd }))
        .sort((a, b) => b.qtd - a.qtd); // Ordenar por quantidade (maior para menor)

      setTableSelection({
        total: totalProdutos,
        batidas: rows.size,
        horaInicial: horaInicial !== '23:59' ? horaInicial : '--:--',
        horaFinal: horaFinal !== '00:00' ? horaFinal : '--:--',
        produtos: produtosFormatados
      });
    };

    // Registrar o listener
    window.addEventListener('table-selection', handleTableSelection as EventListener);

    // Limpar na desmontagem
    return () => window.removeEventListener('table-selection', handleTableSelection as EventListener);
  }, [colLabels]);

  // Função para alterar labels - CORRIGIDA
  const handleLabelChange = async (colKey: string, value: string, unidade?: string) => {
    setColLabels(prev => {
      const newLabels = { ...prev, [colKey]: value };
      if (IS_LOCAL) localStorage.setItem("colLabels", JSON.stringify(newLabels));
      return newLabels;
    });

    if (!IS_LOCAL) {
      try {
        await axios.put(`/api/col_labels/${colKey}`, {
          col_name: value,
          unidade: unidade || null
        });
      } catch (error) {
        console.error("Erro ao atualizar label:", error);
      }
    }
  };

  let content;
  // Fetch data here so pagination is controlled from this component
  const { dados, loading, error, total } = useReportData(filtros, page, pageSize);

  if (view === 'table') {
    content = <TableComponent filtros={filtros} colLabels={colLabels} dados={dados} loading={loading} error={error} page={page} pageSize={pageSize} />;
  } else if (view === 'product') {
    content = (
      <Products
        colLabels={colLabels}
        setColLabels={setColLabels}
        onLabelChange={handleLabelChange}
      />
    );
  }

  // compute pages based on total
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10);

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
          <Button>Upload</Button>
        </div>
      </div>
      <div id="tabela+pag+sideInfo " className="flex flex-row gap-2 justify-start w-full">
        <div className="flex-1 flex flex-col gap-3.5 items-start justify-start h-[80vh] w-[68px]">
          <div className="flex w-full h-[100dvh] overflow-hidden shadow-md/16 flex ">
            {content}
          </div>
          <div id="pagination" className="flex flex-row items-center justify-end mt-2">
            <Pagination className="flex flex-row justify-end" >
              <PaginationContent>
                <PaginationItem>
                  <button onClick={() => setPage((s) => Math.max(1, s - 1))} aria-label="Go to previous page" className="p-1" disabled={page === 1}>
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                </PaginationItem>
                {pages.map((p) => {
                  const isActive = p === page;
                  return (
                    <PaginationItem key={p}>
                      <button
                        onClick={() => setPage(p)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(buttonVariants({ variant: 'default' }), isActive ? 'bg-red-600 text-white' : 'bg-grey-400')}
                      >
                        {p}
                      </button>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <button onClick={() => setPage((s) => Math.min(s + 1, totalPages))} aria-label="Go to next page" className="p-1">
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
        <div id="sideinfo" className="h-[74vh] flex flex-col p-2 shadow-md/16 rounded-xs gap-2 flex-shrink-0">
          {/* Componente de Resumo */}

          <div id="quadradoInfo" className="grid grid-cols-2 gap-1 mt-2">
            <div className="w-31 h-20 max-h-20 rounded-lg flex flex-col justify-between p-2 shadow-md/16">
              <p className="text-center font-semibold">Total</p>
              <p className="text-center text-lg font-bold">
                {tableSelection.total.toLocaleString('pt-BR', {
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
              <Button className="w-24 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Imprimir PDF</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
