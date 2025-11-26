// import { Document, Page, Text, StyleSheet, View, Font, Image, Svg, Path, Rect, Line } from "@react-pdf/renderer";
import { Document, Page, Text, StyleSheet, View, Font, Image} from "@react-pdf/renderer";
import { DASHBOARD_COLORS as palette } from './lib/colors';
import type { FC } from "react";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf" }, // Regular
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 18,
    paddingBottom: 18,
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#333",
    lineHeight: 1.5,
    flexDirection: "column",
  },
  header: {
    
    display: "flex",
    flexDirection: "row",
    justifyContent:"center",
    alignItems: "center",
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 3,
    borderBottomWidth: 2,
    borderBottomColor: "#d1d5db",
    paddingBottom: 10,
  },
  logo: {
    // Fix height to 150 and let width scale to preserve aspect ratio
    width:90,
    maxHeight:120,
    marginRight: 15,
  },
  titleContainer: { flex: 1 },
  // ensure title can wrap under logo when space is constrained
  titleWrapper: { flexGrow: 1, minWidth: 100, display:"flex", justifyContent:"center"},
  title: { fontSize: 24, fontWeight: "bold", color: "#af1e1eff", marginBottom: 5 },
  subtitle: { fontSize: 14, color: "#6f6f6fff", marginTop: 4, marginBottom: 5 },
  section: { marginBottom: 0, flexDirection: "column" },
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
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { fontWeight: "bold", color: "#000000" },
  value: { fontWeight: "normal", textAlign: "right" },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    // keep full border but subtle (neutral gray) to avoid heavy colored bars at page edge
    borderRightWidth: 1,
    borderBottomWidth: 1,
    flexDirection: "column",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
    // allow rows to flow naturally; header is rendered as the first row inside the table
  paddingTop: 0,
  },
  tableRow: { flexDirection: "row" },
  tableRowEven: { flexDirection: "row", backgroundColor: "#f9fafb" },
  tableColHeader: {
    width: "70%",
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#e2e2e2ff",
    padding: 6,
    fontWeight: "bold",
    color: "#af1e1eff",
  },
  tableColHeaderSmall: {
    width: "30%",
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#e5e7eb",
    padding: 6,
    fontWeight: "bold",
    color: "#af1e1eff",
    textAlign: "right",
  },
  // allow long names to wrap and prevent overflow
  tableCol: { width: "70%", borderBottomWidth: 1, borderColor: "#d1d5db", padding: 6, flexWrap: 'wrap' },
  tableColSmall: { width: "30%", borderBottomWidth: 1, borderColor: "#d1d5db", padding: 6, textAlign: "right", minWidth: 60 },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#e2e2e2ff' },
  comentarioContainer: { marginBottom: 10, padding: 12, backgroundColor: "#f8f9fa", borderRadius: 4, border: '1px solid #e5e7eb' },
  comentarioMeta: { fontSize: 10, color: "#666666", marginBottom: 6 },
  comentarioTexto: { fontSize: 11, color: "#333333", lineHeight: 1.4 },
  // Chart styles
  chartSection: { marginBottom: 15 },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, paddingVertical: 4 },
  chartLabel: { marginTop:6 ,width: '25%', fontSize: 10, paddingRight: 4 },
  // increased container/bar heights so bars are clearly visible when rendered to PDF/print
  chartBarContainer: { width: '52%', height: 16, backgroundColor: '#e6e7ea', borderRadius: 4, overflow: 'hidden', marginRight: 6 },
  chartBarFill: { height: 15, backgroundColor: '#af1e1eff', borderRadius: 4 },
  chartValue: { marginTop:6 ,width: '20%', fontSize: 10, textAlign: 'right', paddingRight: 2 },
  chartPercent: {marginTop:6 ,width: '7%', fontSize: 10, textAlign: 'right', color: '#6b7280' },
  // donut
  donutContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  donutBox: { width: '35%', alignItems: 'center', justifyContent: 'center' },
  donutSvg: { width: 120, height: 120 },
  donutCenterText: { position: 'absolute', fontSize: 10, textAlign: 'center', width: 120 },
  legend: { width: '60%', flexDirection: 'column' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendColorBox: { width: 10, height: 10, borderRadius: 2, marginRight: 6 },
  smallNote: { fontSize: 9, color: '#6b7280' },
  // fixed table header that will appear on every page so tables spanning pages keep their header
  // NOTE: removed absolute fixed header because it caused overlap across pages.
  // If a repeating header is required use a page-level fixed component carefully
  // positioned per page; for now we render the header as the first row inside each table.
});

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

