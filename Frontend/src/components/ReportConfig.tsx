import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { X, Plus, Image as ImageIcon, BarChart3, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export interface ReportChart {
  id: string;
  type: 'pie' | 'bar' | 'line' | 'area';
  period: string; // 'hoje'|'ontem'|'semana'|'mes'|'custom'
  startDate?: string;
  endDate?: string;
  title: string;
  enabled: boolean;
}

export interface ReportConfig {
  includeGraphics: boolean;
  includeLogo: boolean;
  logoFile: File | null;
  logoUrl: string;
  primaryColor?: string;
  description: string;
  title: string;
  showProductInfo: boolean;
  showProductionTotal: boolean;
  charts: ReportChart[];
}

interface ReportConfigProps {
  config: ReportConfig;
  onConfigChange: (config: ReportConfig) => void;
  availablePeriods: string[];
}

const CHART_TYPES = [
  { value: 'pie', label: 'Gráfico de Pizza', icon: '🥧' },
  { value: 'bar', label: 'Gráfico de Barras', icon: '📊' },
  { value: 'line', label: 'Gráfico de Linha', icon: '📈' },
  { value: 'area', label: 'Gráfico de Área', icon: '📊' },
];

export default function ReportConfigPanel({ config, onConfigChange, availablePeriods }: ReportConfigProps) {
  const [dragActive, setDragActive] = useState(false);

  const updateConfig = useCallback((updates: Partial<ReportConfig>) => {
    onConfigChange({ ...config, ...updates });
  }, [config, onConfigChange]);

  const handleLogoUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    updateConfig({ logoFile: file, logoUrl: url, includeLogo: true });
  }, [updateConfig]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) handleLogoUpload(imageFile);
  }, [handleLogoUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoUpload(file);
  }, [handleLogoUpload]);

  const addChart = useCallback(() => {
    const newChart: ReportChart = {
      id: Date.now().toString(),
      type: 'pie',
      period: availablePeriods[0] || 'hoje',
      title: `Gráfico ${config.charts.length + 1}`,
      enabled: true,
    };
    updateConfig({ charts: [...config.charts, newChart] });
  }, [config.charts, updateConfig, availablePeriods]);

  const removeChart = useCallback((chartId: string) => {
    updateConfig({ charts: config.charts.filter(c => c.id !== chartId) });
  }, [config.charts, updateConfig]);

  const updateChart = useCallback((chartId: string, updates: Partial<ReportChart>) => {
    updateConfig({ charts: config.charts.map(c => c.id === chartId ? { ...c, ...updates } : c) });
  }, [config.charts, updateConfig]);

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Configuração do Relatório
          </CardTitle>
          <CardDescription>Configure os elementos que aparecerão no seu relatório PDF</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Informações Básicas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Relatório</Label>
            <Input id="title" value={config.title} onChange={(e) => updateConfig({ title: e.target.value })} placeholder="Relatório de Produção" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={config.description} onChange={(e) => updateConfig({ description: e.target.value })} placeholder="Adicione uma descrição para o relatório..." className="min-h-[80px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Logo da Empresa</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="include-logo" checked={config.includeLogo} onCheckedChange={(checked) => updateConfig({ includeLogo: checked })} />
            <Label htmlFor="include-logo">Incluir logo no relatório</Label>
          </div>

          {config.includeLogo && (
            <div className="space-y-4">
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`} onDragOver={(e)=>{e.preventDefault();setDragActive(true);}} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}>
                {config.logoUrl ? (
                  <div className="space-y-4">
                    <img src={config.logoUrl} alt="Logo preview" className="max-w-32 max-h-32 mx-auto object-contain border rounded" />
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" size="sm" onClick={() => updateConfig({ logoFile: null, logoUrl: '', includeLogo: false })}><Trash2 className="h-4 w-4 mr-1"/>Remover Logo</Button>
                      <Button variant="default" size="sm" onClick={async ()=>{
                        try{
                          const ColorThiefModule = await import('colorthief');
                          const ColorThief = (ColorThiefModule as any).default || (ColorThiefModule as any);
                          const imgEl = document.createElement('img');
                          imgEl.crossOrigin = 'anonymous';
                          imgEl.src = config.logoUrl;
                          imgEl.onload = () => {
                            try{
                              const ct = new ColorThief();
                              const rgb = ct.getColor(imgEl) as [number,number,number];
                              const hex = `#${rgb.map(v=>v.toString(16).padStart(2,'0')).join('')}`;
                              updateConfig({ primaryColor: hex });
                            }catch(e){console.error('Erro ao extrair cor', e)}
                          };
                          imgEl.onerror = (e:any) => console.error('Erro ao carregar imagem para extrair cor', e);
                        }catch(err){console.error('Falha ao carregar ColorThief:', err)}
                      }}><ImageIcon className="h-4 w-4 mr-1"/>Detectar Cor</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Arraste uma imagem aqui ou clique para selecionar</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" id="logo-upload" />
                    <Button variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>Selecionar Arquivo</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Elementos do Relatório</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="show-product-info" checked={config.showProductInfo} onCheckedChange={(checked) => updateConfig({ showProductInfo: checked })} />
            <Label htmlFor="show-product-info">Incluir informações dos produtos</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="show-production-total" checked={config.showProductionTotal} onCheckedChange={(checked) => updateConfig({ showProductionTotal: checked })} />
            <Label htmlFor="show-production-total">Incluir total de produção</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="include-graphics" checked={config.includeGraphics} onCheckedChange={(checked) => updateConfig({ includeGraphics: checked })} />
            <Label htmlFor="include-graphics">Incluir gráficos</Label>
          </div>
        </CardContent>
      </Card>

      {config.includeGraphics && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Gráficos</CardTitle>
              <Button onClick={addChart} size="sm"><Plus className="h-4 w-4 mr-1"/>Adicionar Gráfico</Button>
            </div>
            <CardDescription>Selecione os gráficos e períodos que deseja incluir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.charts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Nenhum gráfico configurado. Clique em "Adicionar Gráfico" para começar.</p>
            ) : (
              config.charts.map((chart, index) => (
                <div key={chart.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Gráfico {index + 1}</Badge>
                      <Switch checked={chart.enabled} onCheckedChange={(enabled) => updateChart(chart.id, { enabled })} />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeChart(chart.id)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4"/></Button>
                  </div>

                  {chart.enabled && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Tipo de Gráfico</Label>
                          <Select value={chart.type} onValueChange={(type: any) => updateChart(chart.id, { type })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{CHART_TYPES.map((type) => (<SelectItem key={type.value} value={type.value}>{type.icon} {type.label}</SelectItem>))}</SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Período</Label>
                          <Select value={chart.period} onValueChange={(period) => updateChart(chart.id, { period })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {availablePeriods.map((period) => (<SelectItem key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</SelectItem>))}
                              <SelectItem key="custom" value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {chart.period === 'custom' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Data Início</Label>
                            <Input type="date" value={chart.startDate || ''} onChange={(e) => updateChart(chart.id, { startDate: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Data Fim</Label>
                            <Input type="date" value={chart.endDate || ''} onChange={(e) => updateChart(chart.id, { endDate: e.target.value })} />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Título do Gráfico</Label>
                        <Input value={chart.title} onChange={(e) => updateChart(chart.id, { title: e.target.value })} placeholder="Título do gráfico" />
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}