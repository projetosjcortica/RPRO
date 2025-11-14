import { useEffect, useState } from 'react';

export interface AdvancedFilters {
  includeFormulas: number[];
  excludeFormulas: number[];
  includeFormulaNames: string[];
  excludeFormulaNames: string[];
  includeProductCodes: number[];
  excludeProductCodes: number[];
  includeProductNames: string[];
  excludeProductNames: string[];
  includeClientes: number[];
  excludeClientes: number[];
  dateFrom?: string;
  dateTo?: string;
  matchMode: 'exact' | 'contains';
  maxResults?: number;
  isFixed: boolean;
}

const STORAGE_KEY = 'cortez:advancedFilters:products';

const initialFilters: AdvancedFilters = {
  includeFormulas: [],
  excludeFormulas: [],
  includeFormulaNames: [],
  excludeFormulaNames: [],
  includeProductCodes: [],
  excludeProductCodes: [],
  includeProductNames: [],
  excludeProductNames: [],
  includeClientes: [],
  excludeClientes: [],
  matchMode: 'contains',
  isFixed: false,
};

export default function useAdvancedFilters() {
  const [filters, setFilters] = useState<AdvancedFilters>(initialFilters);

  useEffect(() => {
    loadFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadFilters() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') setFilters((f) => ({ ...f, ...parsed }));
    } catch (e) {
      console.warn('[useAdvancedFilters] failed to load', e);
    }
  }

  function saveFilters(next: AdvancedFilters) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('[useAdvancedFilters] failed to save', e);
    }
  }

  function setFilter<K extends keyof AdvancedFilters>(field: K, value: AdvancedFilters[K]) {
    setFilters((prev) => {
      const next = { ...prev, [field]: value } as AdvancedFilters;
      saveFilters(next);
      return next;
    });
  }

  function clearFilters() {
    const next = { ...initialFilters } as AdvancedFilters;
    saveFilters(next);
    setFilters(next);
  }

  function toggleFixed() {
    setFilters((prev) => {
      const next = { ...prev, isFixed: !prev.isFixed };
      saveFilters(next);
      return next;
    });
  }

  function getActiveFiltersCount() {
    let c = 0;
    (['includeFormulas','excludeFormulas','includeFormulaNames','excludeFormulaNames','includeProductCodes','excludeProductCodes','includeProductNames','excludeProductNames','includeClientes','excludeClientes'] as (keyof AdvancedFilters)[]).forEach(k => {
      const v = filters[k] as any;
      if (Array.isArray(v) && v.length) c += v.length;
    });
    if (filters.dateFrom) c++;
    if (filters.dateTo) c++;
    return c;
  }

  function getFilterSummary() {
    const parts: string[] = [];
    const count = getActiveFiltersCount();
    parts.push(`${count} filtros ativos`);
    if (filters.excludeFormulas.length) parts.push(`Excluir fórmulas: ${filters.excludeFormulas.length}`);
    if (filters.excludeProductCodes.length) parts.push(`Excluir produtos: ${filters.excludeProductCodes.length}`);
    return parts.join(' — ');
  }

  return {
    filters,
    setFilter,
    setFiltersState: (next: AdvancedFilters) => {
      saveFilters(next);
      setFilters(next);
    },
    clearFilters,
    toggleFixed,
    loadFilters,
    saveFilters,
    getActiveFiltersCount,
    getFilterSummary,
  };
}
