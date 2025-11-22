/**
 * Component Showcase - Demonstração Completa da Biblioteca Cortiça UI
 * 
 * Este componente demonstra todos os componentes disponíveis na biblioteca cortiça-lib-ui,
 * incluindo primitivos do shadcn/ui e componentes customizados específicos do Cortez.
 * 
 * @module ComponentShowcase
 * @description Página de demonstração interativa com dados mockados realistas
 * 
 * Categorias de Componentes:
 * - Gráficos: DonutChart, BarChart (com dados de produção realistas)
 * - Tabelas: DataTable (com sorting, resizing)
 * - Formulários: Inputs, Selects, Checkboxes, Radios, Switches, Sliders
 * - Feedback: Alerts, Buttons, Progress, Toasts, Skeletons
 * - Overlays: Dialogs, Popovers, Dropdowns
 * - Navegação: Accordions, Badges, Tabs
 * - Layout: Cards, Separators
 */

import { useState } from 'react';
import { DonutChartWidget, BarChartWidget } from './components/Widgets';
import { DataTable } from './components/cortica-lib-ui/data-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
import { Progress } from './components/ui/progress';
import { Skeleton } from './components/ui/skeleton';
import { Switch } from './components/ui/switch';
import { Slider } from './components/ui/slider';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Checkbox } from './components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Textarea } from './components/ui/textarea';
import { Calendar } from './components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from './components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from './components/ui/pagination';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from './components/ui/sheet';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Info, XCircle, Download, Settings, Trash2, Edit, Eye, MoreVertical, Calendar as CalendarIcon, TrendingUp, Package, Users, Filter, Menu, X, Moon, Sun } from 'lucide-react';
import { ThemeProvider, useTheme } from './components/cortica-lib-ui/theme';
import { DonutChart, BarChart } from './components/cortica-lib-ui/charts';
import { ComponentHelper } from './components/cortica-lib-ui/helpers';

/**
 * Dados mockados de produção - Produtos mais utilizados
 * Baseado em dados reais de uma fábrica de alimentos
 */
const mockChartData = [
    { name: 'Farinha de Trigo Tipo 1', value: 2847.350, count: 156, unit: 'kg' },
    { name: 'Açúcar Refinado', value: 1923.680, count: 98, unit: 'kg' },
    { name: 'Óleo de Soja Refinado', value: 1456.920, count: 87, unit: 'L' },
    { name: 'Leite em Pó Integral', value: 892.450, count: 64, unit: 'kg' },
    { name: 'Ovos Brancos Grandes', value: 743.000, count: 52, unit: 'dz' },
    { name: 'Fermento Biológico Seco', value: 567.230, count: 41, unit: 'kg' },
    { name: 'Chocolate em Pó 50%', value: 445.780, count: 33, unit: 'kg' },
    { name: 'Manteiga sem Sal', value: 389.560, count: 28, unit: 'kg' },
];

/**
 * Dados mockados de fórmulas - Receitas mais produzidas
 */
const mockFormulaData = [
    { name: 'Pão Francês Tradicional', value: 3456.780, count: 234, unit: 'kg' },
    { name: 'Bolo de Chocolate Premium', value: 2134.560, count: 145, unit: 'kg' },
    { name: 'Pão de Forma Integral', value: 1876.340, count: 98, unit: 'kg' },
    { name: 'Biscoito de Polvilho Doce', value: 1234.890, count: 76, unit: 'kg' },
    { name: 'Torta de Frango Especial', value: 987.650, count: 54, unit: 'kg' },
];

/**
 * Dados mockados de produção por horário
 */
const mockHourlyData = [
    { name: '08:00', value: 234.5, count: 12 },
    { name: '09:00', value: 456.8, count: 23 },
    { name: '10:00', value: 567.9, count: 28 },
    { name: '11:00', value: 489.3, count: 24 },
    { name: '12:00', value: 123.4, count: 6 },
    { name: '13:00', value: 345.6, count: 17 },
    { name: '14:00', value: 678.9, count: 34 },
    { name: '15:00', value: 543.2, count: 27 },
    { name: '16:00', value: 432.1, count: 21 },
    { name: '17:00', value: 321.0, count: 16 },
];

/**
 * Dados mockados de tabela - Produção recente
 */
