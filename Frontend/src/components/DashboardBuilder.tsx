import { useState } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { X, Plus, GripVertical, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
// ...existing code...
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// Tipos de widgets disponíveis
export type WidgetType = 
  | "donut-chart" 
  | "bar-chart" 
  | "weekly-chart" 
  | "stats-card" 
  | "line-chart"
  | "table"
  | "metric-card"
  | "custom-analysis";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  chartType?: "formulas" | "produtos" | "horarios" | "diasSemana";
  config?: any;
}

interface DashboardBuilderProps {
  widgets: WidgetConfig[];
  layout: Layout[];
  onLayoutChange: (layout: Layout[]) => void;
  onAddWidget: (widget: WidgetConfig) => void;
  onRemoveWidget: (id: string) => void;
  onUpdateWidget?: (id: string, updates: Partial<WidgetConfig>) => void;
  children: (widget: WidgetConfig) => React.ReactNode;
  editMode: boolean;
  onEditModeChange: (mode: boolean) => void;
}

const widgetTemplates: { type: WidgetType; label: string; icon: string; description: string; defaultSize: { w: number; h: number } }[] = [
  { type: "donut-chart", label: "Gráfico Donut", icon: "🍩", description: "Visualização em pizza com proporções", defaultSize: { w: 4, h: 4 } },
  { type: "bar-chart", label: "Gráfico de Barras", icon: "📊", description: "Comparação visual de valores", defaultSize: { w: 6, h: 4 } },
  { type: "weekly-chart", label: "Gráfico Semanal", icon: "📅", description: "Navegue por semanas específicas", defaultSize: { w: 5, h: 4 } },
  { type: "stats-card", label: "Total Geral", icon: "📈", description: "Soma total e contagem de registros", defaultSize: { w: 3, h: 2 } },
  { type: "metric-card", label: "Fórmulas Únicas", icon: "🎯", description: "Quantidade de fórmulas distintas", defaultSize: { w: 3, h: 2 } },
  { type: "line-chart", label: "Tendência Temporal", icon: "📉", description: "Evolução ao longo de 7, 30 ou 90 dias", defaultSize: { w: 6, h: 4 } },
  { type: "table", label: "Tabela Detalhada", icon: "📋", description: "Lista completa com ordenação", defaultSize: { w: 12, h: 6 } },
  { type: "custom-analysis", label: "Análise Avançada", icon: "🔬", description: "Top 10, comparações e distribuições", defaultSize: { w: 8, h: 5 } },
];

export default function DashboardBuilder({
  widgets,
  layout,
  onLayoutChange,
  onAddWidget,
  onRemoveWidget,
  // onUpdateWidget (optional) removed from destructuring to avoid unused variable
  children,
  editMode,
  onEditModeChange,
}: DashboardBuilderProps) {
  const [addWidgetDialogOpen, setAddWidgetDialogOpen] = useState(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType>("bar-chart");

  const handleAddWidget = () => {
    const template = widgetTemplates.find(t => t.type === selectedWidgetType);
    if (!template) return;

    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type: selectedWidgetType,
      title: template.label,
      chartType: selectedWidgetType.includes("chart") ? "produtos" : undefined,
    };

    // Encontrar posição disponível
    const maxY = layout.length > 0 ? Math.max(...layout.map(l => l.y + l.h)) : 0;
    const newLayout: Layout = {
      i: newWidget.id,
      x: 0,
      y: maxY,
      w: template.defaultSize.w,
      h: template.defaultSize.h,
    };

    onAddWidget(newWidget);
    onLayoutChange([...layout, newLayout]);
    setAddWidgetDialogOpen(false);
  };

  return (
    <div className="relative">
      {/* Barra de Ferramentas */}
      <div className="flex justify-between items-center mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-700">
            {editMode ? "🔧 Modo de Edição" : "👁️ Modo de Visualização"}
          </h2>
          {editMode && (
            <span className="text-xs text-gray-500">
              Arraste os elementos para reorganizar
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          {editMode && (
            <Dialog open={addWidgetDialogOpen} onOpenChange={setAddWidgetDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Widget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Widget</DialogTitle>
                  <DialogDescription>
                    Escolha o tipo de widget que deseja adicionar ao dashboard
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    {widgetTemplates.map((template) => (
                      <button
                        key={template.type}
                        onClick={() => setSelectedWidgetType(template.type)}
                        className={`p-4 border-2 rounded-lg text-left transition-all hover:border-red-500 hover:bg-red-50 ${
                          selectedWidgetType === template.type
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <div className="font-medium text-sm">{template.label}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {template.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {template.defaultSize.w} × {template.defaultSize.h} cols
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button onClick={handleAddWidget} className="w-full">
                    Adicionar Widget
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button
            size="sm"
            variant={editMode ? "destructive" : "outline"}
            onClick={() => onEditModeChange(!editMode)}
            className="gap-2"
          >
            {editMode ? (
              <>
                <Settings className="h-4 w-4" />
                Salvar & Sair
              </>
            ) : (
              <>
                <Settings className="h-4 w-4" />
                Editar Layout
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid Layout */}
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={80}
        width={1760}
        onLayoutChange={onLayoutChange}
        isDraggable={editMode}
        isResizable={editMode}
        compactType="vertical"
        preventCollision={false}
        margin={[12, 12]}
        containerPadding={[0, 0]}
        draggableHandle={editMode ? ".drag-handle" : undefined}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="relative">
            <Card className="h-full bg-white shadow-sm border border-gray-300 flex flex-col overflow-hidden">
              <CardHeader className="border-b border-gray-300 pb-2 pt-3 px-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {editMode && (
                      <div className="drag-handle cursor-move">
                        <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </div>
                    )}
                    <CardTitle className="text-sm font-semibold text-gray-900">
                      {widget.title}
                    </CardTitle>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editMode && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveWidget(widget.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 flex-1 overflow-hidden">
                {children(widget)}
              </CardContent>
            </Card>
            
            {editMode && (
              <div className="absolute inset-0 border-2 border-dashed border-red-500 pointer-events-none rounded-lg" />
            )}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}
