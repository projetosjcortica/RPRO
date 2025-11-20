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

// ✅ Função de formatação brasileira
const formatBR = (value: number, decimals = 3): string => {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(value);
};

// ✅ Tooltip personalizado para gráficos compostos (kg vs %)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const labelsMap: Record<string, string> = {
    entrada: "Entrada",
    saida: "Saída",
    rendimento: "Rendimento",
    perda: "Perda Diária",
    acumulado: "Perda Acumulada",
  };

  return (
    <div className="bg-background p-3 border rounded shadow-sm">
      <p className="font-medium">{label}</p>
      <ul className="mt-1">
        {payload.map((entry: any, index: number) => {
          const value = Number(entry.value);
          let formattedValue = "";
          let displayName = entry.name || labelsMap[entry.dataKey] || entry.dataKey;

          if (displayName.includes("%") || entry.dataKey === "rendimento") {
            formattedValue = `${formatBR(value, 2)}%`;
          } else if (["entrada", "saida", "perda", "acumulado"].includes(entry.dataKey)) {
            formattedValue = `${formatBR(value)} kg`;
          } else {
            formattedValue = formatBR(value);
          }

          return (
            <li key={index} className="flex items-center gap-2 mt-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">{displayName}:</span>
              <span className="font-medium">{formattedValue}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

interface ChartEntradaSaidaPorHorarioProps {
  dados: Array<{ hora: number; entrada: number; saida: number }>;
  bare?: boolean;
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

const COLORS = {
  entrada: "#ef4444",
  saida: "#6b7280",
  rendimento: "#ef4444",
  perda: "#ef4444",
};

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
        <Tooltip
          formatter={(value, name) => {
            let numericValue: number;

            if (Array.isArray(value)) {
              numericValue = Number(value[value.length - 1]);
            } else {
              numericValue = Number(value);
            }

            if (isNaN(numericValue)) return ['', ''];

            const formattedValue = `${formatBR(numericValue)} kg`;
            const nm = String(name || '').toLowerCase();
            const label = nm.includes('entrada') ? 'Entrada' : nm.includes('saída') || nm.includes('saida') ? 'Saída' : String(name || '');
            return [formattedValue, label];
          }}
        />
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
            <Tooltip content={<CustomTooltip />} />
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
        <Tooltip
          formatter={(value, name) => {
            let numericValue: number;

            if (Array.isArray(value)) {
              numericValue = Number(value[value.length - 1]);
            } else {
              numericValue = Number(value);
            }

            if (isNaN(numericValue)) return ['', ''];

            const formattedValue = `${formatBR(numericValue)} kg`;
            const nm = String(name || '').toLowerCase();
            const label = nm.includes('entrada') ? 'Entrada' : nm.includes('saída') || nm.includes('saida') ? 'Saída' : String(name || '');
            return [formattedValue, label];
          }}
        />
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
        <Tooltip content={<CustomTooltip />} />
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
            <Tooltip
              formatter={(value, name) => {
                let numericValue: number;

                if (Array.isArray(value)) {
                  numericValue = Number(value[value.length - 1]);
                } else {
                  numericValue = Number(value);
                }

                if (isNaN(numericValue)) return ['', ''];

                const formattedValue = `${formatBR(numericValue)} kg`;
                const nm = String(name || '').toLowerCase();
                const label = nm.includes('entrada') ? 'Entrada' : nm.includes('saída') || nm.includes('saida') ? 'Saída' : String(name || '');
                return [formattedValue, label];
              }}
            />            
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