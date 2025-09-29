import { Document, Page, Text, StyleSheet, View, Font } from "@react-pdf/renderer";
import type { FC } from "react";

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
  logo: {
    width: 80,
    height: 80,
    marginRight: 15,
    borderRadius: 8,
    objectFit: "cover",
  },
  titleContainer: { flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: "#af1e1eff", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#bbbbbbff", marginTop: 4, marginBottom: 5 },
  section: { marginBottom: 20, flexDirection: "column", break: "auto" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderRadius: 4,
    marginBottom: 10,
    color: "#af1e1eff",
  },
  infoRow: { flexDirection: "column", justifyContent: "space-between", marginBottom: 8 },
  label: { fontWeight: "bold", color: "#374151", width: "40%" },
  value: { width: "60%", textAlign: "right" },
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
  tableRow: { flexDirection: "row" },
  tableRowEven: { flexDirection: "row", backgroundColor: "#f9fafb" },
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
  tableCol: { width: "70%", borderStyle: "solid", borderColor: "#d1d5db", borderBottomWidth: 1, padding: 8 },
  tableColSmall: { width: "30%", borderStyle: "solid", borderColor: "#d1d5db", borderBottomWidth: 1, padding: 8, textAlign: "right" },
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
    color: "#bbbbbbff",
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
    color: "#bbbbbbff",
  },
  comentarioContainer: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  comentarioMeta: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  comentarioTexto: {
    fontSize: 11,
  },
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
  total?: number;
  batidas?: number;
  periodoInicio?: string;
  periodoFim?: string;
  formulas?: { numero: number; nome: string; quantidade: number; porcentagem: number; somatoriaTotal: number }[];
  produtos?: Produto[];
  data?: string;
  empresa?: string;
  observacoes?: string;
  logoSrc?: string;
  orientation?: "portrait" | "landscape";
  formulaSums?: Record<string, number>;
  chartData?: { name: string; value: number }[];
  comentarios?: ComentarioRelatorio[];
}

export const MyDocument: FC<MyDocumentProps> = ({
  total,
  batidas,
  periodoInicio,
  periodoFim,
  formulas = [],
  produtos = [],
  data = new Date().toLocaleDateString("pt-BR"),
  empresa = "Relatorio RPRO",
  observacoes = "",
<<<<<<< HEAD
  // logoSrc,
=======
>>>>>>> 08bf9a8a4e00b5bdf64fe9679abd64f276cfeb98
  orientation = "portrait",
  formulaSums = {},
  chartData = [],
  comentarios = [],
}: MyDocumentProps) => {
  const produtosPorCategoria: Record<string, Produto[]> = {};
  produtos.forEach((p) => {
    const cat = p.categoria || "";
    if (!produtosPorCategoria[cat]) produtosPorCategoria[cat] = [];
    produtosPorCategoria[cat].push(p);
  });
  const categorias = Object.keys(produtosPorCategoria).sort();

  return (
    <Document>
      {/* Página 1 */}
      <Page size="A4" style={styles.page} orientation={orientation}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{empresa}</Text>
            <Text style={styles.subtitle}>Relatório de Produção - {data}</Text>
          </View>
        </View>

        {/* Informações Gerais */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          <View style={styles.infoRow}>
            <View style={{ width: "70%" }}>
              <Text style={styles.label}>
                Total:{" "}
                <Text style={styles.value}>
                  {(total ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 3 })}
                </Text>
              </Text>
            </View>
            <View style={{ width: "70%" }}>
              <Text style={styles.label}>
                Batidas: <Text style={styles.value}>{batidas ?? 0}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={{ width: "70%" }}>
              <Text style={styles.label}>
                Data inicial: <Text style={styles.value}>{periodoInicio ?? "-"}</Text>
              </Text>
            </View>
            <View style={{ width: "70%" }}>
              <Text style={styles.label}>
                Data final: <Text style={styles.value}>{periodoFim ?? "-"}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Fórmulas */}
        {formulas.length > 0 && (
          <View style={styles.section} wrap={true}>
            <Text style={styles.sectionTitle}>Resumo por Fórmula</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>Fórmula</Text>
                <Text style={styles.tableColHeaderSmall}>Total</Text>
              </View>
              {formulas.map((f, i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                  <Text style={styles.tableCol}>{f.nome}</Text>
                  <Text style={styles.tableColSmall}>
                    {f.somatoriaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 3 })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Somatória calculada */}
        {formulaSums && Object.keys(formulaSums).length > 0 && (
          <View style={styles.section} wrap={true}>
            <Text style={styles.sectionTitle}>Somatória por Fórmula (cálculo)</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>Fórmula</Text>
                <Text style={styles.tableColHeaderSmall}>Total</Text>
              </View>
              {Object.entries(formulaSums).map(([nome, val], i) => (
                <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
                  <Text style={styles.tableCol}>{nome}</Text>
                  <Text style={styles.tableColSmall}>
                    {Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 3 })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Rodapé */}
        <Text style={styles.footer} fixed>
          Relatório gerado em {new Date().toLocaleString("pt-BR")} | {empresa}
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>

      {/* Página 2 */}
      <Page size="A4" style={styles.page} orientation={orientation} wrap>
        {/* Produtos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produtos</Text>
          {chartData && chartData.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: "#374151" }}>Resumo rápido</Text>
              {chartData.map((c, i) => (
                <Text key={i} style={{ fontSize: 10 }}>
                  {`${c.name}: ${c.value.toLocaleString("pt-BR", { minimumFractionDigits: 3 })}`}
                </Text>
              ))}
            </View>
          )}
          {categorias.map((cat, idx) => (
            <View key={idx} style={{ marginBottom: 10 }} wrap>
              <View style={styles.table} wrap>
                <View style={styles.tableRow}>
                  <Text style={styles.tableColHeader}>Nome</Text>
                  <Text style={styles.tableColHeaderSmall}>Quantidade</Text>
                </View>
                {produtosPorCategoria[cat].map((p, i) => (
                  <View
                    key={i}
                    style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}
                  >
                    <Text style={styles.tableCol}>{p.nome}</Text>
                    <Text style={styles.tableColSmall}>
                      {p.qtd.toLocaleString("pt-BR", { minimumFractionDigits: 3 })}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Comentários */}
        {comentarios.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comentários do Relatório</Text>
            {comentarios.map((comentario, index) => (
              <View key={index} style={styles.comentarioContainer}>
                <Text style={styles.comentarioMeta}>
                  {comentario.autor || 'Sistema'} • {comentario.data || new Date().toLocaleDateString('pt-BR')}
                </Text>
                <Text style={styles.comentarioTexto}>{comentario.texto}</Text>
              </View>
            ))}
          </View>
        )}

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
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};