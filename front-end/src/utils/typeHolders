// utils/typeGuards.ts
import { ReportApiResponse, ReportRow } from "../components/types";

export function isReportApiResponse(data: any): data is ReportApiResponse {
  return data && typeof data === 'object' && 
         (Array.isArray(data.rows) || Array.isArray(data.data));
}

export function isReportRowArray(data: any): data is ReportRow[] {
  return Array.isArray(data) && 
         (data.length === 0 || 
          (typeof data[0] === 'object' && 'Dia' in data[0] && 'Nome' in data[0]));
}

// Uso no hook:
// if (isReportApiResponse(responseData)) {
//   const rows = responseData.rows || responseData.data || [];
// }