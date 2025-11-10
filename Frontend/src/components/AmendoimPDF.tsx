import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Registrar fontes
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: 300,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #333",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    marginBottom: 3,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#333",
    marginBottom: 8,
    borderBottom: "1px solid #ddd",
    paddingBottom: 4,
  },
  table: {
    display: "flex",
    width: "100%",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #eee",
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottom: "2px solid #333",
    paddingVertical: 8,
    fontWeight: 700,
  },
  tableCol: {
    fontSize: 9,
    paddingHorizontal: 4,
  },
  col1: { width: "10%" },
  col2: { width: "12%" },
  col3: { width: "10%" },
  col4: { width: "12%" },
  col5: { width: "12%" },
  col6: { width: "24%" },
  col7: { width: "12%" },
  col8: { width: "8%" },
  metricCard: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
    border: "1px solid #ddd",
  },
  metricTitle: {
    fontSize: 9,
    color: "#666",
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#333",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
    borderTop: "1px solid #ddd",
    paddingTop: 8,
  },
});

interface AmendoimRecord {
  id: number;
  tipo: "entrada" | "saida";
  dia: string;
  hora: string;
  codigoProduto: string;
  codigoCaixa: string;
  nomeProduto: string;
  peso: number;
  balanca?: string;
}

interface AmendoimPDFDocumentProps {
  registros: AmendoimRecord[];
  filtros?: {
    tipo?: string;
    dataInicio?: string;
    dataFim?: string;
    codigoProduto?: string;
    nomeProduto?: string;
    codigoCaixa?: string;
  };
  comentarios?: { texto: string; data?: string }[];
  estatisticas?: {
    totalRegistros: number;
    pesoTotal: number;
    produtosUnicos: number;
    caixasUtilizadas: number;
  };
  showDetailed?: boolean;
}

