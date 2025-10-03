import React, { useEffect, useRef } from "react";
import { format as formatDateFn } from "date-fns";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "./components/ui/table";
import { Filtros, ReportRow } from "./components/types";
import { ScrollArea, ScrollBar } from "./components/ui/scroll-area";
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

// Função auxiliar para garantir que sempre retorne uma string
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
      <div>
        Código do <br /> programa
      </div>
    );
  } else if (idx === 4) {
    return (
      <div>
        Código do <br /> cliente
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
    // Atualiza se quantidade de linhas mudou OU se o último timestamp mudou
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

  // Use produtosInfo passed from parent (backend-provided). Keep as a const alias.
  const produtosInfo = produtosInfoProp || {};

  const fixedColumns = ["Dia", "Hora", "Nome", "Codigo", "Numero"];

  // Função para converter valores baseado na unidade (no momento retorna o valor já normalizado em kg)
  const converterValor = (valor: number, _colKey: string): number => {
    if (typeof valor !== "number") return valor as any;
    return valor; // already normalized to kg by backend
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
    // Se for uma coluna fixa, retorna o nome direto
    if (fixedColumns.includes(colKey)) return colKey;
    // Se for uma coluna dinâmica, busca no colLabels ou usa fallback
    if (colKey.startsWith("col")) {
      const label = produtosInfo[colKey]?.nome;
      const colNum = parseInt(colKey.replace("col", ""), 10);
      return safeString(label) || `Produto ${colNum - 5}`;
    }
    return safeString(colKey);
  };

  // Use provided prop to decide whether to prefer hook data or external props
  const dados = useExternalData ? dadosAtual : dadosFromHook;

  // Gera dynamicColumns baseado nos dados reais
  const dynamicColumns = React.useMemo(() => {
    if (!dados || dados.length === 0) return [];

    const maxValues = Math.max(...dados.map((row) => row.values?.length || 0));

    const cols = [];
    for (let i = 6; i < 6 + maxValues; i++) {
      const colKey = `col${i}`;
      cols.push(colKey);
    }
    return cols;
  }, [dados]);

  // Função para formatar valores com conversão de unidade
  const loading = useExternalData
    ? Boolean(loadingProp ?? loadingFromHook)
    : loadingFromHook;
  const error = useExternalData ? (errorProp ?? null) : errorFromHook;

  if (loading) return <div className="p-4">Carregando...</div>;
  if (error) return <div className="p-4 text-red-500">Erro: {error}</div>;
  if ((!dados && !loading) || dados.length === 0)
    return <div className="p-4">Nenhum dado encontrado</div>;

  return (
    <div ref={tableRef} className="overflow-hidden w-full h-full flex flex-col">
      <div className="flex-1 h-full border border-gray-300  shadow-sm/16">
        <ScrollArea className="overflow-y-auto h-full w-full scrollbar-custom">
          <Table className="h-full border-collapse table-fixed w-full">
            <TableHeader className="bg-gray-100 sticky top-0 z-10">
              <TableRow>
                {fixedColumns.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className="py-1 px-1 md:py-2 md:px-3 break-words text-center border border-gray-300 font-semibold text-xs md:text-sm"
                    style={{
                      width: idx === 0 ? "100px" : idx === 1 ? "70px" : "100px",
                    }}
                  >
                    {receba(col, idx)}
                  </TableHead>
                ))}
                {dynamicColumns.map((colKey, idx) => {
                  const label = getColumnLabel(colKey);

                  return (
                    <TableHead
                      key={`${colKey}-${idx}`}
                      className="py-1 px-2 md:py-2 md:px-3 text-center border border-gray-300 font-semibold text-xs md:text-sm"
                      style={{
                        width: "100px",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="break-words text-center">{label}</span>
                        {/* {unidade && (
                          <span className="text-xs text-gray-500">({unidade})</span>
                        )} */}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {dados.map((row, rowIdx) => (
                <TableRow key={rowIdx} className="hover:bg-gray-50">
                  {fixedColumns.map((col, colIdx) => (
                    <TableCell
                      key={`${rowIdx}-${colIdx}`}
                      className="p-1 md:p-2 border max-h-20 border-gray-300 cursor-pointer select-none text-center text-xs md:text-sm bg-white"
                      style={{
                        width:
                          colIdx === 0
                            ? "80px"
                            : colIdx === 1
                              ? "70px"
                              : "100px",
                      }}
                    >
                      <div className="truncate">
                        {col === "Dia"
                          ? (() => {
                              const raw = safeString(
                                row[col as keyof ReportRow]
                              );
                              // Try to parse YYYY-MM-DD or DD-MM-YYYY and display as dd/MM/yy
                              try {
                                if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                                  const [y, m, d] = raw.split("-").map(Number);
                                  return formatDateFn(
                                    new Date(y, m - 1, d),
                                    "dd/MM/yy"
                                  );
                                }
                                if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
                                  const [d, m, y] = raw.split("-").map(Number);
                                  return formatDateFn(
                                    new Date(y, m - 1, d),
                                    "dd/MM/yy"
                                  );
                                }
                                // fallback: try Date parse
                                const parsed = new Date(raw);
                                if (!isNaN(parsed.getTime()))
                                  return formatDateFn(parsed, "dd/MM/yy");
                                return raw;
                              } catch (e) {
                                return raw;
                              }
                            })()
                          : safeString(row[col as keyof ReportRow])}
                      </div>
                    </TableCell>
                  ))}

                  {dynamicColumns.map((colKey, dynIdx) => {
                    const rawValue = row.values?.[dynIdx];

                    return (
                      <TableCell
                        key={`${rowIdx}-${colKey}-${dynIdx}`}
                        className="p-1 md:p-2 border border-gray-300 cursor-pointer select-none text-center text-xs md:text-sm bg-white"
                        style={{ width: "100px" }}
                      >
                        <div className="truncate">
                          {formatValue(rawValue, colKey)}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" className="" />
        </ScrollArea>
      </div>
    </div>
  );
}

// Memoize the component to avoid re-rendering (and UI flicker) when external
// data hasn't changed meaningfully. The comparator checks length + last timestamp
// and shallow compares some props. It re-uses the `shallowEqual` and
// `getLastTimestamp` helpers defined above.
export default React.memo(TableComponent, (prevProps, nextProps) => {
  // If useExternalData changed, re-render
  if (prevProps.useExternalData !== nextProps.useExternalData) return false;

  // If not using external data, allow normal updates (don't block)
  if (!nextProps.useExternalData) return false;

  // Ignore transient loading differences (we rely on data/timestamp to detect
  // meaningful changes). Keep error differences, they should trigger updates.
  if (prevProps.error !== nextProps.error) return false;

  // Compare simple props
  if (prevProps.page !== nextProps.page) return false;
  if (prevProps.pageSize !== nextProps.pageSize) return false;

  // Shallow compare labels and produtosInfo
  if (!shallowEqual(prevProps.colLabels, nextProps.colLabels)) return false;
  if (!shallowEqual(prevProps.produtosInfo, nextProps.produtosInfo))
    return false;

  // Compare dadosProp by length and last timestamp
  const prevRows = Array.isArray(prevProps.dados) ? prevProps.dados : [];
  const nextRows = Array.isArray(nextProps.dados) ? nextProps.dados : [];
  if (prevRows.length !== nextRows.length) return false;
  const prevTs = getLastTimestamp(prevRows);
  const nextTs = getLastTimestamp(nextRows);
  if (prevTs !== nextTs) return false;

  // No meaningful change -> skip re-render
  return true;
});
