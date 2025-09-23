import { useEffect, useMemo, useState } from "react"
import { Pie, PieChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { getProcessador } from './Processador' // Certifique-se que o caminho está correto
import { Button } from "./components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, FileText } from "lucide-react"
import { useIsMobile } from "./hooks/use-mobile" // Certifique-se que o caminho está correto
import { Popover, PopoverContent, PopoverTrigger } from "./components/ui/popover"
import { Calendar } from "./components/ui/calendar"
import { format, startOfDay, endOfDay, subDays, subMonths } from "date-fns"
import { pt } from "date-fns/locale"
import { cn } from "./lib/utils" // Certifique-se que o caminho está correto
import { type DateRange } from "react-day-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog"
import { Filtros } from "./components/types" // Certifique-se que o caminho está correto

// Interfaces para tipagem
interface Entry {
  Nome: string;
  values: number[];
  Dia?: string;
  Hora?: string;
  Form1?: number;
  Form2?: number;
  unidadesProdutos?: ('g' | 'kg')[];
  // Adicione outros campos relevantes se precisar para outros gráficos
}

interface ChartDatum {
  name: string;
  value: number;
  unit?: 'g' | 'kg';
}

interface MateriaPrimaConfigItem {
  colKey: string;
  produto: string;
  medida: number; // 0 para g, 1 para kg
}

type FormulaSums = Record<string, number>;

// Formatação para o tooltip
const tooltipFormatter = (value: string | number | (string | number)[], name: string, entry: any): [string, string] => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  const unit = entry?.payload?.unit || 'kg';
  return [name, `: ${numericValue.toLocaleString('pt-BR', {minimumFractionDigits: 3, maximumFractionDigits: 3})} ${unit}`];
};

const COLORS = ["#ff2626ff", "#5e5e5eff", "#d4d4d4ff", "#ffa8a8ff", "#1b1b1bff"];

// Função para agregar dados por fórmula (Nome)
function aggregateByFormula(rows: Entry[]): { chartData: ChartDatum[]; formulaSums: FormulaSums; validCount: number } {
  const valid = rows.filter(r => r && r.Nome && Array.isArray(r.values) && r.values.length > 0)
  const sums: FormulaSums = {}
  for (const r of valid) {
    const key = r.Nome
    // Assume o primeiro valor como representativo da produção da fórmula para o gráfico
    const v = Number(r.values[0] ?? r.Form1 ?? 0)
    sums[key] = (sums[key] || 0) + v
  }

  const chartData = Object.entries(sums).map(([name, value]) => ({ name, value }))
  return { chartData, formulaSums: sums, validCount: valid.length }
}

// Função para agregar dados por produto (materia prima)
function aggregateProducts(rows: Entry[], materiaPrimaConfig: MateriaPrimaConfigItem[]): { productData: ChartDatum[]; productSums: Record<string, number>; totalProducts: number } {
  const valid = rows.filter(r => r && Array.isArray(r.values) && r.values.length > 0);
  const productSums: Record<string, number> = {};
  const productUnits: Record<string, 'g' | 'kg'> = {};

  for (const r of valid) {
    r.values.forEach((value, index) => {
      // Produtos começam em Prod_1, que mapeia para col6 (index 0 -> col6)
      const colKey = `col${index + 6}`;
      const mpConfig = materiaPrimaConfig.find(mp => mp.colKey === colKey);

      let unit: 'g' | 'kg' = 'kg'; // Default para kg
      let conversionFactor = 1;

      if (mpConfig) {
        unit = mpConfig.medida === 0 ? 'g' : 'kg';
        // Se a unidade original for g, convertemos para kg para padronizar
        conversionFactor = unit === 'g' ? 0.001 : 1;
      }

      const productKey = mpConfig?.produto || `Produto ${index + 1}`;
      // Converte o valor para kg para padronização
      const v = Number(value ?? 0) * conversionFactor;

      // Somente considera valores positivos
      if (v <= 0) return;

      if (!productSums[productKey]) {
        productSums[productKey] = v;
        productUnits[productKey] = 'kg'; // Armazena sempre em kg
      } else {
        productSums[productKey] += v;
      }
    });
  }

  // Prepara os dados para o gráfico, garantindo que a unidade seja 'kg'
  const productData = Object.entries(productSums).map(([name, value]) => ({
    name,
    value,
    unit: 'kg' as 'kg'
  }));

  // Calcula o total de produtos em kg
  const totalProducts = Object.values(productSums).reduce((a, b) => a + b, 0);
  return { productData, productSums, totalProducts };
}

