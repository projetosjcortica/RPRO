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
import { config } from './CFG'

// Mocks fornecidos pelo projeto (fallback)
import { mockRows as MOCK_ROWS } from "./Testes/mockData"

type Entry = {
  Nome: string
  values: number[]
  Dia?: string // Data no formato DD/MM/YY
  Hora?: string
  Form1?: number
  Form2?: number
}

type FormulaSums = Record<string, number>
type ChartDatum = { name: string; value: number }

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
      const v = Number(value ?? 0);
      if (value <= 0) return;
      productSums[productKey] = (productSums[productKey] || 0) + v;
    });
  }

  const productData = Object.entries(productSums).map(([name, value]) => ({ name, value }));
  const totalProducts = Object.values(productSums).reduce((a, b) => a + b, 0);
  
  return { productData, productSums, totalProducts };
}

// Formatter para tooltips
const tooltipFormatter = (value: string | number | (string | number)[], name: string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  return [name, `: ${numericValue.toLocaleString('pt-BR')} kg`];
};

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realData, setRealData] = useState<boolean>(false)
  const [rows, setRows] = useState<Entry[] | null>(null)
  const [dataIsEmpty, setDataIsEmpty] = useState<boolean>(false)
 

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

          const mapped: Entry[] = (tableResult.rows || []).map((r: any) => {
            const values: number[] = [];
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
            } as Entry
          })

          loadedRows = mapped
          usingRealData = true
        } catch (e) {
          console.warn('Falha ao carregar via backend, caindo para MOCK:', e)
        }
      }

      if (!usingRealData) {
        loadedRows = MOCK_ROWS as unknown as Entry[]
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
    loadData()
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
    { key: '30dias', label: '30 dias' },
    { key: '15dias', label: '15 dias' },
    { key: 'ontem', label: 'Ontem' },
  ]

  function aggregateForRange(periodKey: string) {
    if (!rows) return { chartData: [] as ChartDatum[], sums: {} as FormulaSums, total: 0, productData: [] as ChartDatum[], productTotal: 0, filteredCount: 0 }
    
    let filtered: Entry[]
    
    // console.log('=== FILTERING FOR PERIOD:', periodKey, '===')
    console.log('Total rows available:', rows.length)
    
    switch(periodKey) {
      case '30dias':
        // Para 30 dias: usar todos os dados
        filtered = rows
        // console.log('30 dias: usando todos os dados')
        break
        
      case '15dias':
        // Para 15 dias: pegar os últimos 15 dias do mês (dias 16-30 de setembro)
        filtered = rows.filter(r => {
          if (!r.Dia) return false
          const dayMatch = r.Dia.match(/^(\d{1,2})\//)
          if (!dayMatch) return false
          const day = parseInt(dayMatch[1], 10)
          return day >= 16 && day <= 30
        })
        // console.log('15 dias: filtrando dias 16-30, encontrados:', filtered.length)
        break
        
      case 'ontem':
        // Para ontem: pegar especificamente os dias 29 e 30
        filtered = rows.filter(r => {
          if (!r.Dia) return false
          const dayMatch = r.Dia.match(/^(\d{1,2})\//)
          if (!dayMatch) return false
          const day = parseInt(dayMatch[1], 10)
          return day === 19 || day === 20
        })
        // console.log('Ontem: filtrando dias 19 e 20, encontrados:', filtered.length)
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
    // console.log('=== END DEBUG ===')
    
    return { chartData, sums: formulaSums, total, productData, productTotal: totalProducts, filteredCount: filtered.length }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Status bar */}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {realData ? (
              <span className="px-2 py-1 rounded bg-green-100 text-green-700">Dados reais do backend</span>
            ) : (
              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">Usando dados mock</span>
            )}
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
        </div>
        {dataIsEmpty && (
          <div className="px-4 text-sm text-gray-600">Nenhum dado disponível para o período selecionado.</div>
        )}
        {/* Charts Grid - Gráficos de Pizza */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Distribuição por Período</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {periods.map((p) => {
              const agg = aggregateForRange(p.key)
              const allProductsForChart = agg.productData.slice().sort((a, b) => b.value - a.value)
              const batidas = agg.filteredCount || 0
              
              return (
                <Card key={p.key} className="shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg font-semibold text-gray-800">{p.label}</CardTitle>
                    <CardDescription>Distribuição de produtos</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="w-64 h-64">
                      <ChartContainer config={chartConfig} className="w-64 h-64">
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
                            innerRadius={50} 
                            labelLine={false}
                          >
                            {allProductsForChart.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-lg font-bold text-gray-900">Total: {agg.productTotal.toLocaleString('pt-BR')} kg</div>
                      <div className="text-sm text-gray-600">Batidas: {batidas}</div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Products Lists */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Detalhamento por Produtos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {periods.map((p) => {
              const agg = aggregateForRange(p.key)
              const allProducts = agg.productData.slice().sort((a, b) => b.value - a.value)
              const batidas = agg.filteredCount || 0
              
              return (
                <Card key={p.key} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-800">Todos os Produtos - {p.label}</CardTitle>
                    <CardDescription>Lista detalhada de produtos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4 h-80 overflow-y-auto">
                      {allProducts.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="font-medium">{t.name}</span>
                          </div>
                          <div className="font-bold">{t.value.toLocaleString("pt-BR")} kg</div>
                        </div>
                      ))}
                      {allProducts.length === 0 && (
                        <div className="text-gray-500 text-sm text-center py-4">
                          Nenhum produto no período
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 border-t pt-2">
                      <div className="flex justify-between">
                        <span>Total Produtos:</span>
                        <span className="font-bold">{agg.productTotal.toLocaleString("pt-BR")} kg</span>
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