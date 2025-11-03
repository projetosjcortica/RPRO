import { format } from "date-fns";

/**
 * Retorna o intervalo padrão do relatório (último dia - apenas hoje).
 * Usar este helper garante consistência entre a barra de filtros e a tabela.
 */
export function getDefaultReportDateRange(daysBack: number = 0): {
  dataInicio: string;
  dataFim: string;
} {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);

  return {
    dataInicio: format(start, "yyyy-MM-dd"),
    dataFim: format(end, "yyyy-MM-dd"),
  };
}