const Home = () => {
  const [materiaPrimaConfig, setMateriaPrimaConfig] = useState<MateriaPrimaConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Entry[]>([]); // Inicia como array vazio
  const [dataIsEmpty, setDataIsEmpty] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [contadorRelatorios, setContadorRelatorios] = useState<number>(0);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string | null>(null);
  const [showAllProducts, setShowAllProducts] = useState<boolean>(false);
  const [allProductsDialogData, setAllProductsDialogData] = useState<{
    products: ChartDatum[];
    title: string;
    total: number;
    batidas: number;
  }>({
    products: [],
    title: '',
    total: 0,
    batidas: 0
  });

  const [activeReportIndex, setActiveReportIndex] = useState<number>(0); // Padrão para '30dias'
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'compact' | 'carousel'>('compact');

  // Estados para o DateRangePicker
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30), // Padrão: últimos 30 dias
    to: new Date(),
  });

  // Estados para datas formatadas para envio ao backend
  const [reportFilter, setReportFilter] = useState<Filtros>({
    dataInicio: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    dataFim: format(new Date(), "yyyy-MM-dd"),
    nomeFormula: ""
  });

  // Definição dos períodos
  const periods = useMemo(() => [
    { key: 'ontem', label: 'Ontem' },
    { key: '30dias', label: '30 dias' },
    { key: 'personalizado', label: 'Personalizado' },
  ], []);

  // Carrega a configuração de matérias-primas
  const loadMateriaPrimaConfig = async () => {
    try {
      const proc = getProcessador();
      const labelsResponse = await proc.sendWithConnectionCheck('materiaprima.getConfig');
      // Assume que o backend retorna um objeto { colKey: { produto, medida } }
      // Ou um array [{ colKey, produto, medida }]
      let configArray: MateriaPrimaConfigItem[] = [];

      if (Array.isArray(labelsResponse)) {
         configArray = labelsResponse;
      } else if (labelsResponse && typeof labelsResponse === 'object') {
         configArray = Object.entries(labelsResponse).map(([colKey, info]: any) => ({
           colKey,
           produto: info.produto,
           medida: info.medida,
         }));
      }
      setMateriaPrimaConfig(configArray);
      // Opcional: Salvar no localStorage para uso offline
      localStorage.setItem('productLabels', JSON.stringify(configArray));
    } catch (err) {
       console.error("Erro ao carregar configuração de matéria prima:", err);
       setError("Falha ao carregar configurações de produtos.");
    }
  };

  // Carrega os dados dos relatórios do backend
  const loadData = async (dateStart: string, dateEnd: string) => {
    setLoading(true);
    setError(null);
    try {
      const proc = getProcessador();

      // Usa o endpoint correto do backend para buscar dados paginados
      const result = await proc.sendWithConnectionCheck('relatorio.paginate', {
        page: 1,
        pageSize: 10000, // Ajuste se necessário ou implemente paginação real
        dateStart: dateStart,
        dateEnd: dateEnd,
        // sortBy e sortDir podem ser adicionados conforme necessário
      });

      console.log('[Home] Dados recebidos do backend:', result);

      if (result && Array.isArray(result.rows)) {
        const mappedRows: Entry[] = result.rows.map((r: any) => {
          const values: number[] = [];
          // Extrai valores de Prod_1 a Prod_40
          for (let i = 1; i <= 40; i++) {
            const v = r[`Prod_${i}`];
            values.push(typeof v === 'number' ? v : (v != null ? Number(v) : 0));
          }
          return {
            Nome: r.Nome ?? 'Desconhecido',
            values,
            Dia: r.Dia,
            Hora: r.Hora,
            Form1: r.Form1 ?? undefined,
            Form2: r.Form2 ?? undefined,
            // unidadesProdutos pode ser preenchido se necessário, mas não é usado na agregação atual
          };
        });

        setRows(mappedRows);
        setContadorRelatorios(result.total || 0);
        setUltimaAtualizacao(new Date().toLocaleString('pt-BR'));
        setDataIsEmpty(mappedRows.length === 0);
      } else {
        throw new Error('Formato de resposta inesperado do backend.');
      }
    } catch (err: any) {
      console.error('[Home] Erro ao carregar dados:', err);
      setError(err.message || 'Falha ao carregar dados do servidor.');
      setRows([]); // Limpa dados antigos em caso de erro
      setDataIsEmpty(true);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar configuração inicial e dados
  useEffect(() => {
    const initialize = async () => {
      await loadMateriaPrimaConfig();
      // Carrega dados iniciais (últimos 30 dias)
      const initialStart = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const initialEnd = format(new Date(), "yyyy-MM-dd");
      await loadData(initialStart, initialEnd);
    };

    initialize();
  }, []);

  // Efeito para atualizar dados quando o filtro de data muda
  useEffect(() => {
    if (reportFilter.dataInicio && reportFilter.dataFim) {
      loadData(reportFilter.dataInicio, reportFilter.dataFim);
    }
  }, [reportFilter.dataInicio, reportFilter.dataFim]); // Dependências

  // Efeito para escutar seleção de tabela (se aplicável)
  useEffect(() => {
    const onTableSelection = (e: CustomEvent) => {
      const detail = e?.detail || [];
      const prodSet = new Set<string>();
      for (const item of detail) {
        if (!item || !item.colKey) continue;
        if (/^col\d+$/.test(item.colKey)) {
          // Tenta encontrar o nome do produto usando a configuração
          const mpItem = materiaPrimaConfig.find(mp => mp.colKey === item.colKey);
          const productLabel = mpItem ? mpItem.produto : item.colKey;
          prodSet.add(productLabel);
        }
      }
      setSelectedProducts(prodSet);
    };

    window.addEventListener('table-selection', onTableSelection as EventListener);
    return () => window.removeEventListener('table-selection', onTableSelection as EventListener);
  }, [materiaPrimaConfig]); // Dependência da configuração

  // Memoiza a agregação por fórmula
  const { formulaSums } = useMemo(() => {
    return aggregateByFormula(rows);
  }, [rows]);

  // Memoiza a configuração do gráfico
  const chartConfig: ChartConfig = useMemo(() => ({
    visitors: { label: "Visitors" },
    ...Object.fromEntries(
      Object.keys(formulaSums).map((k, i) => [k.toLowerCase().replace(/\s+/g, "-"), { label: k, color: COLORS[i % COLORS.length] }])
    ),
  }), [formulaSums]);

  // Manipulador de mudança de data no calendário
  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);

    if (!range?.from || !range?.to) {
      // Se o range estiver incompleto, não aplica o filtro ainda
      return;
    }

    const startDateString = format(range.from, "yyyy-MM-dd");
    const endDateString = format(range.to, "yyyy-MM-dd");

    setReportFilter(prev => ({
      ...prev,
      dataInicio: startDateString,
      dataFim: endDateString
    }));
  };

  // Manipulador para mostrar todos os produtos no modal
  const handleShowAllProducts = (products: ChartDatum[], title: string, total: number, batidas: number) => {
    setAllProductsDialogData({
      products: products.slice().sort((a, b) => b.value - a.value), // Ordena por valor
      title,
      total,
      batidas
    });
    setShowAllProducts(true);
  };

  // Manipulador para gerar relatório (placeholder)
  const handleGenerateReport = () => {
    const { products, title } = allProductsDialogData;
    alert(`Relatório de ${title} será gerado com ${products.length} produtos`);
  };

  // Função para calcular agregações para um período específico
  const aggregateForRange = (periodKey: string) => {
    // A agregação agora é feita em cima dos `rows` já filtrados pelo backend
    // através do `reportFilter`. Esta função pode ser simplificada ou removida
    // se o backend fizer toda a agregação. Para manter a lógica do frontend:
    const { chartData, formulaSums: sums } = aggregateByFormula(rows);
    const { productData, totalProducts } = aggregateProducts(rows, materiaPrimaConfig);
    const total = Object.values(sums).reduce((a, b) => a + b, 0);

    return {
      chartData,
      sums,
      total,
      productData,
      productTotal: totalProducts,
      filteredCount: rows.length // O backend já filtrou, então é o total de rows
    };
  };

  // Renderiza o modal de todos os produtos
  const renderProductsDialog = () => {
    return (
      <Dialog open={showAllProducts} onOpenChange={setShowAllProducts}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Todos os Produtos - {allProductsDialogData.title}</DialogTitle>
            <DialogDescription>
              Lista completa de produtos - Total: {allProductsDialogData.total.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg | Batidas: {allProductsDialogData.batidas}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-2 my-4">
            {allProductsDialogData.products.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="font-bold">{product.value.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} {product.unit || 'kg'}</div>
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

  // Renderização condicional de loading
  if (loading && rows.length === 0) { // Mostra loading apenas na primeira carga
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Carregando dashboard...</p>
          <p className="mt-2 text-gray-500 text-sm">Conectando ao backend...</p>
        </div>
      </div>
    );
  }

  // Renderização condicional de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => loadData(reportFilter.dataInicio, reportFilter.dataFim)} className="w-full">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {renderProductsDialog()}

      {/* Cabeçalho com Status (opcional) */}
      {/* <div className="px-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Status do Backend</CardTitle>
            <CardDescription>Informações úteis para depuração</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-sm">Última atualização: <strong>{ultimaAtualizacao || '—'}</strong></div>
              <div className="text-sm">Relatórios carregados: <strong>{contadorRelatorios}</strong></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => loadData(reportFilter.dataInicio, reportFilter.dataFim)}>Atualizar</Button>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Mensagem de dados vazios */}
      {dataIsEmpty && (
        <div className="px-4 text-sm text-gray-600">Nenhum dado disponível para o período selecionado.</div>
      )}

      {/* Seletor de Visualização e Navegação */}
      <div className="mb-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
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

        {/* Seletor de Data */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar período</label>
            <Popover>
              <PopoverTrigger asChild>
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
          {/* Botão de aplicar filtro pode ser opcional, pois o filtro é aplicado automaticamente ao selecionar */}
          {/* <div>
            <Button
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {}} // Não é mais necessário um clique explícito
              disabled={loading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Aplicar Filtro
            </Button>
          </div> */}
        </div>

        {/* Conteúdo Principal - Gráficos */}
        <div className="w-full">
          {/* Visualização Compacta */}
          <div className={viewMode === 'compact' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {periods.map((p, index) => {
                // Simula a mudança de período alterando o filtro de data
                // Na prática, o usuário escolhe o período no calendário
                // Este bloco pode ser simplificado ou removido se o calendário for o único controle
                // Vamos manter para demonstrar a funcionalidade, mas ele não muda os dados diretamente
                // Os dados são filtrados pelo `reportFilter` que é controlado pelo calendário.

                const agg = aggregateForRange(p.key);
                const allProductsForChart = agg.productData.slice().sort((a, b) => b.value - a.value);
                const batidas = agg.filteredCount || 0;

                return (
                  <Card key={p.key} className="shadow-lg">
                    <CardHeader className="text-center py-2">
                      <CardTitle className="text-lg font-semibold text-gray-800">{p.label}</CardTitle>
                      <CardDescription>Distribuição de produtos</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center p-2">
                      <div className="w-48 h-48 md:w-56 md:h-56" style={{ minWidth: "12rem", minHeight: "12rem" }}>
                        <ChartContainer config={chartConfig} className="w-full h-full">
                          <PieChart width={200} height={200}>
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
                        <div className="text-lg font-bold text-gray-900">Total: {agg.productTotal.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg</div>
                        <div className="text-sm text-gray-600">Batidas: {batidas}</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Visualização em Carrossel */}
          <div className={viewMode === 'carousel' ? 'block' : 'hidden'}>
            {/* Seletor de Período no Carrossel */}
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

            <div className="flex justify-center space-x-2 mb-3">
              {periods.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all ${index === activeReportIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'}`}
                  onClick={() => setActiveReportIndex(index)}
                  aria-label={`Ir para relatório ${index + 1}`}
                />
              ))}
            </div>

            {/* Conteúdo do Carrossel */}
            {periods.map((p, index) => {
              if (index !== activeReportIndex) return null;

              const agg = aggregateForRange(p.key);
              const allProductsForChart = agg.productData.slice().sort((a, b) => b.value - a.value);
              const batidas = agg.filteredCount || 0;
              const limitedProducts = allProductsForChart.slice(0, 12);

              return (
                <div key={p.key} className="flex flex-col md:flex-row gap-4 px-4">
                  {/* Gráfico de Pizza */}
                  <Card className="shadow-lg w-full md:w-1/2">
                    <CardHeader className="text-center py-3">
                      <CardTitle className="text-lg font-semibold text-gray-800">{p.label}</CardTitle>
                      <CardDescription>Distribuição de produtos</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <div className="w-[280px] h-[280px]" style={{ minWidth: "280px", minHeight: "280px" }}>
                        <ChartContainer config={chartConfig} className="w-full h-full">
                          <PieChart width={280} height={280}>
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
                        <div className="text-lg font-bold text-gray-900">Total: {agg.productTotal.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg</div>
                        <div className="text-sm text-gray-600">Batidas: {batidas}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de Produtos */}
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
                            <div className="font-bold">{t.value.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} {t.unit || 'kg'}</div>
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
                          <span className="font-bold">{agg.productTotal.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Batidas:</span>
                          <span className="font-bold">{batidas}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;