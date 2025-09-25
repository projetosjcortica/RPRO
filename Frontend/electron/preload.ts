import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

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
type ChildEvent = { pid: number; data?: any } | { pid: number; code?: number | null; signal?: string | null };

type StartForkResult = { ok: true; pid: number } | { ok: false; reason: string };
 


contextBridge.exposeInMainWorld("electronAPI", {
  loadData: (key: string) => ipcRenderer.invoke("load-data", key),
  saveData: (key: string, data: Partial<FormData>) => ipcRenderer.invoke("save-data", key, data),
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  selectFile: () => ipcRenderer.invoke("select-file"),
  cleanDB: () => ipcRenderer.invoke("clean-db"),
  
  //printer
  printPDF: (filePath: string) => ipcRenderer.invoke("print-pdf", filePath),
  // Save a base64-encoded PDF buffer to a temp file and return its path
  savePdf: (base64: string) => ipcRenderer.invoke('save-pdf', base64),
  
  // forked functions
  startFork: (script: string, args?: string[]) => ipcRenderer.invoke('start-fork', { script, args }) as Promise<StartForkResult>,
  // send an object/message to a forked child by pid
  sendToChild: (pid: number, msg: any) => ipcRenderer.invoke('send-to-child', { pid, msg }) as Promise<{ ok: boolean; reason?: string }>,
  // stop/kill a forked child by pid
  stopChild: (pid: number) => ipcRenderer.invoke('stop-child', { pid }) as Promise<{ ok: boolean; reason?: string }>,
  // event listeners from main (forwarded from child)
  onChildMessage: (fn: (evt: IpcRendererEvent, data: ChildEvent) => void) => ipcRenderer.on('child-message', (e, data) => fn(e, data)),
  onChildStdout: (fn: (evt: IpcRendererEvent, data: { pid: number; data: string }) => void) => ipcRenderer.on('child-stdout', (e, data) => fn(e, data)),
  onChildStderr: (fn: (evt: IpcRendererEvent, data: { pid: number; data: string }) => void) => ipcRenderer.on('child-stderr', (e, data) => fn(e, data)),
  onChildExit: (fn: (evt: IpcRendererEvent, data: { pid: number; code?: number | null; signal?: string | null }) => void) => ipcRenderer.on('child-exit', (e, data) => fn(e, data)),
});