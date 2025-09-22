import { useState, useEffect } from "react";
import { Filtros, ReportRow } from "../components/types";
import { getHttpApi } from "../services/httpApi";
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
<<<<<<< HEAD
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

          // DEBUG: Verificar a estrutura dos dados mock
          console.log('Dados mock carregados:', pageSlice);
          if (pageSlice.length > 0) {
            console.log('Primeira linha:', pageSlice[0]);
            console.log('Values da primeira linha:', pageSlice[0].values);
          }

          setDados(pageSlice);
          setTotal(filtered.length);
        } else if ((window as any).electronAPI) {
=======
        if ((window as any).electronAPI) {
>>>>>>> 03f452872e7741c748550edb4fdcf2777ec67120
          // === Electron/Processador ===
          const processador = getProcessador(3001);
          const res = await processador.getTableData(page, pageSize, {
            formula: filtros.nomeFormula || null,
            dateStart: filtros.dataInicio || null,
            dateEnd: filtros.dataFim || null,
          });

          // DEBUG: Verificar a estrutura dos dados do processador
          console.log('Resposta do processador:', res);

          const mapped: ReportRow[] = (res.rows || []).map((r: any) => {
            const values: number[] = [];
            for (let i = 1; i <= 40; i++) {
              const v = r[`Prod_${i}`];
              values.push(typeof v === "number" ? v : v != null ? Number(v) : 0);
            }

            const rowData = {
              Dia: r.Dia || "",
              Hora: r.Hora || "",
              Nome: r.Nome || "",
              Codigo: r.Form1 ?? 0,
              Numero: r.Form2 ?? 0,
              values,
            };

            // DEBUG: Verificar cada linha mapeada
            console.log('Linha mapeada:', rowData);
            return rowData;
          });

          setDados(mapped);
          setTotal(res.total ?? mapped.length);
        } else {
          // === HTTP API ===
<<<<<<< HEAD
          const httpClient = getHttpApi();
          const result = await httpClient.getTableData(page, pageSize, {
            formula: filtros.nomeFormula || undefined,
            dateStart: filtros.dataInicio || undefined,
            dateEnd: filtros.dataFim || undefined,
=======
          const response = await api.get<ReportApiResponse>('192.168.5.128/api/relatorio/paginate?page=1&pageSize=300', {
            params: {
              ...(filtros.dataInicio && { data_inicio: filtros.dataInicio }),
              ...(filtros.dataFim && { data_fim: filtros.dataFim }),
              ...(filtros.nomeFormula && { nome_formula: filtros.nomeFormula }),
              page,
              pageSize,
            },
>>>>>>> f51fa3474347b6306f9f5d6b994b033d1eb00991
          });

          const mapped: ReportRow[] = (result.rows || []).map((r: any) => {
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

<<<<<<< HEAD
          // DEBUG: Verificar a estrutura da resposta da API
          console.log('Resposta da API:', responseData);

          const rows: ReportRow[] = Array.isArray(responseData.rows)
            ? responseData.rows
            : Array.isArray(responseData.data)
            ? responseData.data
            : [];

          // DEBUG: Verificar as rows processadas
          console.log('Rows processadas:', rows);
          if (rows.length > 0) {
            console.log('Primeira row:', rows[0]);
            console.log('Values da primeira row:', rows[0].values);
          }

          // Garantir que cada row tenha a estrutura correta
          const validatedRows = rows.map((row: any) => ({
            Dia: row.Dia || "",
            Hora: row.Hora || "",
            Nome: row.Nome || "",
            Codigo: row.Codigo ?? row.Form1 ?? 0,
            Numero: row.Numero ?? row.Form2 ?? 0,
            values: Array.isArray(row.values) ? row.values : 
                   Array.isArray(row.Values) ? row.Values : 
                   Array.isArray(row.valores) ? row.valores : 
                   [] // Fallback para array vazio se não encontrar values
          }));

          setDados(validatedRows);
          setTotal(responseData.total ?? validatedRows.length);
=======
          setDados(mapped);
          setTotal(result.total);
>>>>>>> 03f452872e7741c748550edb4fdcf2777ec67120
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

  // DEBUG: Log dos dados finais que serão retornados
  useEffect(() => {
    if (dados.length > 0) {
      console.log('Dados finais retornados pelo hook:', dados);
      console.log('Estrutura da primeira linha:', dados[0]);
      console.log('Values da primeira linha:', dados[0].values);
    }
  }, [dados]);

  return { dados, loading, error, total };
};
