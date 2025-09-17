import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;

// Define the complete form data structure to match the frontend
interface FormData {
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

// Initial data structure to match the frontend
const initialFormData: FormData = {
  nomeCliente: "",
  ip: "",
  user: "",
  password: "",
  localCSV: "",
  metodoCSV: "", // '1' ou '2'
  habilitarCSV: false,
  serverDB: "",
  database: "",
  userDB: "",
  passwordDB: "",
  mySqlDir: "",
  dumpDir: "",
  batchDumpDir: "",
};

// Initialize electron-store
const store = new Store({
  defaults: {
    formData: initialFormData
  },
  name: 'app-config'
});

// IPC Handlers using electron-store
ipcMain.handle('save-data', async (_, key: string, data: Partial<FormData>): Promise<boolean> => {
  try {
    if (key === 'all') {
      // Save all form data
      store.set('formData', data);
    } else {
      // Update specific section while preserving other data
      const existingData = store.get('formData', initialFormData) as FormData;
      const updatedData = { ...existingData, ...data };
      store.set('formData', updatedData);
    }
    
    console.log('Dados salvos com sucesso para a chave:', key);
    return true;
  } catch (err) {
    console.error('Erro ao salvar dados:', err);
    return false;
  }
});

ipcMain.handle('load-data', async (): Promise<FormData> => {
  try {
    const data = store.get('formData', initialFormData) as FormData;
    return data;
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    return initialFormData;
  }
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(win!, {
    properties: ['openDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    console.log('Nenhuma pasta selecionada');
    return null;
  }

  const folderPath = result.filePaths[0];
  console.log('Pasta selecionada:', folderPath);
  return folderPath;
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(win!, {
    properties: ['openFile'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    console.log('Nenhum arquivo selecionado');
    return null;
  }

  const filePath = result.filePaths[0];
  console.log('Arquivo selecionado:', filePath);
  return filePath;
});

ipcMain.handle('clean-db', async (): Promise<boolean> => {
  // Implement your database cleaning logic here
  console.log('Limpando banco de dados...');
  
  // Simulate success for demonstration
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Banco de dados limpo com sucesso');
      resolve(true);
    }, 1000);
  });
});

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.maximize();

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Encerrar backend e app corretamente
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Logging
const logFilePath = path.join(app.getPath('userData'), 'error.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

process.on('uncaughtException', (error: Error) => {
  logStream.write(`[${new Date().toISOString()}] Uncaught Exception: ${error.stack}\n`);
});

process.on('unhandledRejection', (reason: unknown) => {
  logStream.write(`[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n`);
});