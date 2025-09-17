import { ReportApiResponse, ReportRow } from "../components/types";

export function extractReportData(responseData: ReportApiResponse): ReportRow[] {
  if (!responseData || typeof responseData !== 'object') {
    return [];
  }

  // Verifica todas as possíveis propriedades onde os dados podem estar
  if (Array.isArray(responseData.rows)) {
    return responseData.rows;
  }
  
  if (Array.isArray(responseData.data)) {
    return responseData.data;
  }
  
  if (Array.isArray(responseData)) {
    return responseData;
  }

  return [];
}

// No hook você pode usar:
// const rows = extractReportData(response.data);