// src/components/MyDocument.tsx
import { Document, Page, Text, StyleSheet, View, Image, Font } from "@react-pdf/renderer";

// Registrar fonte elegante
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
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#333",
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#af1e1eff",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderRadius: 4,
    marginBottom: 10,
    color: "#af1e1eff",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    color: "#374151",
    width: "40%",
  },
  value: {
    width: "60%",
    textAlign: "right",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    flexDirection: "column",
    borderRadius: 4,
    overflow: "hidden",
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
    borderColor: "#d1d5db",
    borderBottomWidth: 1,
    backgroundColor: "#e5e7eb",
    padding: 8,
    fontWeight: "bold",
    color: "#af1e1eff",
  },
  tableColHeaderSmall: {
    width: "30%",
    borderStyle: "solid",
    borderColor: "#d1d5db",
    borderBottomWidth: 1,
    backgroundColor: "#e5e7eb",
    padding: 8,
    fontWeight: "bold",
    color: "#af1e1eff",
    textAlign: "right",
  },
  tableCol: {
    width: "70%",
    borderStyle: "solid",
    borderColor: "#d1d5db",
    borderBottomWidth: 1,
    padding: 8,
  },
  tableColSmall: {
    width: "30%",
    borderStyle: "solid",
    borderColor: "#d1d5db",
    borderBottomWidth: 1,
    padding: 8,
    textAlign: "right",
  },
  category: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#af1e1eff",
    backgroundColor: "#e0e7ff",
    padding: 4,
    borderRadius: 3,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 10,
    color: "#6b7280",
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    paddingTop: 6,
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 30,
    fontSize: 10,
    color: "#6b7280",
  },
});

interface Produto {
  nome: string;
  qtd: number;
  categoria?: string;
}

interface MyDocumentProps {
  total?: number;
  batidas?: number;
  horaInicio?: string;
  horaFim?: string;
  produtos?: Produto[];
  data?: string;
  empresa?: string;
  observacoes?: string;
  logoSrc?: string;
  orientation?: "portrait" | "landscape";
  formulaSums?: Record<string, number>;
}

export const MyDocument = ({
  total,
  batidas,
  horaInicio,
  horaFim,
  produtos = [],
  data = new Date().toLocaleDateString("pt-BR"),
  empresa = "Empresa",
  observacoes = "",
  logoSrc,
  orientation = "portrait",
  formulaSums = {},
}: MyDocumentProps) => {
  const produtosPorCategoria: Record<string, Produto[]> = {};
  produtos.forEach((p) => {
    const cat = p.categoria || "Sem categoria";
    if (!produtosPorCategoria[cat]) produtosPorCategoria[cat] = [];
    produtosPorCategoria[cat].push(p);
  });
  const categorias = Object.keys(produtosPorCategoria).sort();

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation={orientation}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <View style={[styles.logo, { backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" }]}><Text>LOGO</Text></View>}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{empresa}</Text>
            <Text style={styles.subtitle}>Relatório de Produção - {data}</Text>
          </View>
        </View>

        {/* Informações gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <View style={{ width: "50%" }}>
              <Text style={styles.label}>Total: <Text style={styles.value}>{(total ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 3 })}</Text></Text>
            </View>
            <View style={{ width: "50%" }}>
              <Text style={styles.label}>Batidas: <Text style={styles.value}>{batidas ?? 0}</Text></Text>
            </View>
            <View style={{ width: "50%" }}>
              <Text style={styles.label}>Hora inicial: <Text style={styles.value}>{horaInicio ?? "-"}</Text></Text>
            </View>
            <View style={{ width: "50%" }}>
              <Text style={styles.label}>Hora final: <Text style={styles.value}>{horaFim ?? "-"}</Text></Text>
            </View>
          </View>
        </View>

        {/* Fórmulas */}
        {Object.keys(formulaSums).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo por Fórmula</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>Fórmula</Text>
                <Text style={styles.tableColHeaderSmall}>Total</Text>
              </View>
              {Object.entries(formulaSums).map(([f, v], i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                  <Text style={styles.tableCol}>{f}</Text>
                  <Text style={styles.tableColSmall}>{v.toLocaleString("pt-BR", { minimumFractionDigits: 3 })}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Produtos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos</Text>
          {categorias.map((cat, idx) => (
            <View key={idx} style={{ marginBottom: 10 }}>
              <Text style={styles.category}>{cat}</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableColHeader}>Nome</Text>
                  <Text style={styles.tableColHeaderSmall}>Quantidade</Text>
                </View>
                {produtosPorCategoria[cat].map((p, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                    <Text style={styles.tableCol}>{p.nome}</Text>
                    <Text style={styles.tableColSmall}>{p.qtd.toLocaleString("pt-BR", { minimumFractionDigits: 3 })}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Observações */}
        {observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text>{observacoes}</Text>
          </View>
        )}

        {/* Rodapé */}
        <Text style={styles.footer} fixed>
          Relatório gerado em {new Date().toLocaleString("pt-BR")} | {empresa}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};
