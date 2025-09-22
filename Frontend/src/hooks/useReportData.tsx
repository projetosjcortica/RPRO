import { useState, useEffect } from "react";
import { Filtros, ReportRow, ReportApiResponse } from "../components/types";
import { mockRows } from "../Testes/mockData";
import { api } from "../Testes/api";
import { IS_LOCAL } from "../CFG";
import { getProcessador } from "../Processador";

export const useReportData = (
  filtros: Filtros,
  page: number = 1,
  pageSize: number = 300
) => {
  const [dados, setDados] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (IS_LOCAL) {
          // === Dados mock ===
          await new Promise((resolve) => setTimeout(resolve, 500));

          const filtered = mockRows.filter((row) => {
            const matchesNome = filtros.nomeFormula
              ? row.Nome.toLowerCase().includes(filtros.nomeFormula.toLowerCase())
              : true;

            const matchesDataInicio = filtros.dataInicio
              ? new Date(row.Dia) >= new Date(filtros.dataInicio)
              : true;

            const matchesDataFim = filtros.dataFim
              ? new Date(row.Dia) <= new Date(filtros.dataFim)
              : true;

            return matchesNome && matchesDataInicio && matchesDataFim;
          });

          const start = (page - 1) * pageSize;
          const pageSlice = filtered.slice(start, start + pageSize);

          setDados(pageSlice);
          setTotal(filtered.length);
        } else if ((window as any).electronAPI) {
          // === Electron/Processador ===
          const processador = getProcessador(3001);
          const res = await processador.getTableData(page, pageSize, {
            formula: filtros.nomeFormula || null,
            dateStart: filtros.dataInicio || null,
            dateEnd: filtros.dataFim || null,
          });

          const mapped: ReportRow[] = (res.rows || []).map((r: any) => {
            const values: number[] = [];
            for (let i = 1; i <= 40; i++) {
              const v = r[`Prod_${i}`];
              values.push(typeof v === "number" ? v : v != null ? Number(v) : 0);
            }

            return {
              Dia: r.Dia || "",
              Hora: r.Hora || "",
              Nome: r.Nome || "",
              Codigo: r.Form1 ?? 0,
              Numero: r.Form2 ?? 0,
              values,
            };
          });

          setDados(mapped);
          setTotal(res.total ?? mapped.length);
        } else {
          // === HTTP API ===
          const response = await api.get<ReportApiResponse>('/api/relatorio/paginate?page=1&pageSize=300', {
            params: {
              ...(filtros.dataInicio && { data_inicio: filtros.dataInicio }),
              ...(filtros.dataFim && { data_fim: filtros.dataFim }),
              ...(filtros.nomeFormula && { nome_formula: filtros.nomeFormula }),
              page,
              pageSize,
            },
          });

          const responseData = response.data;

          if (!responseData || typeof responseData !== "object") {
            throw new Error("Resposta da API inválida");
          }

          const rows: ReportRow[] = Array.isArray(responseData.rows)
            ? responseData.rows
            : Array.isArray(responseData.data)
            ? responseData.data
            : [];

          setDados(rows);
          setTotal(responseData.total ?? rows.length);
        }
      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        setError("Erro ao carregar dados da API");
        setDados([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filtros, page, pageSize]);

  return { dados, loading, error, total };
};
