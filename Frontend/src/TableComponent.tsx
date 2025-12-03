import React, { useEffect, useRef, useState, useCallback } from "react";
import { format as formatDateFn } from "date-fns";
import { Filtros, ReportRow } from "./components/types";
import { useReportData } from "./hooks/useReportData";
import { Loader2 } from "lucide-react";

// ================
// TIPOS E CONSTANTES
// ================

interface TableComponentProps {
  filtros?: Filtros;
  colLabels: Record<string, string>;
  dados?: any[];
  loading?: boolean;
  error?: string | null;
  page?: number;
  pageSize?: number;
  produtosInfo?: Record<string, { nome?: string; unidade?: string; num?: number; ativo?: boolean }>;
  useExternalData?: boolean;
  onResetColumnsReady?: (resetFn: () => void) => void;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  onToggleSort?: (col: string) => void;
  emptyColumns?: {
    Dia?: boolean;
    Hora?: boolean;
    Nome?: boolean;
    Codigo?: boolean;
    Numero?: boolean;
    products?: boolean[];
  };
}

const DEFAULT_WIDTHS = {
  dia: 90,
  hora: 70,
  nome: 200,
  codigo: 100,
  numero: 100,
  dynamic: 110,
};

const STORAGE_KEY = "rpro-table-column-widths";
const FIXED_COLUMNS = ["Dia", "Hora", "Nome", "Codigo", "Numero"];

// ================
// FUNÇÕES AUXILIARES
// ================

const safeString = (v: any) => (v === null || v === undefined ? "" : String(v));

const getLastTimestamp = (rows: any[]) => {
  if (!rows || rows.length === 0) return 0;
  const last = rows[rows.length - 1];
  return JSON.stringify(last);
};

function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) {
    if (a[ka[i]] !== b[ka[i]]) return false;
  }
  return true;
}

const formatDate = (raw: string): string => {
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [y, m, d] = raw.split("-").map(Number);
      return formatDateFn(new Date(y, m - 1, d), "dd/MM/yyyy");
    }
    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      const [d, m, y] = raw.split("-").map(Number);
      return formatDateFn(new Date(y, m - 1, d), "dd/MM/yyyy");
    }
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) return formatDateFn(parsed, "dd/MM/yyyy");
  } catch {}
  return raw;
};

// ================
// COMPONENTE PRINCIPAL
// ================

