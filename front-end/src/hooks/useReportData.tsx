import { useState, useEffect } from "react";
import { Filtros, ReportRow, ReportApiResponse } from "../components/types";
import { mockRows } from "../Testes/mockData";
import { api } from "../Testes/api";
import { IS_LOCAL } from "../CFG";

export const useReportData = (filtros: Filtros) => {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (IS_LOCAL) {
          // Filtra mockRows com base nos filtros
          const filtered = mockRows.filter(row => {
            const matchesNome = filtros.nomeFormula
              ? row.Nome.toLowerCase().includes(filtros.nomeFormula.toLowerCase())
              : true;

            const matchesDataInicio = filtros.dataInicio
              ? row.Dia >= filtros.dataInicio
              : true;

            const matchesDataFim = filtros.dataFim
              ? row.Dia <= filtros.dataFim
              : true;

            return matchesNome && matchesDataInicio && matchesDataFim;
          });

          console.log("Dados mock filtrados:", filtered);
          setDados(filtered);
        } else {
          // Chamada real para a API - COM TIPAGEM CORRETA
          const response = await api.get<ReportApiResponse>("/relatorio/", {
            params: {
              ...(filtros.dataInicio && { data_inicio: filtros.dataInicio }),
              ...(filtros.dataFim && { data_fim: filtros.dataFim }),
              ...(filtros.nomeFormula && filtros.nomeFormula !== 'todos' && { 
                nome_formula: filtros.nomeFormula 
              }),
            },
          });
          
          console.log("Resposta completa da API:", response.data);
          
          // TIPAGEM SEGURA - Agora response.data é do tipo ReportApiResponse
          const responseData = response.data;
          
          // Extrai os dados de forma segura com fallbacks
          let rows: ReportRow[] = [];
          
          if (responseData && typeof responseData === 'object') {
            // Verifica todas as possíveis propriedades onde os dados podem estar
            if (Array.isArray(responseData.rows)) {
              rows = responseData.rows;
            } else if (Array.isArray(responseData.data)) {
              rows = responseData.data;
            } else if (Array.isArray(responseData)) {
              rows = responseData;
            }
          }
          
          console.log("Dados processados:", rows);
          setDados(rows);
        }

        setError(null);
      } catch (err: any) {
        const errorMessage = IS_LOCAL 
          ? "Erro ao carregar dados mock" 
          : "Erro ao carregar dados da API";
        
        setError(errorMessage);
        console.error("Erro no useReportData:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [filtros]);

  return { dados, loading, error };
};