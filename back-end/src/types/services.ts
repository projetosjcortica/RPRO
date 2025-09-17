// Shared interfaces for core services

/** Minimal contract for the parser service */
export interface IParserService {
  /** Parse a CSV file and return a normalized result. */
  processFile(filePath: string): Promise<any>;
}

/** Minimal contract for the IHM/FTP service */
export interface IIHMService {
  getArc(localDir: string): Promise<any>;
}

/** Minimal contract for the backup service */
export interface IBackupService {
  backupFile(fileObj: { originalname: string; path: string; mimetype?: string; size?: number }): Promise<any>;
  listBackups(): any[];
  getLatestBackup(originalName: string): any | null;
}

/** Minimal contract for the DB service */
export interface IDbService {
  initDb(): Promise<void>;
  insertRelatorioRows(rows: any[], fileTag: string): Promise<any>;
  countRelatorioByFile(fileTag: string): Promise<number>;
  getLastRelatorioTimestamp(fileTag?: string): Promise<string | null>;
}

/** Minimal contract for file processor */
export interface IFileProcessorService {
  processFile(fullPath: string): Promise<any>;
}
