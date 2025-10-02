import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DonutChartWidget,
  BarChartWidget,
  WeeklyChartWidget,
  TableWidget,
} from "./Widgets";
import SidebarStats from "./SidebarStats";

type Entry = {
  Nome: string;
  values: number[];
  Dia?: string;
  Hora?: string;
  Form1?: number;
  Form2?: number;
};

interface FixedDashboardProps {
  rows: Entry[] | null;
  filters?: any;
}

export default function FixedDashboard({ rows, filters }: FixedDashboardProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Row */}
        <div className="grid grid-cols-1 gap-6">
          {/* Top Left: Donut + Table */}
          <Card className="bg-white shadow-lg border-2 border-gray-300 rounded-lg overflow-hidden h-[500px]">
            <CardHeader className="border-b border-gray-300 pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Análise de Fórmulas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col h-[calc(100%-40px)]">
              <div className="flex-1 min-h-[200px]">
                <DonutChartWidget 
                  chartType="formulas" 
                  config={{ filters }} 
                />
              </div>
              <div className="mt-3 flex-1 min-h-[120px]">
                <TableWidget rows={rows} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Top Right: Donut + Bar + Table */}
          <Card className="bg-white shadow-lg border-2 border-gray-300 rounded-lg overflow-hidden h-[500px]">
            <CardHeader className="border-b border-gray-300 pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Comparativo de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col h-[calc(100%-40px)]">
              <div className="grid grid-cols-2 gap-4 flex-1 min-h-[200px]">
                <div className="h-full">
                  <DonutChartWidget 
                    chartType="produtos" 
                    config={{ filters }} 
                  />
                </div>
                <div className="h-full">
                  <BarChartWidget 
                    chartType="horarios" 
                    config={{ filters }} 
                  />
                </div>
              </div>
              <div className="mt-3 flex-1 min-h-[120px]">
                <TableWidget rows={rows} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-6">
          {/* Bottom Left: Bar + Table */}
          <Card className="bg-white shadow-lg border-2 border-gray-300 rounded-lg overflow-hidden h-[500px]">
            <CardHeader className="border-b border-gray-300 pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Produção Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col h-[calc(100%-40px)]">
              <div className="flex-1 min-h-[200px]">
                <WeeklyChartWidget rows={rows} />
              </div>
              <div className="mt-3 flex-1 min-h-[120px]">
                <TableWidget rows={rows} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Bottom Right: Split Tables */}
          <Card className="bg-white shadow-lg border-2 border-gray-300 rounded-lg overflow-hidden h-[500px]">
            <CardHeader className="border-b border-gray-300 pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Resumo de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col h-[calc(100%-40px)]">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="border-r border-gray-200 pr-4">
                  <TableWidget rows={rows} />
                </div>
                <div className="pl-4">
                  <TableWidget rows={rows} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
