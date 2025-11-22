export interface FilterOptions {
    nomeFormula?: string;
    dataInicio?: string;
    dataFim?: string;
    codigo?: string | number;
    numero?: string | number;
    advancedFilters?: any;
}

export interface DateRangeFilter {
    from?: Date;
    to?: Date;
}

export interface AdvancedFilter {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
    value: any;
}