const mockTableData = [
    {
        id: 1,
        name: 'Pão Francês Tradicional',
        quantity: 245.750,
        unit: 'kg',
        status: 'Concluído',
        date: '2025-11-20',
        batch: 'LOTE-20251120-001',
        operator: 'João Silva'
    },
    {
        id: 2,
        name: 'Bolo de Chocolate Premium',
        quantity: 156.300,
        unit: 'kg',
        status: 'Em Produção',
        date: '2025-11-20',
        batch: 'LOTE-20251120-002',
        operator: 'Maria Santos'
    },
    {
        id: 3,
        name: 'Biscoito de Polvilho Doce',
        quantity: 89.450,
        unit: 'kg',
        status: 'Concluído',
        date: '2025-11-19',
        batch: 'LOTE-20251119-015',
        operator: 'Pedro Costa'
    },
    {
        id: 4,
        name: 'Torta de Frango Especial',
        quantity: 123.680,
        unit: 'kg',
        status: 'Concluído',
        date: '2025-11-19',
        batch: 'LOTE-20251119-014',
        operator: 'Ana Oliveira'
    },
    {
        id: 5,
        name: 'Pão de Forma Integral',
        quantity: 198.920,
        unit: 'kg',
        status: 'Pendente',
        date: '2025-11-18',
        batch: 'LOTE-20251118-032',
        operator: 'Carlos Mendes'
    },
    {
        id: 6,
        name: 'Empada de Palmito',
        quantity: 67.340,
        unit: 'kg',
        status: 'Concluído',
        date: '2025-11-18',
        batch: 'LOTE-20251118-031',
        operator: 'Juliana Ferreira'
    },
];

/**
 * Configuração de colunas para a DataTable
 */
const tableColumns = [
    { id: 'name', header: 'Produto/Fórmula', accessorKey: 'name', sortable: true, width: 250 },
    { id: 'quantity', header: 'Quantidade', accessorKey: 'quantity', sortable: true, width: 120 },
    { id: 'unit', header: 'Unidade', accessorKey: 'unit', width: 80 },
    { id: 'status', header: 'Status', accessorKey: 'status', sortable: true, width: 120 },
    { id: 'batch', header: 'Lote', accessorKey: 'batch', width: 180 },
    { id: 'operator', header: 'Operador', accessorKey: 'operator', width: 150 },
    { id: 'date', header: 'Data', accessorKey: 'date', sortable: true, width: 120 },
];

/**
 * Componente principal do Showcase
 */
// Componente de Toggle de Tema
const ThemeToggle = () => {
    const { mode, setMode } = useTheme();

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            className="ml-auto"
        >
            {mode === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
    );
};

export default function ComponentShowcase() {
    return (
        <ThemeProvider defaultMode="light">
            <ComponentShowcaseContent />
        </ThemeProvider>
    );
}

