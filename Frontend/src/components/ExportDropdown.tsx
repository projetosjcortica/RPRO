import { useState } from "react";
import { FileDown, FileSpreadsheet, Download, Printer, MessageSquare, BarChart3, X, Plus } from "lucide-react";
import { PDFViewer } from "@react-pdf/renderer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface Comment {
  id: string;
  texto: string;
  data: string;
}

interface ExportDropdownProps {
  onPdfExport: () => void;
  onExcelExport: (filters: { nomeFormula?: string; dataInicio?: string; dataFim?: string }) => void;
  pdfDocument?: React.ReactElement;
  showComments?: boolean;
  showCharts?: boolean;
  onToggleComments?: () => void;
  onToggleCharts?: () => void;
  comments?: Comment[];
  onAddComment?: (comment: string) => void;
  onRemoveComment?: (id: string) => void;
}

export function ExportDropdown({
  onPdfExport,
  onExcelExport,
  pdfDocument,
  showComments = false,
  showCharts = false,
  onToggleComments,
  onToggleCharts,
  comments = [],
  onAddComment,
  onRemoveComment,
}: ExportDropdownProps) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  
  // Filtros Excel
  const [nomeFormula, setNomeFormula] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState(""); 

  // Comentários no modal PDF
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showCommentsSection, setShowCommentsSection] = useState(true);

  const handlePdfClick = () => {
    setPdfModalOpen(true);
  };

  const handleExcelClick = () => {
    setExcelModalOpen(true);
  };

  const handlePdfDownload = () => {
    onPdfExport();
    setPdfModalOpen(false);
  };

  const handlePdfPrint = () => {
    window.print();
  };

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment("");
      setShowCommentEditor(false);
    }
  };

  const handleExcelExport = () => {
    onExcelExport({
      nomeFormula: nomeFormula || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
    });
    setExcelModalOpen(false);
    // Limpar filtros
    setNomeFormula("");
    setDataInicio("");
    setDataFim("");
  };

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
          <DropdownMenuItem onClick={handlePdfClick} className="gap-2 cursor-pointer">
            <FileDown className="h-4 w-4" />
            PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExcelClick} className="gap-2 cursor-pointer">
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal PDF */}
      <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto thin-red-scrollbar">
          <DialogHeader>
            <DialogTitle>Preview do PDF</DialogTitle>
            
          </DialogHeader>

          <div className="my-4 border rounded-lg overflow-hidden bg-gray-50 min-h-[600px] thin-red-scrollbar">
            {pdfDocument ? (
              <PDFViewer width="100%" height="600px" showToolbar={true} >
                {pdfDocument}
              </PDFViewer>
            ) : (
              <div className="flex items-center justify-center h-[600px] text-gray-500">
                <div className="text-center">
                  <FileDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Preview do PDF será exibido aqui</p>
                  <p className="text-sm mt-2">O preview será carregado automaticamente com os dados atuais</p>
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
                  onClick={() => {
                    setShowCommentsSection(!showCommentsSection);
                    onToggleComments();
                  }}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  {showCommentsSection ? "Ocultar" : "Mostrar"}
                </Button>
                {showCommentsSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCommentEditor(!showCommentEditor)}
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
                {/* Editor de novo comentário */}
                {showCommentEditor && (
                  <div className="mb-3 border rounded-lg p-3 bg-gray-50">
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
                        onClick={() => {
                          setShowCommentEditor(false);
                          setNewComment("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        Adicionar Comentário
                      </Button>
                    </div>
                  </div>
                )}

                {/* Lista de comentários */}
                {comments && comments.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border rounded-lg p-3 bg-white relative group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{comment.texto}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {comment.data}
                            </p>
                          </div>
                          {onRemoveComment && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum comentário adicionado
                  </p>
                )}
              </>
            )}
          </div>

          <DialogFooter className="flex flex-wrap gap-2 sm:justify-between mt-4">
            <div className="flex gap-2">
               
              {onToggleCharts && (
                <Button
                  variant="outline"
                  onClick={onToggleCharts}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  {showCharts ? "Ocultar" : "Mostrar"} Gráficos
                </Button>
              )}
            </div>
            {/* 
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePdfPrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button onClick={handlePdfDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Excel */}
      <Dialog open={excelModalOpen} onOpenChange={setExcelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar para Excel</DialogTitle>
            <DialogDescription>
              Configure os filtros para exportação
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nomeFormula">Nome da Fórmula</Label>
              <Input
                id="nomeFormula"
                placeholder="Digite o nome ou código da fórmula"
                value={nomeFormula}
                onChange={(e) => setNomeFormula(e.target.value)}
              />
            </div>
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
    </>
  );
}
