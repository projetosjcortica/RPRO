import { useState, useEffect } from "react";
import { Filtros, ReportRow } from "../components/types";
import { mockRows } from "../Testes/mockData";
import { IS_LOCAL, config } from "../CFG";
import { getProcessador , FilterOptions} from "../Processador";

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
          let retryAttempts = 0;
          const maxRetries = 5;
          while (retryAttempts < maxRetries) {
            try {
              const res = await p.getTableData(1, 300, {
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
              break; // Exit retry loop on success
            } catch (retryErr) {
              retryAttempts++;
              if (retryAttempts >= maxRetries) {
                throw retryErr; // Rethrow error after max retries
              }
              await new Promise(r => setTimeout(r, 1000)); // Wait before retrying
            }
          }
        } else {
          // Substituir API HTTP por WebSocket
          const pid = config.contextoPid ?? undefined; // Garante que o valor seja `number | undefined`
          const p = getProcessador(pid);
          const res = await p.relatorioPaginate(
            1,
            300,
            {
              formula: filtros.nomeFormula || null,
              dateStart: filtros.dataInicio || null,
              dateEnd: filtros.dataFim || null,
            }
          );

          const rows: ReportRow[] = (res.rows || []).map((r: any) => {
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
          setDados(rows);
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

  return { dados, loading, error };
};