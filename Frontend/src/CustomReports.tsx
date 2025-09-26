// import { useState, useEffect, useMemo } from "react";
// import { Button } from "./components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
// import { Badge } from "./components/ui/badge";
// import { Tabs, TabsContent } from "./components/ui/tabs";
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./components/ui/resizable";
// import { Download, Settings, Loader2 } from "lucide-react";
// import { pdf } from "@react-pdf/renderer";
// import { MyDocument } from "./Pdf";
// import { toast } from "react-toastify";

// import ReportConfigPanel, { type ReportConfig } from "./components/ReportConfig";
// import ReportPreview from "./components/ReportPreview";
// // Using canonical PDF document (MyDocument) from ./Pdf
// import { getProcessador } from "./Processador";
// import { ScrollArea } from "./components/ui/scroll-area";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog";

// // -------------------- CONFIGURAÇÃO INICIAL --------------------
// const defaultConfig: ReportConfig = {
//   includeGraphics: true,
//   includeLogo: false,
//   logoFile: null,
//   logoUrl: "",
//   primaryColor: "",
//   description: "",
//   title: "Relatório de Produção",
//   showProductInfo: true,
//   showProductionTotal: true,
//   charts: [],
// };

// const availablePeriods = ["hoje", "ontem", "semana", "mes"];

// // -------------------- COMPONENTE PRINCIPAL --------------------
// export default function CustomReports() {
//   const [config, setConfig] = useState<ReportConfig>(defaultConfig);
//   const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
//   const [reportData, setReportData] = useState<any[]>([]);
//   const [produtosInfo, setProdutosInfo] = useState<Record<string, any>>({});
//   const [totalProduction, setTotalProduction] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [isFromRedirect, setIsFromRedirect] = useState(false);
//   const [showGenerateModal, setShowGenerateModal] = useState(false);

//   // -------------------- CARREGAR DADOS DE REDIRECIONAMENTO --------------------
//   useEffect(() => {
//     const savedData = localStorage.getItem("pdf-generation-data");
//     if (savedData) {
//       try {
//         const parsedData = JSON.parse(savedData);
//         const isRecent = Date.now() - parsedData.timestamp < 5 * 60 * 1000;

//         if (isRecent && parsedData.resumo) {
//           setIsFromRedirect(true);

//           if (parsedData.resumo?.formulasUtilizadas) {
//             const chartData = Object.entries(parsedData.resumo.formulasUtilizadas).map(
//               ([name, data]: [string, any]) => ({
//                 name,
//                 value: data?.somatoriaTotal || 0,
//                 unit: "kg",
//               })
//             );
//             setReportData(chartData);
//             const total = chartData.reduce((sum, item) => sum + (item.value || 0), 0);
//             setTotalProduction(total);
//           }

//           if (parsedData.produtosInfo) setProdutosInfo(parsedData.produtosInfo);

//           setConfig((prev) => ({
//             ...prev,
//             title: `Relatório de Produção - ${
//               parsedData.context === "report" ? "Filtros Aplicados" : "Dashboard"
//             }`,
//             description: `Relatório gerado automaticamente com base nos dados de ${
//               parsedData.context === "report" ? "relatórios" : "dashboard"
//             }.`,
//             showProductInfo: true,
//             showProductionTotal: true,
//           }));

//           localStorage.removeItem("pdf-generation-data");
//           setLoading(false);
//           return;
//         }
//         localStorage.removeItem("pdf-generation-data");
//       } catch (error) {
//         console.error("Erro ao carregar dados de redirecionamento:", error);
//         localStorage.removeItem("pdf-generation-data");
//       }
//     }

//     loadInitialData();
//   }, []);

//   // -------------------- CARREGAR DADOS INICIAIS --------------------
//   const generatePDF = async () => {
//     try {
//       setIsGeneratingPdf(true);
//       // Montar dados para o PDF simples
//       const total = totalProduction || (reportData || []).reduce((s:any,i:any)=>s + (i.value||0),0);
//       const produtos = Object.entries(produtosInfo || {}).map(([k,v]:any)=>({ nome: v.nome || k, qtd: v.total || 0, categoria: '' }));
//       const formulas = (reportData || []).map((r:any, i:number)=>({ numero: i+1, nome: r.name, quantidade: 0, porcentagem: 0, somatoriaTotal: r.value }));
//       const chartData = formulas && formulas.length > 0
//         ? formulas.map(f => ({ name: f.nome, value: Number(f.somatoriaTotal || 0) }))
//         : produtos.map(p => ({ name: p.nome, value: Number(p.qtd || 0) }));

