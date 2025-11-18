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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6f6f6fff",
    marginBottom: 3,
  },
  section: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#af1e1eff",
    color: "#ffffff",
    padding: 4,
    borderRadius: 4,
    marginBottom: 10,
    textAlign: "center",
  },
  highlightBox: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#af1e1eff",
    color: "#ffffff",
    padding: 6,
    borderRadius: 4,
    marginBottom: 10,
    textAlign: "center",
    width: "40%",
    alignSelf: "center",
  },
  label: {
    fontWeight: "bold",
    fontSize: 12,
  },
  value: {
    textAlign: "right",
    fontSize: 12,
    fontWeight: "normal",
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
  },
  tableRowEven: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #d1d5db",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e2e2ff",
    borderBottom: "1px solid #d1d5db",
    fontWeight: "bold",
  },
  tableCol: {
    fontSize: 10,
    paddingHorizontal: 4,
    color: "#374151",
  },
  tableColHeader: {
    fontSize: 10,
    padding: 4,
    fontWeight: "bold",
    color: "#af1e1eff",
    borderLeftWidth: 1,
    borderLeftColor: "#d1d5db",
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
  empresa?: string;
  proprietario?: string;
  tabelasSeparadas?: boolean;
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
  tabelasSeparadas = true,
  fontSize = "media",
  ordenacao = "data",
  agruparPorProduto = false,
  logoUrl,
  empresa = "Relatório Cortez",
  proprietario,
}: AmendoimPDFDocumentProps) => {
  const reportTitle = proprietario || empresa;
  const dataGeracao = new Date().toLocaleString("pt-BR");

  // Função para formatar datas no padrão brasileiro (DD/MM/YYYY)
  const formatDateBR = (dateStr?: string): string => {
    if (!dateStr) return "";
    
    // Se já está no formato DD/MM/YYYY ou DD/MM/YY
    if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Se está no formato YYYY-MM-DD (ISO)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    }
    
    // Tentar converter como Date object
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch {}
    
    return dateStr;
  };

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

  // Calcular horários de início e fim do período
  let horarioInicio = "";
  let horarioFim = "";
  
  if (registrosParaExibir.length > 0) {
    // Ordenar por data/hora para pegar primeiro e último registro
    const registrosOrdenadosPorTempo = [...registrosParaExibir].sort((a, b) => {
      const dateA = new Date(`${a.dia} ${a.hora}`).getTime();
      const dateB = new Date(`${b.dia} ${b.hora}`).getTime();
      return dateA - dateB; // Mais antigo primeiro
    });
    
    const primeiroRegistro = registrosOrdenadosPorTempo[0];
    const ultimoRegistro = registrosOrdenadosPorTempo[registrosOrdenadosPorTempo.length - 1];
    
    horarioInicio = primeiroRegistro.hora || "";
    horarioFim = ultimoRegistro.hora || "";
  }

  // Debug: if pesoTotal isn't numeric, warn to help tracing server/client payload shape
  if (!isFinite(Number(stats.pesoTotal))) {
    // eslint-disable-next-line no-console
    console.warn("AmendoimPDF: stats.pesoTotal is not a finite number", stats.pesoTotal, stats);
  }

  // Construir agregados por produto (entradas x saídas)
  const produtoMap: Record<string, { entrada: number; saida: number; entradaCount: number; saidaCount: number }> = {};
  registrosParaExibir.forEach((r) => {
    const prodKey = r.nomeProduto || r.codigoProduto || '(sem nome)';
    if (!produtoMap[prodKey]) produtoMap[prodKey] = { entrada: 0, saida: 0, entradaCount: 0, saidaCount: 0 };
    const peso = Number(r.peso || 0);
    if (r.tipo === 'entrada') {
      produtoMap[prodKey].entrada += peso;
      produtoMap[prodKey].entradaCount += 1;
    } else {
      produtoMap[prodKey].saida += peso;
      produtoMap[prodKey].saidaCount += 1;
    }
  });
  const produtosEntrSaida = Object.entries(produtoMap).map(([nome, v]) => ({ nome, ...v }));
  
  const hasComentarios = comentarios && comentarios.length > 0;
  const totalPages = 1 + (hasComentarios ? 1 : 0);

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
    highlightBox: {
      ...styles.highlightBox,
      fontSize: baseFontSize + 2,
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
            <Text style={dynamicStyles.title}>{reportTitle}</Text>
            <Text style={dynamicStyles.subtitle}>Gerado em: {dataGeracao}</Text>
            {filtros.codigoProduto && <Text style={dynamicStyles.subtitle}>Cód. Produto: {filtros.codigoProduto}</Text>}
            {filtros.nomeProduto && <Text style={dynamicStyles.subtitle}>Produto: {filtros.nomeProduto}</Text>}
            {filtros.codigoCaixa && <Text style={dynamicStyles.subtitle}>Cód. Caixa: {filtros.codigoCaixa}</Text>}
          </View>
        </View>

        {!tabelasSeparadas && (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Informações Gerais</Text>
            
            {filtros.dataInicio && (
              <View style={{ marginBottom: 6 }}>
                <Text style={dynamicStyles.label}>
                  Período:{" "}
                  <Text style={dynamicStyles.value}>
                    {formatDateBR(filtros.dataInicio)}{horarioInicio ? ` às ${horarioInicio}` : ""} até {formatDateBR(filtros.dataFim) || "hoje"}{horarioFim ? ` às ${horarioFim}` : ""}
                  </Text>
                </Text>
              </View>
            )}
            
            <View style={{ marginBottom: 6 }}>
              <Text style={dynamicStyles.label}>
                Total de Registros:{" "}
                <Text style={dynamicStyles.value}>{stats.totalRegistros}</Text>
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
                Produtos Únicos:{" "}
                <Text style={dynamicStyles.value}>{stats.produtosUnicos}</Text>
              </Text>
            </View>
          </View>
        )}



        {/* Tabela de produtos (entradas x saídas) */}
        {!tabelasSeparadas ? (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Produtos (Entradas / Saídas)</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[dynamicStyles.tableColHeader, { width: '48%' }]}>Produto</Text>
                <Text style={[dynamicStyles.tableColHeader, { width: '14%', textAlign: 'right', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>Entrada (kg)</Text>
                <Text style={[dynamicStyles.tableColHeader, { width: '14%', textAlign: 'right', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>Saída (kg)</Text>
                <Text style={[dynamicStyles.tableColHeader, { width: '12%', textAlign: 'center', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>Reg. Ent.</Text>
                <Text style={[dynamicStyles.tableColHeader, { width: '12%', textAlign: 'center', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>Reg. Saí.</Text>
              </View>
              {produtosEntrSaida.map((p, i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                  <Text style={[dynamicStyles.tableCol, { width: '48%', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{p.nome}</Text>
                  <Text style={[dynamicStyles.tableCol, { width: '14%', textAlign: 'right', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{formatNumber(p.entrada, 3)}</Text>
                  <Text style={[dynamicStyles.tableCol, { width: '14%', textAlign: 'right', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{formatNumber(p.saida, 3)}</Text>
                  <Text style={[dynamicStyles.tableCol, { width: '12%', textAlign: 'center', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{p.entradaCount}</Text>
                  <Text style={[dynamicStyles.tableCol, { width: '12%', textAlign: 'center', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{p.saidaCount}</Text>
                </View>
              ))}
              <View style={{ backgroundColor: '#f3f4f6', borderTopWidth: 2, borderTopColor: '#1f2937', paddingVertical: 8, flexDirection: 'row' }}>
                <Text style={[dynamicStyles.tableCol, { width: '48%', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>TOTAL</Text>
                <Text style={[dynamicStyles.tableCol, { width: '14%', textAlign: 'right', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>{formatNumber(pesoEntrada, 3)}</Text>
                <Text style={[dynamicStyles.tableCol, { width: '14%', textAlign: 'right', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>{formatNumber(pesoSaida, 3)}</Text>
                <Text style={[dynamicStyles.tableCol, { width: '12%', textAlign: 'center', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>{produtosEntrSaida.reduce((sum, p) => sum + p.entradaCount, 0)}</Text>
                <Text style={[dynamicStyles.tableCol, { width: '12%', textAlign: 'center', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>{produtosEntrSaida.reduce((sum, p) => sum + p.saidaCount, 0)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            {/* Tabela de Entradas */}
            <View style={styles.section}>
              <Text style={dynamicStyles.sectionTitle}>Produtos - Entradas</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[dynamicStyles.tableColHeader, { width: '60%' }]}>Produto</Text>
                  <Text style={[dynamicStyles.tableColHeader, { width: '20%', textAlign: 'right', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>Peso (kg)</Text>
                  <Text style={[dynamicStyles.tableColHeader, { width: '20%', textAlign: 'center', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>Registros</Text>
                </View>
                {produtosEntrSaida.filter(p => p.entradaCount > 0).map((p, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                    <Text style={[dynamicStyles.tableCol, { width: '60%', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{p.nome}</Text>
                    <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'right', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{formatNumber(p.entrada, 3)}</Text>
                    <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'center', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{p.entradaCount}</Text>
                  </View>
                ))}
                <View style={{ backgroundColor: '#f3f4f6', borderTopWidth: 2, borderTopColor: '#1f2937', paddingVertical: 8, flexDirection: 'row' }}>
                  <Text style={[dynamicStyles.tableCol, { width: '60%', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>TOTAL</Text>
                  <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'right', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>{formatNumber(pesoEntrada, 3)}</Text>
                  <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'center', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>{produtosEntrSaida.reduce((sum, p) => sum + p.entradaCount, 0)}</Text>
                </View>
              </View>
            </View>

            {/* Tabela de Saídas */}
            <View style={{ ...styles.section, marginTop: 20 }}>
              <Text style={dynamicStyles.sectionTitle}>Produtos - Saídas</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[dynamicStyles.tableColHeader, { width: '60%' }]}>Produto</Text>
                  <Text style={[dynamicStyles.tableColHeader, { width: '20%', textAlign: 'right', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>Peso (kg)</Text>
                  <Text style={[dynamicStyles.tableColHeader, { width: '20%', textAlign: 'center', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>Registros</Text>
                </View>
                {produtosEntrSaida.filter(p => p.saidaCount > 0).map((p, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                    <Text style={[dynamicStyles.tableCol, { width: '60%', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{p.nome}</Text>
                    <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'right', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{formatNumber(p.saida, 3)}</Text>
                    <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'center', borderLeftWidth:1, borderLeftColor:'#d1d5db', paddingVertical:6 }]}>{p.saidaCount}</Text>
                  </View>
                ))}
                <View style={{ backgroundColor: '#f3f4f6', borderTopWidth: 2, borderTopColor: '#1f2937', paddingVertical: 8, flexDirection: 'row' }}>
                  <Text style={[dynamicStyles.tableCol, { width: '60%', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>TOTAL</Text>
                  <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'right', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>{formatNumber(pesoSaida, 3)}</Text>
                  <Text style={[dynamicStyles.tableCol, { width: '20%', textAlign: 'center', fontWeight: 'bold', borderLeftWidth:1, borderLeftColor:'#d1d5db' }]}>{produtosEntrSaida.reduce((sum, p) => sum + p.saidaCount, 0)}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Caixa de destaque do Rendimento */}
        <View style={{ marginTop: 20, marginBottom: 12 }}>
          <Text style={dynamicStyles.highlightBox}>Rendimento: {rendimento}%</Text>
        </View>

        {/* Comentários no final da primeira página */}
        {/* {comentarios && comentarios.length > 0 && (
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Comentários</Text>
            {comentarios.map((c, i) => (
              <View key={i} style={{ marginBottom: 8, paddingBottom: 8,borderBottom: i < comentarios.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                {c.data && (
                  <Text style={{ fontSize: dynamicStyles.tableCol.fontSize, color: '#6b7280', marginBottom: 2 }}>
                    {c.data}
                  </Text>
                )}
                <Text style={{ fontSize: dynamicStyles.label.fontSize, color: '#374151' }}>
                  {c.texto}
                </Text>
              </View>
            ))}
          </View>
        )} */}

        <View style={styles.footer}>
          <Text>1 de {totalPages} | Cortez - Sistema de Relatórios | J.Cortiça Automação</Text>
        </View>
      </Page>

      {hasComentarios && (
        <Page size="A4" orientation="portrait" style={dynamicStyles.page}>
          {/* Comentários */}
          <View style={styles.section}>
            <Text style={dynamicStyles.sectionTitle}>Comentários</Text>
            {comentarios.map((c, i) => (
              <View key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < comentarios.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                {c.data && (
                  <Text style={{ fontSize: dynamicStyles.tableCol.fontSize, color: '#6b7280', marginBottom: 2 }}>
                    {c.data}
                  </Text>
                )}
                <Text style={{ fontSize: dynamicStyles.label.fontSize, color: '#374151' }}>
                  {c.texto}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text>2 de {totalPages} | Cortez - Sistema de Relatórios | J.Cortiça Automação</Text>
          </View>
        </Page>
      )}



    </Document>
  );
};
