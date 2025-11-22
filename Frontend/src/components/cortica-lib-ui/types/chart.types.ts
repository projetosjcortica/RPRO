export type ChartType = 'produtos' | 'formulas' | 'horarios' | 'weekly';

export interface ChartDatum {
    name: string;
    value: number;
    count?: number;
    unit?: string;
    average?: number;
}

export interface ChartStats {
    total?: number;
    totalRecords?: number;
    chartData?: ChartDatum[];
}

export interface BaseChartProps {
    config?: any;
    title?: string;
    unit?: string;
    loading?: boolean;
    error?: string | null;
}

export interface DonutChartProps extends BaseChartProps {
    chartType?: ChartType;
    highlightName?: string | null;
    onSliceHover?: (name: string) => void;
    onSliceLeave?: () => void;
    compact?: boolean;
    fetchUrl?: string;
}

export interface BarChartProps extends BaseChartProps {
    chartType?: ChartType;
    fetchUrl?: string;
}

export interface WeeklyChartProps {
    rows: any[] | null;
    weekStart?: Date;
}
