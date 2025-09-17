import { useEffect, useMemo, useState } from "react"
import { Pie, PieChart, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./components/ui/chart"

// Mocks fornecidos pelo projeto
import { mockRows as MOCK_ROWS } from "./Testes/mockData"

type Entry = {
  Nome: string
  values: number[]
  Dia?: string // Data no formato DD/MM/YY
}

type FormulaSums = Record<string, number>
type ChartDatum = { name: string; value: number }

const COLORS = ["#ff2626ff", "#5e5e5eff", "#d4d4d4ff", "#ffa8a8ff", "#1b1b1bff"]

function aggregate(rows: Entry[]): { chartData: ChartDatum[]; formulaSums: FormulaSums; validCount: number } {
  const valid = rows.filter(r => r && r.Nome && Array.isArray(r.values) && r.values.length > 0)
  const sums: FormulaSums = {}
  for (const r of valid) {
    const key = r.Nome
    const v = Number(r.values[0] ?? 0)
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


// Corrigindo o formatter para o tipo correto
const tooltipFormatter = (value: string | number | (string | number)[], name: string) => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : Number(value);
  // Da pra corrigir pra um pais especifico
  return [name, `: ${numericValue.toLocaleString('pt-BR')} kg`];
};

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<Entry[] | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // Simula fetch curto para UX; já temos os mocks localmente
        // await new Promise(r => setTimeout(r, 300))
        const normalized: Entry[] = (MOCK_ROWS || []).map((r: any) => ({
          Nome: r.Nome ?? "Desconhecido",
          values: Array.isArray(r.values) && r.values.length ? r.values : [0],
          Dia: r.Dia, // Preservar informação de data
        }))
        if (!mounted) return
        setRows(normalized)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
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
        console.log('Ontem: filtrando dias 29 e 30, encontrados:', filtered.length)
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

  return (
    <div className="min-h-screen py-4 px-2 flex flex-col justify-center items-center">
      <div className="max-w-full mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
              <p className="mt-2 text-sm">Carregando...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-red-500 p-4 bg-red-50 rounded">
              <p className="text-sm">Erro: {error}</p>
              <button onClick={() => location.reload()} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">Tentar Novamente</button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-30 mb-4">
              {periods.map((p) => {
                const agg = aggregateForRange(p.key)
                // Usar todos os produtos no gráfico de pizza (apenas dados filtrados por data)
                const allProductsForChart = agg.productData.slice().sort((a, b) => b.value - a.value)
                
                // Usar o count filtrado da função aggregateForRange
                const batidas = agg.filteredCount || 0
                
                return (
                  <div key={p.key} className=" p-3 flex flex-col items-center">
                    <div className="mb-2 text-sm font-medium">{p.label}</div>
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
                    <div className="mt-2 text-xs text-center">
                      <div>Total: {agg.productTotal} kg</div>
                      <div>Batidas: {batidas}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-30 scrollbar-custom scrollbar-thin">
              {periods.map((p) => {
                const agg = aggregateForRange(p.key)
                // Usar todos os produtos filtrados por data
                const allProducts = agg.productData.slice().sort((a, b) => b.value - a.value)
                
                // Usar o count filtrado da função aggregateForRange
                const batidas = agg.filteredCount || 0
                
                return (
                  <div key={p.key} className=" p-3">
                    <div className="text-xs font-medium mb-2 ">Todos os Produtos - {p.label}</div>
                    <div className="space-y-1 mb-2 h-73 overflow-y-auto">
                      {allProducts.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-1 bg-gray-50 rounded text-xs">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span>{t.name}</span>
                          </div>
                         <div>Total: {agg.productTotal.toLocaleString("pt-BR")} kg</div>

                        </div>
                      ))}
                      {allProducts.length === 0 && <div className="text-gray-500 text-xs">Nenhum produto no período</div>}
                    </div>
                    <div className="text-xs text-gray-600 border-t pt-1">
                      <div>
  Total Produtos: {agg.productTotal.toLocaleString("pt-BR")} kg | Batidas: {batidas}
</div>

                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}