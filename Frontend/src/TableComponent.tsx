import React, { useEffect, useRef, useState, useCallback } from "react";
import { format as formatDateFn } from "date-fns";
import { Filtros, ReportRow } from "./components/types";
// This component renders its own table-like markup and does not use the UI table primitives
// import { getProcessador } from './Processador'
import { useReportData } from "./hooks/useReportData";
import { Loader2 } from "lucide-react";

interface TableComponentProps {
  filtros?: Filtros;
  colLabels: Record<string, string>;
  dados?: any[];
  loading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  pageSize?: number;
  produtosInfo?: Record<
    string,
    { nome?: string; unidade?: string; num?: number }
  >;
  useExternalData?: boolean;
}

// Larguras padrão das colunas
const DEFAULT_WIDTHS = {
  dia: 90,
  hora: 70,
  nome: 200,
  codigo: 100,
  numero: 100,
  dynamic: 100,
};

const STORAGE_KEY = 'rpro-table-column-widths';

// Module-level helpers used by both component and memo comparator
function shallowEqual(a: any, b: any) {
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

function getLastTimestamp(arr: any[]) {
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
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value.toString();
  if (typeof value === "object") {
    // Se for um objeto, tenta extrair propriedades úteis
    if (value.produto && typeof value.produto === "string")
      return value.produto;
    if (value.nome && typeof value.nome === "string") return value.nome;
    if (value.label && typeof value.label === "string") return value.label;
    // Se não conseguir extrair, retorna string vazia para evitar erro
    return "";
  }
  return String(value);
};

const receba = (col: any, idx: number) => {
  if (idx === 3) {
    return (
      <div className="text-center">
        <div>Código do programa</div>
      </div>
    );
  } else if (idx === 4) {
    return (
      <div className="text-center">
        <div>Código do cliente</div>
      </div>
    );
  }
  return safeString(col);
};

function TableComponent({
  dados: dadosProp = [],
  loading: loadingProp,
  error: errorProp,
  produtosInfo: produtosInfoProp = {},
  filtros = {},
  page = 1,
  pageSize = 100,
  useExternalData = false,
}: TableComponentProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [dadosAtual, setDadosAtual] = React.useState<ReportRow[]>(dadosProp);

  // Estado para larguras das colunas com redimensionamento
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar larguras das colunas:', e);
    }
    // Retornar larguras padrão
    return {
      dia: DEFAULT_WIDTHS.dia,
      hora: DEFAULT_WIDTHS.hora,
      nome: DEFAULT_WIDTHS.nome,
      codigo: DEFAULT_WIDTHS.codigo,
      numero: DEFAULT_WIDTHS.numero,
    };
  });

  // Estado para controle de redimensionamento
  const [resizing, setResizing] = useState<{
    columnKey: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Salvar larguras no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnWidths));
    } catch (e) {
      console.warn('Erro ao salvar larguras das colunas:', e);
    }
  }, [columnWidths]);

  // Manipuladores de redimensionamento
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
    const newWidth = Math.max(50, resizing.startWidth + diff); // Mínimo de 50px
    setColumnWidths(prev => ({
      ...prev,
      [resizing.columnKey]: newWidth,
    }));
  }, [resizing]);

  const handleResizeEnd = useCallback(() => {
    setResizing(null);
  }, []);

  // Adicionar listeners de mouse
  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing, handleResizeMove, handleResizeEnd]);

  // Hook é chamado sempre no nível superior (top-level), o que está correto.
  const hookResult = useReportData(filtros as any, page, pageSize);
  const dadosFromHook = hookResult.dados || [];
  const loadingFromHook = hookResult.loading;
  const errorFromHook = hookResult.error;
  // setDadosAtual(dadosFromHook)

  useEffect(() => {
    if (useExternalData) return;
    const newDados = Array.isArray(dadosFromHook) ? dadosFromHook : [];
    const lastNew = getLastTimestamp(newDados);
    const lastCurrent = getLastTimestamp(dadosAtual);
    if (newDados.length !== dadosAtual.length || lastNew !== lastCurrent) {
      setDadosAtual(newDados);
    }
  }, [dadosFromHook, useExternalData, dadosAtual]);

  useEffect(() => {
    if (!useExternalData) return;
    const newDados = Array.isArray(dadosProp) ? dadosProp : [];
    const lastNew = getLastTimestamp(newDados);
    const lastCurrent = getLastTimestamp(dadosAtual);
    if (newDados.length !== dadosAtual.length || lastNew !== lastCurrent) {
      setDadosAtual(newDados);
    }
  }, [dadosProp, useExternalData, dadosAtual]);

  // Listen for product updates to force re-render when units change
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  useEffect(() => {
    const handleProdutosUpdated = () => {
      // Force component to re-render when product info (units) change
      forceUpdate();
    };
    window.addEventListener('produtos-updated', handleProdutosUpdated as EventListener);
    return () => {
      window.removeEventListener('produtos-updated', handleProdutosUpdated as EventListener);
    };
  }, []);

  // Use produtosInfo passed from parent (backend-provided). Keep as a const alias.
  const produtosInfo = produtosInfoProp || {};

  const fixedColumns = ["Dia", "Hora", "Nome", "Codigo", "Numero"];

  // Função para converter valores baseado na unidade definida em produtosInfo.
  // Backend normaliza valores para kg, mas aqui permitimos apresentar em g ou kg
  // dependendo do produto. Se unidade === 'g' mostramos valor em gramas (kg * 1000).
  const converterValor = (valor: any, colKey: string): number | any => {
    // try to coerce to number
    let n: number;
    if (typeof valor === "number") n = valor;
    else if (typeof valor === "string" && valor.trim() !== "") {
      const parsed = Number(valor.replace(/,/g, ""));
      if (Number.isNaN(parsed)) return valor;
      n = parsed;
    } else {
      return valor;
    }

    const unidade = produtosInfo[colKey]?.unidade || "kg";
    // Backend retorna valores sempre em kg. Se unidade configurada é 'g', dividimos por 1000
    if (unidade === "g") {
      return n / 1000; // mostrar valor em escala de gramas
    }
    return n; // padrão kg
  };

  // Função para formatar valores exibidos na tabela
  const formatValue = (v: unknown, colKey: string): string => {
    if (typeof v === "number") {
      const valorConvertido = converterValor(v, colKey);
      return valorConvertido.toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    }
    return safeString(v);
  };

  // Função para obter o label correto da coluna - SEMPRE retorna string
  const getColumnLabel = (colKey: string): string => {
    if (fixedColumns.includes(colKey)) return colKey;
    if (colKey.startsWith('col')) {
      const label = produtosInfo[colKey]?.nome;
      const unidade = produtosInfo[colKey]?.unidade;
      const colNum = parseInt(colKey.replace("col", ""), 10);
      const base = safeString(label) || `Produto ${colNum - 5}`;
      return unidade ? `${base}` : base;
    }
    return safeString(colKey);
  };

  const dados = useExternalData ? dadosAtual : dadosFromHook;

  const dynamicColumns = React.useMemo(() => {
    if (!dados || dados.length === 0) return [];
    const maxValues = Math.max(...dados.map(row => row.values?.length || 0));
    const cols = [];
    for (let i = 6; i < 6 + maxValues; i++) {
      const colKey = `col${i}`;
      cols.push(colKey);
    }
    return cols;
  }, [dados]);

  const loading = useExternalData
    ? Boolean(loadingProp ?? loadingFromHook)
    : loadingFromHook;
  const error = useExternalData ? errorProp ?? null : errorFromHook;

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 h-[50vh] w-full text-center">
      <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto" />
      <p className="text-lg font-medium">Carregando dados...</p>
      <p className="text-sm text-gray-500">Os dados estão sendo processados, por favor aguarde.</p>
    </div>
  );
  if (error) return (
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
  if (!dados || dados.length === 0) return (
    <div className="flex flex-col items-center justify-center p-8 h-[50vh] w-full text-center">
      <div className="text-gray-700 font-semibold text-lg">Nenhum dado encontrado</div>
      <div className="text-sm text-gray-600 mt-1 max-w-md mx-auto">Tente ajustar os filtros para ver mais resultados.</div>
    </div>
  );

  const resetColumnWidths = () => {
    setColumnWidths({
      dia: DEFAULT_WIDTHS.dia,
      hora: DEFAULT_WIDTHS.hora,
      nome: DEFAULT_WIDTHS.nome,
      codigo: DEFAULT_WIDTHS.codigo,
      numero: DEFAULT_WIDTHS.numero,
    });
    // Limpar do localStorage também
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div ref={tableRef} className="w-full h-full flex flex-col relative">
      {/* Botão de reset no canto superior direito */}
      <button
        onClick={resetColumnWidths}
        className="absolute top-0 right-2 z-30 px-3 py-1 text-xs bg-gray-300 hover:bg-gray-400 text-gray-700 rounded shadow-md transition-colors flex items-center gap-1"
        title="Restaurar larguras padrão das colunas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M8 16H3v5"/>
        </svg>
        Reset
      </button>
      <div className="overflow-auto flex-1 thin-red-scrollbar h-[calc(100vh-200px)]">
        <div id="Table" className="min-w-max w-full">
          <div id="TableHeader" className="sticky top-0 z-20 bg-gray-200 border-b border-gray-300">
            <div id="TableRow" className="flex">
              {fixedColumns.map((col, idx) => {
                const columnKey = col.toLowerCase();
                const width = columnWidths[columnKey] || 
                  (idx === 0 ? DEFAULT_WIDTHS.dia : 
                   idx === 1 ? DEFAULT_WIDTHS.hora : 
                   idx === 2 ? DEFAULT_WIDTHS.nome : 
                   idx === 3 ? DEFAULT_WIDTHS.codigo : 
                   DEFAULT_WIDTHS.numero);

                return (
                  <div
                    id="TableHead"
                    key={idx}
                    className="relative flex items-center justify-center py-1 px-1 md:py-2 md:px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200"
                    style={{ 
                      width: `${width}px`,
                      minWidth: `${width}px`,
                      whiteSpace: idx === 2 ? 'normal' : 'nowrap',
                      wordWrap: idx === 2 ? 'break-word' : 'normal',
                      overflow: 'hidden',
                    }}
                    title={typeof receba(col, idx) === 'string' ? receba(col, idx) as string : ''}
                  >
                    <div 
                      className="max-w-full break-words"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                    >
                      {receba(col, idx)}
                    </div>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-red-500 transition-colors"
                      onMouseDown={(e) => handleResizeStart(e, columnKey)}
                      style={{ userSelect: 'none' }}
                    />
                  </div>
                );
              })}
              {dynamicColumns.map((colKey, idx) => {
                const label = getColumnLabel(colKey);
                const width = columnWidths[colKey] || DEFAULT_WIDTHS.dynamic;
                
                return (
                  <div
                    id="TableHead"
                    key={`${colKey}-${idx}`}
                    className="relative flex items-center justify-center py-1 px-2 md:py-2 md:px-3 text-center border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200"
                    style={{ 
                      width: `${width}px`,
                      minWidth: `${width}px`,
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      overflow: 'hidden'
                    }}
                    title={label}
                  >
                    <span 
                      className="max-w-full text-center break-words"
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        display: 'block'
                      }}
                    >
                      {label}
                    </span>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-red-500 transition-colors"
                      onMouseDown={(e) => handleResizeStart(e, colKey)}
                      style={{ userSelect: 'none' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Corpo da tabela — alinhamento por coluna */}
          <div>
            {dados.map((row, rowIdx) => (
              <div 
                key={rowIdx} 
                className="flex hover:bg-gray-50 border-b border-gray-300"
              >
                {fixedColumns.map((col, colIdx) => {
                  const columnKey = col.toLowerCase();
                  const width = columnWidths[columnKey] || 
                    (colIdx === 0 ? DEFAULT_WIDTHS.dia : 
                     colIdx === 1 ? DEFAULT_WIDTHS.hora : 
                     colIdx === 2 ? DEFAULT_WIDTHS.nome : 
                     colIdx === 3 ? DEFAULT_WIDTHS.codigo : 
                     DEFAULT_WIDTHS.numero);

                  // ✅ Alinhamento dos VALORES no corpo
                  let justifyContent = 'center'; // padrão
                  if (colIdx === 2) {
                    justifyContent = 'flex-start'; // Nome à esquerda
                  } else if (colIdx >= 3) {
                    justifyContent = 'flex-end';   // Código, Número, etc. à direita
                  }

                  return (
                    <div
                      key={`${rowIdx}-${colIdx}`}
                      className="flex items-center p-1 md:p-2 max-h-20 cursor-pointer select-none text-xs md:text-sm bg-white border-r border-gray-300 overflow-hidden"
                      style={{ 
                        width: `${width}px`, 
                        minWidth: `${width}px`,
                        justifyContent,
                      }}
                    >
                      {col === 'Dia' ? (
                        <div className="truncate w-full" title={(() => {
                          const raw = safeString(row[col as keyof ReportRow]);
                          try {
                            if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                              const [y, m, d] = raw.split('-').map(Number);
                              return formatDateFn(new Date(y, m - 1, d), 'dd/MM/yyyy');
                            }
                            if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
                              const [d, m, y] = raw.split('-').map(Number);
                              return formatDateFn(new Date(y, m - 1, d), 'dd/MM/yyyy');
                            }
                            const parsed = new Date(raw);
                            if (!isNaN(parsed.getTime())) return formatDateFn(parsed, 'dd/MM/yyyy');
                            return raw;
                          } catch (e) {
                            return raw;
                          }
                        })()}>
                          {(() => {
                            const raw = safeString(row[col as keyof ReportRow]);
                            try {
                              // Garantindo formato dd/MM/yyyy consistente
                              if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                                const [y, m, d] = raw.split('-').map(Number);
                                return formatDateFn(new Date(y, m - 1, d), 'dd/MM/yyyy');
                              }
                              if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
                                const [d, m, y] = raw.split('-').map(Number);
                                return formatDateFn(new Date(y, m - 1, d), 'dd/MM/yyyy');
                              }
                              // Tenta parse geral como último recurso
                              const parsed = new Date(raw);
                              if (!isNaN(parsed.getTime())) return formatDateFn(parsed, 'dd/MM/yyyy');
                              return raw;
                            } catch (e) {
                              return raw;
                            }
                          })()}
                        </div>
                      ) : (
                        <div 
                          className="w-full break-words" 
                          style={{ 
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal'
                          }}
                          title={safeString(row[col as keyof ReportRow])}
                        >
                          {safeString(row[col as keyof ReportRow])}
                        </div>
                      )}
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
                      className="flex items-center justify-end p-1 md:p-2 cursor-pointer select-none text-right text-xs md:text-sm bg-white border-r border-gray-300 overflow-hidden"
                      style={{ 
                        width: `${width}px`, 
                        minWidth: `${width}px` 
                      }}
                    >
                      <div 
                        className="w-full break-words text-right"
                        style={{ 
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          whiteSpace: 'normal'
                        }}
                        title={formattedValue}
                      >
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

export default React.memo(TableComponent, (prevProps, nextProps) => {
  if (prevProps.useExternalData !== nextProps.useExternalData) return false;
  if (!nextProps.useExternalData) return false;
  if (prevProps.error !== nextProps.error) return false;
  if (prevProps.page !== nextProps.page) return false;
  if (prevProps.pageSize !== nextProps.pageSize) return false;
  if (!shallowEqual(prevProps.colLabels, nextProps.colLabels)) return false;
  if (!shallowEqual(prevProps.produtosInfo, nextProps.produtosInfo))
    return false;

  const prevRows = Array.isArray(prevProps.dados) ? prevProps.dados : [];
  const nextRows = Array.isArray(nextProps.dados) ? nextProps.dados : [];
  if (prevRows.length !== nextRows.length) return false;
  const prevTs = getLastTimestamp(prevRows);
  const nextTs = getLastTimestamp(nextRows);
  if (prevTs !== nextTs) return false;

  return true;
});
