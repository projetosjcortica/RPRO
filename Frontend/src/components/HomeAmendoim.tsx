import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Package, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { TableComponent } from "../TableComponent";
import {
  ChartEntradaSaidaPorHorario,
  ChartRendimentoPorDia,
  ChartFluxoSemanal,
  ChartEficienciaPorTurno,
  ChartPerdaAcumulada,
} from "./AmendoimCharts";

interface DadosAnalise {
  entradaSaidaPorHorario: Array<{ hora: number; entrada: number; saida: number }>;
  rendimentoPorDia: Array<{ dia: string; entrada: number; saida: number; rendimento: number }>;
  fluxoSemanal: Array<{ diaSemana: string; entrada: number; saida: number }>;
  eficienciaPorTurno: Array<{ turno: string; entrada: number; saida: number; rendimento: number }>;
  perdaAcumulada: Array<{ dia: string; perdaDiaria: number; perdaAcumulada: number }>;
}

interface Metricas {
  pesoEntrada: number;
  pesoSaida: number;
  rendimentoPercentual: number;
  perda: number;
  perdaPercentual: number;
}

export default function HomeAmendoim() {
  const [loading, setLoading] = useState(true);
  const [dadosAnalise, setDadosAnalise] = useState<DadosAnalise | null>(null);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [tabelaDados, setTabelaDados] = useState<any[] | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);

        // Carregar dados de análise pré-processados
        const resAnalise = await fetch("http://localhost:3000/api/amendoim/analise");
        const analise = await resAnalise.json();
        setDadosAnalise(analise);

        // Carregar métricas de rendimento
        const resMetricas = await fetch("http://localhost:3000/api/amendoim/metricas/rendimento");
        const metricas = await resMetricas.json();
        setMetricas(metricas);

        // Carregar amostra de registros para tabela (primeira página)
        try {
          const params = new URLSearchParams({ page: '1', pageSize: '50' });
          const resRegs = await fetch(`http://localhost:3000/api/amendoim/registros?${params}`);
          if (resRegs.ok) {
            const json = await resRegs.json();
            // transformar para colunas esperadas pela TableComponent
            const rows = (json.rows || []).map((r: any) => ({
              Dia: r.dia || r.Dia || "",
              Hora: r.hora || r.Hora || "",
              Nome: r.nomeProduto || r.nome || r.Nome || "",
              Codigo: r.codigoCaixa || r.codigo || r.Codigo || "",
              Numero: r.codigoProduto || r.numero || r.Numero || "",
              Peso: r.peso || r.Peso || 0,
            }));
            setTabelaDados(rows);
          }
        } catch (e) {
          console.warn('Erro ao carregar registros para tabela:', e);
          setTabelaDados(null);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-gray-600 text-lg">Carregando análises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-auto p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6"> 

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peso Total Entrada</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metricas?.pesoEntrada || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })} kg
              </div>
              <p className="text-xs text-muted-foreground">Matéria-prima recebida</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peso Total Saída</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metricas?.pesoSaida || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })} kg
              </div>
              <p className="text-xs text-muted-foreground">Produto processado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rendimento</CardTitle>
              <Activity className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metricas?.rendimentoPercentual || 0).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Taxa de aproveitamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perda</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{((metricas?.perda || 0) / 1000).toFixed(2)}t</div>
              <p className="text-xs text-muted-foreground">{(metricas?.perdaPercentual || 0).toFixed(1)}% do total</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Análise */}
        <div className="space-y-6">
          {dadosAnalise && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartEntradaSaidaPorHorario dados={dadosAnalise.entradaSaidaPorHorario} />
                <ChartRendimentoPorDia dados={dadosAnalise.rendimentoPorDia} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartFluxoSemanal dados={dadosAnalise.fluxoSemanal} />
                <ChartEficienciaPorTurno dados={dadosAnalise.eficienciaPorTurno} />
                <ChartPerdaAcumulada dados={dadosAnalise.perdaAcumulada} />
              </div>
            </>
          )}
        </div>
        {/* Tabela de análises (apenas amendoim) */}
        {tabelaDados && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tabela de Análises - Amendoim</CardTitle>
              </CardHeader>
              <CardContent>
                <TableComponent
                  dados={tabelaDados}
                  useExternalData={true}
                  page={1}
                  pageSize={50}
                  colLabels={{ Dia: "Dia", Hora: "Hora", Nome: "Produto", Codigo: "Cód. Caixa", Numero: "Cód. Produto", Peso: "Peso (kg)" }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
