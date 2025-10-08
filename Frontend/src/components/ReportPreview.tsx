import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { FileText, BarChart3, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import type { ReportConfig } from './ReportConfig';

interface ReportPreviewProps {
  config: ReportConfig;
  sampleData?: any;
  produtosInfo?: Record<string, { nome?: string; unidade?: string; total?: number }>;
  totalProduction?: number;
}

import { DASHBOARD_COLORS as COLORS } from "../lib/colors";

// Dados de exemplo para demonstração
const sampleChartData = [
  { name: 'Produto A', value: 400, unit: 'kg' },
  { name: 'Produto B', value: 300, unit: 'kg' },
  { name: 'Produto C', value: 300, unit: 'kg' },
  { name: 'Produto D', value: 200, unit: 'kg' },
];

const sampleProductsInfo = {
  'col6': { nome: 'Produto A', unidade: 'kg', total: 400 },
  'col7': { nome: 'Produto B', unidade: 'kg', total: 300 },
  'col8': { nome: 'Produto C', unidade: 'kg', total: 300 },
  'col9': { nome: 'Produto D', unidade: 'kg', total: 200 },
};

function renderChart(chart: any, data: any[]) {
  const commonProps = {
    data,
    width: 280,
    height: 200,
  };

  switch (chart.type) {
    case 'pie':
      return (
        <PieChart {...commonProps}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
            label={(entry) => `${entry.name}: ${entry.value}${entry.unit}`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      );
    case 'bar':
      return (
        <ResponsiveContainer {...commonProps}>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="value" fill={COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer {...commonProps}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'area':
      return (
        <ResponsiveContainer {...commonProps}>
          <AreaChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Area type="monotone" dataKey="value" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
}

export default function ReportPreview({ 
  config, 
  sampleData, 
  produtosInfo = sampleProductsInfo, 
  totalProduction = 1200 
}: ReportPreviewProps) {
  const chartData = sampleData || sampleChartData;
  const primary = config.primaryColor || '#ef4444';

  return (
    <div className="h-full flex flex-col"> 

      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6 bg-white min-h-full" style={{ fontFamily: 'Arial, sans-serif' }}>
              
              {/* Header com Logo */}
              <div className="flex items-start gap-4 pb-4" style={{ borderBottom: '2px solid #e5e7eb' }}>
                {config.includeLogo && config.logoUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={config.logoUrl}
                      alt="Logo da empresa"
                      className="w-30 h-30 object-contain border rounded"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-1" style={{ color: primary }}>
                    {config.title || 'Relatório de Produção'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Gerado em {new Date().toLocaleDateString('pt-BR')}
                  </p>
                  {config.description && (
                    <p className="text-sm text-gray-700 mt-2">
                      {config.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Informações dos Produtos */}
              {config.showProductInfo && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" style={{ color: primary }} />
                    <h2 className="text-lg font-bold" style={{ color: primary }}>Informações dos Produtos</h2>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(produtosInfo).map(([key, info]) => (
                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <span className="font-medium text-gray-800">
                            {info.nome || `Produto ${key}`}
                          </span>
                          <Badge variant="secondary">
                            {info.total?.toLocaleString('pt-BR')} {info.unidade || 'kg'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Total de Produção */}
              {config.showProductionTotal && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" style={{ color: primary }} />
                    <h2 className="text-lg font-bold" style={{ color: primary }}>Total de Produção</h2>
                  </div>
                  <div className="rounded-lg p-4" style={{ backgroundColor: '#fff1f2', borderLeft: `4px solid ${primary}` }}>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-800">
                        Produção Total do Período:
                      </span>
                      <span className="text-2xl font-bold" style={{ color: primary }}>
                        {totalProduction.toLocaleString('pt-BR')} kg
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Gráficos */}
              {config.includeGraphics && config.charts.some(c => c.enabled) && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" style={{ color: primary }} />
                    <h2 className="text-lg font-bold" style={{ color: primary }}>Gráficos de Período</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {config.charts.filter(c => c.enabled).map((chart) => (
                      <div key={chart.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-md font-semibold text-gray-800">
                            {chart.title}
                          </h3>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              {chart.period.charAt(0).toUpperCase() + chart.period.slice(1)}
                            </Badge>
                            <Badge variant="secondary">
                              {chart.type === 'pie' ? 'Pizza' : 
                               chart.type === 'bar' ? 'Barras' :
                               chart.type === 'line' ? 'Linha' : 'Área'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <div className="border rounded bg-white p-4">
                            {renderChart(chart, chartData)}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 text-center mt-2">
                          Dados do período: {chart.period}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensagem se nenhum conteúdo estiver selecionado */}
              {!config.showProductInfo && !config.showProductionTotal && (!config.includeGraphics || config.charts.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure os elementos na lateral esquerda para ver o preview do relatório</p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Relatório gerado automaticamente pelo sistema de produção</p>
                <p>© {new Date().getFullYear()} - Todos os direitos reservados</p>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}