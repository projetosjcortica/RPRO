import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Registrar fontes
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf" }, // Regular
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 12,
    padding: 30,
    paddingBottom: 60,
    backgroundColor: "#ffffff",
    color: "#333",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #d1d5db",
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 90,
    maxHeight: 150,
    marginRight: 15,
  },
  titleContainer: { 
    flex: 1 
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#af1e1eff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6f6f6fff",
    marginBottom: 3,
  },
  section: {
    marginBottom: 20,
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
  label: {
    fontWeight: "bold",
    color: "#374151",
    fontSize: 12,
  },
  value: {
    textAlign: "right",
    fontSize: 12,
  },
  table: {
    display: "flex",
    width: "100%",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #d1d5db",
    paddingVertical: 6,
  },
  tableRowEven: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #d1d5db",
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e2e2ff",
    borderBottom: "1px solid #d1d5db",
    paddingVertical: 8,
    fontWeight: "bold",
  },
  tableCol: {
    fontSize: 10,
    paddingHorizontal: 4,
    color: "#374151",
  },
  tableColHeader: {
    fontSize: 10,
    paddingHorizontal: 4,
    fontWeight: "bold",
    color: "#af1e1eff",
  },
  col1: { width: "10%" },
  col2: { width: "12%" },
  col3: { width: "10%" },
  col4: { width: "12%" },
  col5: { width: "12%" },
  col6: { width: "24%" },
  col7: { width: "12%" },
  col8: { width: "8%" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#bbbbbbff",
    borderTop: "1px solid #e5e7eb",
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
  fontSize?: "pequena" | "media" | "grande";
  ordenacao?: "data" | "produto" | "peso";
  agruparPorProduto?: boolean;
  logoUrl?: string;
}