export const AmendoimPDFDocument = ({
  registros,
  filtros = {},
  estatisticas,
  comentarios = [],
  showDetailed = true,
}: AmendoimPDFDocumentProps) => {
  const dataGeracao = new Date().toLocaleString("pt-BR");

  // Helper: safely format numbers that may come as string/null
  const formatNumber = (value: any, decimals = 2) => {
    const n = Number(value);
    if (!isFinite(n)) return (0).toFixed(decimals);
    return n.toFixed(decimals);
  };

  // Calcular estatísticas se não fornecidas
  const stats = estatisticas || {
    totalRegistros: registros.length,
    pesoTotal: registros.reduce((sum, r) => sum + Number(r.peso || 0), 0),
    produtosUnicos: new Set(registros.map((r) => r.codigoProduto)).size,
    caixasUtilizadas: new Set(registros.map((r) => r.codigoCaixa)).size,
  };

  // Separar por tipo
  const entrada = registros.filter((r) => r.tipo === "entrada");
  const saida = registros.filter((r) => r.tipo === "saida");
  const pesoEntrada = entrada.reduce((sum, r) => sum + Number(r.peso || 0), 0);
  const pesoSaida = saida.reduce((sum, r) => sum + Number(r.peso || 0), 0);
  const rendimento =
    pesoEntrada > 0 ? formatNumber(((pesoSaida / pesoEntrada) * 100) || 0, 2) : "0.00";

  // Debug: if pesoTotal isn't numeric, warn to help tracing server/client payload shape
  if (!isFinite(Number(stats.pesoTotal))) {
    // eslint-disable-next-line no-console
    console.warn("AmendoimPDF: stats.pesoTotal is not a finite number", stats.pesoTotal, stats);
  }

  // Paginar registros (máximo 30 por página)
  // Construir resumo por produto (para exibir SOMENTE no PDF)
  const resumoMap: Record<string, { name: string; count: number; value: number }> = {};
  registros.forEach((r) => {
    const key = r.nomeProduto || r.codigoProduto || "(sem nome)";
    if (!resumoMap[key]) resumoMap[key] = { name: key, count: 0, value: 0 };
    resumoMap[key].count += 1;
    resumoMap[key].value += Number(r.peso || 0);
  });
  const resumoProdutos = Object.values(resumoMap);

  // Construir agregados por balança e por produto (entradas x saídas)
  const balancaMap: Record<string, { entrada: number; saida: number }> = {};
  const produtoMap: Record<string, { entrada: number; saida: number }> = {};
  registros.forEach((r) => {
    const bal = r.balanca || '(sem balança)';
    if (!balancaMap[bal]) balancaMap[bal] = { entrada: 0, saida: 0 };
    const prodKey = r.nomeProduto || r.codigoProduto || '(sem nome)';
    if (!produtoMap[prodKey]) produtoMap[prodKey] = { entrada: 0, saida: 0 };
    const peso = Number(r.peso || 0);
    if (r.tipo === 'entrada') {
      balancaMap[bal].entrada += peso;
      produtoMap[prodKey].entrada += peso;
    } else {
      balancaMap[bal].saida += peso;
      produtoMap[prodKey].saida += peso;
    }
  });
  const balancas = Object.entries(balancaMap).map(([balanca, v]) => ({ balanca, ...v }));
  const produtosEntrSaida = Object.entries(produtoMap).map(([nome, v]) => ({ nome, ...v }));
  // Paginação para a lista detalhada após o resumo
  const registrosPorPagina = 30;
  const numDetailPages = showDetailed ? (registros.length > 0 ? Math.ceil(registros.length / registrosPorPagina) : 0) : 0;
  const hasCommentsPage = comentarios && comentarios.length > 0 ? 1 : 0;
  const totalPages = 1 + numDetailPages + hasCommentsPage;

  // First page: summary + resumo por produto + comentarios
  // Following pages: detalhado (registros)
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Amendoim - Cortez</Text>
          <Text style={styles.subtitle}>Gerado em: {dataGeracao}</Text>
          {filtros.dataInicio && (
            <Text style={styles.subtitle}>Período: {filtros.dataInicio} até {filtros.dataFim || "hoje"}</Text>
          )}
          {filtros.tipo && <Text style={styles.subtitle}>Tipo: {filtros.tipo}</Text>}
          {filtros.codigoProduto && <Text style={styles.subtitle}>Cód. Produto: {filtros.codigoProduto}</Text>}
          {filtros.nomeProduto && <Text style={styles.subtitle}>Produto: {filtros.nomeProduto}</Text>}
          {filtros.codigoCaixa && <Text style={styles.subtitle}>Cód. Caixa: {filtros.codigoCaixa}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { flex: 1 }]}>
              <Text style={styles.metricTitle}>Total Registros</Text>
              <Text style={styles.metricValue}>{stats.totalRegistros}</Text>
            </View>
            <View style={[styles.metricCard, { flex: 1 }]}>
              <Text style={styles.metricTitle}>Peso Total (kg)</Text>
              <Text style={styles.metricValue}>{formatNumber(stats.pesoTotal, 2)}</Text>
            </View>
            <View style={[styles.metricCard, { flex: 1 }]}>
              <Text style={styles.metricTitle}>Rendimento (%)</Text>
              <Text style={styles.metricValue}>{rendimento}%</Text>
            </View>
            <View style={[styles.metricCard, { flex: 1 }]}>
              <Text style={styles.metricTitle}>Produtos Únicos</Text>
              <Text style={styles.metricValue}>{stats.produtosUnicos}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
            <View style={[styles.metricCard, { flex: 1 }]}>
              <Text style={styles.metricTitle}>Peso Entrada (kg)</Text>
              <Text style={styles.metricValue}>{formatNumber(pesoEntrada, 3)}</Text>
            </View>
            <View style={[styles.metricCard, { flex: 1 }]}>
              <Text style={styles.metricTitle}>Peso Saída (kg)</Text>
              <Text style={styles.metricValue}>{formatNumber(pesoSaida, 3)}</Text>
            </View>
          </View>

          {/* Tabela de balanças (entradas x saídas) */}
          <View style={[styles.section, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Balanças (Entradas / Saídas)</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCol, { width: '50%' }]}>Balança</Text>
                <Text style={[styles.tableCol, { width: '25%', textAlign: 'right' }]}>Entrada (kg)</Text>
                <Text style={[styles.tableCol, { width: '25%', textAlign: 'right' }]}>Saída (kg)</Text>
              </View>
              {balancas.map((b, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCol, { width: '50%' }]}>{b.balanca}</Text>
                  <Text style={[styles.tableCol, { width: '25%', textAlign: 'right' }]}>{formatNumber(b.entrada, 3)}</Text>
                  <Text style={[styles.tableCol, { width: '25%', textAlign: 'right' }]}>{formatNumber(b.saida, 3)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tabela de produtos (entradas x saídas) */}
          <View style={[styles.section, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Produtos (Entradas / Saídas)</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCol, { width: '60%' }]}>Produto</Text>
                <Text style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}>Entrada (kg)</Text>
                <Text style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}>Saída (kg)</Text>
              </View>
              {produtosEntrSaida.map((p, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={[styles.tableCol, { width: '60%' }]}>{p.nome}</Text>
                  <Text style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}>{formatNumber(p.entrada, 3)}</Text>
                  <Text style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}>{formatNumber(p.saida, 3)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Comentários: agora renderizados em página dedicada NO FINAL do documento */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo por Produto</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCol, { width: '60%' }]}>Produto</Text>
              <Text style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}>Registros</Text>
              <Text style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}>Peso (kg)</Text>
            </View>
            {resumoProdutos.map((p, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.tableCol, { width: '60%' }]}>{p.name}</Text>
                <Text style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}>{p.count}</Text>
                <Text style={[styles.tableCol, { width: '20%', textAlign: 'right' }]}>{formatNumber(p.value, 3)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text>1 de {totalPages} | Cortez - Sistema de Relatórios | J.Cortiça Automação</Text>
        </View>
      </Page>

      {/* Detailed registros pages */}
      {Array.from({ length: numDetailPages }, (_, pageIdx) => {
        const inicio = pageIdx * registrosPorPagina;
        const fim = Math.min(inicio + registrosPorPagina, registros.length);
        const registrosPagina = registros.slice(inicio, fim);
        return (
          <Page key={pageIdx} size="A4" orientation="portrait" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>Relatório de Amendoim - Cortez</Text>
              <Text style={styles.subtitle}>Gerado em: {dataGeracao}</Text>
              {filtros.dataInicio && (
                <Text style={styles.subtitle}>Período: {filtros.dataInicio} até {filtros.dataFim || "hoje"}</Text>
              )}
              {filtros.tipo && <Text style={styles.subtitle}>Tipo: {filtros.tipo}</Text>}
              {filtros.codigoProduto && <Text style={styles.subtitle}>Cód. Produto: {filtros.codigoProduto}</Text>}
              {filtros.nomeProduto && <Text style={styles.subtitle}>Produto: {filtros.nomeProduto}</Text>}
              {filtros.codigoCaixa && <Text style={styles.subtitle}>Cód. Caixa: {filtros.codigoCaixa}</Text>}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Registros (detalhado)</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCol, styles.col1]}>Tipo</Text>
                  <Text style={[styles.tableCol, styles.col2]}>Data</Text>
                  <Text style={[styles.tableCol, styles.col3]}>Hora</Text>
                  <Text style={[styles.tableCol, styles.col4]}>Cód. Produto</Text>
                  <Text style={[styles.tableCol, styles.col5]}>Cód. Caixa</Text>
                  <Text style={[styles.tableCol, styles.col6]}>Nome Produto</Text>
                  <Text style={[styles.tableCol, styles.col7]}>Peso (kg)</Text>
                  <Text style={[styles.tableCol, styles.col8]}>Balança</Text>
                </View>

                {registrosPagina.map((registro, idx) => (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={[styles.tableCol, styles.col1]}>{registro.tipo === "entrada" ? "Entrada" : "Saída"}</Text>
                    <Text style={[styles.tableCol, styles.col2]}>{registro.dia}</Text>
                    <Text style={[styles.tableCol, styles.col3]}>{registro.hora}</Text>
                    <Text style={[styles.tableCol, styles.col4]}>{registro.codigoProduto}</Text>
                    <Text style={[styles.tableCol, styles.col5]}>{registro.codigoCaixa}</Text>
                    <Text style={[styles.tableCol, styles.col6]}>{registro.nomeProduto}</Text>
                    <Text style={[styles.tableCol, styles.col7]}>{formatNumber(registro.peso, 3)}</Text>
                    <Text style={[styles.tableCol, styles.col8]}>{registro.balanca || "-"}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.footer}>
              <Text>{pageIdx + 2} de {totalPages} | Cortez - Sistema de Relatórios | J.Cortiça Automação</Text>
            </View>
          </Page>
        );
      })}

      {/* Página final: comentários (se houver) */}
      {comentarios && comentarios.length > 0 && (
        <Page size="A4" orientation="portrait" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Relatório de Amendoim - Cortez</Text>
            <Text style={styles.subtitle}>Gerado em: {dataGeracao}</Text>
            {filtros.dataInicio && (
              <Text style={styles.subtitle}>Período: {filtros.dataInicio} até {filtros.dataFim || "hoje"}</Text>
            )}
            {filtros.tipo && <Text style={styles.subtitle}>Tipo: {filtros.tipo}</Text>}
            {filtros.codigoProduto && <Text style={styles.subtitle}>Cód. Produto: {filtros.codigoProduto}</Text>}
            {filtros.nomeProduto && <Text style={styles.subtitle}>Produto: {filtros.nomeProduto}</Text>}
            {filtros.codigoCaixa && <Text style={styles.subtitle}>Cód. Caixa: {filtros.codigoCaixa}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comentários</Text>
            {comentarios.map((c, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 9, color: '#444' }}>{c.data || ''}</Text>
                <Text style={{ fontSize: 10, color: '#222' }}>{c.texto}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text>{totalPages} de {totalPages} | Cortez - Sistema de Relatórios | J.Cortiça Automação</Text>
          </View>
        </Page>
      )}

    </Document>
  );
};
