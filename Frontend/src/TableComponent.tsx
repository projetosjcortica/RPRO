import React, { useEffect, useRef } from "react";
import { format as formatDateFn } from "date-fns";
import { Filtros, ReportRow } from "./components/types";
// This component renders its own table-like markup and does not use the UI table primitives
// import { getProcessador } from './Processador'
import { useReportData } from "./hooks/useReportData";

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
      <div className="text-left">
        <div>Código do</div>
        <div>programa</div>
      </div>
    );
  } else if (idx === 4) {
    return (
      <div className="text-left">
        <div>Código do</div>
        <div>cliente</div>
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

  if (loading) return <div className="p-4">Carregando...</div>;
  if (error) return <div className="p-4 text-red-500">Erro: {error}</div>;
  if (!dados || dados.length === 0) return <div className="p-4">Nenhum dado encontrado</div>;

  return (
    <div ref={tableRef} className="w-full h-full flex flex-col">
      <div className="overflow-auto flex-1 thin-red-scrollbar h-[calc(100vh-200px)]">
        <div id="Table" className="min-w-max w-full">
          <div id="TableHeader" className="sticky top-0 z-20 bg-gray-200 border-b border-gray-300">
            <div id="TableRow" className="flex">
              {fixedColumns.map((col, idx) => {
                let width = '100px';
                let minWidth = '100px';
                if (idx === 0) {
                  width = '80px';
                  minWidth = '80px';
                } else if (idx === 1) {
                  width = '70px';
                  minWidth = '70px';
                } else if (idx === 2) {
                  width = '200px';
                  minWidth = '200px';
                }

                return (
                  <div
                    id="TableHead"
                    key={idx}
                    className="flex items-center justify-center py-1 px-1 md:py-2 md:px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200"
                    style={{ 
                      width,
                      minWidth,
                      whiteSpace: idx === 2 ? 'normal' : 'nowrap',
                      wordWrap: idx === 2 ? 'break-word' : 'normal',
                    }}
                  >
                    <div className="truncate max-w-full" title={receba(col, idx)}>
                      {receba(col, idx)}
                    </div>
                  </div>
                );
              })}
              {dynamicColumns.map((colKey, idx) => {
                const label = getColumnLabel(colKey);
                return (
                  <div
                    id="TableHead"
                    key={`${colKey}-${idx}`}
                    className="flex items-center justify-center py-1 px-2 md:py-2 md:px-3 text-center border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200"
                    style={{ 
                      width: '100px',
                      minWidth: '100px',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }}
                  >
                    <span className="truncate max-w-full text-center" title={label}>
                      {label}
                    </span>
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
                  let width = '100px';
                  let minWidth = '100px';
                  if (colIdx === 0) {
                    width = '80px';
                    minWidth = '80px';
                  } else if (colIdx === 1) {
                    width = '70px';
                    minWidth = '70px';
                  } else if (colIdx === 2) {
                    width = '200px';
                    minWidth = '200px';
                  }

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
                      className="flex items-center p-1 md:p-2 max-h-20 cursor-pointer select-none text-xs md:text-sm bg-white border-r border-gray-300"
                      style={{ 
                        width, 
                        minWidth,
                        justifyContent,
                      }}
                    >
                      {col === 'Dia' ? (
                        <div className="truncate">
                          {(() => {
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
                          })()}
                        </div>
                      ) : (
                        <div 
                          className="truncate max-w-full"
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
                  return (
                    <div
                      key={`${rowIdx}-${colKey}-${dynIdx}`}
                      className="flex items-center justify-end p-1 md:p-2 cursor-pointer select-none text-right text-xs md:text-sm bg-white border-r border-gray-300"
                      style={{ width: '100px', minWidth: '100px' }}
                    >
                      <div 
                        className="truncate max-w-full"
                        title={formatValue(rawValue, colKey)}
                      >
                        {formatValue(rawValue, colKey)}
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
