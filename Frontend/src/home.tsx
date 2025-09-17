import { useEffect, useMemo, useState } from "react"
import { Pie, PieChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Package, AlertCircle, Database, FileUp } from "lucide-react"
import { getProcessador } from './main'
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
  const [testingConnection, setTestingConnection] = useState<boolean>(false)
  const [loadingMockData, setLoadingMockData] = useState<boolean>(false)
  const [dataIsEmpty, setDataIsEmpty] = useState<boolean>(false)

  const loadMockDataToDatabase = async () => {
    setLoadingMockData(true)
    try {
      if (!config.contextoPid) {
        throw new Error('Backend process not available')
      }

      console.log('Loading mock data to database...')
      const processador = getProcessador(config.contextoPid)

      // Usar método de carregar dados de exemplo (se existir)
      try {
        await processador.loadSampleData()
      } catch {
        // Fallback: usar uploadCSVFile
        const mockCSVPath = 'mock-data.csv'
        await processador.uploadCSVFile(mockCSVPath)
      }
      
      setError('✅ Dados de exemplo carregados com sucesso!')
      
      // Recarregar dados para ver os novos dados
      setTimeout(() => loadData(), 1000)
      
    } catch (error: any) {
      console.error('Error loading mock data:', error)
      setError(`❌ Erro ao carregar dados de exemplo: ${error.message}`)
    } finally {
      setLoadingMockData(false)
    }
  }

  const testBackendConnection = async () => {
    setTestingConnection(true)
    try {
      // PIDs mais ativos dos logs: 6236 e 8652 (que estão respondendo)
      const availablePids = [8652, 6236, 11844, 23324, 3512] // Tentar dos mais ativos primeiro
      
      let connectedPid = null
      let lastError = null
      
      for (const pid of availablePids) {
        try {
          console.log(`Testing connection with PID: ${pid}`)
          const processador = getProcessador(pid)
          
          // Teste mais simples: apenas tentar obter dados sem filtros
          const tableResult = await processador.getTableData(1, 10)
          console.log(`Backend connection successful with PID ${pid}:`, tableResult)
          
          connectedPid = pid
          break
        } catch (error: any) {
          console.log(`PID ${pid} failed:`, error.message)
          lastError = error
          continue
        }
      }
      
      if (connectedPid) {
        // Se funcionou, atualizar o PID global e recarregar dados
        config.contextoPid = connectedPid
        setError(`✅ Conectado com sucesso ao PID ${connectedPid}`)
        await loadData()
      } else {
        throw lastError || new Error('Nenhum PID disponível respondeu')
      }
      
    } catch (error: any) {
      console.error('Backend connection test failed:', error)
      setError(`❌ Teste de conexão falhou: ${error.message}`)
    } finally {
      setTestingConnection(false)
    }
  }

  const loadData = async (retryCount = 0) => {
    try {
      setLoading(true)
      setError(null)

      let loadedRows: Entry[] = []
      let usingRealData = false

      // Tentar carregar dados do backend primeiro
      if (config.contextoPid) {
        try {
          console.log(`Loading data from backend... (attempt ${retryCount + 1})`)
          
          const processador = getProcessador(config.contextoPid)

          // Buscar dados da tabela
          const tableResult = await processador.getTableData(1, 300, {
            dateStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateEnd: new Date().toISOString().split('T')[0]
          })

          if (tableResult?.batidas && tableResult.batidas.length > 0) {
            // Converter dados do backend para o formato esperado
            loadedRows = tableResult.batidas.map((r: any) => ({
              Nome: r.Nome ?? "Desconhecido",
              values: Array.isArray(r.values) ? r.values : [r.Form1 || 0],
              Dia: r.Dia,
              Hora: r.Hora,
              Form1: r.Form1,
              Form2: r.Form2
            }))
            usingRealData = true
            console.log('Data loaded from backend:', loadedRows.length, 'rows')
          } else {
            console.log('Backend returned empty data, using mock data')
            throw new Error('Backend returned empty data')
          }
        } catch (error: any) {
          console.error('Error loading data from backend:', error)
          
          // Retry logic para timeouts
          if (error.message.includes('Timeout') && retryCount < 2) {
            console.log(`Retrying data load in 2 seconds... (${retryCount + 1}/2)`)
            setTimeout(() => loadData(retryCount + 1), 2000)
            return
          }
          
          // Usar dados mock em caso de erro
          usingRealData = false
        }
      }

      // Se não conseguiu carregar do backend, usar dados mock
      if (!usingRealData) {
        loadedRows = (MOCK_ROWS || []).map((r: any) => ({
          Nome: r.Nome ?? "Desconhecido",
          values: Array.isArray(r.values) && r.values.length ? r.values : [0],
          Dia: r.Dia,
          Hora: r.Hora,
          Form1: r.Form1,
          Form2: r.Form2
        }))
        console.log('Using mock data:', loadedRows.length, 'rows')
      }

      setRows(loadedRows)
      setRealData(usingRealData)

      // Detectar se os dados estão vazios
      const isEmpty = loadedRows.length === 0 || loadedRows.every(r => !r.values || r.values.every(v => v <= 0))
      setDataIsEmpty(isEmpty && usingRealData)

      console.log('Data loaded successfully:', { 
        rowsCount: loadedRows.length, 
        usingRealData, 
        isEmpty 
      })

    } catch (error: any) {
      console.error('Error in loadData:', error)
      setError(error.message || 'Failed to load data')
      
      // Usar dados mock como fallback final
      const fallbackRows = (MOCK_ROWS || []).map((r: any) => ({
        Nome: r.Nome ?? "Desconhecido",
        values: Array.isArray(r.values) && r.values.length ? r.values : [0],
        Dia: r.Dia,
        Hora: r.Hora,
        Form1: r.Form1,
        Form2: r.Form2
      }))
      setRows(fallbackRows)
      setRealData(false)
      setDataIsEmpty(false)
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
    
    console.log('=== FILTERING FOR PERIOD:', periodKey, '===')
    console.log('Total rows available:', rows.length)
    
    switch(periodKey) {
      case '30dias':
        // Para 30 dias: usar todos os dados
        filtered = rows
        console.log('30 dias: usando todos os dados')
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
        console.log('15 dias: filtrando dias 16-30, encontrados:', filtered.length)
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
        console.log('Ontem: filtrando dias 19 e 20, encontrados:', filtered.length)
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
    console.log('=== END DEBUG ===')
    
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
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard de Produtos</h1>
          <p className="text-gray-600 text-lg">Análise de consumo e tendências</p>
          
          {/* Test Connection Button */}
          <div className="mt-4 mb-4 flex gap-2 justify-center">
            <button
              onClick={testBackendConnection}
              disabled={testingConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingConnection ? 'Testando PIDs disponíveis...' : 'Testar Conexão Backend'}
            </button>
            
            <button
              onClick={() => {
                setError(null)
                loadData()
              }}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Carregando...' : 'Recarregar Dados'}
            </button>
          </div>
          
          {/* Status indicator */}
          <div className="mt-4 flex flex-col items-center gap-2">
            {config.contextoPid && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">
                  PID Ativo: {config.contextoPid}
                </span>
              </div>
            )}
            
            {error && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {error}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Empty Data Warning */}
        {realData && dataIsEmpty && (
          <div className="mb-8">
            <Card className="border-2 border-dashed border-orange-300 bg-orange-50">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Database className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-orange-900">Banco de Dados Vazio</CardTitle>
                <CardDescription className="text-orange-700">
                  A conexão com o backend está funcionando, mas não há dados no banco de dados para exibir.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-orange-800 mb-4">
                  Para ver o dashboard funcionando com dados reais, você pode:
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={loadMockDataToDatabase}
                    disabled={loadingMockData}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Database className="h-4 w-4" />
                    {loadingMockData ? 'Carregando dados...' : 'Carregar Dados de Exemplo'}
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = '.csv'
                      input.onchange = async (e: any) => {
                        const file = e.target.files[0]
                        if (file) {
                          try {
                            setLoadingMockData(true)
                            const processador = getProcessador(config.contextoPid!)
                            await processador.uploadCSVFile(file.path)
                            setError('✅ Arquivo CSV carregado com sucesso!')
                            setTimeout(() => loadData(), 1000)
                          } catch (error: any) {
                            setError(`❌ Erro ao carregar CSV: ${error.message}`)
                          } finally {
                            setLoadingMockData(false)
                          }
                        }
                      }
                      input.click()
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FileUp className="h-4 w-4" />
                    Importar Arquivo CSV
                  </button>
                </div>
                <p className="text-xs text-orange-600 mt-3">
                  💡 Os gráficos abaixo mostram dados de exemplo para demonstração
                </p>
              </CardContent>
            </Card>
          </div>
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

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {realData ? (
              dataIsEmpty ? (
                <span className="text-orange-600">
                  🗄️ Banco conectado mas vazio - usando dados de demonstração
                </span>
              ) : (
                <span className="text-green-600">
                  ✅ Exibindo dados reais do banco de dados
                </span>
              )
            ) : (
              <span className="text-blue-600">
                🔄 Usando dados de fallback - verifique a conexão com o backend
              </span>
            )}
          </p>
          {config.contextoPid && (
            <p className="text-gray-400 text-xs mt-1">
              PID: {config.contextoPid} | Atualizado: {new Date().toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}