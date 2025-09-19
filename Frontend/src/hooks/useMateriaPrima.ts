// hooks/useMateriaPrima.ts
import { useState, useEffect } from "react";
import { api, apiWs } from "../Testes/api";
import { IS_LOCAL } from "../CFG";

export interface MateriaPrima {
  id: string;
  num: number;
  produto: string;
  medida: number;
  categoria?: string;
}

// Função para converter MateriaPrima para o formato de ColLabels
export function mapMateriaPrimaToColLabels(materias: MateriaPrima[]): { [key: string]: string } {
  const colLabels: { [key: string]: string } = {};
  
  materias.forEach(mp => {
    // Cada produto tem um número (num) que corresponde à posição na coluna
    // As colunas no frontend começam em col6, então precisamos ajustar o índice
    const colKey = `col${mp.num + 5}`;
    colLabels[colKey] = mp.produto;
  });
  
  return colLabels;
}

// Hook para buscar matérias-primas do backend
export function useMateriaPrima() {
  const [materias, setMaterias] = useState<MateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMateriaPrima = async () => {
      try {
        setLoading(true);
        
        if (IS_LOCAL) {
          // Tenta recuperar do localStorage primeiro
          const saved = localStorage.getItem("materiaPrima");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setMaterias(parsed);
              setLoading(false);
              return;
            }
          }
        }
        
        // Tenta usar WebSocket primeiro, depois HTTP se falhar
        try {
          const data = await apiWs.getMateriaPrima();
          if (Array.isArray(data)) {
            setMaterias(data);
            
            // Salva no localStorage para uso futuro
            if (IS_LOCAL) {
              localStorage.setItem("materiaPrima", JSON.stringify(data));
            }
            return;
          }
        } catch (wsError) {
          console.log("Falha ao obter dados via WebSocket, tentando HTTP:", wsError);
          // Fallback para HTTP se WebSocket falhar
        }
        
        // Fallback para HTTP
        const response = await api.get('/materiaprima');
        
        if (response.data && Array.isArray(response.data)) {
          setMaterias(response.data);
          
          // Salva no localStorage para uso futuro
          if (IS_LOCAL) {
            localStorage.setItem("materiaPrima", JSON.stringify(response.data));
          }
        }
      } catch (err) {
        console.error("Erro ao buscar matérias-primas:", err);
        setError("Falha ao carregar matérias-primas");
      } finally {
        setLoading(false);
      }
    };

    fetchMateriaPrima();
  }, []);

  // Função para sincronizar colLabels com MateriaPrima
  const syncLabelsWithMateriaPrima = () => {
    if (materias.length > 0) {
      const colLabels = mapMateriaPrimaToColLabels(materias);
      
      // Atualiza localStorage
      localStorage.setItem("colLabels", JSON.stringify(colLabels));
      
      return colLabels;
    }
    return null;
  };

  return {
    materias,
    loading,
    error,
    syncLabelsWithMateriaPrima
  };
}