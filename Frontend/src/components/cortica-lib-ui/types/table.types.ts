export interface TableColumn<T = any> {
    id: string;
    header: string;
    accessor: keyof T | ((row: T) => any);
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    sortable?: boolean;
    resizable?: boolean;
}

export interface TableProps<T = any> {
    columns: TableColumn<T>[];
    data: T[];
    loading?: boolean;
    error?: string | null;
    onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
    onResize?: (columnId: string, width: number) => void;
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
        onPageChange: (page: number) => void;
    };
}

export interface ReportRow {
    Nome: string;
    Dia?: string;
    Hora?: string;
    values: (string | number)[];
    [key: string]: any;
}
