import { Document, Page, Text, StyleSheet, View, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#333",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#ddd",
    borderBottomStyle: "solid",
    paddingBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a56db",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    padding: 5,
    borderRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
    paddingBottom: 5,
  },
  label: {
    fontWeight: "bold",
    width: "40%",
  },
  value: {
    width: "60%",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "50%",
    marginBottom: 8,
  },
  produtosTitle: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    flexDirection: "column",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowEven: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
  },
  tableColHeader: {
    width: "70%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderBottomColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#e5e7eb",
    padding: 8,
    fontWeight: "bold",
    color: "#374151",
  },
  tableColHeaderSmall: {
    width: "30%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderBottomColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#e5e7eb",
    padding: 8,
    textAlign: "right",
    fontWeight: "bold",
    color: "#374151",
  },
  tableCol: {
    width: "70%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableColSmall: {
    width: "30%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: "#666",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    borderTopStyle: "solid",
    paddingTop: 10,
  },
  footerText: {
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 30,
    fontSize: 10,
    color: "#666",
  },
  category: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#4b5563",
    backgroundColor: "#f3f4f6",
    padding: 4,
    borderRadius: 2,
  },
});

interface MyDocumentProps {
  total?: number;
  batidas?: number;
  horaInicio?: string;
  horaFim?: string;
  produtos?: { nome: string; qtd: number; categoria?: string }[];
  data?: string;
  empresa?: string;
  observacoes?: string;
  logoSrc?: string;
  orientation?: 'portrait' | 'landscape';
}

export const MyDocument = ({
  total,
  batidas,
  horaInicio,
  horaFim,
  produtos = [],
  data = new Date().toLocaleDateString('pt-BR'),
  empresa = "Empresa",
  observacoes = "",
  logoSrc,
  orientation = 'portrait',
}: MyDocumentProps) => {
  // Agrupar produtos por categoria (se houver)
  const produtosPorCategoria: Record<string, typeof produtos> = {};
  
  produtos.forEach(produto => {
    const categoria = produto.categoria || 'Sem categoria';
    if (!produtosPorCategoria[categoria]) {
      produtosPorCategoria[categoria] = [];
    }
    produtosPorCategoria[categoria].push(produto);
  });
  
  const categorias = Object.keys(produtosPorCategoria).sort();
  
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation={orientation}>
        {/* Cabeçalho com Logo */}
        <View style={styles.header}>
          {logoSrc ? (
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <View style={[styles.logo, { backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" }]}>
              <Text style={{ textAlign: "center" }}>LOGO</Text>
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Relatório de Produção</Text>
            <Text style={styles.subtitle}>{empresa} - {data}</Text>
          </View>
        </View>

        {/* Informações gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Total:</Text>
                <Text style={styles.value}>{total ?? 0}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Batidas:</Text>
                <Text style={styles.value}>{batidas ?? 0}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Hora inicial:</Text>
                <Text style={styles.value}>{horaInicio ?? "-"}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Hora final:</Text>
                <Text style={styles.value}>{horaFim ?? "-"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Produtos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos</Text>
          
              {produtos.length === 0 ? (
            <Text>Nenhum produto registrado neste período</Text>
          ) : categorias.length <= 1 ? (
            <View style={styles.table}>
              {/* Cabeçalho tabela */}
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>Nome</Text>
                <Text style={styles.tableColHeaderSmall}>Quantidade</Text>
              </View>
              {/* Linhas */}
              {produtos.map((p, i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                  <Text style={styles.tableCol}>{p.nome}</Text>
                  <Text style={styles.tableColSmall}>{Number(p.qtd).toLocaleString('pt-BR', { minimumFractionDigits: 3 })}</Text>
                </View>
              ))}
            </View>
          ) : (
            // Produtos por categoria
            categorias.map((categoria, catIndex) => (
              <View key={catIndex} style={{ marginBottom: 10 }}>
                <Text style={styles.category}>{categoria}</Text>
                <View style={styles.table}>
                  {/* Cabeçalho tabela */}
                  <View style={styles.tableRow}>
                    <Text style={styles.tableColHeader}>Nome</Text>
                    <Text style={styles.tableColHeaderSmall}>Quantidade</Text>
                  </View>
                  {/* Linhas */}
                  {produtosPorCategoria[categoria].map((p, i) => (
                    <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                      <Text style={styles.tableCol}>{p.nome}</Text>
                      <Text style={styles.tableColSmall}>{Number(p.qtd).toLocaleString('pt-BR', { minimumFractionDigits: 3 })}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
        
        {/* Observações (se houver) */}
        {observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text>{observacoes}</Text>
          </View>
        )}
        
        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Relatório gerado em {new Date().toLocaleString('pt-BR')} | {empresa}</Text>
          <Image src={logoSrc} style={{ width: 80, height: 20, marginTop: 4 }} />
        </View>
        
        {/* Número da página */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }: { pageNumber: number, totalPages: number }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
};
