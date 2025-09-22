import { useState, useEffect, useCallback } from 'react';
import { getHttpApi } from '../services/httpApi';
import { getProcessador } from '../Processador';

export interface MateriaPrima {
  id: number | string;
  num: number;
  produto: string;
  medida: number; // 0 = g, 1 = kg
}

interface UseMateriaPrimaReturn {
  materiasPrimas: MateriaPrima[];
  isLoading: boolean;
  error: string | null;
  reloadData: () => Promise<void>;
  addMateriaPrima: (m: Omit<MateriaPrima, 'id'>) => Promise<MateriaPrima | null>;
  updateMateriaPrima: (id: number | string, updates: Partial<MateriaPrima>) => Promise<MateriaPrima | null>;
  deleteMateriaPrima: (id: number | string) => Promise<boolean>;
}

export function useMateriaPrima(): UseMateriaPrimaReturn {
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isElectron = typeof (window as any).electronAPI !== 'undefined';

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isElectron) {
        const p = getProcessador();
        const res = await p.sendWithConnectionCheck('db.getMateriaPrima');
        if (Array.isArray(res)) {
          setMateriasPrimas(res as MateriaPrima[]);
          localStorage.setItem('materiaPrima', JSON.stringify(res));
          return;
        }
      }

      const http = getHttpApi();
      const data = await http.getMateriaPrima();
      if (Array.isArray(data)) {
        setMateriasPrimas(data as MateriaPrima[]);
        localStorage.setItem('materiaPrima', JSON.stringify(data));
      } else {
        const saved = localStorage.getItem('materiaPrima');
        if (saved) setMateriasPrimas(JSON.parse(saved));
      }
    } catch (err: any) {
      console.error('Erro ao carregar matérias-primas:', err);
      setError(String(err?.message || err));
      const saved = localStorage.getItem('materiaPrima');
      if (saved) setMateriasPrimas(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  }, [isElectron]);

  useEffect(() => { load(); }, [load]);

  const addMateriaPrima = useCallback(async (materia: Omit<MateriaPrima, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isElectron) {
        const p = getProcessador();
        const res = await p.dbSetupMateriaPrima([materia as any]);
        if (Array.isArray(res) && res.length > 0) {
          await load();
          return res[0] as MateriaPrima;
        }
      }
      const http = getHttpApi();
      const created = await http.setupMateriaPrima([materia as any]);
      if (Array.isArray(created) && created.length > 0) {
        await load();
        return created[0] as MateriaPrima;
      }

      const localId = `local-${Date.now()}`;
      const entry: MateriaPrima = { id: localId, ...materia };
      setMateriasPrimas(prev => { const next = [...prev, entry]; localStorage.setItem('materiaPrima', JSON.stringify(next)); return next; });
      return entry;
    } catch (err: any) {
      console.error('Erro ao adicionar matéria-prima:', err);
      setError(String(err?.message || err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isElectron, load]);

  const updateMateriaPrima = useCallback(async (id: number | string, updates: Partial<MateriaPrima>) => {
    setIsLoading(true);
    setError(null);
    try {
      if (isElectron) {
        const p = getProcessador();
        const res = await p.sendWithConnectionCheck('db.setupMateriaPrima', { items: [{ id, ...updates }] });
        await load();
        return Array.isArray(res) ? res[0] : null;
      }
      const http = getHttpApi();
      const res = await http.setupMateriaPrima([{ id, ...updates } as any]);
      await load();
      return Array.isArray(res) ? res[0] : null;
    } catch (err: any) {
      console.error('Erro ao atualizar matéria-prima:', err);
      setError(String(err?.message || err));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isElectron, load]);

  const deleteMateriaPrima = useCallback(async (id: number | string) => {
    setIsLoading(true);
    setError(null);
    try {
      const next = materiasPrimas.filter(m => m.id !== id);
      setMateriasPrimas(next);
      localStorage.setItem('materiaPrima', JSON.stringify(next));
      return true;
    } catch (err: any) {
      console.error('Erro ao deletar matéria-prima:', err);
      setError(String(err?.message || err));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [materiasPrimas]);

  return {
    materiasPrimas,
    isLoading,
    error,
    reloadData: load,
    addMateriaPrima,
    updateMateriaPrima,
    deleteMateriaPrima,
  };
}