//       const doc = (
//         <MyDocument
//           total={total}
//           batidas={undefined}
//           horaInicio={undefined}
//           horaFim={undefined}
//           formulas={formulas}
//           produtos={produtos}
//           data={new Date().toLocaleDateString('pt-BR')}
//           empresa={config.title || 'Empresa'}
//           observacoes={config.description || ''}
//           logoSrc={undefined}
//           chartData={chartData}
//         />
//       );
//       const asPdf = pdf(doc);
//       const blob = await asPdf.toBlob();
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `${config.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
//       toast.success("Relatório PDF gerado com sucesso!");
//     } catch (error) {
//       console.error("Erro ao gerar PDF:", error);
//       toast.error("Erro ao gerar o relatório PDF");
//     } finally {
//       setIsGeneratingPdf(false);
//     }
//   };

//   // -------------------- ALTERAÇÃO DE CONFIG --------------------
//   const handleConfigChange = (newConfig: ReportConfig) => setConfig(newConfig);

//   // -------------------- MEMO PARA REPORT DATA --------------------
//   const memoSampleData = useMemo(() => reportData || [], [reportData]);

//   // -------------------- GERAÇÃO DO PDF CUSTOMIZADO --------------------
//   const generatePDF = async () => {
//     if (!config.showProductInfo && !config.showProductionTotal && !config.includeGraphics) {
//       toast.warning("Selecione pelo menos um elemento para incluir no relatório");
//       return;
//     }
//     try {
//       setIsGeneratingPdf(true);
//       const doc = (
//         <CustomReportDocument
//           config={config}
//           data={reportData}
//           produtosInfo={produtosInfo}
//           totalProduction={totalProduction}
//         />
//       );
//       const asPdf = pdf(doc);
//       const blob = await asPdf.toBlob();
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `${config.title.replace(/\s+/g, "_")}_${new Date()
//         .toISOString()
//         .split("T")[0]}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
//       toast.success("Relatório PDF gerado com sucesso!");
//     } catch (error) {
//       console.error("Erro ao gerar PDF:", error);
//       toast.error("Erro ao gerar o relatório PDF");
//     } finally {
//       setIsGeneratingPdf(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <div className="flex items-center gap-2">
//           <Loader2 className="h-5 w-5 animate-spin" />
//           <span>Carregando dados do relatório...</span>
//         </div>
//       </div>
//     );
//   }

//   // -------------------- RENDER --------------------
//   return (
//     <div className="flex flex-col h-full">
//       <Card className="mb-4">
//         <CardHeader className="pb-4">
//           <div className="flex items-center justify-between flex-wrap">
//             <div className="min-w-0">
//               <CardTitle className="flex items-center gap-2 flex-wrap break-words">
//                 <Settings className="h-5 w-5 shrink-0" />
//                 <span className="truncate">{config.title}</span>
//                 {isFromRedirect && (
//                   <Badge variant="secondary" className="ml-2 shrink-0">
//                     Dados Carregados
//                   </Badge>
//                 )}
//               </CardTitle>
//               <p className="text-sm text-muted-foreground mt-1 break-words">
//                 {isFromRedirect
//                   ? "Dados carregados automaticamente. Configure e gere seu relatório personalizado."
//                   : "Configure e gere relatórios PDF personalizados com logos, gráficos e informações detalhadas"}
//               </p>
//             </div>

//             <Button
//               onClick={() => generatePDF()}
//               disabled={isGeneratingPdf}
//               size="lg"
//               className="gap-2 mt-2 md:mt-0"
//             >
//               {isGeneratingPdf ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Gerando...
//                 </>
//               ) : (
//                 <>
//                   <Download className="h-4 w-4" />
//                   Gerar
//                 </>
//               )}
//             </Button>

//             <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
//               <DialogContent className="max-w-lg">
//                 <DialogHeader>
//                   <DialogTitle>Como deseja gerar o relatório?</DialogTitle>
//                   <DialogDescription>Escolha uma das opções abaixo.</DialogDescription>
//                 </DialogHeader>
//                 {/* ... resto da lógica do modal (sem alterações na ordem de hooks) ... */}
//               </DialogContent>
//             </Dialog>
//           </div>
//         </CardHeader>
//       </Card>

//       <Card className="flex-1">
//         <CardContent className="p-0 h-full">
//           <ResizablePanelGroup direction="horizontal" className="h-full">
//             <ResizablePanel defaultSize={40} minSize={35} maxSize={50}>
//               <div className="h-full border-r">
//                 <Tabs defaultValue="config" className="h-full flex flex-col">
//                   <TabsContent value="config" className="flex-1 m-0">
//                     <div className="h-full overflow-auto">
//                       <ReportConfigPanel
//                         config={config}
//                         onConfigChange={handleConfigChange}
//                         availablePeriods={availablePeriods}
//                       />
//                     </div>
//                   </TabsContent>
//                 </Tabs>
//               </div>
//             </ResizablePanel>

//             <ResizableHandle />

//             <ResizablePanel defaultSize={60}>
//               <ScrollArea className="h-screen">
//                 <div className="h-full p-4">
//                   <ReportPreview
//                     config={config}
//                     sampleData={memoSampleData}
//                     produtosInfo={produtosInfo}
//                     totalProduction={totalProduction}
//                   />
//                 </div>
//               </ScrollArea>
//             </ResizablePanel>
//           </ResizablePanelGroup>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
