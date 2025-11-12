import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface ChartEntradaSaidaPorHorarioProps {
  dados: Array<{ hora: number; entrada: number; saida: number }>;
  bare?: boolean; // quando true, renderiza apenas o gráfico, sem Card/headers
}

interface ChartRendimentoPorDiaProps {
  dados: Array<{ dia: string; entrada: number; saida: number; rendimento: number }>;
}

interface ChartFluxoSemanalProps {
  dados: Array<{ diaSemana: string; entrada: number; saida: number }>;
  bare?: boolean;
}

interface ChartEficienciaPorTurnoProps {
  dados: Array<{ turno: string; entrada: number; saida: number; rendimento: number }>;
  bare?: boolean;
}

interface ChartPerdaAcumuladaProps {
  dados: Array<{ dia: string; perdaDiaria: number; perdaAcumulada: number }>;
}

// Cores do tema
const COLORS = {
  entrada: "#ef4444",   // red-500
  saida: "#6b7280",     // gray-500
  rendimento: "#ef4444", // red-500
  perda: "#ef4444",     // red-500
};

/**
 * Gráfico de Entrada vs Saída por Horário
 * Agrupa registros por hora do dia e compara peso entrada vs saída
 */
export function ChartEntradaSaidaPorHorario({ dados, bare }: ChartEntradaSaidaPorHorarioProps) {
  const data = dados?.map((d) => ({
    hora: `${String(d.hora).padStart(2, "0")}:00`,
    entrada: Math.max(0, Math.round(d.entrada * 100) / 100),
    saida: Math.max(0, Math.round(d.saida * 100) / 100),
  })) || [];

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hora" />
        <YAxis />
        <Tooltip formatter={(value: number) => `${(value as number).toFixed(2)} kg`} />
        <Legend />
        <Bar dataKey="entrada" fill={COLORS.entrada} name="Entrada" />
        <Bar dataKey="saida" fill={COLORS.saida} name="Saída" />
      </BarChart>
    </ResponsiveContainer>
  );

  if (bare) {
    return data.length === 0 ? (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        Sem dados para o período selecionado
      </div>
    ) : chart;
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entrada vs Saída por Horário</CardTitle>
          <CardDescription>Peso total processado por hora do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sem dados suficientes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrada vs Saída por Horário</CardTitle>
        <CardDescription>Peso total (kg) processado por hora do dia</CardDescription>
      </CardHeader>
      <CardContent>{chart}</CardContent>
    </Card>
  );
}

/**
 * Gráfico de Rendimento por Dia
 * Mostra entrada, saída e percentual de rendimento dia a dia (dados pré-processados)
 */
export function ChartRendimentoPorDia({ dados }: ChartRendimentoPorDiaProps) {
  const data = dados.map((d) => ({
    ...d,
    entrada: Math.max(0, Math.round(d.entrada * 100) / 100),
    saida: Math.max(0, Math.round(d.saida * 100) / 100),
    rendimento: Math.max(0, Math.min(100, Math.round(d.rendimento * 100) / 100)),
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimento Diário</CardTitle>
          <CardDescription>Entrada, saída e rendimento por dia</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sem dados suficientes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimento Diário</CardTitle>
        <CardDescription>Entrada, saída (kg) e rendimento (%) por dia</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="entrada" fill={COLORS.entrada} name="Entrada (kg)" />
            <Bar yAxisId="left" dataKey="saida" fill={COLORS.saida} name="Saída (kg)" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="rendimento"
              stroke={COLORS.rendimento}
              strokeWidth={2}
              name="Rendimento (%)"
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Gráfico de Fluxo Semanal
 * Visualização da variação entrada vs saída ao longo da semana (dados pré-processados)
 */
export function ChartFluxoSemanal({ dados, bare }: ChartFluxoSemanalProps) {
  const data = dados?.map((d) => ({
    dia: d.diaSemana,
    entrada: Math.max(0, Math.round(d.entrada * 100) / 100),
    saida: Math.max(0, Math.round(d.saida * 100) / 100),
  })) || [];

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="dia" />
        <YAxis />
        <Tooltip formatter={(value: number) => `${(value as number).toFixed(2)} kg`} />
        <Legend />
        <Bar dataKey="entrada" fill="#ef4444" name="Entrada" />
        <Bar dataKey="saida" fill="#6b7280" name="Saída" />
      </BarChart>
    </ResponsiveContainer>
  );

  if (bare) {
    return data.length === 0 ? (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        Sem dados para o período selecionado
      </div>
    ) : chart;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo Semanal</CardTitle>
        <CardDescription>Distribuição de entrada e saída por dia da semana</CardDescription>
      </CardHeader>
      <CardContent>{chart}</CardContent>
    </Card>
  );
}

/**
 * Gráfico de Eficiência por Período (Turnos)
 * Dados pré-processados do backend
 */
export function ChartEficienciaPorTurno({ dados, bare }: ChartEficienciaPorTurnoProps) {
  const data = dados?.map((d) => ({
    turno: d.turno,
    entrada: Math.max(0, Math.round(d.entrada * 100) / 100),
    saida: Math.max(0, Math.round(d.saida * 100) / 100),
    rendimento: Math.max(0, Math.min(100, Math.round(d.rendimento * 100) / 100)),
  })) || [];

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="turno" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="entrada" fill={COLORS.entrada} name="Entrada (kg)" />
        <Bar yAxisId="left" dataKey="saida" fill={COLORS.saida} name="Saída (kg)" />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="rendimento"
          stroke={COLORS.rendimento}
          strokeWidth={2}
          name="Rendimento (%)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );

  if (bare) {
    return data.length === 0 ? (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        Sem dados para o período selecionado
      </div>
    ) : chart;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eficiência por Turno</CardTitle>
        <CardDescription>Entrada, saída e rendimento por período do dia</CardDescription>
      </CardHeader>
      <CardContent>{chart}</CardContent>
    </Card>
  );
}

/**
 * Gráfico de Perda/Ganho Acumulado
 * Dados pré-processados do backend
 */
export function ChartPerdaAcumulada({ dados }: ChartPerdaAcumuladaProps) {
  const data = dados.map((d) => ({
    dia: d.dia,
    perda: Math.abs(Math.round(d.perdaDiaria * 100) / 100),
    acumulado: Math.abs(Math.round(d.perdaAcumulada * 100) / 100),
  }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perda Acumulada</CardTitle>
          <CardDescription>Evolução da diferença entrada-saída</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sem dados suficientes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perda Acumulada</CardTitle>
        <CardDescription>Diferença entrada-saída (kg) ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)} kg`} />
            <Legend />
            <Area
              type="monotone"
              dataKey="perda"
              stroke={COLORS.perda}
              fill={COLORS.perda}
              fillOpacity={0.3}
              name="Perda Diária"
            />
            <Area
              type="monotone"
              dataKey="acumulado"
              stroke={COLORS.rendimento}
              fill={COLORS.rendimento}
              fillOpacity={0.5}
              name="Perda Acumulada"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
