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
  produtosInfo?: Record<string, { nome?: string; unidade?: string; num?: number }>;
  useExternalData?: boolean;
  onResetColumnsReady?: (resetFn: () => void) => void;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  onToggleSort?: (col: string) => void;
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

function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

function getLastTimestamp(arr: any[]): string {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  for (let i = arr.length - 1; i >= 0; i--) {
    const r = arr[i];
    if (r && (r.Dia || r.Hora)) {
      const d = String(r.Dia || "").trim();
      const h = String(r.Hora || "").trim();
      if (d || h) return `${d}T${h}`;
    }
  }
  return "";
}

const safeString = (value: any): string => {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    if (typeof value.produto === "string") return value.produto;
    if (typeof value.nome === "string") return value.nome;
    if (typeof value.label === "string") return value.label;
  }
  return "";
};

const getColumnHeader = (col: string, idx: number): React.ReactNode => {
  if (idx === 3) return <div className="text-center">Código do programa</div>;
  if (idx === 4) return <div className="text-center">Código do cliente</div>;
  return safeString(col);
};

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
    // Atualização instantânea: sempre aplicar novos dados imediatamente
    setDadosAtual(newDados);
  }, [dadosProp, useExternalData]);

  // Table will re-render when filtros/dados change. Do not auto-refresh on produtos-updated here.
  // Product updates are applied by the parent (`report.tsx`) when navigating away or clicking outside.

  const produtosInfo = produtosInfoProp || {};
  const dados = useExternalData ? dadosAtual : dadosFromHook;

  // ================
  // COLUNAS DINÂMICAS
  // ================

  const dynamicColumns = React.useMemo(() => {
    if (!dados?.length) return [];
    const maxValues = Math.max(...dados.map((row) => row.values?.length || 0));
    return Array.from({ length: maxValues }, (_, i) => `col${6 + i}`);
  }, [dados]);

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

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 h-[50vh] w-full text-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto" />
        <p className="text-lg font-medium">Carregando dados...</p>
        <p className="text-sm text-gray-500">Os dados estão sendo processados, por favor aguarde.</p>
      </div>
    );

  if (error)
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

  if (!dados || dados.length === 0)
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[50vh] w-full text-center">
        <div className="text-gray-700 font-semibold text-lg">Nenhum dado encontrado</div>
        <div className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
          Tente ajustar os filtros para ver mais resultados.
        </div>
      </div>
    );

  // ================
  // RENDERIZAÇÃO
  // ================

  return (
    <div ref={tableRef} className="w-full h-full flex flex-col relative">
      <div className="overflow-auto flex-1 thin-red-scrollbar h-[calc(100vh-200px)]">
        <div id="Table" className="min-w-max w-full">
          {/* Cabeçalho */}
          <div id="TableHeader" className="sticky top-0 z-10 bg-gray-200 border-b border-gray-300">
            <div id="TableRow" className="flex">
              {FIXED_COLUMNS.map((col, idx) => {
                const key = col.toLowerCase();
                const width = columnWidths[key] || DEFAULT_WIDTHS[key as keyof typeof DEFAULT_WIDTHS] || DEFAULT_WIDTHS.dynamic;

                // Map user-facing column labels to backend sortable fields
                let backendField = col;
                if (col === 'Codigo') backendField = 'Form1';
                if (col === 'Numero') backendField = 'Form2';

                const isActive = ((filtros as any)?.sortBy === backendField);

                return (
                  <div
                    key={idx}
                    className="relative flex items-center justify-center py-1 px-1 md:py-2 md:px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200"
                    style={{
                      width: `${width}px`,
                      minWidth: `${width}px`,
                      whiteSpace: idx === 2 ? "normal" : "nowrap",
                      wordWrap: idx === 2 ? "break-word" : "normal",
                      overflow: "hidden",
                    }}
                    title={typeof getColumnHeader(col, idx) === "string" ? getColumnHeader(col, idx) as string : ""}
                  >
                    <div className="max-w-full break-words flex items-center justify-center gap-2" style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                      <div style={{ cursor: 'pointer' }} onClick={() => onToggleSort?.(backendField)} onDoubleClick={(e) => { e.stopPropagation(); onToggleSort?.(backendField); }}>
                        {getColumnHeader(col, idx)}
                      </div>
                      {/* Sort arrow */}
                      { isActive && (
                        <div className="text-xs text-gray-600" title={`Ordenado por ${col} (${(filtros as any)?.sortDir || 'DESC'})`}>
                          {( (filtros as any)?.sortDir === 'ASC' ) ? '\u2191' : '\u2193'}
                        </div>
                      ) }
                    </div>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-red-500 transition-colors"
                      onMouseDown={(e) => handleResizeStart(e, key)}
                      style={{ userSelect: "none" }}
                    />
                  </div>
                );
              })}

              {dynamicColumns.map((colKey, idx) => {
                const label = getColumnLabel(colKey);
                const width = columnWidths[colKey] || DEFAULT_WIDTHS.dynamic;
                // Map colKey (e.g. col6) to backend field (e.g. Prod_1)
                const prodNum = parseInt(colKey.replace('col', ''), 10) - 5;
                const backendField = `Prod_${prodNum}`;
                const isActiveSortCol = (filtros as any)?.sortBy === backendField;
                return (
                  <div
                    key={`${colKey}-${idx}`}
                    className="relative flex items-center justify-center py-1 px-2 md:py-2 md:px-3 text-center border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200"
                    style={{
                      width: `${width}px`,
                      minWidth: `${width}px`,
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                      overflow: "hidden",
                    }}
                    title={label}
                  >
                    <div className="flex items-center justify-center gap-2 max-w-full">
                      <span
                        className="text-center break-words cursor-pointer"
                        style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal", display: "block" }}
                        onClick={() => onToggleSort?.(backendField)}
                        onDoubleClick={(e) => { e.stopPropagation(); onToggleSort?.(backendField); }}
                      >
                        {label}
                      </span>
                      {isActiveSortCol && (
                        <div className="text-xs text-gray-600" title={`Ordenado por ${label} (${(filtros as any)?.sortDir || 'DESC'})`}>
                          {((filtros as any)?.sortDir === 'ASC') ? '↑' : '↓'}
                        </div>
                      )}
                    </div>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-red-500 transition-colors"
                      onMouseDown={(e) => handleResizeStart(e, colKey)}
                      style={{ userSelect: "none" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Corpo da tabela com linhas alternadas */}
          <div>
            {dados.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className={`flex border-b border-gray-300 hover:bg-gray-50 ${
                  rowIdx % 2 === 0 ? "bg-white" : "bg-gray-100"
                }`}
              >
                {FIXED_COLUMNS.map((col, colIdx) => {
                  const key = col.toLowerCase();
                  const width = columnWidths[key] || DEFAULT_WIDTHS[key as keyof typeof DEFAULT_WIDTHS] || DEFAULT_WIDTHS.dynamic;

                  let textAlign = "text-center";
                  if (colIdx === 2) textAlign = "text-left";
                  else if (colIdx >= 3) textAlign = "text-right";

                  const cellValue = row[col as keyof ReportRow];
                  const displayValue = col === "Dia" ? formatDate(safeString(cellValue)) : safeString(cellValue);

                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className={`flex items-center p-1 md:p-2 max-h-20 cursor-pointer select-none text-xs md:text-sm border-r border-gray-300 overflow-hidden ${textAlign}`}
                      style={{ width: `${width}px`, minWidth: `${width}px` }}
                      title={displayValue}
                    >
                      <div className="w-full break-words" style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                        {displayValue}
                      </div>
                    </div>
                  );
                })}

                {dynamicColumns.map((colKey, dynIdx) => {
                  const rawValue = row.values?.[dynIdx];
                  const width = columnWidths[colKey] || DEFAULT_WIDTHS.dynamic;
                  const formattedValue = formatValue(rawValue, colKey);

                  return (
                    <div
                      key={`${rowIdx}-${colKey}-${dynIdx}`}
                      className="flex items-center justify-end p-1 md:p-2 cursor-pointer select-none text-right text-xs md:text-sm border-r border-gray-300 overflow-hidden"
                      style={{ width: `${width}px`, minWidth: `${width}px` }}
                      title={formattedValue}
                    >
                      <div className="w-full break-words text-right" style={{ wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                        {formattedValue}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================
// MEMOIZATION
// ================

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