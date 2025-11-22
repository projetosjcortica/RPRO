/**
 * Theme Configuration for Cortiça UI Library
 * 
 * Sistema de temas com suporte a modo claro e escuro
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
    // Core colors
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;

    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // UI colors
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;

    // Chart colors (8 colors for data visualization)
    chart: [string, string, string, string, string, string, string, string];
}

export interface Theme {
    mode: ThemeMode;
    colors: ThemeColors;
    borderRadius: string;
    fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
    };
}

/**
 * Tema Claro (Padrão Cortez)
 */
export const lightTheme: Theme = {
    mode: 'light',
    colors: {
        primary: '#dc2626',        // Red-600 (Cortez vermelho)
        primaryForeground: '#ffffff',
        secondary: '#64748b',      // Slate-500
        secondaryForeground: '#ffffff',
        accent: '#f1f5f9',         // Slate-100
        accentForeground: '#0f172a',

        success: '#22c55e',        // Green-500
        warning: '#f59e0b',        // Amber-500
        error: '#ef4444',          // Red-500
        info: '#3b82f6',           // Blue-500

        background: '#ffffff',
        foreground: '#0f172a',     // Slate-900
        muted: '#f1f5f9',          // Slate-100
        mutedForeground: '#64748b', // Slate-500
        border: '#e2e8f0',         // Slate-200

        chart: [
            '#dc2626', // Red
            '#f59e0b', // Amber
            '#22c55e', // Green
            '#3b82f6', // Blue
            '#8b5cf6', // Violet
            '#ec4899', // Pink
            '#14b8a6', // Teal
            '#f97316', // Orange
        ],
    },
    borderRadius: '0.5rem',
    fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
    },
};

/**
 * Tema Escuro
 */
export const darkTheme: Theme = {
    mode: 'dark',
    colors: {
        primary: '#ef4444',        // Red-500 (mais claro no dark)
        primaryForeground: '#ffffff',
        secondary: '#94a3b8',      // Slate-400
        secondaryForeground: '#0f172a',
        accent: '#1e293b',         // Slate-800
        accentForeground: '#f1f5f9',

        success: '#4ade80',        // Green-400
        warning: '#fbbf24',        // Amber-400
        error: '#f87171',          // Red-400
        info: '#60a5fa',           // Blue-400

        background: '#0f172a',     // Slate-900
        foreground: '#f1f5f9',     // Slate-100
        muted: '#1e293b',          // Slate-800
        mutedForeground: '#94a3b8', // Slate-400
        border: '#334155',         // Slate-700

        chart: [
            '#ef4444', // Red-500
            '#fbbf24', // Amber-400
            '#4ade80', // Green-400
            '#60a5fa', // Blue-400
            '#a78bfa', // Violet-400
            '#f472b6', // Pink-400
            '#2dd4bf', // Teal-400
            '#fb923c', // Orange-400
        ],
    },
    borderRadius: '0.5rem',
    fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
    },
};

/**
 * Helper para aplicar tema no documento
 */
export function applyTheme(theme: Theme) {
    const root = document.documentElement;

    // Aplicar cores CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((color, index) => {
                root.style.setProperty(`--${key}-${index + 1}`, color);
            });
        } else {
            root.style.setProperty(`--${key}`, value);
        }
    });

    // Aplicar outras propriedades
    root.style.setProperty('--border-radius', theme.borderRadius);

    // Aplicar classe de tema
    root.classList.remove('light', 'dark');
    root.classList.add(theme.mode);
}
