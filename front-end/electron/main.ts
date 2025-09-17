import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Store from 'electron-store';
import fs from 'fs';

// ES module compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simplified path handling
const isDev = process.env.NODE_ENV === 'development' || !!process.env.VITE_DEV_SERVER_URL;
const appRoot = join(__dirname, isDev ? '..' : '../..');

// Path configuration
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
export const RENDERER_DIST = join(appRoot, 'dist');
export const PUBLIC_PATH = VITE_DEV_SERVER_URL 
  ? join(appRoot, 'public') 
  : RENDERER_DIST;

let win: BrowserWindow | null;

// Interfaces
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

const initialFormData: FormData = {
  nomeCliente: "",
  ip: "",
  user: "",
  password: "",
  localCSV: "",
  metodoCSV: "",
  habilitarCSV: false,
  serverDB: "",
  database: "",
  userDB: "",
  passwordDB: "",
  mySqlDir: "",
  dumpDir: "",
  batchDumpDir: "",
};

// Initialize store
const store = new Store({
  defaults: { formData: initialFormData },
  name: 'app-config'
});

// IPC Handlers
ipcMain.handle('save-data', async (_, key: string, data: Partial<FormData>) => {
  try {
    if (key === 'all') {
      store.set('formData', data);
    } else {
      const existingData = store.get('formData', initialFormData) as FormData;
      store.set('formData', { ...existingData, ...data });
    }
    console.log('Dados salvos com sucesso para a chave:', key);
    return true;
  } catch (err) {
    console.error('Erro ao salvar dados:', err);
    return false;
  }
});

ipcMain.handle('load-data', async () => {
  try {
    return store.get('formData', initialFormData) as FormData;
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    return initialFormData;
  }
});

ipcMain.handle('select-folder', async () => {
  if (!win) return null;
  
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('select-file', async () => {
  if (!win) return null;
  
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('clean-db', async () => {
  console.log('Limpando banco de dados...');
  // Add actual database cleaning logic here
  return new Promise(resolve => setTimeout(() => {
    console.log('Banco de dados limpo com sucesso');
    resolve(true);
  }, 1000));
});

function createWindow() {
  win = new BrowserWindow({
    icon: join(PUBLIC_PATH, 'electron-vite.svg'),
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.maximize();

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open dev tools in development
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(RENDERER_DIST, 'index.html'));
  }

  return win;
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Error logging
const logFilePath = join(app.getPath('userData'), 'error.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

process.on('uncaughtException', (error: Error) => {
  logStream.write(`[${new Date().toISOString()}] Uncaught Exception: ${error.stack}\n`);
});

process.on('unhandledRejection', (reason: unknown) => {
  logStream.write(`[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n`);
});