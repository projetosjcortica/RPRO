import React, { useMemo, useState, useEffect } from "react";
import { format as formatDateFn } from "date-fns";
import { Filtros, ReportRow } from "./components/types";
import { useReportData } from "./hooks/useReportData";
import { DataTable, Column } from "./components/ui/data-table/DataTable";

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
}

const STORAGE_KEY = "rpro-table-column-widths";

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

const getStableRowKey = (row: any, idx: number): string => {
  try {
    const d = safeString(row.Dia || row.date || "");
    const h = safeString(row.Hora || row.time || "");
    const num = safeString(row.Numero || row.numero || "");
    const codigo = safeString(row.Codigo || row.codigo || "");
    const maybeId = row.id || row.Id || row._id || "";
    const valuesHash = Array.isArray(row.values) ? String(row.values.length) + '|' + JSON.stringify(row.values?.slice(0, 3) || []) : '';
    const parts = [maybeId, d, h, num, codigo, valuesHash].filter(Boolean);
    if (parts.length === 0) return `r_${idx}`;
    return parts.join("|");
  } catch (e) {
    return `r_${idx}`;
  }
};

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
  } catch { }
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

  const [dadosAtual, setDadosAtual] = useState<ReportRow[]>(dadosProp);

  // ================
  // DADOS DA TABELA
  // ================

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
    setDadosAtual(newDados);
  }, [dadosFromHook, useExternalData]);

  useEffect(() => {
    if (!useExternalData) return;
    const newDados = Array.isArray(dadosProp) ? dadosProp : [];
    try {
      const prevTs = getLastTimestamp(dadosAtual as any[]);
      const newTs = getLastTimestamp(newDados as any[]);
      if ((dadosAtual?.length || 0) === newDados.length && prevTs === newTs) {
        return;
      }
    } catch (e) { }
    setDadosAtual(newDados);
  }, [dadosProp, useExternalData, dadosAtual]);

  const produtosInfo = produtosInfoProp || {};
  const dados = useExternalData ? dadosAtual : dadosFromHook;
  const loading = useExternalData ? Boolean(loadingProp ?? loadingFromHook) : loadingFromHook;
  const error = useExternalData ? errorProp ?? null : errorFromHook;

  // ================
  // COLUNAS
  // ================

  const columns = useMemo<Column<ReportRow>[]>(() => {
    const cols: Column<ReportRow>[] = [
      {
        accessorKey: 'Dia',
        header: 'Dia',
        width: 90,
        sortable: true,
        cell: ({ value }) => formatDate(safeString(value)),
        align: 'center',
      },
      {
        accessorKey: 'Hora',
        header: 'Hora',
        width: 70,
        sortable: true,
        align: 'center',
      },
      {
        accessorKey: 'Nome',
        header: 'Nome',
        width: 200,
        sortable: true,
        align: 'left',
      },
      {
        accessorKey: 'Codigo',
        header: 'Código do programa',
        width: 100,
        sortable: true,
        sortKey: 'Form1',
        align: 'right',
      },
      {
        accessorKey: 'Numero',
        header: 'Código do cliente',
        width: 100,
        sortable: true,
        sortKey: 'Form2',
        align: 'right',
      },
    ];

    // Dynamic Columns
    if (dados?.length) {
      const maxValues = Math.max(...dados.map((row) => row.values?.length || 0));
      const allCols = Array.from({ length: maxValues }, (_, i) => `col${6 + i}`);

      const activeCols = allCols.filter(colKey => {
        const info = produtosInfo[colKey];
        return info?.ativo !== false;
      });

      activeCols.forEach(colKey => {
        const info = produtosInfo[colKey];
        const label = info?.nome || `Produto ${parseInt(colKey.replace("col", ""), 10) - 5}`;
        const prodNum = parseInt(colKey.replace('col', ''), 10) - 5;
        const backendField = `Prod_${prodNum}`;
        const dynIdx = parseInt(colKey.replace('col', ''), 10) - 6; // col6 -> index 0

        cols.push({
          accessorKey: colKey,
          header: label,
          width: 110,
          sortable: true,
          sortKey: backendField,
          align: 'right',
          cell: ({ row }) => {
            const val = row.values?.[dynIdx];
            if (typeof val === "string" && val.trim() !== "") return val;
            if (typeof val === "number") {
              return val.toLocaleString("pt-BR", {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              });
            }
            return safeString(val);
          },
        });
      });
    }

    return cols;
  }, [dados, produtosInfo]);

  // Expose reset capability via ref/callback pattern (legacy support)
  // Note: The new DataTable handles persistence internally via useDataTable,
  // but we need to bridge the reset command if the parent component expects it.
  // Since useDataTable is inside DataTable, we can't easily expose it upwards without ref forwarding.
  // For now, we'll assume the parent might re-mount or we can implement a simple reset via key if needed.
  // However, the original code passed a callback to `onResetColumnsReady`.
  // To support this strictly, we would need to lift the state up or use a ref.
  // Given the constraints, clearing localStorage is the most effective "reset".

  useEffect(() => {
    if (onResetColumnsReady) {
      onResetColumnsReady(() => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload(); // Simple brute-force reset for now to ensure UI updates
      });
    }
  }, [onResetColumnsReady]);

  return (
    <DataTable
      data={dados || []}
      columns={columns}
      loading={loading}
      error={error}
      storageKey={STORAGE_KEY}
      sortBy={sortByProp}
      sortDir={sortDirProp}
      onSort={onToggleSort}
      getRowKey={getStableRowKey}
    />
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