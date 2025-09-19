import { useEffect, useMemo, useState } from "react"
import { Pie, PieChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { getProcessador } from './Processador'
import { config, synchronizeMockStatus } from './CFG'
import { Button } from "./components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText } from "lucide-react"
import { useIsMobile } from "./hooks/use-mobile"
import { Input } from "./components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover"
import { Calendar } from "./components/ui/calendar"
import { format, startOfDay, endOfDay } from "date-fns"
import { pt } from "date-fns/locale"
import { cn } from "./lib/utils"
import { type DateRange } from "react-day-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog"
import { Filtros } from "./components/types"

type Entry = {
  Nome: string
  values: number[]
  Dia?: string // Data no formato DD/MM/YY
  Hora?: string
  Form1?: number
  Form2?: number
  // Adicionando novos campos para tipo de unidade
  unidadesProdutos?: ('g' | 'kg')[] // Array com a unidade de cada produto (g ou kg)
}

type FormulaSums = Record<string, number>
type ChartDatum = { 
  name: string; 
  value: number;
  unit?: 'g' | 'kg'; // Adicionando a unidade para cada produto
}

const COLORS = ["#ff2626ff", "#5e5e5eff", "#d4d4d4ff", "#ffa8a8ff", "#1b1b1bff"]

function aggregate(rows: Entry[]): { chartData: ChartDatum[]; formulaSums: FormulaSums; validCount: number } {
  const valid = rows.filter(r => r && r.Nome && Array.isArray(r.values) && r.values.length > 0)
  const sums: FormulaSums = {}
  for (const r of valid) {
    const key = r.Nome
    const v = Number(r.values[0] ?? r.Form1 ?? 0)
    sums[key] = (sums[key] || 0) + v
  }

  const chartData = Object.entries(sums).map(([name, value]) => ({ name, value }))
  return { chartData, formulaSums: sums, validCount: valid.length }
}

function aggregateProducts(rows: Entry[]): { productData: ChartDatum[]; productSums: Record<string, number>; totalProducts: number } {
  const valid = rows.filter(r => r && Array.isArray(r.values) && r.values.length > 0);
  const productSums: Record<string, number> = {};
  const productUnits: Record<string, 'g' | 'kg'> = {}; // Armazenar a unidade de cada produto

  // Pega labels do localStorage
  let labelsObj: { [key: string]: string } = {};
  try {
    const saved = localStorage.getItem('labelsMock');
    if (saved) {
      const parsed = JSON.parse(saved);
      // saved pode ser um array ou um objeto
      if (Array.isArray(parsed) && parsed.length > 0) {
        labelsObj = parsed[0]; // seu código salva como array com 1 objeto
      } else if (parsed && typeof parsed === 'object') {
        labelsObj = parsed;
      }
    }
  } catch {
    console.warn("Erro ao ler labels do localStorage, usando defaults");
  }

  for (const r of valid) {
    r.values.forEach((value, index) => {
      // col6 = index 0, col7 = index 1, etc.
      const key = `col${index + 6}`;
      const productKey = labelsObj[key] || `Produto ${index + 1}`;
      
      // Verificar se há informação de unidade
      const unit = r.unidadesProdutos && r.unidadesProdutos[index] === 'g' ? 'g' : 'kg';
      
      // Processar valor baseado na unidade (g -> kg)
      let v = Number(value ?? 0);
      // Não convertemos o valor real, apenas armazenamos a unidade para exibição
      
      if (value <= 0) return;
      
      // Se o produto já existir, mantemos a mesma unidade que foi definida primeiro
      if (!productSums[productKey]) {
        productSums[productKey] = v;
        productUnits[productKey] = unit;
      } else {
        // Para produtos existentes, ajustamos o valor conforme a unidade
        if (unit === 'g' && productUnits[productKey] === 'kg') {
          // Converter gramas para kg para somar
          productSums[productKey] += (v / 1000);
        } else if (unit === 'kg' && productUnits[productKey] === 'g') {
          // Converter valor atual para gramas e adicionar kg
          productSums[productKey] = (productSums[productKey] * 1000) + v;
          productUnits[productKey] = 'kg'; // Mudar unidade para kg
        } else {
          // Mesma unidade, soma direta
          productSums[productKey] += v;
        }
      }
    });
  }

  const productData = Object.entries(productSums).map(([name, value]) => ({ 
    name, 
    value,
    unit: productUnits[name] || 'kg' // Adicionar a unidade ao retorno
  }));
  const totalProducts = Object.values(productSums).reduce((a, b) => a + b, 0);

  return { productData, productSums, totalProducts };
}

// Formatter para tooltips
const tooltipFormatter = (value: string | number | (string | number)[], name: string, entry: any) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  // Verificar se existe uma propriedade payload com unit
  const unit = entry?.payload?.unit || 'kg';
  return [name, `: ${numericValue.toLocaleString('pt-BR', {minimumFractionDigits: 3, maximumFractionDigits: 3})} ${unit}`];
};

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realData, setRealData] = useState<boolean>(false)
  const [rows, setRows] = useState<Entry[] | null>(null)
  const [dataIsEmpty, setDataIsEmpty] = useState<boolean>(false)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [contadorRelatorios, setContadorRelatorios] = useState<number>(0)
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string | null>(null)
  // Estado para o diálogo de todos os produtos
  const [showAllProducts, setShowAllProducts] = useState<boolean>(false)
  const [allProductsDialogData, setAllProductsDialogData] = useState<{
    products: ChartDatum[],
    title: string,
    total: number,
    batidas: number
  }>({
    products: [],
    title: '',
    total: 0,
    batidas: 0
  })

  const processador = getProcessador();

  const startCollector = async () => {
    try {
      const response = await processador.sendWithConnectionCheck("collector.start");
      console.log("Collector started:", response);
    } catch (error) {
      console.error("Error starting collector:", error);
    }
  };

  const stopCollector = async () => {
    try {
      const response = await processador.sendWithConnectionCheck("collector.stop");
      console.log("Collector stopped:", response);
    } catch (error) {
      console.error("Error stopping collector:", error);
    }
  };

  const loadData = async (_retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)

      let loadedRows: Entry[] = []
      let usingRealData = false

      if (config.contextoPid) {
        try {
          const p = getProcessador(config.contextoPid)
          const tableResult = await p.getTableData(1, 300, {
            dateStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateEnd: new Date().toISOString().split('T')[0]
          })

          // Atualizar contador de relatórios
          setContadorRelatorios(tableResult.total || 0)

          // Definir data da última atualização
          setUltimaAtualizacao(new Date().toLocaleString('pt-BR'))

          const mapped: Entry[] = (tableResult.rows || []).map((r: any) => {
            const values: number[] = [];
            // Capturar as unidades dos produtos (g ou kg)
            const unidadesProdutos: ('g' | 'kg')[] = [];
            
            for (let i = 1; i <= 40; i++) {
              const v = r[`Prod_${i}`];
              // Capturar unidade do produto do backend, padrão é 'kg' se não especificado
              const unidade = r[`Unidade_${i}`] === 'g' ? 'g' : 'kg';
              unidadesProdutos.push(unidade);
              
              values.push(typeof v === 'number' ? v : (v != null ? Number(v) : 0));
            }
            return {
              Nome: r.Nome ?? 'Desconhecido',
              values,
              unidadesProdutos,
              Dia: r.Dia,
              Hora: r.Hora,
              Form1: r.Form1 ?? undefined,
              Form2: r.Form2 ?? undefined,
            } as Entry
          })

          loadedRows = mapped
          usingRealData = true
        } catch (e) {
          console.error('Falha ao carregar dados do backend:', e)
          setError('Não foi possível obter dados do backend. Verifique a conexão.')
        }
      } else {
        setError('Erro de configuração: contextoPid não está definido')
      }

      setRows(loadedRows)
      setRealData(usingRealData)
      setDataIsEmpty(!loadedRows || loadedRows.length === 0)
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Sincronizar status do mock com o backend
    if (config.contextoPid) {
      synchronizeMockStatus().catch(console.error);
    }

    // Fetch product labels from backend and save to localStorage
    (async () => {
      try {
        const res = await fetch('/api/materiaprima/labels');
        if (res.ok) {
          const labels = await res.json();
          if (labels && typeof labels === 'object') {
            localStorage.setItem('labelsMock', JSON.stringify([labels]));
            console.log('Product labels synchronized from backend (mount)');
          }
        }
      } catch (e) { /* ignore */ }
    })();

    loadData();

    // Configurar atualização periódica
    const intervalo = setInterval(loadData, 60000); // 1 minuto

    return () => clearInterval(intervalo);
  }, [])

  // Listen to table selection events to highlight/filter chart
  useEffect(() => {
    function onTableSelection(e: any) {
      const detail = e?.detail || []
      const prodSet = new Set<string>()
      for (const item of detail) {
        if (!item || !item.colKey) continue
        // product columns are like 'col6','col7', etc.
        if (/^col\d+$/.test(item.colKey)) {
          // map col key to product label stored in localStorage
          let labelsObj: { [k: string]: string } = {}
          try { const saved = localStorage.getItem('labelsMock'); if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length > 0) labelsObj = parsed[0]; else if (parsed && typeof parsed === 'object') labelsObj = parsed } } catch { }
          const productLabel = labelsObj[item.colKey] || item.colKey
          prodSet.add(productLabel)
        }
      }
      setSelectedProducts(prodSet)
    }
    window.addEventListener('table-selection', onTableSelection as EventListener)
    return () => window.removeEventListener('table-selection', onTableSelection as EventListener)
  }, [])

  const { formulaSums } = useMemo(() => {
    if (!rows) return { chartData: [] as ChartDatum[], formulaSums: {}, validCount: 0 }
    return aggregate(rows)
  }, [rows])

  const chartConfig: ChartConfig = useMemo(() => ({
    visitors: { label: "Visitors" },
    ...Object.fromEntries(
      Object.keys(formulaSums).map((k, i) => [k.toLowerCase().replace(/\s+/g, "-"), { label: k, color: COLORS[i % COLORS.length] }])
    ),
  }), [formulaSums])

  // Period definitions
  const periods = [
    { key: 'ontem', label: 'Ontem' },
    { key: '30dias', label: '30 dias' },
    { key: 'personalizado', label: 'Personalizado' },
  ]

  const [activeReportIndex, setActiveReportIndex] = useState<number>(0);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const isMobile = useIsMobile();

  // View mode: compact or carousel
  const [viewMode, setViewMode] = useState<'compact' | 'carousel'>('compact');

  // Date range picker state
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: customStartDate ? new Date(customStartDate) : startOfDay(new Date()),
    to: customEndDate ? new Date(customEndDate) : endOfDay(new Date()),
  });

  // Filter state for table integration
  const [reportFilter, setReportFilter] = useState<Filtros>({
    dataInicio: "",
    dataFim: "",
    nomeFormula: ""
  });

  // Função para formatar data do formato YYYY-MM-DD para DD/MM/YY
  const formatDateForFilter = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().substring(2);
    return `${day}/${month}/${year}`;
  };

  // Função para lidar com a mudança de datas no calendário
  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);

    if (!range?.from || !range?.to) {
      setCustomStartDate("");
      setCustomEndDate("");
      return;
    }

    const startDateString = format(range.from, "yyyy-MM-dd");
    const endDateString = format(range.to, "yyyy-MM-dd");

    setCustomStartDate(startDateString);
    setCustomEndDate(endDateString);
  };

  // Função para aplicar filtro personalizado
  const applyCustomFilter = () => {
    if (!customStartDate || !customEndDate) {
      alert("Por favor, selecione as datas inicial e final");
      return;
    }
    
    setReportFilter({
      ...reportFilter,
      dataInicio: customStartDate,
      dataFim: customEndDate
    });
    
    // Se estivermos no mobile, certifique-se de exibir o relatório personalizado
    if (isMobile) {
      setActiveReportIndex(periods.findIndex(p => p.key === 'personalizado'));
    }
  };

  // Função para mostrar todos os produtos em um diálogo
  const handleShowAllProducts = (products: ChartDatum[], title: string, total: number, batidas: number) => {
    setAllProductsDialogData({
      products: products.slice().sort((a, b) => b.value - a.value),
      title,
      total,
      batidas
    });
    setShowAllProducts(true);
  };

  // Função para gerar um relatório (pode ser implementada para exportar para PDF ou Excel)
  const handleGenerateReport = () => {
    const { products, title } = allProductsDialogData;
    
    // Aqui você pode implementar a lógica para gerar o relatório
    alert(`Relatório de ${title} será gerado com ${products.length} produtos`);
    
    // Redirecionar para a página de relatório ou abrir uma nova janela
    // window.open('/report?title=' + encodeURIComponent(title), '_blank');
  };
  
  function aggregateForRange(periodKey: string) {
    if (!rows) return { chartData: [] as ChartDatum[], sums: {} as FormulaSums, total: 0, productData: [] as ChartDatum[], productTotal: 0, filteredCount: 0 }

    let filtered: Entry[]

    switch (periodKey) {
      case '30dias':
        // Para 30 dias: usar todos os dados
        filtered = rows
        break

      case 'ontem':
        // Para ontem: pegar especificamente os dias 19 e 20 (hoje é 19/09/2025)
        filtered = rows.filter(r => {
          if (!r.Dia) return false
          const dayMatch = r.Dia.match(/^(\d{1,2})\//)
          if (!dayMatch) return false
          const day = parseInt(dayMatch[1], 10)
          return day === 19 || day === 18  // Ontem seria 18/09/2025
        })
        break

      case 'personalizado':
        // Para personalizado: filtrar por intervalo de datas usando o mesmo método do table filter
        filtered = rows.filter(r => {
          if (!r.Dia || (!customStartDate && !customEndDate)) return true;

          try {
            const parts = r.Dia.split('/');
            if (parts.length !== 3) return false;

            // Converte DD/MM/YY para YYYY-MM-DD para comparação
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parseInt(parts[2], 10) < 100 ? `20${parts[2].padStart(2, '0')}` : parts[2];
            const rowDateStr = `${year}-${month}-${day}`;

            // Verifica se está no intervalo
            if (customStartDate && rowDateStr < customStartDate) return false;
            if (customEndDate && rowDateStr > customEndDate) return false;

            return true;
          } catch (e) {
            console.error("Erro ao processar data", r.Dia, e);
            return false;
          }
        })
        break

      default:
        filtered = rows
        break
    }

    const { chartData, formulaSums } = aggregate(filtered)
    const { productData, totalProducts } = aggregateProducts(filtered)
    const total = Object.values(formulaSums).reduce((a, b) => a + b, 0)

    console.log('Final result:', {
      filteredCount: filtered.length,
      productDataLength: productData.length,
      totalProducts
    })

    return { chartData, sums: formulaSums, total, productData, productTotal: totalProducts, filteredCount: filtered.length }
  }

  // Função para renderizar o diálogo de todos os produtos
  const renderProductsDialog = () => {
    return (
      <Dialog open={showAllProducts} onOpenChange={setShowAllProducts}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Todos os Produtos - {allProductsDialogData.title}</DialogTitle>
            <DialogDescription>
              Lista completa de produtos - Total: {allProductsDialogData.total.toLocaleString("pt-BR", {minimumFractionDigits: 3, maximumFractionDigits: 3})} {allProductsDialogData.products[0]?.unit || 'kg'} | Batidas: {allProductsDialogData.batidas}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-2 my-4">
            {allProductsDialogData.products.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="font-bold">{product.value.toLocaleString("pt-BR", {minimumFractionDigits: 3, maximumFractionDigits: 3})} {product.unit || 'kg'}</div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAllProducts(false)}>
              Fechar
            </Button>
            <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700 text-white">
              <FileText className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Carregando dashboard...</p>
          <p className="mt-2 text-gray-500 text-sm">Conectando ao backend...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Status bar */}
      {/* <div className="p-2 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          {realData ? (
            <span className="px-2 py-1 rounded bg-green-100 text-green-700">Dados reais do backend</span>
          ) : (
            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">Usando dados mock</span>
          )}
          {ultimaAtualizacao && (
            <span className="ml-2 text-xs text-gray-400 block sm:inline-block mt-1 sm:mt-0">
              Atualizado em: {ultimaAtualizacao}
            </span>
          )}
        </div>
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
      </div> */}

      {/* Diálogo para mostrar todos os produtos */}
      {renderProductsDialog()}

      {/* Dialog para mostrar todos os produtos */}
            {renderProductsDialog()}

      {/* Dashboard principal */}

      {/* Dashboard principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 px-2 md:px-4">
        {/* Área reservada para futuros componentes */}
      </div>

      {dataIsEmpty && (
        <div className="px-4 text-sm text-gray-600">Nenhum dado disponível para o período selecionado.</div>
      )}

      {/* Prominent Button for Customized Reports - Always visible */}


      {/* Charts Grid - Gráficos de Pizza */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 px-4">
          {/* <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">Distribuição por Período</h2> */}

          {/* View Mode Selector */}
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span className="text-sm text-gray-500">Visualização:</span>
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'compact' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setViewMode('compact')}
              >
                Compacto
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'carousel' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setViewMode('carousel')}
              >
                Carrossel
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Controls - Mobile Only with indicators */}
        <div className={`flex flex-col items-center px-4 mb-4 ${isMobile ? 'flex' : 'hidden'}`}>
          <div className="flex items-center justify-between w-full mb-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveReportIndex(prev => (prev > 0 ? prev - 1 : periods.length - 1))}
              aria-label="Relatório anterior"
              className="h-10 w-10 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <span className="text-base font-medium">{periods[activeReportIndex]?.label}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveReportIndex(prev => (prev < periods.length - 1 ? prev + 1 : 0))}
              aria-label="Próximo relatório"
              className="h-10 w-10 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Carousel indicators */}
          <div className="flex space-x-2 mt-2">
            {periods.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${index === activeReportIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                  }`}
                onClick={() => setActiveReportIndex(index)}
                aria-label={`Ir para relatório ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Personalizado inputs - show only when personalized is selected */}
        {((isMobile && periods[activeReportIndex]?.key === 'personalizado') ||
          (!isMobile && true)) && (
            <div className={`${periods[activeReportIndex]?.key === 'personalizado' || !isMobile ? 'flex' : 'hidden'} flex-col md:flex-row gap-4 mb-4 px-4 md:justify-center items-end`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar período</label>
                <Popover>
                  <PopoverTrigger>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal border border-gray-300",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      autoFocus
                      mode="range"
                      locale={pt}
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleDateChange}
                      numberOfMonths={1}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Button
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={applyCustomFilter}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Aplicar Filtro
                </Button>
              </div>
            </div>
          )}

        {/* Mode-dependent visualization */}
        <div className={viewMode === 'compact' ? 'block' : 'hidden'}>
          {/* Compact View - All Reports Side by Side (smaller size) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {periods.map((p) => {
              const agg = aggregateForRange(p.key)
              const allProductsForChart = agg.productData.slice().sort((a, b) => b.value - a.value)
              const batidas = agg.filteredCount || 0

              return (
                <Card key={p.key} className="shadow-lg">
                  <CardHeader className="text-center py-2">
                    <CardTitle className="text-lg font-semibold text-gray-800">{p.label}</CardTitle>
                    <CardDescription>Distribuição de produtos</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center p-2">
                    <div className="w-48 h-48 md:w-56 md:h-56">
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <PieChart>
                          <ChartTooltip
                            content={<ChartTooltipContent hideLabel />}
                            formatter={tooltipFormatter}
                          />
                          <Pie
                            data={allProductsForChart.map(d => ({ browser: d.name, visitors: d.value }))}
                            dataKey="visitors"
                            nameKey="browser"
                            outerRadius={70}
                            innerRadius={35}
                            labelLine={false}
                          >
                            {allProductsForChart.map((_, i) => (
                              <Cell key={i} fill={selectedProducts.size === 0 || selectedProducts.has(allProductsForChart[i].name) ? COLORS[i % COLORS.length] : '#e5e7eb'} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-lg font-bold text-gray-900">Total: {agg.productTotal.toLocaleString('pt-BR')} kg</div>
                      <div className="text-sm text-gray-600">Batidas: {batidas}</div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Carousel View - Chart and Product List Side by Side */}
        <div className={viewMode === 'carousel' ? 'block' : 'hidden'}>
          <div className="flex justify-center mb-4">
            <Button
              onClick={() => {
                setActiveReportIndex(periods.findIndex(p => p.key === 'personalizado'));
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-md shadow-md"
            >
              <span>Ir para Relatório Personalizado</span>
            </Button>
          </div>
          {/* Carousel Navigation Controls */}
          <div className="flex items-center justify-between px-4 mb-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveReportIndex(prev => (prev > 0 ? prev - 1 : periods.length - 1))}
              aria-label="Relatório anterior"
              className="h-10 w-10 rounded-full flex-shrink-0"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <span className="text-base font-medium px-2 text-center">{periods[activeReportIndex]?.label}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveReportIndex(prev => (prev < periods.length - 1 ? prev + 1 : 0))}
              aria-label="Próximo relatório"
              className="h-10 w-10 rounded-full flex-shrink-0"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center space-x-2 mb-3">
            {periods.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${index === activeReportIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                  }`}
                onClick={() => setActiveReportIndex(index)}
                aria-label={`Ir para relatório ${index + 1}`}
              />
            ))}
          </div>

          {/* Carousel Content - Chart and Products Side by Side */}
          {periods.map((p, index) => {
            if (index !== activeReportIndex) return null;

            const agg = aggregateForRange(p.key)
            const allProductsForChart = agg.productData.slice().sort((a, b) => b.value - a.value)
            const batidas = agg.filteredCount || 0

            // Limit products for display
            const limitedProducts = allProductsForChart.slice(0, 12)

            return (
              <div key={p.key} className="flex flex-col md:flex-row gap-4 px-4">
                {/* Chart Card */}
                <Card className="shadow-lg w-full md:w-1/2">
                  <CardHeader className="text-center py-3">
                    <CardTitle className="text-lg font-semibold text-gray-800">{p.label}</CardTitle>
                    <CardDescription>Distribuição de produtos</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="w-[280px] h-[280px]">
                      <ChartContainer config={chartConfig} className="w-full h-full">
                        <PieChart>
                          <ChartTooltip
                            content={<ChartTooltipContent hideLabel />}
                            formatter={tooltipFormatter}
                          />
                          <Pie
                            data={allProductsForChart.map(d => ({ browser: d.name, visitors: d.value }))}
                            dataKey="visitors"
                            nameKey="browser"
                            outerRadius={120}
                            innerRadius={60}
                            labelLine={false}
                          >
                            {allProductsForChart.map((_, i) => (
                              <Cell key={i} fill={selectedProducts.size === 0 || selectedProducts.has(allProductsForChart[i].name) ? COLORS[i % COLORS.length] : '#e5e7eb'} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-lg font-bold text-gray-900">Total: {agg.productTotal.toLocaleString('pt-BR')} kg</div>
                      <div className="text-sm text-gray-600">Batidas: {batidas}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Products Card */}
                <Card className="shadow-lg w-full md:w-1/2">
                  <CardHeader className="py-3">
                    <CardTitle className="text-lg font-semibold text-gray-800">Produtos - {p.label}</CardTitle>
                    <CardDescription>Lista detalhada de produtos</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 min-h-[280px]">
                      {limitedProducts.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs md:text-sm">
                          <div className="flex items-center">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="font-medium truncate max-w-[100px] md:max-w-[120px]">{t.name}</span>
                          </div>
                          <div className="font-bold">{t.value.toLocaleString("pt-BR", {minimumFractionDigits: 3, maximumFractionDigits: 3})} {t.unit || 'kg'}</div>
                        </div>
                      ))}
                      {allProductsForChart.length > 12 && (
                        <div 
                          className="text-center text-xs text-blue-600 p-1 col-span-1 md:col-span-2 cursor-pointer hover:underline"
                          onClick={() => handleShowAllProducts(allProductsForChart, p.label, agg.productTotal, batidas)}
                        >
                          +{allProductsForChart.length - 12} produtos
                        </div>
                      )}
                      {allProductsForChart.length === 0 && (
                        <div className="text-gray-500 text-sm text-center py-4 col-span-1 md:col-span-2">
                          Nenhum produto no período
                        </div>
                      )}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span>Total Produtos:</span>
                        <span className="font-bold">{agg.productTotal.toLocaleString("pt-BR", {minimumFractionDigits: 3, maximumFractionDigits: 3})} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Batidas:</span>
                        <span className="font-bold">{batidas}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      {/* Products Lists */}
      <div className="mb-8 px-2 md:px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">Detalhamento por Produtos</h2>

          {/* View Mode Selector */}
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span className="text-sm text-gray-500">Visualização:</span>
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'compact' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setViewMode('compact')}
              >
                Compacto
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'carousel' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                onClick={() => setViewMode('carousel')}
              >
                Carrossel
              </button>
            </div>
          </div>
        </div>

        {/* Compact Mode - No Scrollbars */}
        <div className={viewMode === 'compact' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {periods.map((p) => {
              const agg = aggregateForRange(p.key)
              const allProducts = agg.productData.slice().sort((a, b) => b.value - a.value)
              const batidas = agg.filteredCount || 0

              // Limit products for compact view
              const displayProducts = allProducts.slice(0, 5)

              return (
                <Card key={p.key} className="shadow-lg">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-base font-semibold text-gray-800">Todos os Produtos - {p.label}</CardTitle>
                    <CardDescription className="text-xs">Lista resumida (top 5)</CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="space-y-1 mb-2">
                      {displayProducts.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-1 bg-gray-50 rounded text-xs">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="font-medium truncate max-w-[100px]">{t.name}</span>
                          </div>
                          <div className="font-bold">{t.value.toLocaleString("pt-BR", {minimumFractionDigits: 3, maximumFractionDigits: 3})} {t.unit || 'kg'}</div>
                        </div>
                      ))}
                      {allProducts.length > 5 && (
                        <div 
                          className="text-center text-xs text-blue-600 p-1 cursor-pointer hover:underline"
                          onClick={() => handleShowAllProducts(allProducts, p.label, agg.productTotal, batidas)}
                        >
                          +{allProducts.length - 5} produtos
                        </div>
                      )}
                      {allProducts.length === 0 && (
                        <div className="text-gray-500 text-xs text-center py-2">
                          Nenhum produto no período
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 border-t pt-1">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-bold">{agg.productTotal.toLocaleString("pt-BR", {minimumFractionDigits: 3, maximumFractionDigits: 3})} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Batidas:</span>
                        <span className="font-bold">{batidas}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Carousel Mode - No Scrollbars */}
        <div className={viewMode === 'carousel' ? 'block' : 'hidden'}>
          {/* Carousel Navigation */}
          <div className="flex items-center justify-between px-4 mb-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveReportIndex(prev => (prev > 0 ? prev - 1 : periods.length - 1))}
              aria-label="Relatório anterior"
              className="h-10 w-10 rounded-full flex-shrink-0"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <span className="text-base font-medium px-2 text-center">{periods[activeReportIndex]?.label}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setActiveReportIndex(prev => (prev < periods.length - 1 ? prev + 1 : 0))}
              aria-label="Próximo relatório"
              className="h-10 w-10 rounded-full flex-shrink-0"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center space-x-2 mb-3">
            {periods.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${index === activeReportIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                  }`}
                onClick={() => setActiveReportIndex(index)}
                aria-label={`Ir para relatório ${index + 1}`}
              />
            ))}
          </div>

          {/* Product List Grid - 3 columns */}
          {periods.map((p, index) => {
            if (index !== activeReportIndex) return null;

            const agg = aggregateForRange(p.key)
            const allProducts = agg.productData.slice().sort((a, b) => b.value - a.value)
            const batidas = agg.filteredCount || 0

            // Display more products in a grid
            const displayProducts = allProducts.slice(0, 15)

            return (
              <Card key={p.key} className="shadow-lg mx-4">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-base md:text-lg font-semibold text-gray-800">Todos os Produtos - {p.label}</CardTitle>
                  <CardDescription className="text-sm">Lista detalhada de produtos</CardDescription>
                </CardHeader>
                <CardContent className="p-3 md:p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                    {displayProducts.map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <div className="flex items-center flex-grow">
                          <div className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="font-medium truncate max-w-[80px] md:max-w-[140px]">{t.name}</span>
                        </div>
                        <div className="font-bold ml-1 flex-shrink-0">{t.value.toLocaleString("pt-BR", {minimumFractionDigits: 3, maximumFractionDigits: 3})} {t.unit || 'kg'}</div>
                      </div>
                    ))}
                    {allProducts.length > 15 && (
                      <div 
                        className="text-center text-xs text-blue-600 p-1 md:col-span-3 cursor-pointer hover:underline"
                        onClick={() => handleShowAllProducts(allProducts, p.label, agg.productTotal, batidas)}
                      >
                        +{allProducts.length - 15} produtos
                      </div>
                    )}
                    {allProducts.length === 0 && (
                      <div className="text-gray-500 text-sm text-center py-4 md:col-span-3">
                        Nenhum produto no período
                      </div>
                    )}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 border-t pt-2">
                    <div className="flex justify-between">
                      <span>Total Produtos:</span>
                      <span className="font-bold">{agg.productTotal.toLocaleString("pt-BR", {minimumFractionDigits: 3, maximumFractionDigits: 3})} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Batidas:</span>
                      <span className="font-bold">{batidas}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
} 