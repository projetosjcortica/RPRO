import { useMemo, useState, useEffect } from 'react';

// OTIMIZAÇÃO: Cache de chaves de linha para evitar recálculos
const rowKeyCache = new WeakMap<any, string>();

export const useOptimizedRowKey = () => {
  return useMemo(() => {
    return (row: any, idx: number): string => {
      // Tentar recuperar do cache
      if (rowKeyCache.has(row)) {
        return rowKeyCache.get(row)!;
      }

      // Gerar chave otimizada (sem JSON.stringify)
      const d = row.Dia || row.date || '';
      const h = row.Hora || row.time || '';
      const num = row.Numero || row.numero || '';
      const codigo = row.Codigo || row.codigo || '';
      
      // Chave simples e rápida
      const key = `${d}|${h}|${num}|${codigo}|${idx}`;
      
      // Armazenar no cache
      rowKeyCache.set(row, key);
      
      return key;
    };
  }, []);
};

// OTIMIZAÇÃO: Comparação rápida de arrays sem JSON.stringify
export const hasDataChanged = (oldData: any[], newData: any[], oldTotal: number, newTotal: number): boolean => {
  // Verificação rápida de tamanho
  if (oldTotal !== newTotal) return true;
  if (oldData.length !== newData.length) return true;
  if (oldData.length === 0) return false;
  
  // Comparar apenas primeira e última linha (suficiente para detectar mudanças)
  const firstChanged = 
    oldData[0]?.Dia !== newData[0]?.Dia ||
    oldData[0]?.Hora !== newData[0]?.Hora;
  
  const lastIdx = oldData.length - 1;
  const lastChanged = 
    oldData[lastIdx]?.Dia !== newData[lastIdx]?.Dia ||
    oldData[lastIdx]?.Hora !== newData[lastIdx]?.Hora;
  
  return firstChanged || lastChanged;
};

// OTIMIZAÇÃO: Debounce para filtros
export const useDebouncedFilters = <T,>(filters: T, delay: number = 500): T => {
  const [debouncedFilters, setDebouncedFilters] = useState<T>(filters);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [filters, delay]);
  
  return debouncedFilters;
};
