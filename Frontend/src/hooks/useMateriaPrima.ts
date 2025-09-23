import { useState, useEffect } from 'react';
// import { getHttpApi } from '../services/httpApi';
import { getProcessador } from '../Processador';

// Interface para matéria-prima
export interface MateriaPrima {
  id: string;
  num: number;
  produto: string;
  medida: number; // 0 = gramas, 1 = kg
}

/**
 * Hook para gerenciar matérias-primas
 * Busca do backend ou localStorage dependendo do ambiente
 */
export function useMateriaPrima() {
  const [materias, setMaterias] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMateriasPrimas = async () => {
      setLoading(true);
      setError(null);
      
      try {
        
        const p = getProcessador();
        const response = await p.getMateriaPrima();

        if (Array.isArray(response)) {
          // setMaterias(response);
          // localStorage.setItem('materiasPrimas', JSON.stringify(response));
          // sincronizarComProdutosInfo(response);
        } else {
          // Fallback to localStorage
          const savedMaterias = localStorage.getItem('materiasPrimas');
          if (savedMaterias) {
            try {
              const parsed = JSON.parse(savedMaterias);
              if (Array.isArray(parsed)) {
                // setMaterias(parsed);
              } else {
                setMaterias([]);
              }
            } catch (err) {
              console.error('Erro ao parsear matérias-primas do localStorage:', err);
              setMaterias([]);
            }
          } else {
            // Se não houver no localStorage, tenta popular de produtosInfo
          }
        }
      } catch (err) {
        console.error('Erro ao buscar matérias-primas:', err);
        setError('Falha ao carregar matérias-primas. Tente novamente.');
        
        // Tenta usar dados do localStorage como fallback
        const savedMaterias = localStorage.getItem('materiasPrimas');
        if (savedMaterias) {
          try {
            const parsed = JSON.parse(savedMaterias);
            if (Array.isArray(parsed)) {
              setMaterias(parsed);
            }
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMateriasPrimas();
  }, []);

  return { materias, loading, error, setMaterias };
}