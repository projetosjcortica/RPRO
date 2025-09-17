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
          console.log("Usando dados mock com filtros:", filtros);
          
          // Simula delay de rede
          await new Promise(resolve => setTimeout(resolve, 500));
          // Filtra os dados mock
          const filtered = mockRows.filter(row => {
            const matchesNome = filtros.nomeFormula
              ? row.Nome.toLowerCase().includes(filtros.nomeFormula.toLowerCase())
              : true;

            // Converter para Date para comparação correta
            let matchesDataInicio = true;
            let matchesDataFim = true;

            if (filtros.dataInicio) {
              const rowDate = new Date(row.Dia);
              const inicioDate = new Date(filtros.dataInicio);
              matchesDataInicio = rowDate >= inicioDate;
            }

            if (filtros.dataFim) {
              const rowDate = new Date(row.Dia);
              const fimDate = new Date(filtros.dataFim);
              matchesDataFim = rowDate <= fimDate;
            }
            return matchesNome && matchesDataInicio && matchesDataFim;
          });

          console.log(`Dados mock: ${filtered.length} linhas após filtro`);
          setDados(filtered);
        } else {
          try {
            const response = await api.get("/relatorio", {
              params: {
                ...(filtros.dataInicio && { data_inicio: filtros.dataInicio }),
                ...(filtros.dataFim && { data_fim: filtros.dataFim }),
                ...(filtros.nomeFormula && { nome_formula: filtros.nomeFormula }),
              },
            });

            // Type assertion com verificação
            const responseData = response.data as ReportApiResponse;
            
            // Validação dos dados
            if (!responseData || typeof responseData !== 'object') {
              throw new Error('Resposta da API inválida');
            }

            let rows: ReportRow[] = [];
            
            // Extrai dados com fallbacks
            if (Array.isArray(responseData.rows)) {
              rows = responseData.rows;
            } else if (Array.isArray(responseData.data)) {
              rows = responseData.data;
            } else if (Array.isArray(responseData)) {
              rows = responseData;
            } else {
              console.warn('Formato de resposta não esperado:', responseData);
            }

            setDados(rows);
            
          } catch (apiError) {
            console.error('Erro na API:', apiError);
            throw new Error('Falha ao buscar dados da API');
          }
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

    fetchData();
  }, [filtros]);

  return { dados, loading, error };
};