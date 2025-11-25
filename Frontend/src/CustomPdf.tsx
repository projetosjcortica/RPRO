import { Document, Page, Text, StyleSheet, View, Image, Font } from "@react-pdf/renderer";
import { DASHBOARD_COLORS as palette } from './lib/colors';
import type { FC } from "react";
import type { ReportConfig } from './components/ReportConfig';

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
    paddingBottom: 60,
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#333",
    lineHeight: 1.5,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#d1d5db",
    paddingBottom: 10,
  },
  headerWithoutLogo: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#d1d5db",
    paddingBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 15,
    borderRadius: 8,
    objectFit: "cover",
  },
  titleContainer: { 
    flex: 1 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#af1e1eff" 
  },
  subtitle: { 
    fontSize: 14, 
    color: "#bbbbbbff", 
    marginTop: 4 
  },
  description: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    lineHeight: 1.4,
  },
  section: { 
    marginBottom: 20, 
    flexDirection: "column", 
    break: "auto" 
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "#af1e1eff",
    color: "#ffffff",
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  chartBadges: {
    flexDirection: "row",
    gap: 8,
  },
  chartBadge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    color: "#6b7280",
  },
  chartPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  chartPlaceholderText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
  noContentMessage: {
    textAlign: "center",
    paddingVertical: 40,
    color: "#9ca3af",
  },
  noContentIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 10,
    color: "#9ca3af",
  },
  // Chart styles (análise de produção - barras horizontais)
  chartSection: {
    marginBottom: 15,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 2,
  },
  chartLabel: {
    width: '25%',
    fontSize: 8,
    color: '#374151',
    paddingRight: 4,
  },
  chartBarContainer: {
    width: '45%',
    height: 10,
    backgroundColor: '#e6e7ea',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 4,
  },
  chartBarFill: {
    height: 10,
    backgroundColor: '#af1e1eff',
  },
  chartValue: {
    width: '15%',
    fontSize: 8,
    textAlign: 'right',
    color: '#374151',
    paddingRight: 2,
  },
  chartPercent: {
    width: '15%',
    fontSize: 8,
    textAlign: 'right',
    color: '#6b7280',
  },
  // Tabelas padronizadas
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
  },
  tableRowEven: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
  },
  tableCol: {
    width: "70%",
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    padding: 8,
  },
  tableColSmall: {
    width: "30%",
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    padding: 8,
    textAlign: "right",
  },
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
    backgroundColor: "#e2e2e2ff",
    padding: 8,
    fontWeight: "bold",
    color: "#af1e1eff",
    textAlign: "right",
  },
  label: {
    fontWeight: "bold",
    color: "#374151",
  },
  value: {
    textAlign: "right",
  },
  comentarioContainer: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 4,
    border: '1px solid #e5e7eb',
  },
  comentarioMeta: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 6,
  },
  comentarioTexto: {
    fontSize: 11,
    color: "#333333",
    lineHeight: 1.4,
  },
});

// Componente para renderizar gráfico como placeholder (já que react-pdf não suporta componentes complexos)
const ChartPlaceholder: FC<{ chart: any; data: any[] }> = ({ chart }) => (
  <View style={styles.chartPlaceholder}>
    <Text style={styles.chartPlaceholderText}>
      {chart.type === 'pie' ? '🥧' : 
       chart.type === 'bar' ? '📊' : 
       chart.type === 'line' ? '📈' : '📊'} {' '}
      Gráfico de {chart.type === 'pie' ? 'Pizza' : 
                  chart.type === 'bar' ? 'Barras' :
                  chart.type === 'line' ? 'Linha' : 'Área'}
    </Text>
    <Text style={styles.chartPlaceholderText}>
      Período: {chart.period}
    </Text>
  </View>
);

interface Produto {
  nome: string;
  qtd: number | string;
  unidade?: string;
  categoria?: string;
}

interface ComentarioRelatorio {
  texto: string;
  data?: string;
  autor?: string;
}

export interface PdfCustomization {
  fontSize: 'small' | 'medium' | 'large';
  sortOrder: 'alphabetic' | 'silo' | 'most-used';
  formulaSortOrder?: 'alphabetic' | 'code' | 'most-used';
  simplifiedLayout?: boolean;
}

interface CustomReportDocumentProps {
  config: ReportConfig;
  data?: any;
  produtosInfo?: Record<string, { nome?: string; unidade?: string; total?: number; categoria?: string }>;
  totalProduction?: number;
  produtos?: Produto[];
  comentarios?: ComentarioRelatorio[];
  usuario?: string;
  empresa?: string;
  periodoInicio?: string;
  periodoFim?: string;
  horaInicial?: string;
  horaFinal?: string;
  pdfCustomization?: PdfCustomization;
  chartData?: { name: string; value: number }[];
  showCharts?: boolean;
}

