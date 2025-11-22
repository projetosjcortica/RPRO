// Dashboard color palette
export const DASHBOARD_COLORS = [
    '#ff2626ff', // Primary red
    '#3b82f6',   // Blue
    '#10b981',   // Green
    '#f59e0b',   // Amber
    '#8b5cf6',   // Purple
    '#ec4899',   // Pink
    '#14b8a6',   // Teal
    '#f97316',   // Orange
    '#6366f1',   // Indigo
    '#84cc16',   // Lime
] as const;

// Chart colors (alias for compatibility)
export const CHART_COLORS = DASHBOARD_COLORS;

// Status colors
export const STATUS_COLORS = {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
} as const;

// Brand colors
export const BRAND_COLORS = {
    primary: '#ff2626ff',
    primaryHover: '#ef4444',
    secondary: '#6b7280',
    secondaryHover: '#4b5563',
} as const;

export type DashboardColor = typeof DASHBOARD_COLORS[number];
export type StatusColor = keyof typeof STATUS_COLORS;
export type BrandColor = keyof typeof BRAND_COLORS;
