import { useState, useEffect } from 'react';
import { getHttpApi } from '../services/httpApi';

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
        const httpClient = getHttpApi();
        const response = await httpClient.getMateriaPrima();
        
        if (Array.isArray(response)) {
          setMaterias(response);
          localStorage.setItem('materiasPrimas', JSON.stringify(response));
          sincronizarComProdutosInfo(response);
        } else {
          // Fallback to localStorage
          const savedMaterias = localStorage.getItem('materiasPrimas');
          if (savedMaterias) {
            try {
              const parsed = JSON.parse(savedMaterias);
              if (Array.isArray(parsed)) {
                setMaterias(parsed);
              } else {
                setMaterias([]);
              }
            } catch (err) {
              console.error('Erro ao parsear matérias-primas do localStorage:', err);
              setMaterias([]);
            }
          } else {
            // Se não houver no localStorage, tenta popular de produtosInfo
            const produtosInfoRaw = localStorage.getItem('produtosInfo');
            if (produtosInfoRaw) {
              try {
                const produtosInfo = JSON.parse(produtosInfoRaw);
                const result: MateriaPrima[] = [];
                
                Object.keys(produtosInfo).forEach(key => {
                  const colNum = parseInt(key.replace('col', ''), 10);
                  if (!isNaN(colNum) && colNum >= 6) {
                    const prodNum = colNum - 5;
                    const info = produtosInfo[key];
                    
                    if (info && info.nome) {
                      result.push({
                        id: `local-${Date.now()}-${prodNum}`,
                        num: prodNum,
                        produto: info.nome,
                        medida: info.unidade === 'g' ? 0 : 1
                      });
                    }
                  }
                });
                
                setMaterias(result);
                localStorage.setItem('materiasPrimas', JSON.stringify(result));
              } catch (err) {
                console.error('Erro ao gerar matérias-primas de produtosInfo:', err);
                setMaterias([]);
              }
            } else {
              setMaterias([]);
            }
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

  // Sincroniza matérias-primas do backend com produtosInfo no localStorage
  const sincronizarComProdutosInfo = (materiasData: MateriaPrima[]) => {
    try {
      const produtosInfoRaw = localStorage.getItem('produtosInfo');
      let produtosInfo: Record<string, any> = {};
      
      if (produtosInfoRaw) {
        try {
          produtosInfo = JSON.parse(produtosInfoRaw);
        } catch {
          produtosInfo = {};
        }
      }
      
      materiasData.forEach(materia => {
        const colKey = `col${materia.num + 5}`;
        
        // Atualiza ou cria entrada no produtosInfo
        produtosInfo[colKey] = {
          nome: materia.produto,
          unidade: materia.medida === 0 ? 'g' : 'kg'
        };
      });
      
      localStorage.setItem('produtosInfo', JSON.stringify(produtosInfo));
    } catch (err) {
      console.error('Erro ao sincronizar matérias-primas com produtosInfo:', err);
    }
  };

  return { materias, loading, error, setMaterias };
}