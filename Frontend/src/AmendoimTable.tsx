import React, { useMemo } from 'react';
import { DataTable, Column } from './components/ui/data-table/DataTable';

interface AmendoimRecord {
  id: number;
  tipo: 'entrada' | 'saida';
  dia: string;
  hora: string;
  codigoProduto: string;
  codigoCaixa: string;
  nomeProduto: string;
  peso: number;
  balanca?: string;
  createdAt?: string;
}

interface Props {
  registros: AmendoimRecord[];
  loading?: boolean;
  error?: string | null;
  page?: number;
  pageSize?: number;
  onSort?: (col: string) => void;
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc';
  onResetColumns?: () => void;
  resetKey?: number;
}

const safe = (v: any) => (v == null ? '' : String(v));

const STORAGE_KEY = 'amendoim-table-column-widths';

export default function AmendoimTable({
  registros,
  loading,
  error,
  onSort,
  sortColumn,
  sortDirection,
  resetKey
}: Props) {

  const columns = useMemo<Column<AmendoimRecord>[]>(() => [
    {
      accessorKey: 'dia',
      header: 'Dia',
      width: 100,
      sortable: true,
      align: 'center',
      cell: ({ value }) => safe(value),
    },
    {
      accessorKey: 'hora',
      header: 'Hora',
      width: 80,
      sortable: true,
      align: 'center',
      cell: ({ value }) => safe(value),
    },
    {
      accessorKey: 'codigoProduto',
      header: 'Cód. Produto',
      width: 110,
      sortable: true,
      align: 'left',
      cell: ({ value }) => safe(value),
    },
    {
      accessorKey: 'balanca',
      header: 'Balança',
      width: 80,
      sortable: true,
      align: 'center',
      cell: ({ value }) => safe(value),
    },
    {
      accessorKey: 'nomeProduto',
      header: 'Nome do Produto',
      width: 300,
      sortable: true,
      align: 'left',
      cell: ({ value }) => safe(value),
    },
    {
      accessorKey: 'peso',
      header: 'Peso (kg)',
      width: 110,
      sortable: true,
      align: 'right',
      cell: ({ value }) => Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      width: 90,
      sortable: true,
      align: 'center',
      cell: ({ value }) => safe(value),
    },
  ], []);

  // Handle reset externally if needed, but DataTable handles persistence.
  // If resetKey changes, we might want to clear storage.
  React.useEffect(() => {
    if (typeof resetKey !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      // Force re-render or let the parent handle reload if strict reset is needed.
      // For now, clearing storage ensures next mount is clean.
    }
  }, [resetKey]);

  return (
    <DataTable
      data={registros || []}
      columns={columns}
      loading={loading}
      error={error}
      storageKey={STORAGE_KEY}
      sortBy={sortColumn || undefined}
      sortDir={sortDirection}
      onSort={onSort}
      getRowKey={(row, idx) => String(row.id || `r_${idx}`)}
    />
  );
}
