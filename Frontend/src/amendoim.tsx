import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Loader2, Upload, FileText } from "lucide-react";
import { DonutChartWidget, BarChartWidget } from "./components/Widgets";
import FiltrosAmendoimBar from "./components/FiltrosAmendoim";

interface AmendoimRecord {
  id: number;
  dia: string;
  hora: string;
  codigoProduto: string;
  codigoCaixa: string;
  nomeProduto: string;
  peso: number;
  numeroBalanca: string;
  createdAt: string;
}

interface UploadResult {
  ok: boolean;
  processados: number;
  salvos: number;
  erros: string[];
  mensagem: string;
}

interface Estatisticas {
  totalRegistros: number;
  pesoTotal: number;
  produtosUnicos: number;
  balancasUtilizadas: number;
}

interface FiltrosAmendoim {
  dataInicio?: string;
  dataFim?: string;
  codigoProduto?: string;
  nomeProduto?: string;
}

export default function Amendoim() {
  const [registros, setRegistros] = useState<AmendoimRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  // Filtros ativos
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAmendoim>({});
  
  // Drawer de gráficos
  const [chartsOpen, setChartsOpen] = useState(false);

  // Buscar registros
  const fetchRegistros = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });

      // Adicionar filtros aos parâmetros
      if (filtrosAtivos.dataInicio) params.set('dataInicio', filtrosAtivos.dataInicio);
      if (filtrosAtivos.dataFim) params.set('dataFim', filtrosAtivos.dataFim);
      if (filtrosAtivos.codigoProduto) params.set('codigoProduto', filtrosAtivos.codigoProduto);
      if (filtrosAtivos.nomeProduto) params.set('nomeProduto', filtrosAtivos.nomeProduto);

      const res = await fetch(`http://localhost:3000/api/amendoim/registros?${params}`);
      
      if (!res.ok) {
        throw new Error(`Erro ao buscar registros: ${res.status}`);
      }

      const data = await res.json();
      setRegistros(data.rows || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
      setRegistros([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar estatísticas
  const fetchEstatisticas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtrosAtivos.dataInicio) params.set('dataInicio', filtrosAtivos.dataInicio);
      if (filtrosAtivos.dataFim) params.set('dataFim', filtrosAtivos.dataFim);

      const res = await fetch(`http://localhost:3000/api/amendoim/estatisticas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEstatisticas(data);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  useEffect(() => {
    fetchRegistros();
    fetchEstatisticas();
  }, [page, filtrosAtivos]);

  // Handler para aplicar filtros
  const handleAplicarFiltros = (filtros: FiltrosAmendoim) => {
    setFiltrosAtivos(filtros);
    setPage(1); // Resetar para primeira página ao aplicar filtros
    setChartsOpen(true); // Abrir gráficos ao buscar
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:3000/api/amendoim/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar arquivo');
      }

      setUploadResult(data);
      
      // Recarregar registros após upload bem-sucedido
      if (data.salvos > 0) {
        await fetchRegistros();
        await fetchEstatisticas();
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar arquivo');
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col gap-1.5 w-full h-full">
      {/* Header */}
      <div className="h-[10dvh] flex flex-row justify-between w-full">
        <div className="flex flex-row items-end gap-1 h-[10dvh]"> 
        </div>
        <div className="flex flex-col items-end justify-end gap-2">
          <div className="flex flex-row items-end gap-1">
            {/* Upload button */}
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Button disabled={uploading}>
                <div className="flex items-center gap-2">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? 'Enviando...' : 'Enviar CSV'}
                </div>
              </Button>
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-2 justify-start w-full">
        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col gap-3.5 items-start justify-start h-[90vh] 3xl:h-206 w-[68px]">
          {/* Barra de Filtros */}
          <div className="flex justify-end w-full">
            <FiltrosAmendoimBar onAplicarFiltros={handleAplicarFiltros} />
          </div>

          {/* Upload result */}
          {uploadResult && (
            <div className={`p-4 rounded-lg ${uploadResult.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="font-semibold mb-2">{uploadResult.mensagem}</div>
          {uploadResult.erros.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600">
                {uploadResult.erros.length} erro(s) encontrado(s)
              </summary>
              <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {uploadResult.erros.map((erro, idx) => (
                  <li key={idx} className="text-red-600">• {erro}</li>
                ))}
              </ul>
            </details>
            )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="flex w-full h-[74vh] 3xl:h-201 overflow-hidden shadow-xl rounded flex border border-gray-300">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 h-[50vh] w-full text-center">
            <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto" />
            <p className="text-lg font-medium">Carregando dados...</p>
            <p className="text-sm text-gray-500">Os dados estão sendo processados, por favor aguarde.</p>
          </div>
        ) : registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 h-[50vh] w-full text-center">
            <FileText className="h-12 w-12 mb-2 text-gray-400" />
            <div className="text-gray-700 font-semibold text-lg">Nenhum registro encontrado</div>
            <div className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
              Envie um arquivo CSV para começar
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col relative">
            <div className="overflow-auto flex-1 thin-red-scrollbar">
              <div className="min-w-max w-full">
                {/* Cabeçalho */}
                <div className="sticky top-0 z-10 bg-gray-200 border-b border-gray-300">
                  <div className="flex">
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '90px', minWidth: '90px' }}>
                      Dia
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '70px', minWidth: '70px' }}>
                      Hora
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '120px', minWidth: '120px' }}>
                      Cód. Produto
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '120px', minWidth: '120px' }}>
                      Cód. Caixa
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '250px', minWidth: '250px' }}>
                      Nome do Produto
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '120px', minWidth: '120px' }}>
                      Peso (kg)
                    </div>
                    <div className="flex items-center justify-center py-2 px-3 border-r border-gray-300 font-semibold text-sm bg-gray-200" style={{ width: '100px', minWidth: '100px' }}>
                      Balança
                    </div>
                  </div>
                </div>

                {/* Corpo da tabela */}
                <div>
                  {registros.map((registro, rowIdx) => (
                    <div
                      key={registro.id}
                      className={`flex border-b border-gray-300 hover:bg-gray-50 ${
                        rowIdx % 2 === 0 ? "bg-white" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-center p-2 text-sm border-r border-gray-300" style={{ width: '90px', minWidth: '90px' }}>
                        {registro.dia}
                      </div>
                      <div className="flex items-center justify-center p-2 text-sm border-r border-gray-300" style={{ width: '70px', minWidth: '70px' }}>
                        {registro.hora}
                      </div>
                      <div className="flex items-center justify-end p-2 text-sm border-r border-gray-300" style={{ width: '120px', minWidth: '120px' }}>
                        {registro.codigoProduto}
                      </div>
                      <div className="flex items-center justify-end p-2 text-sm border-r border-gray-300" style={{ width: '120px', minWidth: '120px' }}>
                        {registro.codigoCaixa}
                      </div>
                      <div className="flex items-center justify-start p-2 text-sm border-r border-gray-300 overflow-hidden" style={{ width: '250px', minWidth: '250px' }}>
                        <div className="w-full break-words" style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                          {registro.nomeProduto}
                        </div>
                      </div>
                      <div className="flex items-center justify-end p-2 text-sm border-r border-gray-300" style={{ width: '120px', minWidth: '120px' }}>
                        {Number(registro.peso).toLocaleString('pt-BR', {
                          minimumFractionDigits: 3,
                          maximumFractionDigits: 3,
                        })}
                      </div>
                      <div className="flex items-center justify-center p-2 text-sm border-r border-gray-300" style={{ width: '100px', minWidth: '100px' }}>
                        {registro.numeroBalanca}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
          </div>

          {/* Pagination */}
          <div className="flex flex-row items-center justify-end mt-2">
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setPage(p => Math.max(1, p - 1));
                  }}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center text-sm text-gray-600 px-3">
                  Página {page} de {totalPages} ({total} registros)
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    setPage(p => Math.min(totalPages, p + 1));
                  }}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        </div>

      {/* Side Info com drawer de gráficos */}
      <div
        className="relative w-87 3xl:h-[76vh] h-[74vh] flex flex-col p-2 shadow-xl rounded border border-gray-300 gap-2 flex-shrink-0"
        style={{ zIndex: 10 }}
      >
        {/* Drawer de gráficos compacto, por trás do sideinfo */}
        {chartsOpen && (
          <div
            className="absolute top-0 right-full mr-2 h-full w-96 bg-white border rounded-l-lg shadow-lg overflow-hidden"
            style={{ zIndex: 1 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="text-base font-bold text-gray-900">
                  Gráficos de Amendoim
                </div>
              </div>
              <div
                className="p-4 space-y-4 overflow-auto scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {/* Produtos Donut */}
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="text-sm font-bold text-gray-800">
                      Produtos (Top 20)
                    </div>
                  </div>
                  <div className="h-[280px] px-3 py-3 relative">
                    <DonutChartWidget
                      fetchUrl={`http://localhost:3000/api/amendoim/chartdata/produtos?${new URLSearchParams({
                        ...(filtrosAtivos.dataInicio && { dataInicio: filtrosAtivos.dataInicio }),
                        ...(filtrosAtivos.dataFim && { dataFim: filtrosAtivos.dataFim }),
                        ...(filtrosAtivos.codigoProduto && { codigoProduto: filtrosAtivos.codigoProduto }),
                      })}`}
                      unit="kg"
                      compact
                    />
                  </div>
                </div>

                {/* Caixas Donut */}
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="text-sm font-bold text-gray-800">
                      Caixas
                    </div>
                  </div>
                  <div className="h-[280px] px-3 py-3 relative">
                    <DonutChartWidget
                      fetchUrl={`http://localhost:3000/api/amendoim/chartdata/caixas?${new URLSearchParams({
                        ...(filtrosAtivos.dataInicio && { dataInicio: filtrosAtivos.dataInicio }),
                        ...(filtrosAtivos.dataFim && { dataFim: filtrosAtivos.dataFim }),
                        ...(filtrosAtivos.codigoProduto && { codigoProduto: filtrosAtivos.codigoProduto }),
                      })}`}
                      unit="kg"
                      compact
                    />
                  </div>
                </div>

                {/* Horários Bar */}
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="text-sm font-bold text-gray-800">
                      Horários
                    </div>
                  </div>
                  <div className="h-[280px] px-3 py-3 relative">
                    <BarChartWidget
                      fetchUrl={`http://localhost:3000/api/amendoim/chartdata/horarios?${new URLSearchParams({
                        ...(filtrosAtivos.dataInicio && { dataInicio: filtrosAtivos.dataInicio }),
                        ...(filtrosAtivos.dataFim && { dataFim: filtrosAtivos.dataFim }),
                        ...(filtrosAtivos.codigoProduto && { codigoProduto: filtrosAtivos.codigoProduto }),
                      })}`}
                      unit="kg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botão para abrir/fechar drawer */}
        <button
          className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-l px-1.5 py-2 shadow hover:bg-gray-50"
          onClick={() => setChartsOpen((s) => !s)}
          title={chartsOpen ? "Ocultar gráficos" : "Mostrar gráficos"}
          style={{ zIndex: 7 }}
        >
          {chartsOpen ? "▶" : "◀"}
        </button>

        {/* Conteúdo do sideinfo - Estatísticas */}
        <div className="flex-1 overflow-auto" style={{ zIndex: 15 }}>
          <div className="text-lg font-bold mb-4">Estatísticas</div>
          
          {estatisticas && (
            <div className="space-y-3">
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500">Total de Registros</div>
                <div className="text-2xl font-bold">{estatisticas.totalRegistros}</div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500">Peso Total</div>
                <div className="text-2xl font-bold">
                  {estatisticas.pesoTotal.toLocaleString('pt-BR', { 
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })} kg
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500">Produtos Únicos</div>
                <div className="text-2xl font-bold">{estatisticas.produtosUnicos}</div>
              </div>
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500">Balanças Utilizadas</div>
                <div className="text-2xl font-bold">{estatisticas.balancasUtilizadas}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