function ComponentShowcaseContent() {
    // ==================
    // STATE MANAGEMENT
    // ==================

    /** Estado para controle de progresso (0-100) */
    const [progress, setProgress] = useState(33);

    /** Estado do switch de ativação */
    const [switchValue, setSwitchValue] = useState(false);

    /** Valor do slider (array para compatibilidade com Slider component) */
    const [sliderValue, setSliderValue] = useState([50]);

    /** Data selecionada no calendário */
    const [selectedDate, setSelectedDate] = useState<Date>();

    /** Produto destacado nos gráficos (para demonstrar interatividade) */
    const [highlightProduct, setHighlightProduct] = useState<string | null>(null);

    /** Tipo de gráfico ativo (produtos ou fórmulas) */
    const [chartType, setChartType] = useState<'produtos' | 'formulas'>('produtos');

    /** Dados de estatísticas calculadas */
    const [stats, setStats] = useState({
        totalProduction: 12847.35,
        activeFormulas: 24,
        totalOperators: 8,
        efficiency: 94.5
    });

    /** Página atual da paginação (para demonstração) */
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;

    // ==================
    // HELPER FUNCTIONS
    // ==================

    /**
     * Simula atualização de estatísticas
     * Em produção, isso viria de uma API
     */
    const refreshStats = () => {
        setStats({
            totalProduction: Math.random() * 15000 + 10000,
            activeFormulas: Math.floor(Math.random() * 10) + 20,
            totalOperators: Math.floor(Math.random() * 5) + 5,
            efficiency: Math.random() * 10 + 90
        });
        toast.success('Estatísticas atualizadas!');
    };

    /**
     * Formata números para exibição (separador de milhares)
     */
    const formatNumber = (num: number, decimals: number = 2): string => {
        return num.toLocaleString('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    /**
     * Retorna a cor do badge baseado no status
     */
    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'Concluído': return 'default';
            case 'Em Produção': return 'secondary';
            case 'Pendente': return 'outline';
            default: return 'destructive';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-gray-900">Cortiça UI Library</h1>
                    <p className="text-lg text-gray-600">Demonstração completa de todos os componentes</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                        <Badge variant="default">46 Componentes Primitivos</Badge>
                        <Badge variant="secondary">31 Componentes Customizados</Badge>
                        <Badge variant="outline">100% TypeScript</Badge>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Produção Total</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.totalProduction, 2)} kg</div>
                            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fórmulas Ativas</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeFormulas}</div>
                            <p className="text-xs text-muted-foreground">Em produção</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Operadores</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalOperators}</div>
                            <p className="text-xs text-muted-foreground">Ativos hoje</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatNumber(stats.efficiency, 1)}%</div>
                            <p className="text-xs text-muted-foreground">
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={refreshStats}>
                                    Atualizar
                                </Button>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                {/* Main Content */}
                <Tabs defaultValue="charts" className="w-full">
                    <TabsList className="grid w-full grid-cols-8">
                        <TabsTrigger value="charts">Gráficos</TabsTrigger>
                        <TabsTrigger value="tables">Tabelas</TabsTrigger>
                        <TabsTrigger value="forms">Formulários</TabsTrigger>
                        <TabsTrigger value="feedback">Feedback</TabsTrigger>
                        <TabsTrigger value="overlays">Overlays</TabsTrigger>
                        <TabsTrigger value="navigation">Navegação</TabsTrigger>
                        <TabsTrigger value="layout">Layout</TabsTrigger>
                        <TabsTrigger value="advanced">Avançado</TabsTrigger>
                        <TabsTrigger value="library">Biblioteca</TabsTrigger>
                    </TabsList>

                    {/* Charts Tab */}
                    <TabsContent value="charts" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Gráficos de Donut</CardTitle>
                                        <CardDescription>Gráficos circulares com dados mockados - componentes do projeto</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={chartType === 'produtos' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                setChartType('produtos');
                                                toast.info('Exibindo dados de Produtos');
                                            }}
                                        >
                                            Produtos
                                        </Button>
                                        <Button
                                            variant={chartType === 'formulas' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                setChartType('formulas');
                                                toast.info('Exibindo dados de Fórmulas');
                                            }}
                                        >
                                            Fórmulas
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Gráfico Principal */}
                                    <div className="h-[300px]">
                                        <DonutChartWidget
                                            chartType={chartType}
                                            config={{
                                                chartData: chartType === 'produtos' ? mockChartData : mockFormulaData,
                                                total: (chartType === 'produtos' ? mockChartData : mockFormulaData).reduce((s, d) => s + d.value, 0),
                                                // Força o componente a usar os dados passados diretamente
                                                skipFetch: true
                                            }}
                                            displayProducts={[]}
                                            tableSelection={null}
                                            highlightName={highlightProduct}
                                            onSliceLeave={() => setHighlightProduct(null)}
                                        />
                                    </div>

                                    {/* Gráfico Compacto */}
                                    <div className="h-[300px]">
                                        <DonutChartWidget
                                            chartType={chartType}
                                            config={{
                                                chartData: chartType === 'produtos' ? mockChartData.slice(0, 5) : mockFormulaData,
                                                total: (chartType === 'produtos' ? mockChartData.slice(0, 5) : mockFormulaData).reduce((s, d) => s + d.value, 0),
                                                skipFetch: true
                                            }}
                                            displayProducts={[]}
                                            tableSelection={null}
                                            compact
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Gráfico de Barras</CardTitle>
                                <CardDescription>Produção por horário - componente do projeto</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <BarChartWidget
                                        chartType="horarios"
                                        config={{
                                            chartData: mockHourlyData,
                                            total: mockHourlyData.reduce((s, d) => s + d.value, 0),
                                            skipFetch: true
                                        }}
                                        displayProducts={[]}
                                        tableSelection={null}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tables Tab */}
                    <TabsContent value="tables" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>DataTable</CardTitle>
                                <CardDescription>Tabela com sorting, resizing e paginação</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={tableColumns}
                                    data={mockTableData}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Forms Tab */}
                    <TabsContent value="forms" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inputs & Selects</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome</Label>
                                        <Input id="name" placeholder="Digite seu nome" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoria</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma categoria" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="panificacao">Panificação</SelectItem>
                                                <SelectItem value="confeitaria">Confeitaria</SelectItem>
                                                <SelectItem value="salgados">Salgados</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descrição</Label>
                                        <Textarea id="description" placeholder="Digite uma descrição" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Switches, Checkboxes & Radios</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="active">Ativo</Label>
                                        <Switch id="active" checked={switchValue} onCheckedChange={setSwitchValue} />
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>Opções</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="option1" />
                                            <label htmlFor="option1" className="text-sm">Opção 1</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="option2" />
                                            <label htmlFor="option2" className="text-sm">Opção 2</label>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>Escolha uma</Label>
                                        <RadioGroup defaultValue="option1">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="option1" id="r1" />
                                                <Label htmlFor="r1">Opção A</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="option2" id="r2" />
                                                <Label htmlFor="r2">Opção B</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>Slider: {sliderValue[0]}%</Label>
                                        <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Feedback Tab */}
                    <TabsContent value="feedback" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alerts</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>Informação</AlertTitle>
                                        <AlertDescription>Esta é uma mensagem informativa.</AlertDescription>
                                    </Alert>
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Erro</AlertTitle>
                                        <AlertDescription>Ocorreu um erro ao processar sua solicitação.</AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Buttons & Loading</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <Button>Default</Button>
                                        <Button variant="secondary">Secondary</Button>
                                        <Button variant="destructive">Destructive</Button>
                                        <Button variant="outline">Outline</Button>
                                        <Button variant="ghost">Ghost</Button>
                                        <Button variant="link">Link</Button>
                                    </div>
                                    <Separator />
                                    <div className="flex gap-2 flex-wrap">
                                        <Button size="sm">Small</Button>
                                        <Button size="default">Default</Button>
                                        <Button size="lg">Large</Button>
                                        <Button size="icon"><Settings className="h-4 w-4" /></Button>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label>Progress: {progress}%</Label>
                                        <Progress value={progress} />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>-10%</Button>
                                            <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>+10%</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Toasts</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button onClick={() => toast.success('Operação realizada com sucesso!')} className="w-full">
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Success Toast
                                    </Button>
                                    <Button onClick={() => toast.error('Erro ao processar operação')} variant="destructive" className="w-full">
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Error Toast
                                    </Button>
                                    <Button onClick={() => toast.info('Informação importante')} variant="secondary" className="w-full">
                                        <Info className="mr-2 h-4 w-4" />
                                        Info Toast
                                    </Button>
                                    <Button onClick={() => toast.loading('Processando...')} variant="outline" className="w-full">
                                        Loading Toast
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Skeletons</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                    <Skeleton className="h-32 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Overlays Tab */}
                    <TabsContent value="overlays" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dialog</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="w-full">Abrir Dialog</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Título do Dialog</DialogTitle>
                                                <DialogDescription>
                                                    Esta é uma descrição do dialog. Você pode adicionar formulários e outros conteúdos aqui.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="dialog-input">Nome</Label>
                                                    <Input id="dialog-input" placeholder="Digite algo" />
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline">Cancelar</Button>
                                                    <Button>Salvar</Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Popover</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Selecione uma data'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Dropdown Menu</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <MoreVertical className="mr-2 h-4 w-4" />
                                                Ações
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Opções</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Visualizar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Deletar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Navigation Tab */}
                    <TabsContent value="navigation" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Accordion</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>Seção 1</AccordionTrigger>
                                        <AccordionContent>
                                            Conteúdo da primeira seção. Aqui você pode adicionar qualquer tipo de conteúdo.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger>Seção 2</AccordionTrigger>
                                        <AccordionContent>
                                            Conteúdo da segunda seção com mais informações.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-3">
                                        <AccordionTrigger>Seção 3</AccordionTrigger>
                                        <AccordionContent>
                                            Conteúdo da terceira seção.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Badges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2 flex-wrap">
                                    <Badge>Default</Badge>
                                    <Badge variant="secondary">Secondary</Badge>
                                    <Badge variant="destructive">Destructive</Badge>
                                    <Badge variant="outline">Outline</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Paginação</CardTitle>
                                <CardDescription>Navegação entre páginas com controles completos</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center text-sm text-muted-foreground">
                                    Página {currentPage} de {totalPages}
                                </div>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (currentPage > 1) {
                                                        setCurrentPage(currentPage - 1);
                                                        toast.info(`Navegou para página ${currentPage - 1}`);
                                                    }
                                                }}
                                            />
                                        </PaginationItem>

                                        {currentPage > 2 && (
                                            <>
                                                <PaginationItem>
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentPage(1);
                                                            toast.info('Navegou para página 1');
                                                        }}
                                                    >
                                                        1
                                                    </PaginationLink>
                                                </PaginationItem>
                                                {currentPage > 3 && (
                                                    <PaginationItem>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                )}
                                            </>
                                        )}

                                        {currentPage > 1 && (
                                            <PaginationItem>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage(currentPage - 1);
                                                        toast.info(`Navegou para página ${currentPage - 1}`);
                                                    }}
                                                >
                                                    {currentPage - 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )}

                                        <PaginationItem>
                                            <PaginationLink href="#" isActive>
                                                {currentPage}
                                            </PaginationLink>
                                        </PaginationItem>

                                        {currentPage < totalPages && (
                                            <PaginationItem>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage(currentPage + 1);
                                                        toast.info(`Navegou para página ${currentPage + 1}`);
                                                    }}
                                                >
                                                    {currentPage + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )}

                                        {currentPage < totalPages - 1 && (
                                            <>
                                                {currentPage < totalPages - 2 && (
                                                    <PaginationItem>
                                                        <PaginationEllipsis />
                                                    </PaginationItem>
                                                )}
                                                <PaginationItem>
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setCurrentPage(totalPages);
                                                            toast.info(`Navegou para página ${totalPages}`);
                                                        }}
                                                    >
                                                        {totalPages}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            </>
                                        )}

                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (currentPage < totalPages) {
                                                        setCurrentPage(currentPage + 1);
                                                        toast.info(`Navegou para página ${currentPage + 1}`);
                                                    }
                                                }}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                                <div className="flex gap-2 justify-center flex-wrap">
                                    <Button size="sm" variant="outline" onClick={() => { setCurrentPage(1); toast.info('Voltou para página 1'); }}>
                                        Primeira
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => { setCurrentPage(5); toast.info('Pulou para página 5'); }}>
                                        Página 5
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => { setCurrentPage(totalPages); toast.info(`Pulou para última página (${totalPages})`); }}>
                                        Última
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Layout Tab */}
                    <TabsContent value="layout" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Card Padrão</CardTitle>
                                    <CardDescription>Card com header, content e footer</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">
                                        Este é o conteúdo do card. Você pode adicionar qualquer componente aqui.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Card com Estatísticas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total</span>
                                            <span className="font-bold">1,234</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Ativos</span>
                                            <span className="font-bold text-green-600">987</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Inativos</span>
                                            <span className="font-bold text-red-600">247</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Advanced Tab - Sidebars, Filters, Enhanced Modals */}
                    <TabsContent value="advanced" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sidebar/Drawer */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sidebar (Sheet)</CardTitle>
                                    <CardDescription>Drawer lateral para navegação e filtros</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button className="w-full">
                                                <Menu className="mr-2 h-4 w-4" />
                                                Abrir Sidebar
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                            <SheetHeader>
                                                <SheetTitle>Menu de Navegação</SheetTitle>
                                                <SheetDescription>
                                                    Acesse rapidamente as funcionalidades do sistema
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="py-4 space-y-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm">Produção</h4>
                                                    <div className="space-y-1">
                                                        <Button variant="ghost" className="w-full justify-start" onClick={() => toast.info('Navegando para Dashboard')}>
                                                            <TrendingUp className="mr-2 h-4 w-4" />
                                                            Dashboard
                                                        </Button>
                                                        <Button variant="ghost" className="w-full justify-start" onClick={() => toast.info('Navegando para Relatórios')}>
                                                            <Package className="mr-2 h-4 w-4" />
                                                            Relatórios
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Separator />
                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-sm">Configurações</h4>
                                                    <div className="space-y-1">
                                                        <Button variant="ghost" className="w-full justify-start" onClick={() => toast.info('Abrindo Configurações')}>
                                                            <Settings className="mr-2 h-4 w-4" />
                                                            Configurações
                                                        </Button>
                                                        <Button variant="ghost" className="w-full justify-start" onClick={() => toast.info('Gerenciando Usuários')}>
                                                            <Users className="mr-2 h-4 w-4" />
                                                            Usuários
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <SheetFooter>
                                                <SheetClose asChild>
                                                    <Button variant="outline" className="w-full">Fechar</Button>
                                                </SheetClose>
                                            </SheetFooter>
                                        </SheetContent>
                                    </Sheet>

                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" className="w-full">
                                                <Filter className="mr-2 h-4 w-4" />
                                                Filtros Avançados
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent side="right">
                                            <SheetHeader>
                                                <SheetTitle>Filtros</SheetTitle>
                                                <SheetDescription>
                                                    Configure os filtros de visualização
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="py-4 space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Período</Label>
                                                    <Select>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione o período" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="today">Hoje</SelectItem>
                                                            <SelectItem value="week">Última Semana</SelectItem>
                                                            <SelectItem value="month">Último Mês</SelectItem>
                                                            <SelectItem value="year">Último Ano</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Produto</Label>
                                                    <Select>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Todos os produtos" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {mockChartData.slice(0, 5).map((item, idx) => (
                                                                <SelectItem key={idx} value={item.name}>{item.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="active-only" />
                                                    <label htmlFor="active-only" className="text-sm">Apenas ativos</label>
                                                </div>
                                            </div>
                                            <SheetFooter className="flex gap-2">
                                                <Button variant="outline" onClick={() => toast.info('Filtros limpos')}>Limpar</Button>
                                                <Button onClick={() => toast.success('Filtros aplicados!')}>Aplicar</Button>
                                            </SheetFooter>
                                        </SheetContent>
                                    </Sheet>
                                </CardContent>
                            </Card>

                            {/* Enhanced Modal */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Modal Aprimorado</CardTitle>
                                    <CardDescription>Dialog com formulário completo e validação</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="w-full">
                                                <Edit className="mr-2 h-4 w-4" />
                                                Criar Novo Registro
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle>Novo Registro de Produção</DialogTitle>
                                                <DialogDescription>
                                                    Preencha os dados do registro de produção
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="product" className="text-right">Produto</Label>
                                                    <Select>
                                                        <SelectTrigger className="col-span-3">
                                                            <SelectValue placeholder="Selecione o produto" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {mockFormulaData.map((item, idx) => (
                                                                <SelectItem key={idx} value={item.name}>{item.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="quantity" className="text-right">Quantidade</Label>
                                                    <Input id="quantity" type="number" placeholder="0.000" className="col-span-3" />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="operator" className="text-right">Operador</Label>
                                                    <Input id="operator" placeholder="Nome do operador" className="col-span-3" />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="notes" className="text-right">Observações</Label>
                                                    <Textarea id="notes" placeholder="Observações adicionais..." className="col-span-3" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" onClick={() => toast.info('Cancelado')}>Cancelar</Button>
                                                <Button onClick={() => toast.success('Registro criado com sucesso!')}>Salvar</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filter Bar Component */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Barra de Filtros</CardTitle>
                                <CardDescription>Filtros inline para tabelas e listas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border">
                                    <Select>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="completed">Concluído</SelectItem>
                                            <SelectItem value="pending">Pendente</SelectItem>
                                            <SelectItem value="inprogress">Em Produção</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Selecione a data'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <Input placeholder="Buscar..." className="w-[200px]" />

                                    <Button variant="outline" onClick={() => toast.info('Filtros aplicados')}>
                                        <Filter className="mr-2 h-4 w-4" />
                                        Aplicar
                                    </Button>

                                    <Button variant="ghost" onClick={() => toast.info('Filtros limpos')}>
                                        <X className="mr-2 h-4 w-4" />
                                        Limpar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <Separator />
                <div className="text-center text-sm text-gray-500">
                    <p>Cortiça UI Library - Todos os componentes em um só lugar</p>
                    <p className="mt-2">Baseado em shadcn/ui + Componentes Customizados</p>
                </div>
            </div>
        </div>
    );
}
