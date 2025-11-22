import React, { useMemo, useCallback } from 'react';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../theme';

export interface ChartDatum {
    name: string;
    value: number;
    count?: number;
    unit?: string;
    average?: number;
    [key: string]: any;
}

export interface DonutChartProps {
    /** Array of data objects with name and value */
    data: ChartDatum[];
    /** Total value to display in center (calculated automatically if not provided) */
    total?: number;
    /** Chart title */
    title?: string;
    /** Unit label (e.g., 'kg') */
    unit?: string;
    /** Visual variant */
    variant?: 'default' | 'compact';
    /** Custom colors array */
    colors?: string[];
    /** Name of the slice to highlight */
    highlightName?: string | null;
    /** Callback when hovering a slice */
    onSliceHover?: (name: string) => void;
    /** Callback when leaving a slice */
    onSliceLeave?: () => void;
    /** Loading state */
    loading?: boolean;
    /** Message to show when data is empty */
    emptyMessage?: string;
    /** Additional CSS classes */
    className?: string;
}

const CompactTooltip = ({ active, payload, stats }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const value = data.value || 0;
    const unit = data.unit || 'kg';

    const total = stats?.total || payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

    return (
        <div className="bg-gray-900 text-white rounded px-2 py-1 text-xs shadow-lg z-50">
            <div className="font-semibold max-w-[120px] truncate" title={data.name}>
                {data.name}
            </div>
            <div className="text-[10px]">
                {value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} {unit} • {percentage}%
            </div>
        </div>
    );
};

const DefaultTooltip = ({ active, payload, stats, unit: customUnit }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const value = data.value || 0;
    const count = data.count || 0;
    const average = data.average || 0;
    const unit = customUnit || data.unit || 'kg';

    const total = stats?.total || payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[200px] pointer-events-none z-50">
            <div className="border-b border-gray-200 dark:border-slate-700 pb-2 mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold truncate" title={data.name}>
                    {data.name}
                </p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-bold text-primary dark:text-red-400">
                    {value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} {unit}
                </p>
                {count > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Registros: {count}</p>
                )}
                {average > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Média: {average.toFixed(2)} {unit}
                    </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}% do total</p>
            </div>
        </div>
    );
};

/**
 * DonutChart Component
 * 
 * Gráfico de rosca responsivo com suporte a temas e interatividade.
 */
export const DonutChart = React.memo(({
    data,
    total,
    title,
    unit = 'kg',
    variant = 'default',
    colors,
    highlightName,
    onSliceHover,
    onSliceLeave,
    loading = false,
    emptyMessage = 'Nenhum dado disponível',
    className = ''
}: DonutChartProps) => {
    const { theme } = useTheme();
    const chartColors = colors || theme.colors.chart;
    const isCompact = variant === 'compact';

    const displayTotal = useMemo(() => {
        if (typeof total === 'number') return total;
        return data.reduce((acc, item) => acc + (item.value || 0), 0);
    }, [data, total]);

    const handleMouseLeave = useCallback((e: any) => {
        const toElement = e.relatedTarget as HTMLElement;
        if (!toElement?.classList.contains('recharts-sector')) {
            onSliceLeave?.();
        }
    }, [onSliceLeave]);

    if (loading) {
        return (
            <div className={`h-full w-full flex items-center justify-center ${className}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <div className="text-sm text-muted-foreground">Carregando...</div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0 || data.every(item => !item.value)) {
        return (
            <div className={`h-full w-full flex items-center justify-center ${className}`}>
                <div className="text-center text-muted-foreground text-sm">
                    {emptyMessage}
                </div>
            </div>
        );
    }

    return (
        <div className={`h-full w-full relative flex flex-col ${className}`}>
            {title && (
                <div className="text-sm font-semibold text-foreground mb-2">
                    {title}
                </div>
            )}

            <div className="relative flex-1 min-h-0">
                {!isCompact && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                        <div className="text-center">
                            <div className="text-xs text-muted-foreground">Total</div>
                            <div className="text-lg font-bold text-primary">
                                {displayTotal.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                            </div>
                            <div className="text-xs text-muted-foreground">{unit}</div>
                        </div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={isCompact ? '50%' : '60%'}
                            outerRadius={isCompact ? '80%' : '90%'}
                            dataKey="value"
                            labelLine={false}
                            onMouseLeave={handleMouseLeave}
                            isAnimationActive={true}
                            animationDuration={500}
                        >
                            {data.map((entry, index) => {
                                const isHighlighted = !!highlightName && entry.name === highlightName;
                                const dimmed = !!highlightName && entry.name !== highlightName;

                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={chartColors[index % chartColors.length]}
                                        fillOpacity={dimmed ? 0.35 : 1}
                                        stroke={isHighlighted ? theme.colors.background : 'transparent'}
                                        strokeWidth={isHighlighted ? 2 : 0}
                                        className="transition-all duration-300"
                                        style={{ outline: 'none' }}
                                        onMouseEnter={() => onSliceHover?.(entry.name)}
                                    />
                                );
                            })}
                        </Pie>
                        <Tooltip
                            content={isCompact
                                ? <CompactTooltip stats={{ total: displayTotal }} />
                                : <DefaultTooltip stats={{ total: displayTotal }} unit={unit} />
                            }
                            cursor={{ fill: 'transparent' }}
                            wrapperStyle={{ zIndex: 100 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});
