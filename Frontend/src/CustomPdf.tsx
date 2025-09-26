import { Document, Page, Text, StyleSheet, View, Image, Font } from "@react-pdf/renderer";
import type { FC } from "react";
import type { ReportConfig } from './components/ReportConfig';

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf" },
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
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    color: "#af1e1eff",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    width: "48%",
    marginRight: "2%",
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    flex: 1,
  },
  productValue: {
    fontSize: 12,
    color: "#6b7280",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalProductionCard: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 4,
    borderLeftColor: "#af1e1eff",
    borderRadius: 6,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalProductionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  totalProductionValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#af1e1eff",
  },
  chartSection: {
    marginBottom: 24,
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

interface CustomReportDocumentProps {
  config: ReportConfig;
  data?: any;
  produtosInfo?: Record<string, { nome?: string; unidade?: string; total?: number }>;
  totalProduction?: number;
}

export const CustomReportDocument: FC<CustomReportDocumentProps> = ({ 
  config, 
  data, 
  produtosInfo = {}, 
  totalProduction = 0
}) => {
  // usar cor principal configurada (hex) como fallback para elementos do PDF
  const primary = (config as any)?.primaryColor || '#af1e1e';
    console.log("COR PRIMÁRIA CONFIGURADA:", primary);
    console.log("DADOS DO RELATÓRIO:", data);
    console.log("CONFIGURAÇÕES DO RELATÓRIO:", config);
    console.log("INFORMAÇÕES DOS PRODUTOS:", produtosInfo);
    
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={config.includeLogo && config.logoUrl ? styles.header : styles.headerWithoutLogo}>
          {config.includeLogo && config.logoUrl && (
            <Image style={styles.logo} src={config.logoUrl} />
          )}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: primary }]}>
              {config.title || 'Relatório de Produção'}
            </Text>
            <Text style={styles.subtitle}>
              Gerado em {new Date().toLocaleDateString('pt-BR')}
            </Text>
            {config.description && (
              <Text style={styles.description}>
                {config.description}
              </Text>
            )}
          </View>
        </View>

        {/* Informações dos Produtos */}
        {config.showProductInfo && Object.keys(produtosInfo).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Informações dos Produtos</Text>
            <View style={styles.productGrid}>
              {Object.entries(produtosInfo).map(([key, info]) => (
                <View key={key} style={styles.productRow}>
                  <Text style={styles.productName}>
                    {(info as any).nome || `Produto ${key}`}
                  </Text>
                  <Text style={styles.productValue}>
                    {(info as any).total?.toLocaleString('pt-BR') || '0'} {(info as any).unidade || 'kg'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Total de Produção */}
        {config.showProductionTotal && totalProduction > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Total de Produção</Text>
            <View style={[styles.totalProductionCard, { borderLeftColor: primary }]}> 
              <Text style={styles.totalProductionLabel}>
                Produção Total do Período:
              </Text>
              <Text style={[styles.totalProductionValue, { color: primary }]}> 
                {totalProduction.toLocaleString('pt-BR')} kg
              </Text>
            </View>
          </View>
        )}

        {/* Gráficos */}
        {config.includeGraphics && config.charts.some((c: any) => c.enabled) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Gráficos de Período</Text>
            {config.charts.filter((c: any) => c.enabled).map((chart: any) => (
              <View key={chart.id} style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>{chart.title}</Text>
                  <View style={styles.chartBadges}>
                    <Text style={styles.chartBadge}>
                      {chart.period.charAt(0).toUpperCase() + chart.period.slice(1)}
                    </Text>
                    <Text style={styles.chartBadge}>
                      {chart.type === 'pie' ? 'Pizza' : 
                       chart.type === 'bar' ? 'Barras' :
                       chart.type === 'line' ? 'Linha' : 'Área'}
                    </Text>
                  </View>
                </View>
                <ChartPlaceholder chart={chart} data={data || []} />
                <Text style={[styles.chartPlaceholderText, { marginTop: 8 }]}> 
                  Dados do período: {chart.period}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Mensagem se não há conteúdo */}
        {!(config.showProductInfo || config.showProductionTotal || (config.includeGraphics && config.charts.some((c:any)=>c.enabled))) && (
          <View style={styles.noContentMessage}>
            <Text style={styles.noContentIcon}>📄</Text>
            <Text>Nenhum conteúdo foi selecionado para este relatório.</Text>
            <Text>Configure os elementos desejados antes de gerar o PDF.</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Relatório gerado automaticamente pelo sistema de produção
          </Text>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()}  J.Cortiça Automação - Todos os direitos reservados
          </Text>
        </View>
      </Page>
    </Document>
  );
};