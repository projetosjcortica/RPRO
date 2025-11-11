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
    paddingBottom: 18, // espaço para o rodapé reduzido
    fontSize: 12,
    fontFamily: "Roboto",
    color: "#333",
    lineHeight: 1.5,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
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
  titleWrapper: { flexGrow: 1, minWidth: 100, display:"flex", justifyContent:"center", marginTop:25 },
  title: { fontSize: 24, fontWeight: "bold", color: "#af1e1eff", marginBottom: 4 },
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
  chartLabel: { width: '25%', fontSize: 10, color: '#374151', paddingRight: 4 },
  // increased container/bar heights so bars are clearly visible when rendered to PDF/print
  chartBarContainer: { width: '45%', height: 16, backgroundColor: '#e6e7ea', borderRadius: 4, overflow: 'hidden', marginRight: 6 },
  chartBarFill: { height: 14, backgroundColor: '#af1e1eff', borderRadius: 4 },
  chartValue: { width: '20%', fontSize: 10, textAlign: 'right', color: '#374151', paddingRight: 2 },
  chartPercent: { width: '15%', fontSize: 10, textAlign: 'right', color: '#6b7280' },
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
}

export interface MyDocumentProps {
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
  pdfCustomization = { fontSize: 'medium', sortOrder: 'alphabetic', formulaSortOrder: 'alphabetic' },
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
  const rowsPerPageByFont: Record<string, number> = {
    // increased defaults to allow more rows per page for formula tables
    // These values assume typical row content — tune down if you see wrapping issues.
    small: 28,
    medium: 23,
    large: 18,
  };
  const rowsPerPage = rowsPerPageByFont[pdfCustomization.fontSize] || 5;

  // Reserve a modest space on the first page for header/metadata so the
  // first chunk is larger than before and continuations are fuller.
  const reserveForHeaderAndInfo = 20; // estimated rows taken by header/other content
  const firstChunkSize = Math.max(12, rowsPerPage - reserveForHeaderAndInfo);

  const formulaChunks: typeof formulasOrdenadas[] = [];
  if (formulasOrdenadas.length > 0) {
    // first chunk limited to firstChunkSize
    formulaChunks.push(formulasOrdenadas.slice(0, firstChunkSize));
    for (let i = firstChunkSize; i < formulasOrdenadas.length; i += rowsPerPage) {
      formulaChunks.push(formulasOrdenadas.slice(i, i + rowsPerPage));
    }
  }

