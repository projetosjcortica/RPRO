
import { Row } from '../entities/Row'


export interface ConfigData {
  nomeCliente: string;
  ip: string;
  user: string;
  password: string;
  localCSV: string;
  metodoCSV: string;
  habilitarCSV: boolean;
  serverDB: string;
  database: string;
  userDB: string;
  passwordDB: string;
  mySqlDir: string;
  dumpDir: string;
  batchDumpDir: string;
}

export interface Batidas {
  // Representa um registro/linha do relatório
  // Mantemos campos mínimos esperados pelo frontend
  Dia?: string | null;
  Hora?: string | null;
  Nome?: string | null;
  Form1?: number | null;
  Form2?: number | null;
  values?: Array<number | null>;
}

export interface ChartData {
  total: number;
  series: Array<{
    name: string;
    data: Array<{ x: string | number; y: number }>;
  }>;
}

export interface TableData {
  total: number;
  pages: number;
  currentPage: number;
  pageSize: number;
  batidas: Batidas[];
  rowsCount?: number;
}



export type ProcessPayload = { filename: string; lastProcessedAt: string; rowCount: number };


export interface Observer {
  update(payload: ProcessPayload): Promise<void>;
}

export interface CandidateObserver {
  updateCandidates(candidates: Array<{ name: string; size: number }>): Promise<Array<{ name: string; size: number }>>;
}