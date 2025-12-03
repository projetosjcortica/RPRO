import { useState, useEffect } from "react";
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
import IhmProfilesConfig from "./IhmProfilesConfig";
import { Switch } from "./ui/switch";

interface Comment {
  id: string;
  texto: string;
  data: string;
}

export interface PdfCustomization {
  fontSize: 'small' | 'medium' | 'large';
  sortOrder: 'alphabetic' | 'silo' | 'most-used';
  formulaSortOrder?: 'alphabetic' | 'code' | 'most-used';
  simplifiedLayout?: boolean;
}

interface ExportDropdownProps {
  onExcelExport: (filters: { nomeFormula?: string; dataInicio?: string; dataFim?: string }) => void;
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
  onPdfModalOpenChange?: (open: boolean) => void;
  isLoading?: boolean;
}

export function ExportDropdown({
  onExcelExport,
  pdfDocument,
  // ...existing code...
  // showComments = true,
  showCharts = false,
  onToggleComments,
  onToggleCharts,
  comments = [],
  onAddComment,
  onRemoveComment,
  pdfCustomization = { fontSize: 'medium', sortOrder: 'alphabetic' },
  onPdfCustomizationChange,
  onPdfModalOpenChange,
  isLoading = false,
}: ExportDropdownProps) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [pdfSettingsOpen, setPdfSettingsOpen] = useState(false);
  const [ihmProfilesOpen, setIhmProfilesOpen] = useState(false);

  // Filtros Excel
  const [nomeFormula, setNomeFormula] = useState("");
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
  const [localFormulaSortOrder, setLocalFormulaSortOrder] = useState(pdfCustomization.formulaSortOrder || 'alphabetic');
  const [localSimplifiedLayout, setLocalSimplifiedLayout] = useState<boolean>(pdfCustomization.simplifiedLayout ?? true);

  // Sync local controls when pdfCustomization prop changes
  useEffect(() => {
    setLocalFontSize(pdfCustomization.fontSize);
    setLocalSortOrder(pdfCustomization.sortOrder);
    setLocalFormulaSortOrder(pdfCustomization.formulaSortOrder || 'alphabetic');
    setLocalSimplifiedLayout(pdfCustomization.simplifiedLayout ?? true);
  }, [pdfCustomization.fontSize, pdfCustomization.sortOrder, pdfCustomization.formulaSortOrder, pdfCustomization.simplifiedLayout]);

  const handlePdfClick = () => {
    setPdfModalOpen(true);
    onPdfModalOpenChange?.(true);
  };

  const handleExcelClick = () => {
    setExcelModalOpen(true);
  };

  // ...existing code...

  // ...existing code...

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
      nomeFormula: nomeFormula || undefined,
      dataInicio: exportedDataInicio || undefined,
      dataFim: exportedDataFim || undefined,
    });
    setExcelModalOpen(false);
    // Limpar filtros
    setNomeFormula("");
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

      <IhmProfilesConfig isOpen={ihmProfilesOpen} onClose={() => setIhmProfilesOpen(false)} />

      {/* Modal PDF */}
      <Dialog open={pdfModalOpen} onOpenChange={(open) => {
        setPdfModalOpen(open);
        onPdfModalOpenChange?.(open);
      }}>
        <DialogContent className="w-200 max-h-[90vh] overflow-y-auto thin-red-scrollbar">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Pré-visualização do PDF</DialogTitle>
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

          <div className="my-4 border rounded-lg overflow-hidden bg-gray-50 min-h-[600px] thin-red-scrollbar">
            {isLoading ? (
               <div className="flex items-center justify-center h-[600px]">
                 <div className="text-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#af1e1e] mx-auto mb-4"></div>
                   <p className="text-sm text-gray-600">Gerando PDF...</p>
                 </div>
               </div>
            ) : pdfDocument ? (
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

              {onToggleCharts && !pdfCustomization?.simplifiedLayout && (
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

          <div className="flex flex-row gap-4 py-4">
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
            <div className="flex flex-row gap-2 items-center">
              <Label className="text-sm font-medium">Layout Simplificado</Label>
              <Switch
                checked={localSimplifiedLayout}
                onCheckedChange={(checked) => setLocalSimplifiedLayout(checked)}
              />
            </div>
            
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
                {/* <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="font-large" />
                  <Label htmlFor="font-large" className="cursor-pointer font-normal">Grande</Label>
                </div> */}
              </RadioGroup>
            </div>

            {/* Ordenação da Tabela de Produtos */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Ordenar Tabela de Produtos por</Label>
              <RadioGroup value={localSortOrder} onValueChange={(v) => setLocalSortOrder(v as 'alphabetic' | 'silo' | 'most-used')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alphabetic" id="sort-alpha" />
                  <Label htmlFor="sort-alpha" className="cursor-pointer font-normal">Ordem Alfabética</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="silo" id="sort-silo" />
                  <Label htmlFor="sort-silo" className="cursor-pointer font-normal">Silos (Prod_1...65)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="most-used" id="sort-usage" />
                  <Label htmlFor="sort-usage" className="cursor-pointer font-normal">Mais Usados</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Ordenação da Tabela de Fórmulas - Apenas se não for layout simplificado */}
            {!localSimplifiedLayout && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Ordenar Tabela de Fórmulas por</Label>
                <RadioGroup value={localFormulaSortOrder} onValueChange={(v) => setLocalFormulaSortOrder(v as 'alphabetic' | 'code' | 'most-used')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alphabetic" id="formula-sort-alpha" />
                    <Label htmlFor="formula-sort-alpha" className="cursor-pointer font-normal">Ordem Alfabética</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="code" id="formula-sort-code" />
                    <Label htmlFor="formula-sort-code" className="cursor-pointer font-normal">Código</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="most-used" id="formula-sort-usage" />
                    <Label htmlFor="formula-sort-usage" className="cursor-pointer font-normal">Mais Usadas</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
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
                  formulaSortOrder: localFormulaSortOrder,
                  simplifiedLayout: localSimplifiedLayout,
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
