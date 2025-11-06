import { useState } from "react";
import { FileDown, FileSpreadsheet, MessageSquare, BarChart3, X, Plus, Settings } from "lucide-react";
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
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format as formatDate } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Comment {
  id: string;
  texto: string;
  data: string;
}

export interface PdfCustomization {
  fontSize: 'small' | 'medium' | 'large';
  sortOrder: 'alphabetic' | 'silo' | 'most-used';
}

interface AmendoimExportDropdownProps {
  onExcelExport: (filters: {
    tipo?: string;
    dataInicio?: string;
    dataFim?: string;
    codigoProduto?: string;
    nomeProduto?: string;
    codigoCaixa?: string;
  }) => void;
  pdfDocument?: React.ReactElement;
  showComments?: boolean;
  showCharts?: boolean;
  onToggleComments?: () => void;
  onToggleCharts?: () => void;
  comments?: Comment[];
  onAddComment?: (comment: string) => void;
  onRemoveComment?: (id: string) => void;
  pdfCustomization?: PdfCustomization;
  onPdfCustomizationChange?: (customization: PdfCustomization) => void;
}

export function AmendoimExportDropdown({
  onExcelExport,
  pdfDocument,
  showComments = false,
  showCharts = false,
  onToggleComments,
  onToggleCharts,
  comments = [],
  onAddComment,
  onRemoveComment,
  pdfCustomization = { fontSize: 'medium', sortOrder: 'alphabetic' },
  onPdfCustomizationChange,
}: AmendoimExportDropdownProps) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [pdfSettingsOpen, setPdfSettingsOpen] = useState(false);
  
  // Filtros Excel
  const [tipo, setTipo] = useState("todos");
  const [codigoProduto, setCodigoProduto] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  const [codigoCaixa, setCodigoCaixa] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState(""); 
  const [excelDateRange, setExcelDateRange] = useState<DateRange | undefined>(undefined);
  const [excelPopoverOpen, setExcelPopoverOpen] = useState(false);

  // Comentários no modal PDF
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showCommentsSection, setShowCommentsSection] = useState(true);
  
  // Customização PDF (local state)
  const [localFontSize, setLocalFontSize] = useState(pdfCustomization.fontSize);
  const [localSortOrder, setLocalSortOrder] = useState(pdfCustomization.sortOrder);

  const handlePdfClick = () => {
    setPdfModalOpen(true);
  };

  const handleExcelClick = () => {
    setExcelModalOpen(true);
  };

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment("");
      setShowCommentEditor(false);
    }
  };

  const handleExcelExport = () => {
    const exportedDataInicio = dataInicio || (excelDateRange?.from ? formatDate(excelDateRange.from, 'yyyy-MM-dd') : undefined);
    const exportedDataFim = dataFim || (excelDateRange?.to ? formatDate(excelDateRange.to, 'yyyy-MM-dd') : undefined);
    onExcelExport({
      tipo: tipo && tipo !== "todos" ? tipo : undefined,
      dataInicio: exportedDataInicio || undefined,
      dataFim: exportedDataFim || undefined,
      codigoProduto: codigoProduto || undefined,
      nomeProduto: nomeProduto || undefined,
      codigoCaixa: codigoCaixa || undefined,
    });
    setExcelModalOpen(false);
    // Limpar filtros
    setTipo("todos");
    setCodigoProduto("");
    setNomeProduto("");
    setCodigoCaixa("");
    setDataInicio("");
    setDataFim("");
    setExcelDateRange(undefined);
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
            <div className="flex items-center justify-between">
              <DialogTitle>Pré-visualização do PDF</DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPdfSettingsOpen(true)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Customizar Relatório
              </Button>
            </div>
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
                  <p>Pré-visualização do PDF será exibida aqui</p>
                  <p className="text-sm mt-2">A pré-visualização será carregada automaticamente com os dados atuais</p>
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
                    if (onToggleComments) onToggleComments();
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
                  <div className="mb-3 border max-w-md rounded-lg p-3 bg-gray-50">
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
                        className="border rounded-lg p-3 bg-white relative group max-w-[400px]"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 break-words whitespace-pre-wrap overflow-hidden">{comment.texto}</p>
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

          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SAIDA">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="codigoProduto">Código do Produto</Label>
              <Input
                id="codigoProduto"
                placeholder="Digite o código do produto"
                value={codigoProduto}
                onChange={(e) => setCodigoProduto(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="nomeProduto">Nome do Produto</Label>
              <Input
                id="nomeProduto"
                placeholder="Digite o nome do produto"
                value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="codigoCaixa">Código da Caixa</Label>
              <Input
                id="codigoCaixa"
                placeholder="Digite o código da caixa"
                value={codigoCaixa}
                onChange={(e) => setCodigoCaixa(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Período</Label>
              <Popover open={excelPopoverOpen} onOpenChange={setExcelPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={"w-full justify-start text-left font-normal " + (!excelDateRange && !dataInicio && !dataFim ? "text-gray-400" : "")}>
                    {excelDateRange?.from ? (
                      excelDateRange.to ? (
                        <>{formatDate(excelDateRange.from, 'dd/MM/yy')} - {formatDate(excelDateRange.to, 'dd/MM/yy')}</>
                      ) : (
                        formatDate(excelDateRange.from, 'dd/MM/yyyy')
                      )
                    ) : (dataInicio || dataFim) ? (
                      <>{dataInicio && (<>{dataInicio}</>)}{dataInicio && dataFim ? (' - ' + dataFim) : ''}</>
                    ) : (
                      <span>Selecione um Período</span>
                    )}
                    <CalendarIcon className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <Calendar
                    mode="range"
                    locale={pt}
                    defaultMonth={excelDateRange?.from}
                    selected={excelDateRange}
                    onSelect={(r) => setExcelDateRange(r)}
                    numberOfMonths={1}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" onClick={() => { setExcelDateRange(undefined); setDataInicio(''); setDataFim(''); }}>Limpar</Button>
                    <Button onClick={() => setExcelPopoverOpen(false)}>Aplicar</Button>
                  </div>
                </PopoverContent>
              </Popover>
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

      {/* Modal de Customização do PDF */}
      <Dialog open={pdfSettingsOpen} onOpenChange={setPdfSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customizar Relatório PDF</DialogTitle>
            <DialogDescription>
              Ajuste as opções de visualização do relatório
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tamanho da Fonte */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tamanho da Fonte</Label>
              <RadioGroup value={localFontSize} onValueChange={(v) => setLocalFontSize(v as 'small' | 'medium' | 'large')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="font-small" />
                  <Label htmlFor="font-small" className="cursor-pointer font-normal">Pequena</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="font-medium" />
                  <Label htmlFor="font-medium" className="cursor-pointer font-normal">Média (Padrão)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="font-large" />
                  <Label htmlFor="font-large" className="cursor-pointer font-normal">Grande</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Ordenação da Tabela */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Ordenar Tabela por</Label>
              <RadioGroup value={localSortOrder} onValueChange={(v) => setLocalSortOrder(v as 'alphabetic' | 'silo' | 'most-used')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alphabetic" id="sort-alpha" />
                  <Label htmlFor="sort-alpha" className="cursor-pointer font-normal">Ordem Alfabética</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="silo" id="sort-silo" />
                  <Label htmlFor="sort-silo" className="cursor-pointer font-normal">Código</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="most-used" id="sort-usage" />
                  <Label htmlFor="sort-usage" className="cursor-pointer font-normal">Mais Usados</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPdfSettingsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (onPdfCustomizationChange) {
                onPdfCustomizationChange({
                  fontSize: localFontSize,
                  sortOrder: localSortOrder,
                });
              }
              setPdfSettingsOpen(false);
            }}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
