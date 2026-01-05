import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { FileSpreadsheet, FileText, FileDown, Settings, CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { MessageSquare, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { pt } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { toast } from "../lib/toastWrapper";
// import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { PDFViewer, pdf } from "@react-pdf/renderer";
import { AmendoimPDFDocument } from "./AmendoimPDF";

interface AmendoimExportProps {
  filtros?: {
    dataInicio?: string;
    dataFim?: string;
    codigoProduto?: string;
    nomeProduto?: string;
    tipo?: "entrada" | "saida" | "comparativo";
    codigoCaixa?: string;
  };
  // comentários with optional id (to match report ExportDropdown contract)
  comentarios?: { id?: string; texto: string; data?: string }[];
  // add receives the raw text, remove receives the comment id
  onAddComment?: (texto: string) => void;
  onRemoveComment?: (id: string) => void;
  logoUrl?: string;
  proprietario?: string;
  onPdfModalOpenChange?: (isOpen: boolean) => void;
  pdfFileName?: string;
}

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
}

export function AmendoimExport({ filtros = {}, comentarios = [], onAddComment, onRemoveComment, logoUrl, proprietario, onPdfModalOpenChange, pdfFileName }: AmendoimExportProps) {
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Estados para filtros do Excel - tipo sempre é "todos" (sem seleção)
  const tipo = "todos";
  
  // DateRange para Excel modal
  const [excelDateRange, setExcelDateRange] = useState<DateRange | undefined>(() => {
    if (filtros.dataInicio || filtros.dataFim) {
      return {
        from: filtros.dataInicio ? parse(filtros.dataInicio, "yyyy-MM-dd", new Date()) : undefined,
        to: filtros.dataFim ? parse(filtros.dataFim, "yyyy-MM-dd", new Date()) : undefined,
      };
    }
    return undefined;
  });
  
  const [codigoProduto, setCodigoProduto] = useState(filtros.codigoProduto || "");
  const [nomeProduto, setNomeProduto] = useState(filtros.nomeProduto || "");
  const [codigoCaixa, setCodigoCaixa] = useState(filtros.codigoCaixa || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Estados para PDF
  const [pdfData, setPdfData] = useState<AmendoimRecord[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  // PDF sempre em modo comparativo
  const pdfTipo = "comparativo";
  // Comentários locais (se o pai passar, preferir o prop). Keep a local copy so user can add/delete even if parent handlers aren't provided.
  const [showCommentsSection, setShowCommentsSection] = useState(true);
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<{ id?: string; texto: string; data?: string }[]>(comentarios || []);
  // Opção para separar tabelas de entrada/saída (padrão: true)
  const [tabelasSeparadas, setTabelasSeparadas] = useState(true);
  // PDF customization options
  const [fontSize, setFontSize] = useState<"pequena" | "media" | "grande">("media");
  const [ordenacao, setOrdenacao] = useState<"data" | "produto" | "peso">("data");
  const [agruparPorProduto, setAgruparPorProduto] = useState(false);
  // Modal de configurações
  const [pdfSettingsOpen, setPdfSettingsOpen] = useState(false);
  const [dataRefreshed, setDataRefreshed] = useState(false);

  // Keep localComments in sync if parent prop changes
  useEffect(() => {
    setLocalComments(comentarios || []);
  }, [comentarios]);

  // Keep filter inputs in sync if parent `filtros` prop changes (report applies filters)
  useEffect(() => {
    if (filtros.dataInicio || filtros.dataFim) {
      setExcelDateRange({
        from: filtros.dataInicio ? parse(filtros.dataInicio, "yyyy-MM-dd", new Date()) : undefined,
        to: filtros.dataFim ? parse(filtros.dataFim, "yyyy-MM-dd", new Date()) : undefined,
      });
    } else {
      setExcelDateRange(undefined);
    }
    
    setCodigoProduto(filtros.codigoProduto || "");
    setNomeProduto(filtros.nomeProduto || "");
    setCodigoCaixa(filtros.codigoCaixa || "");
  }, [filtros.tipo, filtros.dataInicio, filtros.dataFim, filtros.codigoProduto, filtros.nomeProduto, filtros.codigoCaixa]);

  const handleExcelExport = async () => {
    try {
      const backendPort = 3000;
      const base = `http://localhost:${backendPort}`;
      const params = new URLSearchParams();

      if (tipo && tipo !== "todos") params.append("tipo", tipo);
      
      // Converter DateRange para formato YYYY-MM-DD para backend
      if (excelDateRange?.from) {
        params.append("dataInicio", format(excelDateRange.from, "yyyy-MM-dd"));
      }
      if (excelDateRange?.to) {
        params.append("dataFim", format(excelDateRange.to, "yyyy-MM-dd"));
      }
      
      if (codigoProduto) params.append("codigoProduto", codigoProduto);
      if (nomeProduto) params.append("nomeProduto", nomeProduto);
      if (codigoCaixa) params.append("codigoCaixa", codigoCaixa);

      const url = `${base}/api/amendoim/exportExcel?${params.toString()}`;
      console.log('[AmendoimExport] 🔍 URL Exportação:', url);
      console.log('[AmendoimExport] 📅 Período:', { dataInicio: excelDateRange?.from, dataFim: excelDateRange?.to });

      toast.loading("Exportando para Excel...");

      const resp = await fetch(url, { method: "GET" });
      
      if (!resp.ok) {
        let txt = "";
        try {
          txt = await resp.text();
        } catch {}
        toast.dismiss();
        toast.error(`Erro ao exportar: ${txt || resp.statusText}`);
        return;
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      
      // Gerar nome do arquivo com datas dos filtros
      let fileName = "relatorio";
      if (excelDateRange?.from) {
        const dataInicio = format(excelDateRange.from, "dd-MM-yyyy");
        fileName += `_${dataInicio}`;
        if (excelDateRange?.to) {
          const dataFim = format(excelDateRange.to, "dd-MM-yyyy");
          fileName += `_${dataFim}`;
        }
      } else {
        fileName += `_${format(new Date(), "dd-MM-yyyy")}`;
      }
      a.download = `${fileName}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      
      toast.dismiss();
      toast.success("Download iniciado");
      setExcelModalOpen(false);
    } catch (err) {
      console.error("Erro exportando Excel", err);
      toast.dismiss();
      toast.error("Erro ao exportar relatório");
    }
  };

  const handleLoadPdfData = async () => {
    try {
      // if (loadingPdf || pdfData.length > 0) return;
      setLoadingPdf(true);
      const backendPort = 3000;
      const base = `http://localhost:${backendPort}`;
      const params = new URLSearchParams();

      // Converter DateRange para formato YYYY-MM-DD para backend
      if (excelDateRange?.from) {
        params.append("dataInicio", format(excelDateRange.from, "yyyy-MM-dd"));
      }
      if (excelDateRange?.to) {
        params.append("dataFim", format(excelDateRange.to, "yyyy-MM-dd"));
      }
      
      // advanced filters: include product/box filters so PDF data matches UI filters
      if (codigoProduto) params.append("codigoProduto", codigoProduto);
      if (nomeProduto) params.append("nomeProduto", nomeProduto);
      if (codigoCaixa) params.append("codigoCaixa", codigoCaixa);
      // Request a large pageSize to fetch all registros for the PDF (avoid pagination mismatch)
      params.append("page", "1");
      params.append("pageSize", "100000");

      // If comparativo, fetch entrada and saida separately and merge
      if (pdfTipo === "comparativo") {
        const paramsEntrada = new URLSearchParams(params.toString());
        paramsEntrada.append("tipo", "entrada");
        const paramsSaida = new URLSearchParams(params.toString());
        paramsSaida.append("tipo", "saida");

        const [respE, respS] = await Promise.all([
          fetch(`${base}/api/amendoim/registros?${paramsEntrada.toString()}`),
          fetch(`${base}/api/amendoim/registros?${paramsSaida.toString()}`),
        ]);

        if (!respE.ok || !respS.ok) {
          throw new Error("Erro ao carregar dados comparativos");
        }

        const [dataE, dataS] = await Promise.all([respE.json(), respS.json()]);
        const rowsE = Array.isArray(dataE.rows ? dataE.rows : dataE.registros ? dataE.registros : dataE) ? (dataE.rows || dataE.registros || dataE) : [];
        const rowsS = Array.isArray(dataS.rows ? dataS.rows : dataS.registros ? dataS.registros : dataS) ? (dataS.rows || dataS.registros || dataS) : [];

        // Ensure tipo field is present so PDF can differentiate
        const taggedE = rowsE.map((r: any) => ({ ...(r as any), tipo: "entrada" }));
        const taggedS = rowsS.map((r: any) => ({ ...(r as any), tipo: "saida" }));

        setPdfData([...taggedE, ...taggedS]);
      } else {
        // append tipo for entrada/saida PDFs (comparativo handled above in if block)
        params.append("tipo", pdfTipo);

        const url = `${base}/api/amendoim/registros?${params.toString()}`;

        const resp = await fetch(url);
        if (!resp.ok) {
          throw new Error("Erro ao carregar dados");
        }

        const data = await resp.json();
        // backend returns { rows, total, page, pageSize }
        const rows = data.rows || data.registros || data;
        if (!Array.isArray(rows)) {
          console.warn("[AmendoimExport] unexpected registros payload", data);
          setPdfData([]);
        } else {
          setPdfData(rows.map((r: any) => ({ ...(r as any) })));
        }
      }
    } catch (err) {
      console.error("Erro carregando dados para PDF", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoadingPdf(false);
      setDataRefreshed(true);
    }
  };
 

  // Prepare comments to pass to PDF: include saved localComments plus the editor's newComment (if any)
  const commentsForPdf = [
    ...localComments.map((c) => ({ texto: c.texto, data: c.data })),
    ...(newComment ? [{ texto: newComment, data: new Date().toLocaleString('pt-BR') }] : []),
  ];

  const handlePdfDownload = async () => {
    try {
      // Recreate the document element to generate a PDF blob
      const doc = (
        <AmendoimPDFDocument
          registros={pdfData}
          filtros={{
            tipo: pdfTipo,
            dataInicio: excelDateRange?.from ? format(excelDateRange.from, "yyyy-MM-dd") : undefined,
            dataFim: excelDateRange?.to ? format(excelDateRange.to, "yyyy-MM-dd") : undefined,
            codigoProduto,
            nomeProduto,
            codigoCaixa,
          }}
          comentarios={commentsForPdf}
          tabelasSeparadas={tabelasSeparadas}
          fontSize={fontSize}
          ordenacao={ordenacao}
          agruparPorProduto={agruparPorProduto}
          logoUrl={logoUrl}
          proprietario={proprietario}
        />
      );
      const instance = pdf(doc);
      const blob = await instance.toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      a.download = `${pdfFileName ?? `relatorio_${today}`}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Erro ao gerar PDF para download (amendoim):', err);
    }
  };

  useEffect(() => {
    if (onPdfModalOpenChange) {
      onPdfModalOpenChange(pdfModalOpen);
    }

    if (pdfModalOpen && !dataRefreshed) {
      void handleLoadPdfData();
    } else if (!pdfModalOpen && dataRefreshed) {
      // Reset refresh state when modal closes so next open triggers fetch
      setDataRefreshed(false);
    }
    // Reload when modal opens (pdfTipo is now constant "comparativo")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfModalOpen, dataRefreshed]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <FileDown className="h-4 w-4" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuItem onClick={() => setPdfModalOpen(true)} className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4" />
            PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExcelModalOpen(true)} className="gap-2 cursor-pointer">
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal Excel */}
      <Dialog open={excelModalOpen} onOpenChange={setExcelModalOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Exportar para Excel</DialogTitle>
            <DialogDescription>
              Configure os filtros para exportar os dados de amendoim
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Tipo sempre é "todos" - não há seletor */}

            <div className="grid gap-2">
              <Label>Período</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-left border border-gray-500 font-normal",
                      !excelDateRange && "text-gray-400"
                    )}
                  >
                    {excelDateRange?.from ? (
                      excelDateRange.to ? (
                        <>
                          {format(excelDateRange.from, "dd/MM/yy")} -{" "}
                          {format(excelDateRange.to, "dd/MM/yy")}
                        </>
                      ) : (
                        format(excelDateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Selecione o período</span>
                    )}
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    autoFocus
                    mode="range"
                    locale={pt}
                    defaultMonth={excelDateRange?.from}
                    selected={excelDateRange}
                    onSelect={setExcelDateRange}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* apenas Tipo e Período visíveis por padrão; mostrar filtros avançados opcionalmente */}
            <div className="mt-2">
              <button
                type="button"
                className="text-sm text-gray-500 underline hover:text-gray-700"
                onClick={() => setShowAdvanced((s) => !s)}
              >
                {showAdvanced ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-3 mt-3">
                <div className="grid gap-2">
                  <Label htmlFor="codigoProduto">Código Produto</Label>
                  <Input
                    id="codigoProduto"
                    type="text"
                    placeholder="Ex: 001"
                    value={codigoProduto}
                    onChange={(e) => setCodigoProduto(e.target.value)}
                    className="border-gray-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nomeProduto">Nome Produto</Label>
                  <Input
                    id="nomeProduto"
                    type="text"
                    placeholder="Ex: Amendoim"
                    value={nomeProduto}
                    onChange={(e) => setNomeProduto(e.target.value)}
                    className="border-gray-500"
                  />
                </div> 
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExcelModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExcelExport} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal PDF */}
      <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogContent className="w-150 max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Exportar para PDF</DialogTitle> 
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPdfSettingsOpen(true)}
                className="gap-2 mr-5"
              >
                <Settings className="h-4 w-4" />
                Customizar Relatório
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto py-4">
            {loadingPdf ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#af1e1e] mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Carregando dados comparativos...</p>
                </div>
              </div>
            ) : pdfData.length > 0 ? (
              <div className="my-4 border rounded-lg overflow-hidden bg-gray-50 min-h-[600px]">
                <PDFViewer width="100%" height="600px" showToolbar={true}>
                  <AmendoimPDFDocument
                    registros={pdfData}
                    filtros={{
                      tipo: pdfTipo,
                      dataInicio: excelDateRange?.from ? format(excelDateRange.from, "yyyy-MM-dd") : undefined,
                      dataFim: excelDateRange?.to ? format(excelDateRange.to, "yyyy-MM-dd") : undefined,
                      codigoProduto,
                      nomeProduto,
                      codigoCaixa,
                    }}
                    comentarios={commentsForPdf}
                    tabelasSeparadas={tabelasSeparadas}
                    fontSize={fontSize}
                    ordenacao={ordenacao}
                    agruparPorProduto={agruparPorProduto}
                    logoUrl={logoUrl}
                    proprietario={proprietario}
                  />
                </PDFViewer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] border border-dashed border-gray-300 rounded">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 mb-2">
                    Nenhum dado carregado
                  </p>
                  <p className="text-xs text-gray-400">
                    Clique em "Carregar Dados" para visualizar o relatório
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Seção de Comentários no Modal */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Comentários do Relatório</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommentsSection(!showCommentsSection)}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  {showCommentsSection ? "Ocultar" : "Mostrar"}
                </Button>
                {showCommentsSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowCommentEditor(!showCommentEditor); setNewComment(""); }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {showCommentEditor ? "Cancelar" : "Adicionar"}
                  </Button>
                )}
              </div>
            </div>

            {showCommentsSection && (
              <>
                {showCommentEditor && (
                  <div className="mb-3 border rounded-lg p-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Digite seu comentário sobre este relatório..."
                      className="w-full resize-none mb-2"
                      rows={3}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setShowCommentEditor(false); setNewComment(""); }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const texto = newComment.trim();
                          if (!texto) return;
                          const c = { id: String(Date.now()), texto, data: new Date().toLocaleString('pt-BR') };
                          setLocalComments((s) => [c, ...s]);
                          if (typeof onAddComment === 'function') onAddComment(texto);
                          setNewComment('');
                          setShowCommentEditor(false);
                        }}
                        disabled={!newComment.trim()}
                      >
                        Adicionar Comentário
                      </Button>
                    </div>
                  </div>
                )}

                {localComments && localComments.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {localComments.map((c) => (
                      <div key={c.id ?? c.texto} className="border rounded-lg p-3 bg-white relative group">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">{c.texto}</p>
                            <p className="text-xs text-gray-400 mt-1">{c.data}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (typeof onRemoveComment === 'function' && c.id) {
                                onRemoveComment(String(c.id));
                              } else {
                                setLocalComments((prev) => prev.filter((x) => x.id !== c.id || x.texto !== c.texto));
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum comentário adicionado</p>
                )}
              </>
            )}
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={handlePdfDownload} className="gap-2">
              <FileDown className="h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações do PDF */}
      <Dialog open={pdfSettingsOpen} onOpenChange={setPdfSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações do Relatório PDF</DialogTitle>
            <DialogDescription>
              Customize a aparência e organização do relatório
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Opção de Tabelas Separadas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estrutura da Tabela</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="tabelasSeparadas"
                  checked={tabelasSeparadas}
                  onChange={() => setTabelasSeparadas((s) => !s)}
                  className="w-4 h-4 text-[#af1e1e] rounded focus:ring-[#af1e1e]"
                />
                <label htmlFor="tabelasSeparadas" className="text-sm text-gray-600 cursor-pointer">
                  Separar tabelas de Entrada e Saída
                </label>
              </div>
            </div>

            {/* Tamanho da Fonte */}
            <div className="space-y-2">
              <Label htmlFor="fontSize-config" className="text-sm font-medium">Tamanho da Fonte</Label>
              <Select value={fontSize} onValueChange={(v) => setFontSize(v as "pequena" | "media" | "grande")}>
                <SelectTrigger id="fontSize-config">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequena">Pequena (10pt)</SelectItem>
                  <SelectItem value="media">Média (12pt)</SelectItem>
                  <SelectItem value="grande">Grande (14pt)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ordenação */}
            <div className="space-y-2">
              <Label htmlFor="ordenacao-config" className="text-sm font-medium">Ordenação dos Registros</Label>
              <Select value={ordenacao} onValueChange={(v) => setOrdenacao(v as "data" | "produto" | "peso")}>
                <SelectTrigger id="ordenacao-config">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data">Por Data (mais recente primeiro)</SelectItem>
                  <SelectItem value="produto">Por Produto (A-Z)</SelectItem>
                  <SelectItem value="peso">Por Peso (maior primeiro)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agrupamento */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Agrupamento</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="agruparPorProduto"
                  checked={agruparPorProduto}
                  onChange={() => setAgruparPorProduto((s) => !s)}
                  className="w-4 h-4 text-[#af1e1e] rounded focus:ring-[#af1e1e]"
                />
                <label htmlFor="agruparPorProduto" className="text-sm text-gray-600 cursor-pointer">
                  Agrupar registros por produto
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPdfSettingsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setPdfSettingsOpen(false)}>
              Aplicar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
