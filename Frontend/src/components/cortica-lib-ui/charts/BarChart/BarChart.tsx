import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../theme';
import { ChartDatum } from '../DonutChart'; // Reuse type

export interface BarChartProps {
    data: ChartDatum[];
    title?: string;
    unit?: string;
    layout?: 'horizontal' | 'vertical';
    colors?: string[];
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
    showGrid?: boolean;
    barSize?: number;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const value = data.value || 0;

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[150px] z-50">
            <div className="border-b border-gray-200 dark:border-slate-700 pb-2 mb-2">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{label}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-bold text-primary dark:text-red-400">
                    {value.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} {unit}
                </p>
                {data.count && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">Registros: {data.count}</p>
                )}
            </div>
        </div>
    );
};

export const BarChart = React.memo(({
    data,
    title,
    unit = 'kg',
    layout = 'horizontal',
    colors,
    loading = false,
    emptyMessage = 'Nenhum dado disponível',
    className = '',
    showGrid = true,
    barSize
}: BarChartProps) => {
    const { theme } = useTheme();
    const primaryColor = colors?.[0] || theme.colors.primary;

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
        <div className={`h-full w-full flex flex-col ${className}`}>
            {title && (
                <div className="text-sm font-semibold text-foreground mb-2">
                    {title}
                </div>
            )}

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                        data={data}
                        layout={layout}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={theme.mode === 'dark' ? '#334155' : '#e2e8f0'}
                                horizontal={layout === 'horizontal'}
                                vertical={layout === 'vertical'}
                            />
                        )}

                        {layout === 'horizontal' ? (
                            <>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: theme.colors.mutedForeground, fontSize: 12 }}
                                    axisLine={{ stroke: theme.colors.border }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: theme.colors.mutedForeground, fontSize: 12 }}
                                    axisLine={{ stroke: theme.colors.border }}
                                    tickLine={false}
                                    tickFormatter={(val) => val.toLocaleString('pt-BR', { notation: 'compact' })}
                                />
                            </>
                        ) : (
                            <>
                                <XAxis
                                    type="number"
                                    tick={{ fill: theme.colors.mutedForeground, fontSize: 12 }}
                                    axisLine={{ stroke: theme.colors.border }}
                                    tickLine={false}
                                    tickFormatter={(val) => val.toLocaleString('pt-BR', { notation: 'compact' })}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={100}
                                    tick={{ fill: theme.colors.mutedForeground, fontSize: 12 }}
                                    axisLine={{ stroke: theme.colors.border }}
                                    tickLine={false}
                                />
                            </>
                        )}

                        <Tooltip
                            content={<CustomTooltip unit={unit} />}
                            cursor={{ fill: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                        />

                        <Bar
                            dataKey="value"
                            fill={primaryColor}
                            radius={layout === 'horizontal' ? [4, 4, 0, 0] : [0, 4, 4, 0]}
                            barSize={barSize}
                            animationDuration={500}
                        />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});
