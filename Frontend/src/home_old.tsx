import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Package, AlertCircle } from "lucide-react"
import { getProcessador } from './main'
import { config } from './CFG'

// Tipos de dados
interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface BarDataItem {
  day: string;
  produtos: number;
}

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Dados de fallback quando não conseguir conectar ao backend
const fallbackPieData: PieDataItem[] = [
  { name: 'Produto A', value: 400, color: '#0088FE' },
  { name: 'Produto B', value: 300, color: '#00C49F' },
  { name: 'Produto C', value: 300, color: '#FFBB28' },
  { name: 'Produto D', value: 200, color: '#FF8042' },
  { name: 'Produto E', value: 100, color: '#8884D8' },
]

const fallbackBarData: BarDataItem[] = [
  { day: 'Seg', produtos: 120 },
  { day: 'Ter', produtos: 190 },
  { day: 'Qua', produtos: 300 },
  { day: 'Qui', produtos: 250 },
  { day: 'Sex', produtos: 400 },
  { day: 'Sab', produtos: 180 },
  { day: 'Dom', produtos: 90 },
]

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realData, setRealData] = useState<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [tableData, setTableData] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Verificar se temos um PID válido
        if (!config.contextoPid) {
          throw new Error('Backend process not available. PID not found.')
        }

        console.log('Loading data from backend...')
        
        // Obter instância do processador
        const processador = getProcessador(config.contextoPid)

        // Buscar dados do gráfico e da tabela em paralelo
        const [chartResult, tableResult] = await Promise.all([
          processador.getChartData(1, 300, {
            dateStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // últimos 30 dias
            dateEnd: new Date().toISOString().split('T')[0]
          }),
          processador.getTableData(1, 300, {
            dateStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dateEnd: new Date().toISOString().split('T')[0]
          })
        ])

        setChartData(chartResult)
        setTableData(tableResult)
        setRealData(true)

        console.log('Data loaded successfully:', { chartResult, tableResult })

      } catch (error: any) {
        console.error('Error loading data from backend:', error)
        setError(error.message || 'Failed to load data from backend')
        setRealData(false)
        
        // Usar dados de fallback
        setChartData({
          productData: fallbackPieData,
          chartData: fallbackBarData,
          productTotal: fallbackPieData.reduce((sum, item) => sum + item.value, 0),
          total: 15000,
          rowsCount: 150
        })
        setTableData({
          total: 1000,
          rowsCount: 150
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Preparar dados para exibição
  const pieData = useMemo((): PieDataItem[] => {
    if (chartData?.productData && Array.isArray(chartData.productData)) {
      return chartData.productData.map((item: any, index: number): PieDataItem => ({
        name: item.name || `Produto ${index + 1}`,
        value: item.value || 0,
        color: item.color || COLORS[index % COLORS.length]
      }))
    }
    return fallbackPieData
  }, [chartData])

  const barData = useMemo((): BarDataItem[] => {
    if (chartData?.chartData && Array.isArray(chartData.chartData)) {
      // Adaptar os dados do backend para o formato esperado
      return chartData.chartData.slice(0, 7).map((item: any, index: number): BarDataItem => ({
        day: item.name || item.day || `Dia ${index + 1}`,
        produtos: item.value || item.produtos || item.count || 0
      }))
    }
    return fallbackBarData
  }, [chartData])

  const totalProdutos = useMemo(() => {
    return pieData.reduce((sum: number, item: PieDataItem) => sum + item.value, 0)
  }, [pieData])

  const totalRegistros = tableData?.rowsCount || 0
  const totalValor = chartData?.total || 0

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
          
          {/* Status indicator */}
          {error && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                {realData ? 'Conectado ao backend' : 'Usando dados de exemplo - Backend indisponível'}
              </span>
            </div>
          )}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Pie Chart - Produtos gastos nos últimos 30 dias */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                Produtos gastos nos últimos 30 dias
              </CardTitle>
              <CardDescription className="text-base">
                Distribuição de consumo por categoria de produto
                {realData && <span className="ml-2 text-green-600">• Dados reais</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), 'Quantidade']}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Summary */}
              <div className="mt-6 text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{totalProdutos.toLocaleString()}</p>
                <p className="text-blue-800 font-medium">Total de produtos consumidos</p>
              </div>
            </CardContent>
          </Card>

          {/* Top Right - Estatísticas */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                Estatísticas Gerais
              </CardTitle>
              <CardDescription className="text-base">
                Resumo dos dados coletados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{totalRegistros.toLocaleString()}</p>
                  <p className="text-blue-800 font-medium">Total de Registros</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">R$ {totalValor.toLocaleString()}</p>
                  <p className="text-green-800 font-medium">Valor Total</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{pieData.length}</p>
                  <p className="text-purple-800 font-medium">Categorias</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bar Chart - Produtos Diários */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                Produtos por Período
              </CardTitle>
              <CardDescription className="text-base">
                Distribuição temporal dos dados
                {realData && <span className="ml-2 text-green-600">• Dados reais</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6b7280"
                      fontSize={14}
                      fontWeight={500}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={14}
                      fontWeight={500}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), 'Produtos']}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="produtos" 
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Trend indicator */}
              <div className="mt-6 flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Média: {Math.round(barData.reduce((sum: number, item: BarDataItem) => sum + item.produtos, 0) / barData.length)} produtos/período
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Right - Conexão Status */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center">
                {realData ? (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-lg font-medium text-green-800">Conectado ao Backend</p>
                    <p className="text-sm text-green-600">Dados em tempo real</p>
                    <p className="text-xs text-gray-500 mt-2">PID: {config.contextoPid}</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-8 w-8 text-yellow-600" />
                    </div>
                    <p className="text-lg font-medium text-yellow-800">Modo Offline</p>
                    <p className="text-sm text-yellow-600">Usando dados de exemplo</p>
                    <p className="text-xs text-gray-500 mt-2">Backend indisponível</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{totalProdutos}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Total Produtos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(barData.reduce((sum: number, item: BarDataItem) => sum + item.produtos, 0) / barData.length)}
                </p>
                <p className="text-sm font-medium text-gray-600 mt-1">Média por Período</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.max(...barData.map((item: BarDataItem) => item.produtos))}
                </p>
                <p className="text-sm font-medium text-gray-600 mt-1">Pico Máximo</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{totalRegistros}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Registros</p>
              </div>
            </CardContent>
          </Card>
        </div>
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
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Pie Chart - Produtos gastos nos últimos 30 dias */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                Produtos gastos nos últimos 30 dias
              </CardTitle>
              <CardDescription className="text-base">
                Distribuição de consumo por categoria de produto
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), 'Quantidade']}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Summary */}
              <div className="mt-6 text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{totalProdutos.toLocaleString()}</p>
                <p className="text-blue-800 font-medium">Total de produtos consumidos</p>
              </div>
            </CardContent>
          </Card>

          {/* Top Right Empty Card - Placeholder */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium">Espaço reservado</p>
                <p className="text-sm">Para futuras métricas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bar Chart - Produtos Diários */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                Produtos Diários durante os últimos dias
              </CardTitle>
              <CardDescription className="text-base">
                Mantendo padrão de semanas de calendários
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6b7280"
                      fontSize={14}
                      fontWeight={500}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={14}
                      fontWeight={500}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), 'Produtos']}
                      labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="produtos" 
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Trend indicator */}
              <div className="mt-6 flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Tendência crescente esta semana (+12%)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Right Empty Card - Placeholder */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium">Espaço reservado</p>
                <p className="text-sm">Para análises adicionais</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{totalProdutos}</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Total Produtos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(barData.reduce((sum, item) => sum + item.produtos, 0) / barData.length)}
                </p>
                <p className="text-sm font-medium text-gray-600 mt-1">Média Diária</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.max(...barData.map(item => item.produtos))}
                </p>
                <p className="text-sm font-medium text-gray-600 mt-1">Pico Diário</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">30</p>
                <p className="text-sm font-medium text-gray-600 mt-1">Dias Analisados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