export function TableComponent({
  dados: dadosProp = [],
  loading: loadingProp,
  error: errorProp,
  produtosInfo: produtosInfoProp = {},
  filtros = {},
  page = 1,
  pageSize = 100,
  useExternalData = false,
  onResetColumnsReady,
  sortBy: sortByProp,
  sortDir: sortDirProp,
  onToggleSort,
  emptyColumns,
}: TableComponentProps) {
  // ================
  // REFS & STATE
  // ================
  const tableRef = useRef<HTMLDivElement>(null);
  const [dadosAtual, setDadosAtual] = useState<ReportRow[]>(dadosProp);

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) {
      console.warn("Erro ao carregar larguras das colunas:", e);
    }
    return {
      dia: DEFAULT_WIDTHS.dia,
      hora: DEFAULT_WIDTHS.hora,
      nome: DEFAULT_WIDTHS.nome,
      codigo: DEFAULT_WIDTHS.codigo,
      numero: DEFAULT_WIDTHS.numero,
    };
  });

  const [resizing, setResizing] = useState<{
    columnKey: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // ================
  // CALLBACKS
  // ================

  const resetColumnWidths = useCallback(() => {
    const defaults = {
      dia: DEFAULT_WIDTHS.dia,
      hora: DEFAULT_WIDTHS.hora,
      nome: DEFAULT_WIDTHS.nome,
      codigo: DEFAULT_WIDTHS.codigo,
      numero: DEFAULT_WIDTHS.numero,
    };
    setColumnWidths(defaults);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setResizing({
      columnKey,
      startX: e.clientX,
      startWidth: columnWidths[columnKey] || DEFAULT_WIDTHS.dynamic,
    });
  }, [columnWidths]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizing) return;
    const diff = e.clientX - resizing.startX;
    const newWidth = Math.max(50, resizing.startWidth + diff);
    setColumnWidths((prev) => ({ ...prev, [resizing.columnKey]: newWidth }));
  }, [resizing]);

  const handleResizeEnd = useCallback(() => {
    setResizing(null);
  }, []);

  // ================
  // EFFECTS
  // ================

  useEffect(() => {
    if (onResetColumnsReady) onResetColumnsReady(resetColumnWidths);
  }, [onResetColumnsReady, resetColumnWidths]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnWidths));
    } catch (e) {
      console.warn("Erro ao salvar larguras das colunas:", e);
    }
  }, [columnWidths]);

  useEffect(() => {
    if (resizing) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
      return () => {
        window.removeEventListener("mousemove", handleResizeMove);
        window.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [resizing, handleResizeMove, handleResizeEnd]);

  // ================
  // DADOS DA TABELA
  // ================

  // Quando useExternalData é true, não usar o hook interno
  const shouldFetchData = !useExternalData;
  const internalSortBy = sortByProp || 'Dia';
  const internalSortDir = sortDirProp || 'DESC';
  
  const { dados: dadosFromHook, loading: loadingFromHook, error: errorFromHook } = useReportData(
    filtros as any, 
    page || 1, 
    pageSize || 100,
    internalSortBy,
    internalSortDir,
    shouldFetchData
  );

  useEffect(() => {
    if (useExternalData) return;
    const newDados = Array.isArray(dadosFromHook) ? dadosFromHook : [];
    // Atualização instantânea: sempre aplicar novos dados imediatamente
    setDadosAtual(newDados);
  }, [dadosFromHook, useExternalData]);

  useEffect(() => {
    if (!useExternalData) return;
    const newDados = Array.isArray(dadosProp) ? dadosProp : [];
    // Evitar setState desnecessário para prevenir re-renders/flicker
    try {
      const prevTs = getLastTimestamp(dadosAtual as any[]);
      const newTs = getLastTimestamp(newDados as any[]);
      if ((dadosAtual?.length || 0) === newDados.length && prevTs === newTs) {
        return;
      }
    } catch (e) {
      // swallow
    }
    setDadosAtual(newDados);
  }, [dadosProp, useExternalData, dadosAtual]);

  // Table will re-render when filtros/dados change. Do not auto-refresh on produtos-updated here.
  // Product updates are applied by the parent (`report.tsx`) when navigating away or clicking outside.

  const produtosInfo = produtosInfoProp || {};
  const dados = useExternalData ? dadosAtual : dadosFromHook;

  // ================
  // COLUNAS FIXAS COM DADOS
  // ================

  const fixedColumnsWithData = React.useMemo(() => {
    // Se o backend forneceu informação de colunas vazias, usar isso
    if (emptyColumns) {
      const columnsToCheck = ['Dia', 'Hora', 'Nome', 'Codigo', 'Numero'];
      return columnsToCheck.filter(col => !emptyColumns[col as keyof typeof emptyColumns]);
    }

    // Fallback: análise client-side
    if (!dados?.length) return [];
    
    const columnsToCheck = ['Dia', 'Hora', 'Nome', 'Codigo', 'Numero'];
    return columnsToCheck.filter(col => {
      // Verificar se pelo menos uma linha tem valor não-vazio nessa coluna
      return dados.some(row => {
        const value = row[col] || row[col.toLowerCase()];
        if (value === null || value === undefined || value === '' || value === 0 || value === '0') return false;
        // Considerar strings formatadas como zero (0.000, 0,000, etc)
        if (typeof value === 'string' && parseFloat(value.replace(',', '.')) === 0) return false;
        return true;
      });
    });
  }, [dados, emptyColumns]);

  // ================
  // COLUNAS DINÂMICAS
  // ================

  const dynamicColumns = React.useMemo(() => {
    if (!dados?.length) return [];
    const maxValues = Math.max(...dados.map((row) => row.values?.length || 0));
    const allCols = Array.from({ length: maxValues }, (_, i) => `col${6 + i}`);
    
    // ⚠️ FILTRO 1: Remover produtos inativos
    const activeCols = allCols.filter(colKey => {
      const info = produtosInfo[colKey];
      // Se ativo é undefined ou true, mostrar. Se false, ocultar
      return info?.ativo !== false;
    });
    
    // ⚠️ FILTRO 2: Remover colunas sem dados no escopo atual de busca
    const colsWithData = activeCols.filter(colKey => {
      const colIndex = parseInt(colKey.replace('col', ''), 10) - 6;
      
      // Se o backend forneceu informação de colunas vazias, usar isso
      if (emptyColumns?.products && Array.isArray(emptyColumns.products)) {
        return !emptyColumns.products[colIndex];
      }

      // Fallback: análise client-side
      return dados.some(row => {
        const value = row.values?.[colIndex];
        if (value === null || value === undefined || value === '' || value === 0 || value === '0') return false;
        // Considerar strings formatadas como zero (0.000, 0,000, etc)
        if (typeof value === 'string' && parseFloat(value.replace(',', '.')) === 0) return false;
        return true;
      });
    });
    
    return colsWithData;
  }, [dados, produtosInfo, emptyColumns]);

  // ================
  // FORMATAÇÃO
  // ================

  const converterValor = (valor: any, _colKey?: string): any => {
    // Backend agora envia valores já formatados como string com 3 casas decimais
    // Se vier string, usar direto; se vier number (legado), formatar
    if (typeof valor === "string" && valor.trim() !== "") {
      return valor; // Já formatado pelo backend (ex: "0.800", "1.234")
    }
    
    let n: number;
    if (typeof valor === "number") {
      n = valor;
    } else {
      return valor;
    }

    // Fallback: se ainda for número, formatar localmente
    return n;
  };

  const formatValue = (v: unknown, colKey: string): string => {
    // Se valor já vier como string formatada do backend, usar direto
    if (typeof v === "string" && v.trim() !== "") {
      return v;
    }
    
    // Fallback: formatar se vier como número
    if (typeof v === "number") {
      const valorConvertido = converterValor(v, colKey);
      if (typeof valorConvertido === "string") return valorConvertido;
      return valorConvertido.toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    }
    return safeString(v);
  };

  const getColumnLabel = (colKey: string): string => {
    if (FIXED_COLUMNS.includes(colKey)) return colKey;
    if (colKey.startsWith("col")) {
      const label = produtosInfo[colKey]?.nome;
      const colNum = parseInt(colKey.replace("col", ""), 10);
      return safeString(label) || `Produto ${colNum - 5}`;
    }
    return safeString(colKey);
  };

  // ================
  // LOADING / ERRO / VAZIO
  // ================

  const loading = useExternalData ? Boolean(loadingProp ?? loadingFromHook) : loadingFromHook;
  const error = useExternalData ? errorProp ?? null : errorFromHook;

  // If we are loading or have an error but already have data, keep rendering
  // the table to avoid flicker / full re-mounts. Only show the full-screen
  // placeholders when there is no existing data to display.
  const hasData = Array.isArray(dados) && dados.length > 0;

  if (loading && !hasData)
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 h-[50vh] w-full text-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto" />
        <p className="text-lg font-medium">Carregando dados...</p>
        <p className="text-sm text-gray-500">Os dados estão sendo processados, por favor aguarde.</p>
      </div>
    );

  if (error && !hasData)
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3 h-[50vh] w-full text-center">
        <div className="text-gray-700 font-semibold text-lg">Erro ao carregar dados</div>
        <div className="text-sm text-gray-600 max-w-md mx-auto">{error}</div>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors mx-auto"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );

  if (!hasData)
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[50vh] w-full text-center">
        <div className="text-gray-700 font-semibold text-lg">Nenhum dado encontrado</div>
        <div className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
          Tente ajustar os filtros para ver mais resultados.
        </div>
      </div>
    );
  
  // ================
  // RENDERIZAÇÃO DA TABELA
  // ================

  const allColumns = [...FIXED_COLUMNS, ...dynamicColumns];

  const renderSortIcon = (col: string) => {
    if (sortByProp === col) {
      return sortDirProp === 'ASC' ? '↑' : '↓';
    }
    return '↕';
  };

  const shouldShowColumn = (col: string) => {
    return fixedColumnsWithData.includes(col);
  };

  return (
    <div ref={tableRef} className="w-full h-full flex flex-col relative">
      <div className="overflow-auto flex-1 thin-red-scrollbar h-[calc(100vh-200px)]">
        <div className="min-w-max w-full">
          {/* CABEÇALHO */}
          <div className="sticky top-0 z-10 bg-gray-200 border-b border-gray-300">
            <div className="flex">
              {/* Colunas Fixas */}
              {shouldShowColumn('Dia') && (
              <div
                className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200 cursor-pointer"
                style={{ width: `${columnWidths.dia}px`, minWidth: `${columnWidths.dia}px` }}
                onClick={() => onToggleSort?.('Dia')}
              >
                <span className="flex items-center gap-1 pointer-events-none">
                  Dia {renderSortIcon('Dia')}
                </span>
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                  onMouseDown={(e) => handleResizeStart(e, 'dia')}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              )}

              {shouldShowColumn('Hora') && (
              <div
                className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200 cursor-pointer"
                style={{ width: `${columnWidths.hora}px`, minWidth: `${columnWidths.hora}px` }}
                onClick={() => onToggleSort?.('Hora')}
              >
                <span className="flex items-center gap-1 pointer-events-none">
                  Hora {renderSortIcon('Hora')}
                </span>
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                  onMouseDown={(e) => handleResizeStart(e, 'hora')}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              )}

              {shouldShowColumn('Nome') && (
              <div
                className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200 cursor-pointer"
                style={{ width: `${columnWidths.nome}px`, minWidth: `${columnWidths.nome}px` }}
                onClick={() => onToggleSort?.('Nome')}
              >
                <span className="flex items-center gap-1 pointer-events-none">
                  Nome {renderSortIcon('Nome')}
                </span>
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                  onMouseDown={(e) => handleResizeStart(e, 'nome')}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              )}

              {shouldShowColumn('Codigo') && (
              <div
                className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200 cursor-pointer"
                style={{ width: `${columnWidths.codigo}px`, minWidth: `${columnWidths.codigo}px` }}
                onClick={() => onToggleSort?.('Codigo')}
              >
                <span className="flex items-center gap-1 pointer-events-none">
                  Código {renderSortIcon('Codigo')}
                </span>
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                  onMouseDown={(e) => handleResizeStart(e, 'codigo')}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              )}

              {shouldShowColumn('Numero') && (
              <div
                className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200 cursor-pointer"
                style={{ width: `${columnWidths.numero}px`, minWidth: `${columnWidths.numero}px` }}
                onClick={() => onToggleSort?.('Numero')}
              >
                <span className="flex items-center gap-1 pointer-events-none">
                  Número {renderSortIcon('Numero')}
                </span>
                <div
                  className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                  onMouseDown={(e) => handleResizeStart(e, 'numero')}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              )}

              {/* Colunas Dinâmicas */}
              {dynamicColumns.map((colKey) => {
                const width = columnWidths[colKey] || DEFAULT_WIDTHS.dynamic;
                return (
                  <div
                    key={colKey}
                    className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200 cursor-pointer"
                    style={{ width: `${width}px`, minWidth: `${width}px` }}
                    onClick={() => onToggleSort?.(colKey)}
                  >
                    <span className="flex items-center gap-1 pointer-events-none">
                      {getColumnLabel(colKey)} {renderSortIcon(colKey)}
                    </span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                      onMouseDown={(e) => handleResizeStart(e, colKey)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* CORPO DA TABELA */}
          <div>
            {dados.map((row, idx) => {
              const dia = formatDate(safeString(row.Dia || row.dia));
              const hora = safeString(row.Hora || row.hora);
              const nome = safeString(row.Nome || row.nome);
              const codigo = safeString(row.Codigo || row.codigo);
              const numero = safeString(row.Numero || row.numero);

              return (
                <div
                  key={row.id ?? `r_${idx}`}
                  className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'} flex border-b border-gray-300`}
                >
                  {/* Colunas Fixas */}
                  {shouldShowColumn('Dia') && (
                  <div
                    className="flex items-center justify-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300"
                    style={{ width: `${columnWidths.dia}px`, minWidth: `${columnWidths.dia}px` }}
                  >
                    {dia}
                  </div>
                  )}

                  {shouldShowColumn('Hora') && (
                  <div
                    className="flex items-center justify-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300"
                    style={{ width: `${columnWidths.hora}px`, minWidth: `${columnWidths.hora}px` }}
                  >
                    {hora}
                  </div>
                  )}

                  {shouldShowColumn('Nome') && (
                  <div
                    className="flex items-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300"
                    style={{ width: `${columnWidths.nome}px`, minWidth: `${columnWidths.nome}px` }}
                  >
                    {nome}
                  </div>
                  )}

                  {shouldShowColumn('Codigo') && (
                  <div
                    className="flex items-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300"
                    style={{ width: `${columnWidths.codigo}px`, minWidth: `${columnWidths.codigo}px` }}
                  >
                    {codigo}
                  </div>
                  )}

                  {shouldShowColumn('Numero') && (
                  <div
                    className="flex items-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300"
                    style={{ width: `${columnWidths.numero}px`, minWidth: `${columnWidths.numero}px` }}
                  >
                    {numero}
                  </div>
                  )}

                  {/* Colunas Dinâmicas */}
                  {dynamicColumns.map((colKey) => {
                    const colIndex = parseInt(colKey.replace('col', ''), 10) - 6;
                    const value = row.values?.[colIndex];
                    const formatted = formatValue(value, colKey);
                    const width = columnWidths[colKey] || DEFAULT_WIDTHS.dynamic;

                    return (
                      <div
                        key={colKey}
                        className="flex items-center justify-end p-1 md:p-2 text-xs md:text-sm border-r border-gray-300"
                        style={{ width: `${width}px`, minWidth: `${width}px` }}
                      >
                        {formatted}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TableComponent, (prevProps, nextProps) => {
  if (prevProps.useExternalData !== nextProps.useExternalData) return false;
  if (!nextProps.useExternalData) return false;
  if (prevProps.error !== nextProps.error) return false;
  if (prevProps.page !== nextProps.page) return false;
  if (prevProps.pageSize !== nextProps.pageSize) return false;
  if (!shallowEqual(prevProps.colLabels, nextProps.colLabels)) return false;
  if (!shallowEqual(prevProps.produtosInfo, nextProps.produtosInfo)) return false;

  const prevRows = Array.isArray(prevProps.dados) ? prevProps.dados : [];
  const nextRows = Array.isArray(nextProps.dados) ? nextProps.dados : [];
  if (prevRows.length !== nextRows.length) return false;

  const prevTs = getLastTimestamp(prevRows);
  const nextTs = getLastTimestamp(nextRows);
  return prevTs === nextTs;
});