export const AmendoimPDFDocument = ({
  registros,
  filtros = {},
  estatisticas,
  comentarios = [],
  showDetailed = true,
  fontSize = "media",
  ordenacao = "data",
  agruparPorProduto = false,
  logoUrl,
}: AmendoimPDFDocumentProps) => {
  const dataGeracao = new Date().toLocaleString("pt-BR");

  // Aplicar tamanho de fonte dinamicamente
  const baseFontSize = fontSize === "pequena" ? 10 : fontSize === "grande" ? 14 : 12;
  
  // Aplicar ordenação aos registros
  let registrosOrdenados = [...registros];
  if (ordenacao === "data") {
    registrosOrdenados.sort((a, b) => {
      const dateA = new Date(`${a.dia} ${a.hora}`).getTime();
      const dateB = new Date(`${b.dia} ${b.hora}`).getTime();
      return dateB - dateA; // Mais recente primeiro
    });
  } else if (ordenacao === "produto") {
    registrosOrdenados.sort((a, b) => 
      (a.nomeProduto || a.codigoProduto || "").localeCompare(b.nomeProduto || b.codigoProduto || "")
    );
  } else if (ordenacao === "peso") {
    registrosOrdenados.sort((a, b) => Number(b.peso || 0) - Number(a.peso || 0)); // Maior peso primeiro
  }

  // Aplicar agrupamento se necessário
  const registrosParaExibir = agruparPorProduto 
    ? registrosOrdenados.sort((a, b) => 
        (a.nomeProduto || a.codigoProduto || "").localeCompare(b.nomeProduto || b.codigoProduto || "")
      )
    : registrosOrdenados;

  // Helper: safely format numbers that may come as string/null
  const formatNumber = (value: any, decimals = 2) => {
    const n = Number(value);
    if (!isFinite(n)) return "0" + (decimals > 0 ? "." + "0".repeat(decimals) : "");
    
    // Formatar com separador de milhares (ponto) e casas decimais
    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Calcular estatísticas se não fornecidas
  const stats = estatisticas || {
    totalRegistros: registrosParaExibir.length,
    pesoTotal: registrosParaExibir.reduce((sum, r) => sum + Number(r.peso || 0), 0),
    produtosUnicos: new Set(registrosParaExibir.map((r) => r.codigoProduto)).size,
    caixasUtilizadas: new Set(registrosParaExibir.map((r) => r.codigoCaixa)).size,
  };

  // Separar por tipo
  const entrada = registrosParaExibir.filter((r) => r.tipo === "entrada");
  const saida = registrosParaExibir.filter((r) => r.tipo === "saida");
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
  registrosParaExibir.forEach((r) => {
    const key = r.nomeProduto || r.codigoProduto || "(sem nome)";
    if (!resumoMap[key]) resumoMap[key] = { name: key, count: 0, value: 0 };
    resumoMap[key].count += 1;
    resumoMap[key].value += Number(r.peso || 0);
  });
  const resumoProdutos = Object.values(resumoMap);

  // Construir agregados por balança e por produto (entradas x saídas)
  const balancaMap: Record<string, { entrada: number; saida: number }> = {};
  const produtoMap: Record<string, { entrada: number; saida: number }> = {};
  registrosParaExibir.forEach((r) => {
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
  const numDetailPages = showDetailed ? (registrosParaExibir.length > 0 ? Math.ceil(registrosParaExibir.length / registrosPorPagina) : 0) : 0;
  const hasCommentsPage = comentarios && comentarios.length > 0 ? 1 : 0;
  const totalPages = 1 + numDetailPages + hasCommentsPage;

  // Criar estilos dinâmicos baseados no fontSize
  const dynamicStyles = StyleSheet.create({
    page: {
      ...styles.page,
      fontSize: baseFontSize,
    },
    title: {
      ...styles.title,
      fontSize: baseFontSize * 2,
    },
    subtitle: {
      ...styles.subtitle,
      fontSize: baseFontSize + 2,
    },
    sectionTitle: {
      ...styles.sectionTitle,
      fontSize: baseFontSize + 4,
    },
    label: {
      ...styles.label,
      fontSize: baseFontSize,
    },
    value: {
      ...styles.value,
      fontSize: baseFontSize,
    },
    tableColHeader: {
      ...styles.tableColHeader,
      fontSize: baseFontSize - 1,
    },
    tableCol: {
      ...styles.tableCol,
      fontSize: baseFontSize - 2,
    },
  });

  // First page: summary + resumo por produto + comentarios
  // Following pages: detalhado (registros)
  return (
    <Document>
      <Page size="A4" orientation="portrait" style={dynamicStyles.page}>
        <View style={styles.header}>
          {logoUrl && (
            <Image 
              src={logoUrl} 
              style={styles.logo}
            />
          )}
          <View style={styles.titleContainer}>
            <Text style={dynamicStyles.title}>Relatório de Amendoim - Cortez</Text>
            <Text style={dynamicStyles.subtitle}>Gerado em: {dataGeracao}</Text>
            {filtros.dataInicio && (
              <Text style={dynamicStyles.subtitle}>Período: {filtros.dataInicio} até {filtros.dataFim || "hoje"}</Text>
            )}
            {filtros.tipo && <Text style={dynamicStyles.subtitle}>Tipo: {filtros.tipo}</Text>}
            {filtros.codigoProduto && <Text style={dynamicStyles.subtitle}>Cód. Produto: {filtros.codigoProduto}</Text>}
            {filtros.nomeProduto && <Text style={dynamicStyles.subtitle}>Produto: {filtros.nomeProduto}</Text>}
            {filtros.codigoCaixa && <Text style={dynamicStyles.subtitle}>Cód. Caixa: {filtros.codigoCaixa}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Informações Gerais</Text>
          
          <View style={{ marginBottom: 6 }}>
            <Text style={dynamicStyles.label}>
              Total de Registros:{" "}
              <Text style={dynamicStyles.value}>{stats.totalRegistros}</Text>
            </Text>
          </View>

          <View style={{ marginBottom: 6 }}>
            <Text style={dynamicStyles.label}>
              Peso Total:{" "}
              <Text style={dynamicStyles.value}>{formatNumber(stats.pesoTotal, 3)} kg</Text>
            </Text>
          </View>

          <View style={{ marginBottom: 6 }}>
            <Text style={dynamicStyles.label}>
              Peso Entrada:{" "}
              <Text style={dynamicStyles.value}>{formatNumber(pesoEntrada, 3)} kg</Text>
            </Text>
          </View>

          <View style={{ marginBottom: 6 }}>
            <Text style={dynamicStyles.label}>
              Peso Saída:{" "}
              <Text style={dynamicStyles.value}>{formatNumber(pesoSaida, 3)} kg</Text>
            </Text>
          </View>

          <View style={{ marginBottom: 6 }}>
            <Text style={dynamicStyles.label}>
              Rendimento:{" "}
              <Text style={dynamicStyles.value}>{rendimento}%</Text>
            </Text>
          </View>

          <View style={{ marginBottom: 6 }}>
            <Text style={dynamicStyles.label}>
              Produtos Únicos:{" "}
              <Text style={dynamicStyles.value}>{stats.produtosUnicos}</Text>
            </Text>
          </View>
        </View>

        {/* Tabela de balanças (entradas x saídas) */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Balanças (Entradas / Saídas)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[dynamicStyles.tableColHeader, { width: '50%' }]}>Balança</Text>
              <Text style={[dynamicStyles.tableColHeader, { width: '25%', textAlign: 'right' }]}>Entrada (kg)</Text>
              <Text style={[dynamicStyles.tableColHeader, { width: '25%', textAlign: 'right' }]}>Saída (kg)</Text>
            </View>
            {balancas.map((b, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                <Text style={[dynamicStyles.tableCol, { width: '50%' }]}>{b.balanca}</Text>
                <Text style={[dynamicStyles.tableCol, { width: '25%', textAlign: 'right' }]}>{formatNumber(b.entrada, 3)}</Text>
                <Text style={[dynamicStyles.tableCol, { width: '25%', textAlign: 'right' }]}>{formatNumber(b.saida, 3)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabela de produtos (entradas x saídas) */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Produtos (Entradas / Saídas)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[dynamicStyles.tableColHeader, { width: '60%' }]}>Produto</Text>
              <Text style={[dynamicStyles.tableColHeader, { width: '20%', textAlign: 'right' }]}>Entrada (kg)</Text>
              <Text style={[dynamicStyles.tableColHeader, { width: '20%', textAlign: 'right' }]}>Saída (kg)</Text>
            </View>
            {produtosEntrSaida.map((p, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                <Text style={[dynamicStyles.tableCol, { width: '60%' }]}>{p.nome}</Text>
                <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'right' }]}>{formatNumber(p.entrada, 3)}</Text>
                <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'right' }]}>{formatNumber(p.saida, 3)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Resumo por Produto</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[dynamicStyles.tableColHeader, { width: '60%' }]}>Produto</Text>
              <Text style={[dynamicStyles.tableColHeader, { width: '20%', textAlign: 'right' }]}>Registros</Text>
              <Text style={[dynamicStyles.tableColHeader, { width: '20%', textAlign: 'right' }]}>Peso (kg)</Text>
            </View>
            {resumoProdutos.map((p, i) => (
              <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                <Text style={[dynamicStyles.tableCol, { width: '60%' }]}>{p.name}</Text>
                <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'right' }]}>{p.count}</Text>
                <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'right' }]}>{formatNumber(p.value, 3)}</Text>
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
        const fim = Math.min(inicio + registrosPorPagina, registrosParaExibir.length);
        const registrosPagina = registrosParaExibir.slice(inicio, fim);
        return (
          <Page key={pageIdx} size="A4" orientation="portrait" style={dynamicStyles.page}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={dynamicStyles.title}>Relatório de Amendoim - Cortez</Text>
                <Text style={dynamicStyles.subtitle}>Gerado em: {dataGeracao}</Text>
                {filtros.dataInicio && (
                  <Text style={dynamicStyles.subtitle}>Período: {filtros.dataInicio} até {filtros.dataFim || "hoje"}</Text>
                )}
                {filtros.tipo && <Text style={dynamicStyles.subtitle}>Tipo: {filtros.tipo}</Text>}
                {filtros.codigoProduto && <Text style={dynamicStyles.subtitle}>Cód. Produto: {filtros.codigoProduto}</Text>}
                {filtros.nomeProduto && <Text style={dynamicStyles.subtitle}>Produto: {filtros.nomeProduto}</Text>}
                {filtros.codigoCaixa && <Text style={dynamicStyles.subtitle}>Cód. Caixa: {filtros.codigoCaixa}</Text>}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={dynamicStyles.sectionTitle}>Registros (detalhado)</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[dynamicStyles.tableColHeader, styles.col1]}>Tipo</Text>
                  <Text style={[dynamicStyles.tableColHeader, styles.col2]}>Data</Text>
                  <Text style={[dynamicStyles.tableColHeader, styles.col3]}>Hora</Text>
                  <Text style={[dynamicStyles.tableColHeader, styles.col4]}>Cód. Produto</Text>
                  <Text style={[dynamicStyles.tableColHeader, styles.col5]}>Cód. Caixa</Text>
                  <Text style={[dynamicStyles.tableColHeader, styles.col6]}>Nome Produto</Text>
                  <Text style={[dynamicStyles.tableColHeader, styles.col7]}>Peso (kg)</Text>
                  <Text style={[dynamicStyles.tableColHeader, styles.col8]}>Balança</Text>
                </View>

                {registrosPagina.map((registro, idx) => (
                  <View key={idx} style={idx % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                    <Text style={[dynamicStyles.tableCol, styles.col1]}>{registro.tipo === "entrada" ? "Entrada" : "Saída"}</Text>
                    <Text style={[dynamicStyles.tableCol, styles.col2]}>{registro.dia}</Text>
                    <Text style={[dynamicStyles.tableCol, styles.col3]}>{registro.hora}</Text>
                    <Text style={[dynamicStyles.tableCol, styles.col4]}>{registro.codigoProduto}</Text>
                    <Text style={[dynamicStyles.tableCol, styles.col5]}>{registro.codigoCaixa}</Text>
                    <Text style={[dynamicStyles.tableCol, styles.col6]}>{registro.nomeProduto}</Text>
                    <Text style={[dynamicStyles.tableCol, styles.col7]}>{formatNumber(registro.peso, 3)}</Text>
                    <Text style={[dynamicStyles.tableCol, styles.col8]}>{registro.balanca || "-"}</Text>
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