export const CustomReportDocument: FC<CustomReportDocumentProps> = ({ 
  config, 
  data, 
  produtosInfo = {}, 
  totalProduction = 0,
  produtos = [],
  comentarios = [],
  usuario = "Sistema",
  periodoInicio = "-",
  periodoFim = "-",
  horaInicial = "-",
  horaFinal = "-",
  pdfCustomization = { fontSize: 'medium', sortOrder: 'alphabetic' },
  chartData = [],
  showCharts = true,
}) => {
  // usar cor principal configurada (hex) como fallback para elementos do PDF
  const primary = (config as any)?.primaryColor || '#af1e1e';
  
  // Data de geração
  const dataGeracao = new Date().toLocaleString("pt-BR", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Formatar datas
  const formatarData = (data: string) => {
    if (!data || data === '-') return '-';
    try {
      const d = new Date(data);
      if (isNaN(d.getTime())) return data;
      return d.toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  const periodoInicioFormatado = formatarData(periodoInicio);
  const periodoFimFormatado = formatarData(periodoFim);

  // Tamanhos de fonte baseados na customização
  const fontSizes = {
    small: { base: 10, title: 20, section: 14, table: 8 },
    medium: { base: 12, title: 24, section: 16, table: 10 },
    large: { base: 14, title: 28, section: 18, table: 12 },
  };
  const currentFontSizes = fontSizes[pdfCustomization.fontSize];

  // Agrupar produtos por categoria
  const produtosPorCategoria: Record<string, Produto[]> = {};
  produtos.forEach((p) => {
    const cat = p.categoria || "Sem Categoria";
    if (!produtosPorCategoria[cat]) produtosPorCategoria[cat] = [];
    produtosPorCategoria[cat].push(p);
  });
  const categorias = Object.keys(produtosPorCategoria).sort();

  // Preparar dados de gráfico
  const _chartSource: { name: string; value: number }[] = [];
  if (chartData && Array.isArray(chartData) && chartData.length > 0) {
    for (const c of chartData) {
      _chartSource.push({ name: String(c.name), value: Number(c.value) || 0 });
    }
  } else if (produtosInfo && Object.keys(produtosInfo).length > 0) {
    for (const [k, v] of Object.entries(produtosInfo)) {
      _chartSource.push({ name: (v as any).nome || k, value: Number((v as any).total) || 0 });
    }
  }
  const chartSource = _chartSource;

  // Renderizar rodapé
  const renderRodape = () => (
    <>
      <Text
        fixed
        style={{
          position: "absolute",
          bottom: 12,
          left: 30,
          fontSize: currentFontSizes.base - 2,
          color: "#bbbbbbff",
        }}
      >
        Relatório gerado em {dataGeracao} por J.Cortiça ({usuario})
      </Text>
      <Text
        fixed
        style={{
          position: "absolute",
          bottom: 12,
          right: 30,
          fontSize: currentFontSizes.base - 2,
          color: "#bbbbbbff",
        }}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </>
  );

  // Renderizar tabela padrão
  const renderTable = (
    rows: Produto[],
    keyMapper: (row: Produto) => { col1: string; col2: string }
  ) => (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <Text style={[styles.tableColHeader, { fontSize: currentFontSizes.table }]}>Nome</Text>
        <Text style={[styles.tableColHeaderSmall, { fontSize: currentFontSizes.table }]}>Total</Text>
      </View>
      {rows.map((row, i) => {
        const { col1, col2 } = keyMapper(row);
        return (
          <View
            key={i}
            style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}
          >
            <Text style={[styles.tableCol, { fontSize: currentFontSizes.table }]}>{col1}</Text>
            <Text style={[styles.tableColSmall, { fontSize: currentFontSizes.table }]}>{col2}</Text>
          </View>
        );
      })}
    </View>
  );
    
  return (
    <Document>
      {/* Página 1 - Header e Informações Gerais */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={config.includeLogo && config.logoUrl ? styles.header : styles.headerWithoutLogo}>
          {config.includeLogo && config.logoUrl && (
            <Image style={styles.logo} src={config.logoUrl} />
          )}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: primary, fontSize: currentFontSizes.title }]}>
              {config.title || 'Relatório de Produção'}
            </Text>
            <Text style={[styles.subtitle, { fontSize: currentFontSizes.base + 2 }]}>
              Gerado em {new Date().toLocaleDateString('pt-BR')}
            </Text>
            {config.description && (
              <Text style={[styles.description, { fontSize: currentFontSizes.base }]}>
                {config.description}
              </Text>
            )}
          </View>
        </View>

        {/* Informações Gerais */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section }]}>
            Informações Gerais
          </Text>
          
          {totalProduction > 0 && (
            <View style={{ marginBottom: 6 }}>
              <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
                Total:{" "}
                <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>
                  {totalProduction.toLocaleString("pt-BR", { minimumFractionDigits: 3 })} kg
                </Text>
              </Text>
            </View>
          )}

          {periodoInicio !== '-' && (
            <View style={{ marginBottom: 6 }}>
              <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
                Data inicial:{" "}
                <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>
                  {periodoInicioFormatado}
                </Text>
              </Text>
            </View>
          )}

          {periodoFim !== '-' && (
            <View style={{ marginBottom: 6 }}>
              <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
                Data final:{" "}
                <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>
                  {periodoFimFormatado}
                </Text>
              </Text>
            </View>
          )}

          {horaInicial !== '-' && (
            <View style={{ marginBottom: 6 }}>
              <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
                Hora inicial:{" "}
                <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>
                  {horaInicial}
                </Text>
              </Text>
            </View>
          )}

          {horaFinal !== '-' && (
            <View style={{ marginBottom: 6 }}>
              <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
                Hora final:{" "}
                <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>
                  {horaFinal}
                </Text>
              </Text>
            </View>
          )}
        </View>

        {renderRodape()}
      </Page>

      {/* Página 2 - Tabela de Produtos Detalhada */}
      {produtos.length > 0 && (
        <Page size="A4" style={styles.page} wrap>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 15 }]}>
              TABELA DE PRODUTOS
            </Text>
            {categorias.map((cat, idx) => (
              <View key={idx} style={{ marginBottom: 15 }}>
                {renderTable(produtosPorCategoria[cat], (p) => ({
                  col1: p.nome,
                  col2: ((p.unidade === "kg" ? p.qtd : p.qtd).toLocaleString("pt-BR", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  }) + " kg"),
                }))}
              </View>
            ))}
          </View>
          {renderRodape()}
        </Page>
      )}

      {/* Página 3 - Gráficos e Comentários */}
      <Page size="A4" style={styles.page} wrap>
        {/* Comentários do Relatório */}
        {comentarios && comentarios.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 15 }]}>
              COMENTÁRIOS DO RELATÓRIO
            </Text>
            {comentarios.map((c, i) => (
              <View key={i} style={styles.comentarioContainer}>
                <Text style={styles.comentarioMeta}>
                  {c.data ? formatarData(c.data) : new Date().toLocaleDateString("pt-BR")}
                  {c.autor && ` • ${c.autor}`}
                </Text>
                <Text style={styles.comentarioTexto}>{c.texto}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Gráficos de Análise (Barras Horizontais) */}
        {showCharts && chartSource.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section }]}>
              📊 Análise de Produção
            </Text>
            <View style={[styles.chartSection, { flexDirection: 'column' }]}>
              <View style={{ marginTop: 4 }}>
                {chartSource.slice().sort((a, b) => b.value - a.value).map((row, i) => {
                  const totalAll = chartSource.reduce((s, it) => s + it.value, 0) || 1;
                  const pct = row.value <= 0 ? 0 : (row.value / totalAll) * 100;
                  const color = palette[i % palette.length];
                  return (
                    <View key={i} style={styles.chartRow}>
                      <Text style={styles.chartLabel}>
                        {row.name.length > 30 ? row.name.substring(0, 27) + '...' : row.name}
                      </Text>
                      <View style={styles.chartBarContainer}>
                        <View style={[styles.chartBarFill, { 
                          width: `${Math.max(1, Math.round(pct))}%`, 
                          backgroundColor: color 
                        }]} />
                      </View>
                      <Text style={styles.chartValue}>
                        {Number(row.value).toLocaleString('pt-BR', { 
                          minimumFractionDigits: 3, 
                          maximumFractionDigits: 3 
                        })} kg
                      </Text>
                      <Text style={styles.chartPercent}>{pct.toFixed(1)}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Gráficos Configuráveis (Placeholders) */}
        {config.includeGraphics && config.charts.some((c: any) => c.enabled) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section }]}>
              📊 Gráficos de Período
            </Text>
            {config.charts.filter((c: any) => c.enabled).map((chart: any) => (
              <View key={chart.id} style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                  <Text style={[styles.chartTitle, { fontSize: currentFontSizes.base + 2 }]}>
                    {chart.title}
                  </Text>
                  <View style={styles.chartBadges}>
                    <Text style={[styles.chartBadge, { fontSize: currentFontSizes.base - 2 }]}>
                      {chart.period.charAt(0).toUpperCase() + chart.period.slice(1)}
                    </Text>
                    <Text style={[styles.chartBadge, { fontSize: currentFontSizes.base - 2 }]}>
                      {chart.type === 'pie' ? 'Pizza' : 
                       chart.type === 'bar' ? 'Barras' :
                       chart.type === 'line' ? 'Linha' : 'Área'}
                    </Text>
                  </View>
                </View>
                <ChartPlaceholder chart={chart} data={data || []} />
                <Text style={[styles.chartPlaceholderText, { 
                  marginTop: 8, 
                  fontSize: currentFontSizes.base 
                }]}> 
                  Dados do período: {chart.period}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Mensagem se não há conteúdo */}
        {!(config.showProductInfo || config.showProductionTotal || 
            (config.includeGraphics && config.charts.some((c:any)=>c.enabled)) ||
            showCharts || comentarios.length > 0 || produtos.length > 0) && (
          <View style={styles.noContentMessage}>
            <Text style={[styles.noContentIcon, { fontSize: currentFontSizes.title * 2 }]}>
              📄
            </Text>
            <Text style={[{ fontSize: currentFontSizes.base }]}>
              Nenhum conteúdo foi selecionado para este relatório.
            </Text>
            <Text style={[{ fontSize: currentFontSizes.base }]}>
              Configure os elementos desejados antes de gerar o PDF.
            </Text>
          </View>
        )}

        {renderRodape()}
      </Page>
    </Document>
  );
};