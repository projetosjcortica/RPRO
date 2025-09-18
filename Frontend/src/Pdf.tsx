import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#333",
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
  },
  produtosTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
  },
  table: {
    layout: "table",
    width: "auto",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "70%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderBottomColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 4,
  },
  tableColHeaderSmall: {
    width: "30%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderBottomColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f0f0f0",
    padding: 4,
    textAlign: "right",
  },
  tableCol: {
    width: "70%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableColSmall: {
    width: "30%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
    textAlign: "right",
  },
});

interface MyDocumentProps {
  total?: number;
  batidas?: number;
  horaInicio?: string;
  horaFim?: string;
  produtos?: { nome: string; qtd: number }[];
}

export const MyDocument = ({
  total,
  batidas,
  horaInicio,
  horaFim,
  produtos = [],
}: MyDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho */}
      <View style={styles.section}>
        <Text style={styles.title}>Relatório de Produção</Text>
      </View>

      {/* Infos */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Total:</Text>
          <Text>{total ?? 0}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Batidas:</Text>
          <Text>{batidas ?? 0}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Hora inicial:</Text>
          <Text>{horaInicio ?? "-"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Hora final:</Text>
          <Text>{horaFim ?? "-"}</Text>
        </View>
      </View>

      {/* Produtos */}
      <View style={styles.section}>
        <Text style={styles.produtosTitle}>Produtos:</Text>
        {produtos.length === 0 ? (
          <Text>Nenhum produto</Text>
        ) : (
          <View style={styles.table}>
            {/* Cabeçalho tabela */}
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>Nome</Text>
              <Text style={styles.tableColHeaderSmall}>Quantidade</Text>
            </View>
            {/* Linhas */}
            {produtos.map((p, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCol}>{p.nome}</Text>
                <Text style={styles.tableColSmall}>{p.qtd}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  </Document>
);
