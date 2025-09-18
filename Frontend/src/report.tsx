import { useEffect, useState } from "react";
import axios from "axios";
import TableComponent from "./TableComponent";
import Products from "./products";
import FiltrosBar from "./components/searchBar";
import { Button, buttonVariants } from "./components/ui/button";
import { Filtros } from "./components/types";
import { fetchLabels, ColLabel } from "./hooks/useLabelService";
import { IS_LOCAL } from "./CFG";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "./components/ui/pagination";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "./lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MyDocument } from "./Pdf";
import { getProcessador } from "./Processador";

export default function Report() {
  const [filtros, setFiltros] = useState<Filtros>({
    dataInicio: "",
    dataFim: "",
    nomeFormula: "",
  });

  const [colLabels, setColLabels] = useState<{ [key: string]: string }>({});
  const [view, setView] = useState<'table' | 'product'>('table');

  // Carregar labels
  useEffect(() => {
    const loadLabels = async () => {
      try {
        // Prioriza localStorage se estiver usando mock
        if (IS_LOCAL) { // ← CORREÇÃO AQUI
          const saved = localStorage.getItem("colLabels");
          if (saved) {
            setColLabels(JSON.parse(saved));
            return;
          }
        }

        const labelsArray: ColLabel[] = await fetchLabels();
        const labelsObj: { [key: string]: string } = {};
        labelsArray.forEach(l => labelsObj[l.col_key] = l.col_name);
        setColLabels(labelsObj);

        if (IS_LOCAL) localStorage.setItem("colLabels", JSON.stringify(labelsObj));
      } catch (err) {
        console.error("Erro ao buscar labels:", err);
      }
    };

    loadLabels();
  }, []);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const fileContent = reader.result;
      if (!fileContent) return;

      try {
        const processador = getProcessador(); // Assumes WebSocket is initialized
        // processador.sendConfig({});
        processador.processFileContent(file.name, fileContent as string);
        // processador.send('upload_csv', { filename: file.name, content: fileContent });
        console.log('Arquivo enviado via WebSocket:', file.name);
      } catch (error) {
        console.error('Erro ao enviar arquivo via WebSocket:', error);
      }
    };

    reader.readAsText(file);
  };

  let content;
  if (view === 'table') {
    content = <TableComponent filtros={filtros} colLabels={colLabels} />;
  } else if (view === 'product') {
    content = (
      <Products
        colLabels={colLabels}
        setColLabels={setColLabels}
        onLabelChange={handleLabelChange}
      />
    );
  }
  let pages: number[] = [];

  function generatePages(pagesTotal: number) {
    for (let i = 1; i <= pagesTotal; i++) {
      pages.push(i);
    } 

  }

  generatePages(5);

  return (
    <div className="overflow-hidden flex flex-col gap-7 w-[100vw] h-full">
      <div className="h-[80%] flex flex-row justify-between">
        <div className="flex flex-row items-end gap-2">
          <Button onClick={() => setView('table')}>Relatórios</Button>
          <Button onClick={() => setView('product')}>Produtos</Button>
        </div>
        <div className="flex flex-row items-end justify-end gap-2">
          <FiltrosBar onAplicarFiltros={setFiltros} />
          <Button>Automático</Button>
          <input
            type="file"
            accept=".csv"
            id="file-upload"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <Button onClick={() => document.getElementById('file-upload')?.click()}>
            Upload
          </Button>
        </div>
      </div>
      <div id="tabela+pag+sideInfo "className="flex flex-row gap-2 justify-start">
        <div className="flex flex-col gap-3.5 items-start justify-start h-[80vh]">
          <div className="w-[63dvw] lg:w-[70.5dvw] h-[80vh] overflow-hidden shadow-md/16 flex ">
            {content}
          </div>
          <div id="pagination" className="flex flex-row items-center justify-end mt-2">
            <Pagination className="flex flex-row justify-end" >
              <PaginationContent>
                <PaginationItem>
                <PaginationLink href="#" aria-label="Go to previous page" size="icon">
                <ChevronsLeft className="h-4 w-4" />
              </PaginationLink>
              </PaginationItem>
                {pages.map((page) => {
                  const isActive = page === 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href={`#${page}`}
                        isActive={page === 2}
                        className={cn({
                          [buttonVariants({
                            variant: "default",
                            className:
                              "hover:text-primary-foreground! shadow-none! dark:bg-primary dark:hover:bg-primary/90",
                          })]: isActive,
                          "bg-secondary text-secondary-foreground": !isActive,
                        })}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                <PaginationLink href="#" aria-label="Go to next page" size="icon">
                  <ChevronsRight className="h-4 w-4" />
                </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
        <div id="sideinfo" className=" h-[75.2vh] flex flex-col p-2 shadow-md/16 rounded-xs gap-2 flex-shrink-0">
          <div id="quadradoInfo" className="grid grid-cols-2 gap-1 ">
            <div className="w-31 h-20 max-h-20 border-2 rounded-lg">
              <p className="text-center font-semibold">Total</p>
            </div>
            <div className="w-31 h-20 max-h-20 border-2 rounded-lg">
              <p className="text-center font-semibold">Batidas</p>
            </div>
            <div className="w-31 h-20 max-h-20 border-2 rounded-lg">
              <p className="text-center font-semibold">Hora inicial</p>
            </div>
            <div className="w-31 h-20 max-h-20 border-2 rounded-lg">
              <p className="text-center font-semibold">Hora final</p>
            </div>
          </div>
          <div id="retanguloProd" className="border rounded">
            <Table className="h-100">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Produtos</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
            <div id="impressao" className="flex flex-col text-center gap-2 mt-6">
              <p>Importar/Imprimir</p>
              <div id="botões" className="flex flex-row gap-2 justify-center">
                 <PDFDownloadLink
                  document={
                    <MyDocument
                      total={1200}
                      batidas={45}
                      horaInicio="08:00"
                      horaFim="17:00"
                      produtos={[
                        { nome: "Produto A", qtd: 100 },
                        { nome: "Produto B", qtd: 250 },
                      ]}
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
                      <Button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Baixar PDF
                      </Button>
                    )
                  }
                </PDFDownloadLink>
                <Button className="w-20">Excel</Button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
