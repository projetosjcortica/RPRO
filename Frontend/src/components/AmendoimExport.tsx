import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { FileSpreadsheet, FileText, FileDown } from "lucide-react";
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
import { toast } from "react-toastify";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { AmendoimPDFDocument } from "./AmendoimPDF";

interface AmendoimExportProps {
  filtros?: {
    dataInicio?: string;
    dataFim?: string;
    codigoProduto?: string;
    nomeProduto?: string;
    tipo?: "entrada" | "saida";
    codigoCaixa?: string;
  };
  // comentários with optional id (to match report ExportDropdown contract)
  comentarios?: { id?: string; texto: string; data?: string }[];
  // add receives the raw text, remove receives the comment id
  onAddComment?: (texto: string) => void;
  onRemoveComment?: (id: string) => void;
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

export function AmendoimExport({ filtros = {}, comentarios = [], onAddComment, onRemoveComment }: AmendoimExportProps) {
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Estados para filtros do Excel (simplificados: tipo + período)
  const [tipo, setTipo] = useState(filtros.tipo || "todos");
  const [dataInicio, setDataInicio] = useState(filtros.dataInicio || "");
  const [dataFim, setDataFim] = useState(filtros.dataFim || "");
  const [codigoProduto, setCodigoProduto] = useState(filtros.codigoProduto || "");
  const [nomeProduto, setNomeProduto] = useState(filtros.nomeProduto || "");
  const [codigoCaixa, setCodigoCaixa] = useState(filtros.codigoCaixa || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Estados para PDF
  const [pdfData, setPdfData] = useState<AmendoimRecord[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  // PDF tipo: entrada / saida / comparativo
  const [pdfTipo, setPdfTipo] = useState<"entrada" | "saida" | "comparativo">(
    filtros.tipo === "entrada" || filtros.tipo === "saida" ? (filtros.tipo as "entrada" | "saida") : "entrada"
  );
  // Comentários locais (se o pai passar, preferir o prop). Keep a local copy so user can add/delete even if parent handlers aren't provided.
  const [showCommentsSection, setShowCommentsSection] = useState(true);
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<{ id?: string; texto: string; data?: string }[]>(comentarios || []);
  // Show/hide detailed report pages in the PDF
  const [showDetailed, setShowDetailed] = useState(true);

  // Keep localComments in sync if parent prop changes
  useEffect(() => {
    setLocalComments(comentarios || []);
  }, [comentarios]);

  // Keep filter inputs in sync if parent `filtros` prop changes (report applies filters)
  useEffect(() => {
    setTipo(filtros.tipo || "todos");
    setDataInicio(filtros.dataInicio || "");
    setDataFim(filtros.dataFim || "");
    setCodigoProduto(filtros.codigoProduto || "");
    setNomeProduto(filtros.nomeProduto || "");
    setCodigoCaixa(filtros.codigoCaixa || "");
  }, [filtros.tipo, filtros.dataInicio, filtros.dataFim, filtros.codigoProduto, filtros.nomeProduto, filtros.codigoCaixa]);

  const handleExcelExport = async () => {
    try {
      const backendPort = 3000;
      const base = `http://localhost:${backendPort}`;
      const params = new URLSearchParams();

      // backend export expects dates in DD-MM-YY (DB format). Convert from YYYY-MM-DD if needed.
      const convertToDB = (d?: string) => {
        if (!d) return undefined;
        // if already in DD-MM-YY, keep
        if (/^\d{2}-\d{2}-\d{2}$/.test(d)) return d;
        // YYYY-MM-DD -> DD-MM-YY
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
          const [y, m, day] = d.split("-");
          return `${day}-${m}-${y.slice(-2)}`;
        }
        return d;
      };

      if (tipo && tipo !== "todos") params.append("tipo", tipo);
      const dInicio = convertToDB(dataInicio);
      const dFim = convertToDB(dataFim);
      if (dInicio) params.append("dataInicio", dInicio);
      if (dFim) params.append("dataFim", dFim);
      if (codigoProduto) params.append("codigoProduto", codigoProduto);
      if (nomeProduto) params.append("nomeProduto", nomeProduto);
      if (codigoCaixa) params.append("codigoCaixa", codigoCaixa);

      const url = `${base}/api/amendoim/exportExcel?${params.toString()}`;

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
      a.download = `amendoim_${Date.now()}.xlsx`;
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
      setLoadingPdf(true);
      const backendPort = 3000;
      const base = `http://localhost:${backendPort}`;
      const params = new URLSearchParams();

      // Build common params
      // backend expects dates in DD-MM-YY like the Excel export — convert if necessary
      const convertToDB = (d?: string) => {
        if (!d) return undefined;
        if (/^\d{2}-\d{2}-\d{2}$/.test(d)) return d;
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
          const [y, m, day] = d.split("-");
          return `${day}-${m}-${y.slice(-2)}`;
        }
        return d;
      };

      const dInicio = convertToDB(dataInicio);
      const dFim = convertToDB(dataFim);
      if (dInicio) params.append("dataInicio", dInicio);
      if (dFim) params.append("dataFim", dFim);
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
        // append tipo for entrada/saida PDFs (comparativo handled above)
        if (pdfTipo !== "comparativo") params.append("tipo", pdfTipo as string);

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
    }
  };

  // When opening the PDF modal, auto-load data so preview shows immediately
  useEffect(() => {
    if (pdfModalOpen) {
      void handleLoadPdfData();
    }
    // Reload when modal opens or when pdfTipo changes while modal is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfModalOpen, pdfTipo]);

  // Prepare comments to pass to PDF: include saved localComments plus the editor's newComment (if any)
  const commentsForPdf = [
    ...localComments.map((c) => ({ texto: c.texto, data: c.data })),
    ...(newComment ? [{ texto: newComment, data: new Date().toLocaleString('pt-BR') }] : []),
  ];

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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Exportar para Excel</DialogTitle>
            <DialogDescription>
              Configure os filtros para exportar os dados de amendoim
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="codigoCaixa">Código Caixa</Label>
                  <Input
                    id="codigoCaixa"
                    type="text"
                    placeholder="Ex: CX1"
                    value={codigoCaixa}
                    onChange={(e) => setCodigoCaixa(e.target.value)}
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
        <DialogContent className="sm:max-w-[580px] 3xl:h-[900px] h-[750px] overflow-auto thin-red-scrollbar">
          <DialogHeader>
            <DialogTitle>Exportar para PDF</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* PDF mode selector: Entrada / Saída / Comparativo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 items-end">
              <div className="col-span-1">
                <Label htmlFor="pdfTipo" className="p-3">Modo do PDF</Label>
                <Select value={pdfTipo} onValueChange={(v) => setPdfTipo(v as "entrada" | "saida" | "comparativo") }>
                  <SelectTrigger id="pdfTipo">
                    <SelectValue placeholder="Selecione o modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="comparativo">Comparativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loadingPdf ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Carregando dados...</p>
                </div>
              </div>
            ) : pdfData.length > 0 ? (
              <div className="h-[698px] rounded justify-center flex">
                <PDFViewer width="90%" height="100%">
                  <AmendoimPDFDocument
                    registros={pdfData}
                    filtros={{
                      tipo: pdfTipo,
                      dataInicio,
                      dataFim,
                      codigoProduto,
                      nomeProduto,
                      codigoCaixa,
                    }}
                    comentarios={commentsForPdf}
                    showDetailed={showDetailed}
                  />
                </PDFViewer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-sm text-gray-500">
                  Clique em "Carregar Dados" para visualizar o relatório
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex sm:items-center sm:justify-center">
            {/* <Button variant="outline" onClick={() => setPdfModalOpen(false)}>
              Fechar
            </Button> */}
            {pdfData.length === 0 ? (
              <Button onClick={handleLoadPdfData} className="gap-2">
                <FileText className="h-4 w-4" />
                Carregar Dados
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div className="flex-1 items-center justify-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={!showDetailed} onChange={() => setShowDetailed((s) => !s)} />
                        <span className="text-xs text-gray-600">Ocultar relatório detalhado</span>
                      </label>
                      <h3 className="text-sm font-medium">Comentários: </h3>
                    </div>
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
                            <div key={c.id ?? c.texto} className="border rounded-lg p-3 bg-white relative group max-w-[400px]">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-700 break-words whitespace-pre-wrap overflow-hidden">{c.texto}</p>
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
                <PDFDownloadLink
                  document={
                    <AmendoimPDFDocument
                      registros={pdfData}
                      filtros={{ tipo: pdfTipo, dataInicio, dataFim, codigoProduto, nomeProduto, codigoCaixa }}
                        comentarios={commentsForPdf}
                        showDetailed={showDetailed}
                    />
                  }
                  fileName={`amendoim_${Date.now()}.pdf`}
                >
                  {/* {({ loading }) => (
                      <Button className="gap-2" disabled={loading} onClick={() => {
                        const texto = newComment?.trim();
                        if (texto) {
                          const c = { id: String(Date.now()), texto, data: new Date().toLocaleString('pt-BR') };
                          setLocalComments((s) => [c, ...s]);
                          if (typeof onAddComment === 'function') onAddComment(texto);
                          setNewComment('');
                        }
                      }}>
                      <FileText className="h-4 w-4" />
                      {loading ? "Gerando PDF..." : "Baixar PDF"}
                    </Button>
                  )} */}
                </PDFDownloadLink>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
