import { Document, Page, Text, StyleSheet, View, Font, Image, Svg, G, Circle } from "@react-pdf/renderer";
import { DASHBOARD_COLORS as palette } from './lib/colors';
import type { FC } from "react";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf" }, // Regular
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 60, // espaço para o rodapé
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#333",
    lineHeight: 1.5,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#d1d5db",
    paddingBottom: 10,
  },
  logo: {
    // Fix height to 150 and let width scale to preserve aspect ratio
    width: 100,
    marginRight: 15,
  },
  titleContainer: { flex: 1 },
  // ensure title can wrap under logo when space is constrained
  titleWrapper: { flexGrow: 1, minWidth: 100 },
  title: { fontSize: 24, fontWeight: "bold", color: "#af1e1eff", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6f6f6fff", marginTop: 4, marginBottom: 5 },
  section: { marginBottom: 20, flexDirection: "column" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "#dadadaff",
    padding: 6,
    borderRadius: 4,
    marginBottom: 10,
    color: "#af1e1eff",
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { fontWeight: "bold", color: "#374151" },
  value: { textAlign: "right" },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    flexDirection: "column",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableRow: { flexDirection: "row" },
  tableRowEven: { flexDirection: "row", backgroundColor: "#f9fafb" },
  tableColHeader: {
    width: "70%",
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#e2e2e2ff",
    padding: 8,
    fontWeight: "bold",
    color: "#af1e1eff",
  },
  tableColHeaderSmall: {
    width: "30%",
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#e5e7eb",
    padding: 8,
    fontWeight: "bold",
    color: "#af1e1eff",
    textAlign: "right",
  },
  tableCol: { width: "70%", borderBottomWidth: 1, borderColor: "#d1d5db", padding: 8 },
  tableColSmall: { width: "30%", borderBottomWidth: 1, borderColor: "#d1d5db", padding: 8, textAlign: "right" },
  comentarioContainer: { marginBottom: 10, padding: 8, backgroundColor: "#f8f9fa", borderRadius: 4 },
  comentarioMeta: { fontSize: 10, color: "#666", marginBottom: 4 },
  comentarioTexto: { fontSize: 11 },
  // Chart styles
  chartSection: { marginBottom: 10 },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  chartLabel: { width: '30%', fontSize: 10, color: '#374151' },
  chartBarContainer: { width: '55%', height: 12, backgroundColor: '#e6e7ea', borderRadius: 4, overflow: 'hidden', marginRight: 6 },
  chartBarFill: { height: 12, backgroundColor: '#af1e1eff' },
  chartValue: { width: '10%', fontSize: 9, textAlign: 'right', color: '#374151' },
  // donut
  donutContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  donutBox: { width: '35%', alignItems: 'center', justifyContent: 'center' },
  donutSvg: { width: 120, height: 120 },
  donutCenterText: { position: 'absolute', fontSize: 10, textAlign: 'center', width: 120 },
  legend: { width: '60%', flexDirection: 'column' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendColorBox: { width: 10, height: 10, borderRadius: 2, marginRight: 6 },
  smallNote: { fontSize: 9, color: '#6b7280' },
});

interface Produto {
  nome: string;
  qtd: number;
  categoria?: string;
}
interface ComentarioRelatorio {
  texto: string;
  data?: string;
  autor?: string;
}

export interface MyDocumentProps {
  logoUrl?: string;
  total?: number;
  batidas?: number;
  periodoInicio?: string;
  periodoFim?: string;
  formulas?: { numero: number; nome: string; quantidade: number; porcentagem: number; somatoriaTotal: number }[];
  produtos: { nome: string; qtd: number; unidade?: string; categoria?: string }[];
  data?: string;
  empresa?: string;
  observacoes?: string;
  orientation?: "portrait" | "landscape";
  formulaSums?: Record<string, number>;
  chartData?: { name: string; value: number }[];
  comentarios?: ComentarioRelatorio[];
}

export const MyDocument: FC<MyDocumentProps> = ({
  logoUrl,
  total = 0,
  batidas = 0,
  periodoInicio = "-",
  periodoFim = "-",
  formulas = [],
  produtos = [],
  data = new Date().toLocaleDateString("pt-BR"),
  empresa = "Relatório RPRO",
  observacoes = "",
  orientation = "portrait",
  formulaSums = {},
  chartData = [],
  comentarios = [],
}) => {
  const dataGeracao = new Date().toLocaleString("pt-BR");

  const produtosPorCategoria: Record<string, Produto[]> = {};
  produtos.forEach((p) => {
    const cat = p.categoria || "Sem Categoria";
    if (!produtosPorCategoria[cat]) produtosPorCategoria[cat] = [];
    produtosPorCategoria[cat].push(p);
  });
  const categorias = Object.keys(produtosPorCategoria).sort();

  // Prepare chart source outside of JSX so it's available during render
  const _chartSource: { name: string; value: number }[] = [];
  if (chartData && Array.isArray(chartData) && chartData.length > 0) {
    for (const c of chartData) _chartSource.push({ name: String(c.name), value: Number(c.value) || 0 });
  } else if (formulaSums && Object.keys(formulaSums).length > 0) {
    for (const [k, v] of Object.entries(formulaSums)) _chartSource.push({ name: k, value: Number(v) || 0 });
  }
  const chartSource = _chartSource;
  const chartTop = chartSource.length > 0 ? chartSource.slice().sort((a, b) => b.value - a.value).slice(0, 10) : [];

  // use shared palette, fallback to an extended local palette if needed
  const extendedPalette = palette;

  const renderRodape = () => (
    <>
      <Text
        fixed
        style={{
          position: "absolute",
          bottom: 20,
          left: 30,
          fontSize: 10,
          color: "#bbbbbbff",
        }}
      >
        Relatório gerado em {dataGeracao} por J.Cortiça
      </Text>
      <Text
        fixed
        style={{
          position: "absolute",
          bottom: 20,
          right: 30,
          fontSize: 10,
          color: "#bbbbbbff",
        }}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </>
  );

  const renderTable = (
    rows: any[],
    keyMapper: (row: any) => { col1: string; col2: string }
  ) => (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <Text style={styles.tableColHeader}>Nome</Text>
        <Text style={styles.tableColHeaderSmall}>Total</Text>
      </View>
      {rows.map((row, i) => {
        const { col1, col2 } = keyMapper(row);
        return (
          <View
            key={i}
            style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}
          >
            <Text style={styles.tableCol}>{col1}</Text>
            <Text style={styles.tableColSmall}>{col2}</Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <Document>
      {/* Página 1 */}
      <Page size="A4" style={styles.page} orientation={orientation}>
        <View style={styles.header}>
          {/* Logo à esquerda */}
          {logoUrl && (
            <Image
              src={logoUrl}
              style={styles.logo}
              // preserve aspect ratio; react-pdf will scale width accordingly when only height provided
            />
          )}
          <View style={styles.titleContainer}>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>{empresa}</Text>
              <Text style={styles.subtitle}>
                Relatório de Produção - {data}
              </Text>
            </View>
          </View>
        </View>

        {/* Informações gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>

          <View style={{ marginBottom: 6 }}>
            <Text style={styles.label}>
              Total:{" "}
              <Text style={styles.value}>
                {total.toLocaleString("pt-BR", { minimumFractionDigits: 3 })} kg
              </Text>
            </Text>
          </View>

          <View style={{ marginBottom: 6 }}>
            <Text style={styles.label}>
              Batidas: <Text style={styles.value}>{batidas}</Text>
            </Text>
          </View>

          <View style={{ marginBottom: 6 }}>
            <Text style={styles.label}>
              Data inicial: <Text style={styles.value}>{periodoInicio}</Text>
            </Text>
          </View>

          <View style={{ marginBottom: 6 }}>
            <Text style={styles.label}>
              Data final: <Text style={styles.value}>{periodoFim}</Text>
            </Text>
          </View>
        </View>

        {/* Fórmulas */}
        {formulas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo por Fórmula</Text>
            {renderTable(formulas, (f) => ({
              col1: f.nome,
              col2: (f.somatoriaTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 3,
              })+" kg"),
            }))}
          </View>
        )}

        {Object.keys(formulaSums).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Somatória por Fórmula (cálculo)
            </Text>
            {renderTable(Object.entries(formulaSums), ([nome, val]) => ({
              col1: nome,
              col2: (Number(val).toLocaleString("pt-BR", {
                minimumFractionDigits: 3,
              })+" kg"),
            }))}
          </View>
        )}

        {renderRodape()}
      </Page>

      {/* Página 2 */}
      <Page size="A4" style={styles.page} orientation={orientation} wrap>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos</Text>
          
          {categorias.map((cat, idx) => ( 
            <View key={idx} style={{ marginBottom: 10 }}>
              {renderTable(produtosPorCategoria[cat], (p) => ({
                col1: p.nome,
                col2: ((p.unidade === "kg" ? p.qtd : p.qtd / 1000).toLocaleString("pt-BR", {
                  minimumFractionDigits: 3,
                })+" kg"),
              }))}
            </View>
          ))}
        </View>

        {comentarios.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comentários do Relatório</Text>
            {comentarios.map((c, i) => (
              <View key={i} style={styles.comentarioContainer}>
                <Text style={styles.comentarioMeta}>
                  {c.autor || "Sistema"} •{" "}
                  {c.data || new Date().toLocaleDateString("pt-BR")}
                </Text>
                <Text style={styles.comentarioTexto}>{c.texto}</Text>
              </View>
            ))}
          </View>
        )}

        {observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text>{observacoes}</Text>
          </View>
        )}

        {renderRodape()}
      </Page>
      {/* Página 3 */}
      <Page size="A4" style={styles.page} orientation={orientation} wrap>
        {/* pagina para os graficos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gráficos</Text>
          {chartTop.length === 0 ? (
            <Text style={styles.smallNote}>Nenhum dado de gráfico disponível.</Text>
          ) : (
            <View style={[styles.chartSection, { flexDirection: 'column' }]}>
              <Text style={{ fontSize: 12, marginBottom: 6 }}>Resumo de Gráficos — Total: {chartTop.reduce((s, it) => s + it.value, 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg</Text>

              <View style={styles.donutContainer}>
                {/* Donut + legend */}
                <View style={styles.donutBox}>
                  <Svg style={styles.donutSvg} viewBox="0 0 120 120">
                    <G>
                      {/* draw background ring */}
                      <Circle cx={60} cy={60} r={44} fill="#fff" stroke="#eef2f7" strokeWidth={16} />
                      {/* slices */}
                      {(() => {
                        // donut uses only top N for clarity
                        const topDonut = chartTop.slice(0, 6);
                        const total = topDonut.reduce((s, it) => s + it.value, 0) || 1;
                        let offset = 0;
                        return topDonut.map((it, idx) => {
                          const pct = (it.value / total);
                          const circumference = 2 * Math.PI * 44;
                          const dash = Math.max(0.0001, circumference * pct);
                          const dashArray = `${dash} ${circumference - dash}`;
                          const color = extendedPalette[idx % extendedPalette.length];
                          const style = { stroke: color, strokeWidth: 16, fill: 'none', strokeLinecap: 'butt', strokeDasharray: dashArray, strokeDashoffset: -offset };
                          offset += dash;
                          return (
                            // @ts-ignore - react-pdf svg element
                            <Circle key={idx} cx={60} cy={60} r={44} {...style} />
                          );
                        });
                      })()}
                    </G>
                  </Svg>
                  <View style={styles.donutCenterText}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', textAlign: 'center' }}>{chartTop[0]?.name || ''}</Text>
                    <Text style={{ fontSize: 9, textAlign: 'center' }}>{(chartTop[0]?.value ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg</Text>
                  </View>
                </View>

                <View style={styles.legend}>
                  {chartTop.slice(0, 6).map((it, idx) => {
                    const total = chartTop.slice(0, 6).reduce((s, it2) => s + it2.value, 0) || 1;
                    const pct = (it.value / total) * 100;
                    const color = extendedPalette[idx % extendedPalette.length];
                    return (
                      <View key={idx} style={styles.legendItem}>
                        <View style={[styles.legendColorBox, { backgroundColor: color }]} />
                        <Text style={{ fontSize: 10, flex: 1 }}>{it.name}</Text>
                        <Text style={{ fontSize: 10, width: 60, textAlign: 'right' }}>{Number(it.value).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg</Text>
                        <Text style={{ fontSize: 9, width: 36, textAlign: 'right', color: '#6b7280' }}>{pct.toFixed(1)}%</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Bars (improved) - show all entries sorted */}
              <View style={{ marginTop: 8 }}>
                {chartSource.slice().sort((a, b) => b.value - a.value).map((row, i) => {
                  const totalAll = chartSource.reduce((s, it) => s + it.value, 0) || 1;
                  const pct = row.value <= 0 ? 0 : (row.value / totalAll) * 100;
                  const color = extendedPalette[i % extendedPalette.length];
                  return (
                    <View key={i} style={styles.chartRow}>
                      <Text style={styles.chartLabel}>{row.name}</Text>
                      <View style={styles.chartBarContainer}>
                        <View style={[styles.chartBarFill, { width: `${Math.max(1, Math.round(pct))}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={styles.chartValue}>{Number(row.value).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg</Text>
                      <Text style={{ fontSize: 9, width: 36, textAlign: 'right', color: '#6b7280' }}>{pct.toFixed(1)}%</Text>
                    </View>
                  );
                })}
                <Text style={[styles.smallNote, { marginTop: 6 }]}>Exibindo {chartSource.length} registros.</Text>
              </View>
            </View>
          )}
        </View>
          
        {renderRodape()}
      </Page>
    </Document>
  );
};