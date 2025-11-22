import React from 'react';
import { Loader2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useDataTable } from './useDataTable';

export interface Column<T> {
    accessorKey: string; // Unique key for the column (used for width storage)
    header: React.ReactNode | ((props: { column: Column<T> }) => React.ReactNode);
    cell?: (props: { row: T; value: any }) => React.ReactNode;
    width?: number; // Default width
    minWidth?: number;
    sortable?: boolean; // Defaults to false
    sortKey?: string; // If different from accessorKey (e.g. backend field name)
    align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    error?: string | null;
    storageKey?: string; // Key for persisting column widths

    // Sorting
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC' | 'asc' | 'desc';
    onSort?: (columnKey: string) => void;

    // Row Key
    getRowKey?: (row: T, index: number) => string;

    // Styling
    rowClassName?: (row: T, index: number) => string;
    onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id?: any }>({
    data,
    columns,
    loading,
    error,
    storageKey,
    sortBy,
    sortDir,
    onSort,
    getRowKey = (row, index) => row.id?.toString() || index.toString(),
    rowClassName,
    onRowClick,
}: DataTableProps<T>) {

    // Extract default widths from columns
    const defaultWidths = React.useMemo(() => {
        const widths: Record<string, number> = {};
        columns.forEach(col => {
            if (col.width) widths[col.accessorKey] = col.width;
        });
        return widths;
    }, [columns]);

    const { columnWidths, handleResizeStart } = useDataTable({
        storageKey,
        defaultWidths,
    });

    // Normalize sort direction for display
    const normalizedSortDir = sortDir?.toLowerCase() as 'asc' | 'desc' | undefined;

    // ================
    // RENDER HELPERS
    // ================

    const renderHeader = (col: Column<T>) => {
        const width = columnWidths[col.accessorKey] || col.width || 100;
        const isSorted = sortBy === (col.sortKey || col.accessorKey);

        return (
            <div
                key={col.accessorKey}
                className="relative flex items-center justify-center py-1 px-2 md:py-2 md:px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200 select-none"
                style={{
                    width: `${width}px`,
                    minWidth: `${width}px`,
                    overflow: 'hidden',
                }}
            >
                <div
                    className={`flex items-center gap-2 max-w-full ${col.sortable ? 'cursor-pointer hover:text-gray-900' : ''}`}
                    onClick={() => col.sortable && onSort?.(col.sortKey || col.accessorKey)}
                    title={typeof col.header === 'string' ? col.header : undefined}
                >
                    <span className="truncate">
                        {typeof col.header === 'function' ? col.header({ column: col }) : col.header}
                    </span>

                    {col.sortable && (
                        <span className="text-gray-500">
                            {isSorted ? (
                                normalizedSortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40" />
                            )}
                        </span>
                    )}
                </div>

                {/* Resize Handle */}
                <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-red-500 transition-colors z-10"
                    onMouseDown={(e) => handleResizeStart(e, col.accessorKey)}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        );
    };

    const renderRow = (row: T, index: number) => {
        const isEven = index % 2 === 0;
        const customClass = rowClassName ? rowClassName(row, index) : '';

        return (
            <div
                key={getRowKey(row, index)}
                className={`flex border-b border-gray-300 hover:bg-gray-50 ${isEven ? 'bg-white' : 'bg-gray-100'} ${customClass}`}
                onClick={() => onRowClick?.(row)}
            >
                {columns.map((col) => {
                    const width = columnWidths[col.accessorKey] || col.width || 100;
                    const value = (row as any)[col.accessorKey];

                    let alignClass = 'text-left';
                    if (col.align === 'center') alignClass = 'text-center';
                    if (col.align === 'right') alignClass = 'text-right';

                    return (
                        <div
                            key={`${getRowKey(row, index)}-${col.accessorKey}`}
                            className={`flex items-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300 overflow-hidden ${alignClass}`}
                            style={{ width: `${width}px`, minWidth: `${width}px` }}
                        >
                            <div className="w-full break-words" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                                {col.cell ? col.cell({ row, value }) : String(value ?? '')}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // ================
    // STATES
    // ================

    if (loading && (!data || data.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 h-[50vh] w-full text-center">
                <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto" />
                <p className="text-lg font-medium">Carregando dados...</p>
            </div>
        );
    }

    if (error && (!data || data.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-3 h-[50vh] w-full text-center">
                <div className="text-gray-700 font-semibold text-lg">Erro ao carregar dados</div>
                <div className="text-sm text-gray-600 max-w-md mx-auto">{error}</div>
            </div>
        );
    }

    if (!loading && (!data || data.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-[50vh] w-full text-center">
                <div className="text-gray-700 font-semibold text-lg">Nenhum dado encontrado</div>
                <div className="text-sm text-gray-600 mt-1 max-w-md mx-auto">
                    Tente ajustar os filtros para ver mais resultados.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Loading Overlay (when refreshing existing data) */}
            {loading && data.length > 0 && (
                <div className="absolute top-2 right-2 z-20 flex items-center gap-2 bg-white/90 p-2 rounded shadow">
                    <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                    <span className="text-xs text-gray-700">Atualizando...</span>
                </div>
            )}

            {/* Error Overlay */}
            {error && data.length > 0 && (
                <div className="absolute left-2 top-2 right-2 z-20 bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 rounded text-sm">
                    <strong>Erro ao atualizar:</strong>&nbsp;{error}
                </div>
            )}

            <div className="overflow-auto flex-1 thin-red-scrollbar h-[calc(100vh-200px)]">
                <div className="min-w-max w-full">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-gray-200 border-b border-gray-300">
                        <div className="flex">
                            {columns.map(renderHeader)}
                        </div>
                    </div>

                    {/* Body */}
                    <div>
                        {data.map(renderRow)}
                    </div>
                </div>
            </div>
        </div>
    );
}