export interface MyDocumentProps {
  simplifiedLayout?: boolean;
  logoUrl?: string;
  total?: number;
  batidas?: number;
  periodoInicio?: string;
  periodoFim?: string;
  horaInicial?: string;
  horaFinal?: string;
  formulas?: { numero: number; nome: string; quantidade: number; porcentagem: number; somatoriaTotal: number; batidas?: number; codigo?: string }[];
  produtos: { nome: string; qtd: number | string; unidade?: string; categoria?: string }[];
  data?: string;
  empresa?: string;
  usuario?: string;
  observacoes?: string;
  orientation?: "portrait" | "landscape";
  formulaSums?: Record<string, number>;
  chartData?: { name: string; value: number }[];
  comentarios?: ComentarioRelatorio[];
  showCharts?: boolean;
  produtosChartData?: { name: string; value: number }[];
  formulasChartData?: { name: string; value: number }[];
  horariosChartData?: { name: string; value: number }[];
  semanaChartData?: { name: string; value: number }[];
  diasSemanaChartData?: { name: string; value: number }[];
  pdfCustomization?: PdfCustomization;
  codigoCliente?: string | number;
  codigoPrograma?: string | number;
}

export const MyDocument: FC<MyDocumentProps> = ({
  logoUrl,
  total = 0,
  batidas = 0,
  periodoInicio = "-",
  periodoFim = "-",
  horaInicial = "-",
  horaFinal = "-",
  formulas = [],
  produtos = [],
  data = new Date().toLocaleDateString("pt-BR"),
  empresa = "Relatório Cortez",
  usuario = "Sistema",
  observacoes = "",
  orientation = "portrait",
  formulaSums = {},
  chartData = [],
  comentarios = [],
  showCharts = true,
  pdfCustomization = { fontSize: 'medium', sortOrder: 'alphabetic', formulaSortOrder: 'alphabetic', simplifiedLayout: true },
  simplifiedLayout = true,
  codigoCliente,

  codigoPrograma,
  // produtosChartData = [],
  // formulasChartData = [],
  // horariosChartData = [],
  // semanaChartData = [],
  // diasSemanaChartData = [],
}) => {
  const dataGeracao = new Date().toLocaleString("pt-BR", {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Formatar datas do período
  const formatarData = (data: string) => {
    if (!data || data === '-') return '-';
    try {
      // If the input is a plain ISO date (YYYY-MM-DD) the built-in Date parser
      // treats it as UTC which can shift the day depending on the local timezone.
      // To avoid the "one day behind" issue, construct a local Date when
      // the string matches the YYYY-MM-DD pattern.
      const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/;
      if (isoDateOnly.test(data)) {
        const [y, m, d] = data.split('-').map(Number);
        const local = new Date(y, m - 1, d); // local midnight
        if (isNaN(local.getTime())) return data;
        return local.toLocaleDateString('pt-BR');
      }

      // Fallback: try normal Date parsing for other formats (datetime strings).
      const parsed = new Date(data);
      if (isNaN(parsed.getTime())) return data;
      return parsed.toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  const periodoInicioFormatado = formatarData(periodoInicio);
  const periodoFimFormatado = formatarData(periodoFim);
  
  // Calcular tamanhos de fonte baseados na customização
  const fontSizes = {
    small: { base: 10, title: 20, section: 14, table: 8 },
    medium: { base: 12, title: 24, section: 16, table: 10 },
    large: { base: 14, title: 28, section: 18, table: 12 },
  };
  
  const currentFontSizes = fontSizes[pdfCustomization.fontSize];

  // Calculate a bottom padding to reserve space for the fixed footer so
  // content never overlaps it. Make this depend on the selected font size
  // to remain safe across small/large layouts.
  const pagePaddingBottom = Math.max(40, currentFontSizes.base * 3);

  // Aplicar ordenação nas fórmulas
  const formulasOrdenadas = (() => {
    const formsCopy = [...formulas];
    const sortOrder = pdfCustomization.formulaSortOrder || 'alphabetic';
    
    if (sortOrder === 'alphabetic') {
      return formsCopy.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (sortOrder === 'code') {
      return formsCopy.sort((a, b) => {
        const codeA = a.codigo || a.numero?.toString() || '';
        const codeB = b.codigo || b.numero?.toString() || '';
        return codeA.localeCompare(codeB);
      });
    } else if (sortOrder === 'most-used') {
      return formsCopy.sort((a, b) => b.somatoriaTotal - a.somatoriaTotal);
    }
    
    return formsCopy;
  })();

  // Paginação simples para a tabela de fórmulas: dividimos em chunks para garantir
  // que o cabeçalho seja renderizado em cada página quando a tabela quebrar.
  // Ajuste rowsPerPage conforme o tamanho da fonte para estimar quantas linhas cabem.
  // Use conservative estimates for rows per page to avoid accidental overflow
  // when some cells wrap into multiple lines. These values can be tuned if
  // you know the typical content length.
  const rowsPerPageFormulasByFont: Record<string, number> = {
    // defaults for formula tables
    small: 28,
    medium: 19,
    large: 18,
  };
  const rowsPerPageFormulas = rowsPerPageFormulasByFont[pdfCustomization.fontSize] || 5;

  // Reserve a modest space on the first page for header/metadata for formulas
  const reserveForHeaderAndInfoFormulas = 20; // estimated rows taken by header/other content
  const firstChunkSizeFormulas = Math.max(11, rowsPerPageFormulas - reserveForHeaderAndInfoFormulas);

  // Separate controls for produtos pagination so products first chunk can be
  // independent from formulas (requested change).
  const rowsPerPageProdutosByFont: Record<string, number> = {
    small: 28,
    medium: 20,
    large: 18,
  };
  const rowsPerPageProdutos = rowsPerPageProdutosByFont[pdfCustomization.fontSize] || 5;
  const reserveForHeaderAndInfoProdutos = 6; // products typically share less header space
  const firstChunkSizeProdutos = Math.max(20, rowsPerPageProdutos - reserveForHeaderAndInfoProdutos);

  const formulaChunks: typeof formulasOrdenadas[] = [];
  if (formulasOrdenadas.length > 0) {
    // first chunk limited to firstChunkSizeFormulas
    formulaChunks.push(formulasOrdenadas.slice(0, firstChunkSizeFormulas));
    for (let i = firstChunkSizeFormulas; i < formulasOrdenadas.length; i += rowsPerPageFormulas) {
      formulaChunks.push(formulasOrdenadas.slice(i, i + rowsPerPageFormulas));
    }
  }

  const produtosPorCategoria: Record<string, Produto[]> = {};
  produtos.forEach((p) => {
    const cat = p.categoria || "Sem Categoria";
    if (!produtosPorCategoria[cat]) produtosPorCategoria[cat] = [];
    produtosPorCategoria[cat].push(p);
  });
  const categorias = Object.keys(produtosPorCategoria).sort();

  // Flatten products into a single list (preserve category order) and prepare
  // pagination chunks using the same rows-per-page logic as formulas so that
  // products table breaks pages in the same way and repeats header/title.
  const produtosList: Produto[] = [];
  for (const cat of categorias) {
    const list = produtosPorCategoria[cat] || [];
    // Optionally insert a category header row as a pseudo-row? For now keep
    // plain items to match formula table behavior exactly.
    for (const p of list) produtosList.push(p);
  }

  const produtoChunks: Produto[][] = [];
  if (produtosList.length > 0) {
    // Use produto-specific pagination values so first chunk and continuation
    // sizes can differ from formulas.
    produtoChunks.push(produtosList.slice(0, firstChunkSizeProdutos));
    for (let i = firstChunkSizeProdutos; i < produtosList.length; i += rowsPerPageProdutos) {
      produtoChunks.push(produtosList.slice(i, i + rowsPerPageProdutos));
    }
  }

  // Prepare chart source outside of JSX so it's available during render
  const _chartSource: { name: string; value: number }[] = [];
  if (chartData && Array.isArray(chartData) && chartData.length > 0) {
    for (const c of chartData) _chartSource.push({ name: String(c.name), value: Number(c.value) || 0 });
  } else if (formulaSums && Object.keys(formulaSums).length > 0) {
    for (const [k, v] of Object.entries(formulaSums)) _chartSource.push({ name: k, value: Number(v) || 0 });
  }
  const chartSource = _chartSource;
  // chartTop removed — use chartChunks/ chartDisplay for paginated chart rendering

  // Paginação para gráficos de barras: dividimos o dataset em páginas menores
  // para que, quando o conjunto exceder uma página, possamos repetir o título
  // em páginas subsequentes com o sufixo "(continuação)".
  const chartRowsPerPageByFont: Record<string, number> = {
    small: 28,
    medium: 19,
    large: 12,
  };
  const chartRowsPerPage = chartRowsPerPageByFont[pdfCustomization.fontSize] || 18;
  // Use uma cópia ordenada para dividir em páginas mantendo consistência com a
  // apresentação (maiores valores primeiro). Reserve algumas linhas por página
  // para o cabeçalho/espacamento para evitar que a última linha ultrapasse a
  // margem da página (comportamento observado em PDFs com quebras automáticas).
  const chartDisplay = chartSource.slice().sort((a, b) => b.value - a.value);
  const chartChunks: typeof chartDisplay[] = [];
  if (chartDisplay.length > 0) {
    const reservedHeaderRows = 3; // espaço reservado para título e espaçamento
    const effectiveRowsPerPage = Math.max(6, chartRowsPerPage - reservedHeaderRows);
    for (let i = 0; i < chartDisplay.length; i += effectiveRowsPerPage) {
      chartChunks.push(chartDisplay.slice(i, i + effectiveRowsPerPage));
    }
  }
  // comments will be rendered after the last chart chunk (on the same page)

  // prepare dedicated chunk list for rendering pages (slice(1)) so we can
  // easily detect the last dedicated page and render comments there
  const dedicatedChartChunks = chartChunks && chartChunks.length > 1 ? chartChunks.slice(1) : [];

  // use shared palette, fallback to an extended local palette if needed
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

  // Table padding sizes depend on whether we're rendering the simplified layout.
  // When simplifiedLayout is false we keep the older, larger paddings for
  // table headers and cells so the full PDF follows the legacy visual density.
  const headerPadding = simplifiedLayout ? 3 : 8;
  const headerPaddingTop = simplifiedLayout ? 2 : 14;
  const cellPadding = simplifiedLayout ? 3 : 6;
  const cellPaddingTop = simplifiedLayout ? 3 : 9;

  const renderTable = (
    rows: Produto[],
    keyMapper: (row: Produto) => { col1: string; col2: string }
  ) => (
    <>
      <View style={styles.table}>
        {/* header as first row inside the table so it flows with pages */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[{ width: '80%', fontWeight: 'bold', fontSize: currentFontSizes.table, color: '#af1e1eff', padding: headerPadding, paddingTop: headerPaddingTop }]}>
              Nome
            </Text>
            <Text style={[{ width: '20%', fontWeight: 'bold', fontSize: currentFontSizes.table, color: '#af1e1eff', textAlign: 'right', paddingHorizontal: headerPadding, paddingTop: headerPaddingTop, borderLeftWidth: 1, borderLeftColor: '#d1d5db' }]}>
              Total
            </Text>
          </View>
        {rows.map((row, i) => {
          const { col1, col2 } = keyMapper(row);
          return (
            <View
              key={i}
              style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}
     >
              <Text style={[styles.tableCol, { width: '80%', paddingTop: cellPaddingTop, paddingBottom: 0, paddingHorizontal: cellPadding, fontSize: currentFontSizes.table }]}>{col1}</Text>
              <Text style={[styles.tableColSmall, { width: '20%', paddingTop: cellPaddingTop, paddingBottom: 0, paddingHorizontal: cellPadding, borderLeftColor: '#d1d5db', borderLeftWidth: 1, fontSize: currentFontSizes.table }]}>{col2}</Text>
            </View>
          );
        })}
      </View>
    </>
  );
  
  // Tabela especial para fórmulas com batidas e códigos
  const renderFormulaTable = (
    formulas: Array<{ numero: number; nome: string; quantidade: number; porcentagem: number; somatoriaTotal: number; batidas?: number; codigo?: string }>
  ) => (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <Text style={[{ width: "12%", borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", backgroundColor: "#e2e2e2ff", padding: headerPadding, paddingTop: headerPaddingTop, fontWeight: "bold", color: "#af1e1eff", textAlign: "center" }, { fontSize: currentFontSizes.table }]}>Código</Text>
        <Text style={[{ width: "53%", borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", backgroundColor: "#e2e2e2ff", padding: headerPadding, paddingTop: headerPaddingTop, fontWeight: "bold", color: "#af1e1eff", flexWrap: 'wrap' }, { fontSize: currentFontSizes.table }]}>Nome Fórmula</Text>
        <Text style={[{ width: "10%", borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", backgroundColor: "#e2e2e2ff", padding: headerPadding, paddingTop: headerPaddingTop, fontWeight: "bold", color: "#af1e1eff", textAlign: "center" }, { fontSize: currentFontSizes.table }]}>Batidas</Text>
        <Text style={[{ width: "25%", borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", backgroundColor: "#e2e2e2ff", padding: headerPadding, paddingTop: headerPaddingTop, fontWeight: "bold", color: "#af1e1eff", textAlign:"right" }, { fontSize: currentFontSizes.table }]}>Total</Text>
      </View>
      {formulas.map((f, i) => (
        <View
          key={i}
          style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}
        >
          <Text style={[{ width: "12%", paddingTop: cellPaddingTop , paddingHorizontal: cellPadding, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", textAlign: "center" }, { fontSize: currentFontSizes.table }]}>{f.codigo || f.numero || '-'}</Text>
          <Text style={[{ width: "53%", paddingTop: cellPaddingTop , paddingHorizontal: cellPadding, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", flexWrap: 'wrap' }, { fontSize: currentFontSizes.table }]}>{f.nome}</Text>
          <Text style={[{ width: "10%", paddingTop: cellPaddingTop , paddingHorizontal: cellPadding, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", textAlign: "center" }, { fontSize: currentFontSizes.table }]}>{f.batidas || f.quantidade || '-'}</Text>
          <Text style={[{ width: "25%", paddingTop: cellPaddingTop , paddingHorizontal: cellPadding, borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", textAlign: "right" }, { fontSize: currentFontSizes.table }]}> 
            {f.somatoriaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 3 })} kg
          </Text>
        </View>
      ))}
    </View>
  );

  // Render simplified layout when requested
  if (simplifiedLayout) {
    return (
      <Document>
        {/* Página 1 */}
        <Page size="A4" style={[styles.page, { paddingBottom: 3 }]} orientation={orientation}>
          <View style={styles.header}>
            {/* Logo à esquerda */}
            {logoUrl && (
              <Image
                src={logoUrl}
                style={styles.logo}
              />
            )}
            <View style={styles.titleContainer}>
              <View style={styles.titleWrapper}>
                <Text style={[styles.title, { fontSize: currentFontSizes.title }]}>{empresa}</Text>
                <Text style={[styles.subtitle, { fontSize: currentFontSizes.base + 2 }]}>
                  Relatório de Produção
                </Text>
                {/* Data e Hora em uma única linha */}
                <Text style={{ fontSize: currentFontSizes.base, color: '#4b5563' }}>
                  Data: {periodoInicioFormatado} a {periodoFimFormatado} • Horário: {horaInicial} às {horaFinal}
                </Text>
                {codigoCliente && (
                   <Text style={{ fontSize: currentFontSizes.base, color: '#4b5563', marginTop: 2 }}>
                     Cliente: {codigoCliente} {codigoPrograma ? `• Programa: ${codigoPrograma}` : ''}
                   </Text>
                )}
              </View>
            </View>
          </View>


          {/* Principais Fórmulas e Tabela de Fórmulas (compacto) */}
          {(formulasOrdenadas.length > 0 || (formulaSums && Object.keys(formulaSums).length > 0) || (chartData && chartData.length > 0)) && (
            <View style={{ marginTop: 0}}>
              <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginTop: 3, marginBottom: 3 }]}>Tabela de Fórmulas</Text>
              {formulasOrdenadas.length > 0 ? (
                renderFormulaTable(formulaChunks[0] || [])
              ) : (
                // fallback render from formulaSums or chartData
                renderFormulaTable(((formulaSums && Object.keys(formulaSums).length > 0)
                  ? Object.entries(formulaSums).map(([k, v], idx) => ({ numero: idx + 1, nome: k, quantidade: 0, porcentagem: 0, somatoriaTotal: Number(v) || 0 }))
                  : (chartData || []).map((d: any, idx: number) => ({ numero: idx + 1, nome: d.name, quantidade: 0, porcentagem: 0, somatoriaTotal: d.value }))
                ))
              )}
            </View>
          )}

          {/* Tabela de produtos (apenas) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginTop:0 ,marginBottom: 3 }]}>Tabela de Produtos</Text>
            {produtoChunks.length > 0 ? (
              renderTable(produtoChunks[0], (p) => {
                const valueNum = Number(p.qtd) || 0;
                return {
                  col1: p.nome,
                  col2: `${valueNum.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${p.unidade || 'kg'}`,
                };
              })
            ) : (
              <Text style={{ fontSize: currentFontSizes.base }}>Nenhum produto para exibir.</Text>
            )}
          </View>

          {/* Se houver apenas 1 página de produtos, mostrar totais e comentários aqui */}
          {produtoChunks.length <= 1 && (
            <>
               <View style={{ marginTop: 2, marginBottom: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
                    <Text style={{ fontSize: currentFontSizes.base, fontWeight: 'bold', marginRight: 10 }}>Total:</Text>
                    <Text style={{ fontSize: currentFontSizes.base }}>{total.toLocaleString("pt-BR", { minimumFractionDigits: 3 })} kg</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Text style={{ fontSize: currentFontSizes.base, fontWeight: 'bold', marginRight: 10 }}>Batidas:</Text>
                    <Text style={{ fontSize: currentFontSizes.base }}>{batidas}</Text>
                  </View>
               </View>
            </>
          )}

          {renderRodape()}
        </Page>

        {/* Páginas dedicadas para a tabela de produtos */}
        {produtoChunks.length > 1 && produtoChunks.slice(1).filter(c => c && c.length > 0).map((chunk, idx) => (
          <Page key={`produtos-dedicated-${idx}`} size="A4" style={[styles.page, { paddingBottom: 5 }]} orientation={orientation} wrap>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 12 }]}>Tabela de produtos</Text>
              {renderTable(chunk, (p) => {
                const valueNum = Number(p.qtd) || 0;
                return {
                  col1: p.nome,
                  col2: `${valueNum.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${p.unidade || 'kg'}`,
                };
              })}
            </View>

            {/* Se for a última página, mostrar totais e comentários */}
            {idx === (produtoChunks.length - 2) && ( // -2 because slice(1) removes the first chunk
               <>
                 <View style={{ marginBottom: 1, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
                      <Text style={{ fontSize: currentFontSizes.base, fontWeight: 'bold', marginRight: 10 }}>Total:</Text>
                      <Text style={{ fontSize: currentFontSizes.base }}>{total.toLocaleString("pt-BR", { minimumFractionDigits: 3 })} kg</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <Text style={{ fontSize: currentFontSizes.base, fontWeight: 'bold', marginRight: 10 }}>Batidas:</Text>
                      <Text style={{ fontSize: currentFontSizes.base }}>{batidas}</Text>
                    </View>
                 </View>

                 {comentarios && comentarios.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 12 }]}>Comentários do relatório</Text>
                    {comentarios.map((c, i) => (
                      <View key={`coment-last-${i}`} style={styles.comentarioContainer}>
                        <Text style={styles.comentarioMeta}>{c.data ? formatarData(c.data) : new Date().toLocaleDateString('pt-BR')}{c.autor && ` • ${c.autor}`}</Text>
                        <Text style={styles.comentarioTexto}>{c.texto}</Text>
                      </View>
                    ))}
                  </View>
                )}
               </>
            )}

            {renderRodape()}
          </Page>
        ))}
      </Document>
    );
  }

  // Layout completo (padrão)
  return (
    <Document>
    {/* Página 1 */}
    <Page size="A4" style={[styles.page, { paddingBottom: pagePaddingBottom }]} orientation={orientation}>
      <View style={styles.header}>
        {/* Logo à esquerda */}
        {logoUrl && (
          <Image
            src={logoUrl}
            style={styles.logo}
            // preserve aspect ratio; react-pdf will scale width accordingly when only height provided
          />
        )}
        <View style={styles.titleContainer}>
          <View style={styles.titleWrapper}>
            <Text style={[styles.title, { fontSize: currentFontSizes.title }]}>{empresa}</Text>
            <Text style={[styles.subtitle, { fontSize: currentFontSizes.base + 2 }]}>
              Relatório de Produção - {data}
            </Text>
          </View>
        </View>
      </View>

      {/* Informações gerais */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section }]}>Informações Gerais</Text>

        <View style={{ marginBottom: 6 }}>
          <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
            Total:{" "}
            <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>
              {total.toLocaleString("pt-BR", { minimumFractionDigits: 3 })} kg
            </Text>
          </Text>
        </View>

        <View style={{ marginBottom: 6 }}>
          <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
            Batidas: <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>{batidas}</Text>
          </Text>
        </View>

        {codigoCliente && (
          <View style={{ marginBottom: 6 }}>
            <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
              Cód. Cliente: <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>{codigoCliente}</Text>
            </Text>
          </View>
        )}

        {codigoPrograma && (
          <View style={{ marginBottom: 6 }}>
            <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
              Cód. Programa: <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>{codigoPrograma}</Text>
            </Text>
          </View>
        )}

        <View style={{ marginBottom: 6 }}>
          <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
            Data inicial: <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>{periodoInicioFormatado}</Text>
          </Text>
        </View>

        <View style={{ marginBottom: 6 }}>
          <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
            Data final: <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>{periodoFimFormatado}</Text>
          </Text>
        </View>

        <View style={{ marginBottom: 6 }}>
          <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
            Hora inicial: <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>{horaInicial}</Text>
          </Text>
        </View>

        <View style={{ marginBottom: 6 }}>
          <Text style={[styles.label, { fontSize: currentFontSizes.base }]}>
            Hora final: <Text style={[styles.value, { fontSize: currentFontSizes.base }]}>{horaFinal}</Text>
          </Text>
        </View>
      </View>
      

      {/* Fórmulas: renderiza um primeiro chunk na página atual e o resto em páginas dedicadas */}
      {formulasOrdenadas.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 15 }]}>Tabela de fórmulas</Text>
          {renderFormulaTable(formulaChunks[0] || [])}
        </View>
      )}

      {renderRodape()}
      </Page>

      {/* Páginas dedicadas para a tabela de fórmulas (cada chunk em sua própria página) */}
      {formulasOrdenadas.length > 0 && formulaChunks.length > 1 && formulaChunks.slice(1).filter(c => c && c.length > 0).map((chunk, idx) => (
        <Page key={`formulas-dedicated-${idx}`} size="A4" style={[styles.page, { paddingBottom: pagePaddingBottom }]} orientation={orientation} wrap>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 12 }]}>Tabela de fórmulas</Text>
            {renderFormulaTable(chunk)}
          </View>

          {renderRodape()}
        </Page>
      ))}

    {/* Página 2 */}
    <Page size="A4" style={[styles.page, { paddingBottom: pagePaddingBottom }]} orientation={orientation} wrap>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 15 }]}>Tabela de produtos</Text>
        {produtoChunks.length > 0 ? (
          // render first chunk inline (may share the page with previous content)
          renderTable(produtoChunks[0], (p) => {
            const valueNum = Number(p.qtd) || 0;
            return {
              col1: p.nome,
              col2: `${valueNum.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${p.unidade || 'kg'}`,
            };
          })
        ) : (
          <Text style={{ fontSize: currentFontSizes.base }}>Nenhum produto para exibir.</Text>
        )}
      </View>

      {renderRodape()}
    </Page>

    {/* Páginas dedicadas para a tabela de produtos (cada chunk em sua própria página) */}
    {produtoChunks.length > 1 && produtoChunks.slice(1).filter(c => c && c.length > 0).map((chunk, idx) => (
      <Page key={`produtos-dedicated-${idx}`} size="A4" style={[styles.page, { paddingBottom: pagePaddingBottom }]} orientation={orientation} wrap>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 12 }]}>Tabela de produtos</Text>
          {renderTable(chunk, (p) => {
            const valueNum = Number(p.qtd) || 0;
            return {
              col1: p.nome,
              col2: `${valueNum.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${p.unidade || 'kg'}`,
            };
          })}
        </View>

        {renderRodape()}
      </Page>
    ))}
    {/* Página 3 */}
    <Page size="A4" style={[styles.page, { paddingBottom: pagePaddingBottom }]} orientation={orientation} wrap>

      {/* Gráficos */}
      {showCharts && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section }]}>Análise de Produção</Text>
          {(!chartChunks || chartChunks.length === 0) ? (
            <Text style={styles.smallNote}>Nenhum dado de gráfico disponível.</Text>
          ) : (
            <View style={[styles.chartSection, { flexDirection: 'column' }]}>
              <View style={{ marginTop: 4 }}>
                {chartChunks[0].map((row, i) => {
                  const totalAll = chartDisplay.reduce((s, it) => s + it.value, 0) || 1;
                  const pct = row.value <= 0 ? 0 : (row.value / totalAll) * 100;
                  const color = palette[i % palette.length];
                  return (
                    <View key={`chart-row-0-${i}`} style={styles.chartRow}>
                      <Text style={styles.chartLabel}>{row.name.length > 30 ? row.name.substring(0, 27) + '...' : row.name}</Text>
                      <View style={styles.chartBarContainer}>
                        {/* Ensure a small minimum visible width so tiny percentages still render visibly in print/PDF */}
                        <View style={[styles.chartBarFill, { width: `${Math.max(4, Math.round(pct))}%`, backgroundColor: color }]} />
                      </View>
                      <Text style={styles.chartValue}>{Number(row.value).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg</Text>
                      <Text style={styles.chartPercent}>{pct.toFixed(1)}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Se não houver páginas dedicadas de continuação dos gráficos, renderize os comentários
          na mesma página (logo após o primeiro chunk de gráficos) */}
      {chartChunks && chartChunks.length <= 1 && comentarios && comentarios.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 12 }]}>Comentários do relatório</Text>
          {comentarios.map((c, i) => (
            <View key={`coment-${i}`} style={styles.comentarioContainer}>
              <Text style={styles.comentarioMeta}>
                {c.data ? formatarData(c.data) : new Date().toLocaleDateString("pt-BR")}
                {c.autor && ` • ${c.autor}`}
              </Text>
              <Text style={styles.comentarioTexto}>{c.texto}</Text>
            </View>
          ))}
        </View>
      )}

      {observacoes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text>{observacoes}</Text>
        </View>
      )}
        
      {renderRodape()}
    </Page>

    {/* Comentários serão renderizados após todas as páginas de gráfico (inseridos abaixo). */}

    {/* Páginas dedicadas para continuação dos gráficos de barras */}
    {showCharts && dedicatedChartChunks && dedicatedChartChunks.length > 0 && dedicatedChartChunks.map((chunk, idx) => (
      <Page key={`charts-dedicated-${idx}`} size="A4" style={[styles.page, { paddingBottom: pagePaddingBottom }]} orientation={orientation} wrap>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 12 }]}>Análise de Produção</Text>
          <View style={[styles.chartSection, { flexDirection: 'column' }]}>
            <View style={{ marginTop: 4 }}>
              {chunk.map((row, i) => {
                const totalAll = chartDisplay.reduce((s, it) => s + it.value, 0) || 1;
                const pct = row.value <= 0 ? 0 : (row.value / totalAll) * 100;
                const color = palette[i % palette.length];
                return (
                  <View key={`chart-row-${idx + 1}-${i}`} style={styles.chartRow}>
                    <Text style={styles.chartLabel}>{row.name.length > 30 ? row.name.substring(0, 27) + '...' : row.name}</Text>
                    <View style={styles.chartBarContainer}>
                      <View style={[styles.chartBarFill, { width: `${Math.max(4, Math.round(pct))}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.chartValue}>{Number(row.value).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg</Text>
                    <Text style={styles.chartPercent}>{pct.toFixed(1)}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Se for a última página dedicada de gráfico, renderize os comentários aqui */}
        {idx === (dedicatedChartChunks.length - 1) && comentarios && comentarios.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 12 }]}>Comentários do relatório</Text>
            {comentarios.map((c, i) => (
              <View key={`coment-last-${i}`} style={styles.comentarioContainer}>
                <Text style={styles.comentarioMeta}>{c.data ? formatarData(c.data) : new Date().toLocaleDateString('pt-BR')}{c.autor && ` • ${c.autor}`}</Text>
                <Text style={styles.comentarioTexto}>{c.texto}</Text>
              </View>
            ))}
          </View>
        )}

        {renderRodape()}
      </Page>
    ))}

    {/* Comentários serão renderizados inline na última página de gráficos */}

    </Document>
  );
};