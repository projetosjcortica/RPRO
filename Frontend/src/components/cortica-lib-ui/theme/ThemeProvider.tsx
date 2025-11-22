import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, ThemeMode, lightTheme, darkTheme, applyTheme } from './theme.config';

interface ThemeContextType {
    theme: Theme;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    defaultMode?: ThemeMode;
    storageKey?: string;
}

/**
 * Theme Provider Component
 * 
 * Provedor de contexto para gerenciar temas claro/escuro
 * 
 * @example
 * ```tsx
 * <ThemeProvider defaultMode="light">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
    children,
    defaultMode = 'light',
    storageKey = 'cortica-theme-mode'
}: ThemeProviderProps) {
    const [mode, setModeState] = useState<ThemeMode>(() => {
        // Carregar do localStorage
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey);
            if (stored === 'light' || stored === 'dark' || stored === 'system') {
                return stored;
            }
        }
        return defaultMode;
    });

    const [theme, setTheme] = useState<Theme>(() => {
        return mode === 'dark' ? darkTheme : lightTheme;
    });

    useEffect(() => {
        let effectiveMode: 'light' | 'dark' = mode === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : mode;

        const newTheme = effectiveMode === 'dark' ? darkTheme : lightTheme;
        setTheme(newTheme);
        applyTheme(newTheme);

        // Salvar no localStorage
        localStorage.setItem(storageKey, mode);
    }, [mode, storageKey]);

    // Listener para mudanças no sistema
    useEffect(() => {
        if (mode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const newTheme = mediaQuery.matches ? darkTheme : lightTheme;
            setTheme(newTheme);
            applyTheme(newTheme);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [mode]);

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
    };

    const toggleTheme = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, mode, setMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook para acessar o tema atual
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