  const produtosPorCategoria: Record<string, Produto[]> = {};
  produtos.forEach((p) => {
    const cat = p.categoria || "Sem Categoria";
    if (!produtosPorCategoria[cat]) produtosPorCategoria[cat] = [];
    produtosPorCategoria[cat].push(p);
  });
  const categorias = Object.keys(produtosPorCategoria).sort();

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
    medium: 22,
    large: 12,
  };
  const chartRowsPerPage = chartRowsPerPageByFont[pdfCustomization.fontSize] || 18;

  // Use uma cópia ordenada para dividir em páginas mantendo consistência com a
  // apresentação (maiores valores primeiro).
  const chartDisplay = chartSource.slice().sort((a, b) => b.value - a.value);
  const chartChunks: typeof chartDisplay[] = [];
  if (chartDisplay.length > 0) {
    for (let i = 0; i < chartDisplay.length; i += chartRowsPerPage) {
      chartChunks.push(chartDisplay.slice(i, i + chartRowsPerPage));
    }
  }

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

  // Função para renderizar gráficos de donut SVG com labels em caixas ao redor
  // const renderDonutChart = (data: { name: string; value: number }[], title: string) => {
  //   if (!data || data.length === 0) return null;

  //   const total = data.reduce((sum, item) => sum + item.value, 0);
  //   if (total <= 0) return null;

  // // Use all items (caller should control how many items are present)
  // const displayData = data;

  // // Use shared palette (print-friendly)
  // const colors = (palette && Array.isArray(palette) && palette.length > 0) ? palette : ['#ff2626ff', '#5e5e5eff', '#d4d4d4ff', '#ffa8a8ff', '#1b1b1bff'];

  //   // Calcular ângulos para cada fatia
  //   let currentAngle = 0;
  //   const slices = displayData.map((item, index) => {
  //     const percentage = (item.value / total) * 100;
  //     const angle = (item.value / total) * 360;
  //     const midAngle = currentAngle + angle / 2;
  //     const slice = {
  //       ...item,
  //       percentage,
  //       startAngle: currentAngle,
  //       endAngle: currentAngle + angle,
  //       midAngle,
  //       color: colors[index % colors.length],
  //     };
  //     currentAngle += angle;
  //     return slice;
  //   });

  //   // Gerar paths SVG para donut
  //   const generateDonutPath = (startAngle: number, endAngle: number) => {
  //     const radius = 55;
  //     const innerRadius = 38;
  //     const cx = 150;
  //     const cy = 120;

  //     const startRad = (startAngle - 90) * (Math.PI / 180);
  //     const endRad = (endAngle - 90) * (Math.PI / 180);

  //     const x1 = cx + radius * Math.cos(startRad);
  //     const y1 = cy + radius * Math.sin(startRad);
  //     const x2 = cx + radius * Math.cos(endRad);
  //     const y2 = cy + radius * Math.sin(endRad);
  //     const x3 = cx + innerRadius * Math.cos(endRad);
  //     const y3 = cy + innerRadius * Math.sin(endRad);
  //     const x4 = cx + innerRadius * Math.cos(startRad);
  //     const y4 = cy + innerRadius * Math.sin(startRad);

  //     const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  //     return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  //   };

  //   return (
  //     <View style={{ marginBottom: 20 }}>
  //       <Text style={{
  //         fontSize: 14,
  //         fontWeight: 'bold',
  //         backgroundColor: '#dadadaff',
  //         padding: 6,
  //         borderRadius: 4,
  //         marginBottom: 12,
  //         color: '#af1e1eff',
  //       }}>{title}</Text>
        
  //       {/* SVG com donut */}
  //       <View style={{ alignItems: 'center' }}>
  //           <Svg width="200" height="200" viewBox="0 0 300 240">
  //           {/* Donut central */}
  //           {slices.map((slice, index) => (
  //             <Path
  //               key={`slice-${index}`}
  //               d={generateDonutPath(slice.startAngle, slice.endAngle)}
  //                 fill={slice.color}
  //                 stroke="#ffffff"
  //                 strokeWidth="2"
  //             />
  //           ))}
            
  //           {/* Linhas conectoras */}
  //           {slices.map((slice, index) => {
  //             const midAngleRad = (slice.midAngle - 90) * (Math.PI / 180);
  //             const lineStartRadius = 60;
  //             const labelDistance = index % 2 === 0 ? 105 : 85;
  //             const centerX = 150;
  //             const centerY = 120;
              
  //             const lineStartX = centerX + lineStartRadius * Math.cos(midAngleRad);
  //             const lineStartY = centerY + lineStartRadius * Math.sin(midAngleRad);
  //             const labelX = centerX + labelDistance * Math.cos(midAngleRad);
  //             const labelY = centerY + labelDistance * Math.sin(midAngleRad);
              
  //             return (
  //               <Line
  //                 key={`line-${index}`}
  //                 x1={lineStartX}
  //                 y1={lineStartY}
  //                 x2={labelX}
  //                 y2={labelY}
  //                 stroke={slice.color}
  //                 strokeWidth="1.2"
  //               />
  //             );
  //           })}
  //         </Svg>
          
  //         {/* Labels fora do SVG */}
  //         <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, width: '85%' }}>
  //           {/* Legend: color box + combined label+percentage in single Text to avoid awkward wrapping */}
  //             {slices.map((slice, index) => {
  //               const cleanName = (slice.name || '').replace(/\s+/g, ' ').trim();
  //               const maxLabel = 22; // keep labels short so they fit on one line in most page widths
  //               const shortLabel = cleanName.length > maxLabel ? cleanName.substring(0, maxLabel - 3) + '...' : cleanName;
  //               // Use non-breaking space between number and percent so '%' doesn't wrap to the next line
  //               const pct = `${slice.percentage.toFixed(1)}\u00A0%`;
  //               return (
  //                 <View key={`label-${index}`} style={{ flexDirection: 'row', alignItems: 'center', width: '45%', marginBottom: 6 }}>
  //                   <Text style={{ fontSize: 9, color: '#111827', fontWeight: '600', marginRight: 6 }}>{index + 1}.</Text>
  //                   <View style={{ width: 12, height: 12, backgroundColor: slice.color, borderRadius: 3, marginRight: 8, borderWidth: 0.5, borderColor: '#ffffff' }} />
  //                   <Text style={{ fontSize: 9, color: '#222222' }}>
  //                     {shortLabel} {pct}
  //                   </Text>
  //                 </View>
  //               );
  //             })}
  //         </View>
  //       </View> 
           
  //     </View>
  //   );
  // };

  // Função para renderizar gráfico de barras horizontais (horários)
  // const renderBarChart = (data: { name: string; value: number }[], title: string) => {
  //   if (!data || data.length === 0) return null;

  //   const maxValue = Math.max(...data.map(d => d.value), 1);

  //   return (
  //     <View style={{ marginBottom: 16 }}>
  //       <Text style={{
  //         fontSize: 14,
  //         fontWeight: 'bold',
  //         backgroundColor: '#dadadaff',
  //         padding: 6,
  //         borderRadius: 4,
  //         marginBottom: 10,
  //         color: '#af1e1eff',
  //       }}>{title}</Text>
  //       <View style={{ flexDirection: 'column', gap: 4 }}>
  //         {data.map((item, index) => {
  //           const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
  //           const color = "#ff2626ff"; // Vermelho padrão
            
  //           return (
  //             <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
  //               <Text style={{ fontSize: 8, width: 50, color: '#374151', fontWeight: 'bold' }}>
  //                 {item.name}
  //               </Text>
  //               <View style={{ 
  //                 flex: 1, 
  //                 height: 16, 
  //                 backgroundColor: '#e5e7eb', 
  //                 borderRadius: 3,
  //                 overflow: 'hidden',
  //                 marginHorizontal: 6
  //               }}>
  //                 <View style={{ 
  //                   width: `${Math.max(2, percentage)}%`, 
  //                   height: 16, 
  //                   backgroundColor: color,
  //                   borderRadius: 3
  //                 }} />
  //               </View>
  //               <Text style={{ fontSize: 8, width: 60, textAlign: 'right', color: '#374151' }}>
  //                 {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
  //               </Text>
  //             </View>
  //           );
  //         })}
  //       </View>
  //     </View>
  //   );
  // };

  // Função para renderizar gráfico de barras verticais (semanal/diário)
  // const renderVerticalBarChart = (data: { name: string; value: number }[], title: string) => {
  //   if (!data || data.length === 0) return null;

  //   const maxValue = Math.max(...data.map(d => d.value), 1);
  //   const chartHeight = 120;
  //   const barWidth = 25;
  //   const spacing = 10;
  //   const totalWidth = data.length * (barWidth + spacing);

  //   return (
  //     <View style={{ marginBottom: 16 }}>
  //       <Text style={{
  //         fontSize: 14,
  //         fontWeight: 'bold',
  //         backgroundColor: '#dadadaff',
  //         padding: 6,
  //         borderRadius: 4,
  //         marginBottom: 10,
  //         color: '#af1e1eff',
  //       }}>{title}</Text>
        
  //       <View style={{ alignItems: 'center' }}>
  //         <Svg width={totalWidth} height={chartHeight + 30} viewBox={`0 0 ${totalWidth} ${chartHeight + 30}`}>
  //           {/* Barras */}
  //           {data.map((item, index) => {
  //             const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
  //             const x = index * (barWidth + spacing);
  //             const y = chartHeight - barHeight;
              
  //             return (
  //               <Rect
  //                 key={index}
  //                 x={x}
  //                 y={y}
  //                 width={barWidth}
  //                 height={barHeight}
  //                 fill="#ff2626ff"
  //               />
  //             );
  //           })}
  //         </Svg>
          
  //         {/* Labels */}
  //         <View style={{ flexDirection: 'row', marginTop: 5, width: totalWidth }}>
  //           {data.map((item, index) => {
  //             const x = index * (barWidth + spacing);
  //             return (
  //               <View key={index} style={{ 
  //                 position: 'absolute', 
  //                 left: x, 
  //                 width: barWidth, 
  //                 alignItems: 'center' 
  //               }}>
  //                 <Text style={{ fontSize: 7, color: '#374151', fontWeight: 'bold' }}>
  //                   {item.name}
  //                 </Text>
  //                 <Text style={{ fontSize: 6, color: '#6b7280' }}>
  //                   {item.value.toFixed(0)} kg
  //                 </Text>
  //               </View>
  //             );
  //           })}
  //         </View>
  //       </View>
  //     </View>
  //   );
  // };

  const renderTable = (
    rows: Produto[],
    keyMapper: (row: Produto) => { col1: string; col2: string }
  ) => (
    <>
      <View style={styles.table}>
        {/* header as first row inside the table so it flows with pages */}
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[{ width: '70%', fontWeight: 'bold', fontSize: currentFontSizes.table, color: '#374151', padding: 8 }]}>Nome</Text>
          <Text style={[{ width: '30%', fontWeight: 'bold', fontSize: currentFontSizes.table, color: '#374151', textAlign: 'right', padding: 8 }]}>Total</Text>
        </View>
        {rows.map((row, i) => {
          const { col1, col2 } = keyMapper(row);
          return (
            <View
              key={i}
              style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}
            >
              <Text style={[styles.tableCol, { fontSize: currentFontSizes.table }]}>{col1}</Text>
              <Text style={[styles.tableColSmall, { fontSize: currentFontSizes.table }]}>{col2}</Text>
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
        <Text style={[{ width: "6%" , borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", backgroundColor: "#e2e2e2ff", padding: 8,paddingTop: 14, fontWeight: "bold", color: "#af1e1eff" }, { fontSize: currentFontSizes.table }]}>Cód</Text>
        <Text style={[{ width: "59%", borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", backgroundColor: "#e2e2e2ff", padding: 8,paddingTop: 14, fontWeight: "bold", color: "#af1e1eff", flexWrap: 'wrap' }, { fontSize: currentFontSizes.table }]}>Nome Fórmula</Text>
        <Text style={[{ width: "10%", borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", backgroundColor: "#e2e2e2ff", padding: 8,paddingTop: 14, fontWeight: "bold", color: "#af1e1eff" }, { fontSize: currentFontSizes.table }]}>Batidas</Text>
        <Text style={[{ width: "25%", borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#d1d5db", backgroundColor: "#e2e2e2ff", padding: 8,paddingTop: 14, fontWeight: "bold", color: "#af1e1eff" }, { fontSize: currentFontSizes.table }]}>Total</Text>
      </View>
      {formulas.map((f, i) => (
        <View
          key={i}
          style={i % 2 === 0 ? styles.tableRow : styles.tableRowEven}
        >
          <Text style={[{ width: "6%", borderRightWidth: 1, borderBottomWidth: 1,borderColor: "#d1d5db", padding: 6 }, { fontSize: currentFontSizes.table }]}>{f.codigo || f.numero || '-'}</Text>
          <Text style={[{ width: "59%", borderRightWidth: 1, borderBottomWidth: 1,borderColor: "#d1d5db", padding: 6, flexWrap: 'wrap' }, { fontSize: currentFontSizes.table }]}>{f.nome}</Text>
          <Text style={[{ width: "10%", borderRightWidth: 1, borderBottomWidth: 1,borderColor: "#d1d5db", padding: 6, textAlign: "center" }, { fontSize: currentFontSizes.table }]}>{f.batidas || f.quantidade || '-'}</Text>
          <Text style={[{ width: "25%", borderRightWidth: 1, borderBottomWidth: 1,borderColor: "#d1d5db", padding: 6, textAlign: "right" }, { fontSize: currentFontSizes.table }]}>
            {f.somatoriaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 3 })} kg
          </Text>
        </View>
      ))}
    </View>
  );
 
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
{/* 
        {Object.keys(formulaSums).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Somatória por Fórmula (cálculo)
            </Text>
            {renderTable(Object.entries(formulaSums), ([nome, val]) => ({
              col1: nome,
              col2: (Number(val).toLocaleString("pt-BR", {
                minimumFractionDigits: 3,
              })+" kg"),
            }))}
          </View>
        )} */}

        {renderRodape()}
        </Page>

        {/* Páginas dedicadas para a tabela de fórmulas (cada chunk em sua própria página) */}
        {formulasOrdenadas.length > 0 && formulaChunks.length > 1 && formulaChunks.slice(1).filter(c => c && c.length > 0).map((chunk, idx) => (
          <Page key={`formulas-dedicated-${idx}`} size="A4" style={[styles.page, { paddingBottom: pagePaddingBottom }]} orientation={orientation} wrap>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 12 }]}>TABELA DE FÓRMULAS (continuação)</Text>
              {renderFormulaTable(chunk)}
            </View>

            {renderRodape()}
          </Page>
        ))}

      {/* Página 2 */}
  <Page size="A4" style={[styles.page, { paddingBottom: pagePaddingBottom }]} orientation={orientation} wrap>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 15 }]}>Tabela de produtos</Text>
          {categorias.map((cat, idx) => (
            <View key={idx} style={{ marginBottom: 15 }}>
              {renderTable(produtosPorCategoria[cat], (p) => {
                const valueNum = Number(p.qtd) || 0;
                return {
                  col1: p.nome,
                  col2: `${valueNum.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} kg`,
                };
              })}
            </View>
          ))}
        </View>

        {renderRodape()}
      </Page>
      {/* Página 3 */}
  <Page size="A4" style={[styles.page, { paddingBottom: pagePaddingBottom }]} orientation={orientation} wrap>
        {/* Comentários do Relatório */}
        {comentarios && comentarios.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 15 }]}>
              COMENTÁRIOS DO RELATÓRIO
            </Text>
            {comentarios.map((c, i) => (
              <View key={i} style={styles.comentarioContainer}>
                <Text style={styles.comentarioMeta}>
                  {c.data ? formatarData(c.data) : new Date().toLocaleDateString("pt-BR")}
                  {c.autor && ` • ${c.autor}`}
                </Text>
                <Text style={styles.comentarioTexto}>{c.texto}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Gráficos de Donut - Produtos */}
        {/* {showCharts && produtosChartData && produtosChartData.length > 0 && (
          <View style={styles.section}>
            {renderDonutChart(produtosChartData, 'Distribuição de Produtos')}
          </View>
        )} */}

        {/* Gráficos de Donut - Fórmulas */}
        {/* {showCharts && formulasChartData && formulasChartData.length > 0 && (
          <View style={styles.section}>
            {renderDonutChart(formulasChartData, 'Distribuição de Fórmulas')}
          </View>
        )} */}

        {/* Gráfico de Barras - Horários */}
        {/* {showCharts && horariosChartData && horariosChartData.length > 0 && (
          <View style={styles.section}>
            {renderBarChart(horariosChartData, 'Horários de Produção')}
          </View>
        )} */}

        {/* Gráfico de Barras - Produção Semanal */}
        {/* {showCharts && semanaChartData && semanaChartData.length > 0 && (
          <View style={styles.section}>
            {renderVerticalBarChart(semanaChartData, 'Produção Semanal')}
          </View>
        )} */}

        {/* Gráfico de Barras - Dias da Semana */}
        {/* {showCharts && diasSemanaChartData && diasSemanaChartData.length > 0 && (
          <View style={styles.section}>
            {renderVerticalBarChart(diasSemanaChartData, 'Distribuição por Dia da Semana')}
          </View>
        )} */}

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

        {observacoes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text>{observacoes}</Text>
          </View>
        )}
          
        {renderRodape()}
      </Page>

      {/* Páginas dedicadas para continuação dos gráficos de barras */}
      {showCharts && chartChunks && chartChunks.length > 1 && chartChunks.slice(1).map((chunk, idx) => (
        <Page key={`charts-dedicated-${idx}`} size="A4" style={[styles.page, { paddingBottom: pagePaddingBottom }]} orientation={orientation} wrap>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: currentFontSizes.section, marginBottom: 12 }]}>Análise de Produção (continuação)</Text>
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

          {renderRodape()}
        </Page>
      ))}

    </Document>
  );
};