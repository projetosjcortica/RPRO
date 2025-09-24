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

// Paleta de Cores Sóbrias
const COLORS = {
  TEXT_DARK: "#333333",
  TEXT_MEDIUM: "#666666",
  BLUE_DARK: "#004080",
  GREY_LIGHT: "#EEEEEE",
  GREY_MEDIUM: "#CCCCCC",
  GREY_EXTRA_LIGHT: "#F9F9F9",
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Roboto",
    color: COLORS.TEXT_DARK,
    lineHeight: 1.5,
  },
  // --- Cabeçalho ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY_MEDIUM,
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 0,
    objectFit: "cover",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.BLUE_DARK,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.TEXT_MEDIUM,
    marginTop: 4,
  },
  // --- Seções ---
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: COLORS.GREY_LIGHT,
    padding: 4,
    borderRadius: 0,
    marginBottom: 8,
    color: COLORS.TEXT_DARK,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.BLUE_DARK,
  },
  // --- Informações Gerais ---
  // CORREÇÃO: Removendo infoRow, label e value para usar um layout flexível limpo
  // e corrigindo a forma como os Textos eram aninhados.
  infoRowContainer: { 
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingHorizontal: 5,
  },
  infoLabel: {
    fontWeight: "bold",
    color: COLORS.TEXT_DARK,
    fontSize: 11,
    width: "40%",
  },
  infoValue: {
    fontWeight: "bold",
    color: COLORS.BLUE_DARK,
    textAlign: "right",
    width: "60%",
    fontSize: 11,
  },
  // --- Tabela ---
  table: {
    width: "100%",
    borderStyle: "solid",
    borderColor: COLORS.GREY_MEDIUM,
    borderWidth: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    flexDirection: "column",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowEven: {
    flexDirection: "row",
    backgroundColor: COLORS.GREY_EXTRA_LIGHT,
  },
  tableColHeader: {
    width: "70%",
    borderStyle: "solid",
    borderColor: COLORS.GREY_MEDIUM,
    borderBottomWidth: 1,
    backgroundColor: COLORS.GREY_LIGHT,
    padding: 6,
    fontWeight: "bold",
    color: COLORS.TEXT_DARK,
    textTransform: "uppercase",
    fontSize: 10,
  },
  tableColHeaderSmall: {
    width: "30%",
    borderStyle: "solid",
    borderColor: COLORS.GREY_MEDIUM,
    borderBottomWidth: 1,
    backgroundColor: COLORS.GREY_LIGHT,
    padding: 6,
    fontWeight: "bold",
    color: COLORS.TEXT_DARK,
    textAlign: "right",
    textTransform: "uppercase",
    fontSize: 10,
  },
  tableCol: {
    width: "70%",
    borderStyle: "solid",
    borderColor: COLORS.GREY_MEDIUM,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 6,
  },
  tableColSmall: {
    width: "30%",
    borderStyle: "solid",
    borderColor: COLORS.GREY_MEDIUM,
    borderBottomWidth: 1,
    padding: 6,
    textAlign: "right",
    fontWeight: "bold",
  },
  category: {
    fontSize: 12,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
    color: COLORS.BLUE_DARK,
    padding: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY_MEDIUM,
  },
  // --- Rodapé ---
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 8,
    color: COLORS.TEXT_MEDIUM,
    borderTopWidth: 1,
    borderTopColor: COLORS.GREY_MEDIUM,
    paddingTop: 6,
    textAlign: "left",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 30,
    fontSize: 8,
    color: COLORS.TEXT_MEDIUM,
    textAlign: "right",
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
    const cat = p.categoria || "Sem Categoria";
    if (!produtosPorCategoria[cat]) produtosPorCategoria[cat] = [];
    produtosPorCategoria[cat].push(p);
  });
  const categorias = Object.keys(produtosPorCategoria).sort();

  // Função utilitária para formatação
  const formatNumber = (num: number | undefined) =>
    (num ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 3 });

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation={orientation}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <View style={[styles.logo, { backgroundColor: COLORS.GREY_LIGHT, justifyContent: "center", alignItems: "center" }]}><Text style={{ color: COLORS.TEXT_MEDIUM }}>LOGO</Text></View>}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{empresa}</Text>
            <Text style={styles.subtitle}>Relatório de Produção - {data}</Text>
          </View>
        </View>

        {/* Informações gerais - CORRIGIDO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            
            {/* Linha Total */}
            <View style={{ width: "48%", ...styles.infoRowContainer }}>
              <Text style={styles.infoLabel}>Total:</Text>
              <Text style={styles.infoValue}>{formatNumber(total)}</Text>
            </View>
            
            {/* Linha Batidas */}
            <View style={{ width: "48%", ...styles.infoRowContainer }}>
              <Text style={styles.infoLabel}>Batidas:</Text>
              <Text style={styles.infoValue}>{batidas ?? 0}</Text>
            </View>
            
            {/* Linha Hora inicial */}
            <View style={{ width: "48%", ...styles.infoRowContainer }}>
              <Text style={styles.infoLabel}>Hora inicial:</Text>
              <Text style={styles.infoValue}>{horaInicio ?? "-"}</Text>
            </View>
            
            {/* Linha Hora final */}
            <View style={{ width: "48%", ...styles.infoRowContainer }}>
              <Text style={styles.infoLabel}>Hora final:</Text>
              <Text style={styles.infoValue}>{horaFim ?? "-"}</Text>
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
                  <Text style={styles.tableColSmall}>{formatNumber(v)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Produtos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos</Text>
          {categorias.map((cat, idx) => (
            <View key={idx} style={{ marginBottom: 15 }}>
              <Text style={styles.category}>{cat}</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableColHeader}>Nome</Text>
                  <Text style={styles.tableColHeaderSmall}>Quantidade</Text>
                </View>
                {produtosPorCategoria[cat].map((p, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                    <Text style={styles.tableCol}>{p.nome}</Text>
                    <Text style={styles.tableColSmall}>{formatNumber(p.qtd)}</Text>
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
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};