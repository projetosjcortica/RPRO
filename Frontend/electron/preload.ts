import { contextBridge, ipcRenderer } from "electron";

export type FormData = {
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
  passwordADM: string;
  mySqlDir: string;
  dumpDir: string;
  batchDumpDir: string;
};

contextBridge.exposeInMainWorld("electronAPI", {
  loadData: (key: string) => ipcRenderer.invoke("load-data", key),
  saveData: (key: string, data: FormData) => ipcRenderer.invoke("save-data", key, data),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  selectFile: () => ipcRenderer.invoke("select-file"),
  cleanDB: () => ipcRenderer.invoke("clean-db"),
});