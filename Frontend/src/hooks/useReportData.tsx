import { useState, useEffect } from "react";
import { Filtros, ReportRow, ReportApiResponse } from "../components/types";
import { mockRows } from "../Testes/mockData";
import { api } from "../Testes/api";
import { IS_LOCAL } from "../CFG";
import { config } from "../CFG";
import { getProcessador } from "../Processador";

export const useReportData = (filtros: Filtros, page: number = 1, pageSize: number = 300) => {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

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
          setTotal(filtered.length);
          const start = (page - 1) * pageSize;
          const pageSlice = filtered.slice(start, start + pageSize);
          setDados(pageSlice);
        } else if ((window as any).electronAPI) {
          // Aguarda PID do backend disponível
          let pid = config.contextoPid;
          let attempts = 0;
          while (!pid && attempts < 10) {
            await new Promise(r => setTimeout(r, 200));
            pid = (window as any).contextoPid || config.contextoPid;
            attempts++;
          }
          if (!pid) throw new Error('backend-pid-unavailable');
          config.contextoPid = pid;
          // Usar IPC Processador
          const p = getProcessador(pid);
          const res = await p.getTableData(page, pageSize, {
            formula: filtros.nomeFormula || null,
            dateStart: filtros.dataInicio || null,
            dateEnd: filtros.dataFim || null,
          });
          const mapped: ReportRow[] = (res.rows || []).map((r: any) => {
            const values: number[] = [];
            for (let i = 1; i <= 40; i++) {
              const v = r[`Prod_${i}`];
              values.push(typeof v === 'number' ? v : (v != null ? Number(v) : 0));
            }
            return {
              Dia: r.Dia || '',
              Hora: r.Hora || '',
              Nome: r.Nome || '',
              Codigo: r.Form1 ?? 0,
              Numero: r.Form2 ?? 0,
              values,
            } as ReportRow;
          });
          setDados(mapped);
          // se o backend retornar paginação, obter total
          try {
            const backendTotal = (res && (res.total || res.count || res.totalRows)) || 0;
            setTotal(backendTotal);
          } catch (e) {
            setTotal(mapped.length);
          }
        } else {
          // Fallback HTTP (caso rode fora do Electron)
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
            rows = responseData.data as unknown as ReportRow[];
          } else if (Array.isArray(responseData)) {
            rows = responseData as unknown as ReportRow[];
          } else {
            console.warn('Formato de resposta não esperado:', responseData);
          }

          setDados(rows);
          setTotal(rows.length);
        }

        setError(null);
      } catch (err: any) {
        const errorMessage = IS_LOCAL 
          ? "Erro ao carregar dados mock" 
          : "Erro ao carregar dados (IPC/API)";
        
        setError(errorMessage);
        console.error("Erro no useReportData:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filtros]);

  return { dados, loading, error, total };
};