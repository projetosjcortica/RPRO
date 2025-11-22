import { useState, useEffect, useCallback } from 'react';

const DEFAULT_MIN_WIDTH = 50;

export interface UseDataTableProps {
    storageKey?: string;
    defaultWidths?: Record<string, number>;
}

export function useDataTable({ storageKey, defaultWidths = {} }: UseDataTableProps) {
    // ================
    // COLUMN WIDTHS
    // ================
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
        if (!storageKey) return defaultWidths;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    return { ...defaultWidths, ...parsed };
                }
            }
        } catch (e) {
            console.warn('Error loading column widths:', e);
        }
        return defaultWidths;
    });

    // Persist widths
    useEffect(() => {
        if (!storageKey) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(columnWidths));
        } catch (e) {
            console.warn('Error saving column widths:', e);
        }
    }, [columnWidths, storageKey]);

    // ================
    // RESIZING LOGIC
    // ================
    const [resizing, setResizing] = useState<{
        columnKey: string;
        startX: number;
        startWidth: number;
    } | null>(null);

    const handleResizeStart = useCallback((e: React.MouseEvent, columnKey: string) => {
        e.preventDefault();
        e.stopPropagation();
        const currentWidth = columnWidths[columnKey] || defaultWidths[columnKey] || 100;
        setResizing({
            columnKey,
            startX: e.clientX,
            startWidth: currentWidth,
        });
    }, [columnWidths, defaultWidths]);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!resizing) return;
        const diff = e.clientX - resizing.startX;
        const newWidth = Math.max(DEFAULT_MIN_WIDTH, resizing.startWidth + diff);
        setColumnWidths((prev) => ({ ...prev, [resizing.columnKey]: newWidth }));
    }, [resizing]);

    const handleResizeEnd = useCallback(() => {
        setResizing(null);
    }, []);

    useEffect(() => {
        if (resizing) {
            window.addEventListener('mousemove', handleResizeMove);
            window.addEventListener('mouseup', handleResizeEnd);
            return () => {
                window.removeEventListener('mousemove', handleResizeMove);
                window.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [resizing, handleResizeMove, handleResizeEnd]);

    const resetWidths = useCallback(() => {
        setColumnWidths(defaultWidths);
        if (storageKey) localStorage.removeItem(storageKey);
    }, [defaultWidths, storageKey]);

    return {
        columnWidths,
        handleResizeStart,
        resetWidths,
        setColumnWidths,
    };
}
