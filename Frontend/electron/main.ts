import { app, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fork, ChildProcess } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;
// Map to track forked child processes by PID
const children: Map<number, ChildProcess> = new Map();

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


/***********/

ipcMain.handle('start-fork', async (_event: IpcMainInvokeEvent, { script, args = [] }: { script?: string; args?: string[] } = {}) => {
  if (!script) return { ok: false, reason: 'no-script' };

  // Better path resolution - handle relative paths from the app root
  let scriptPath: string;
  if (path.isAbsolute(script)) {
    scriptPath = script;
  } else {
    // Try multiple potential locations for the script
    // For '../back-end/dist/src/index.js', we need to go up from Frontend directory
    const possiblePaths = [
      path.join(__dirname, script), // From electron build dir
      path.join(process.env.APP_ROOT!, script), // From app root if defined
      path.join(path.dirname(__dirname), script), // From Frontend dir
      path.join(path.dirname(path.dirname(__dirname)), script), // From parent of Frontend (project root)
      path.resolve(script) // Resolve relative to current working directory
    ];
    
    console.log('Trying paths:', possiblePaths);
    
    scriptPath = possiblePaths.find(p => {
      try {
        const exists = fs.existsSync(p);
        console.log(`Path ${p} exists: ${exists}`);
        return exists;
      } catch {
        return false;
      }
    }) || possiblePaths[0];
  }

  console.log('Attempting to fork script at:', scriptPath);
  console.log('Script exists:', fs.existsSync(scriptPath));

  try {
    // Fork with stdio pipes so we can capture stdout/stderr and with IPC channel.
    // Set cwd to backend directory to use backend's package.json (CommonJS) instead of frontend's (ES module)
    // Find the back-end directory by looking for the closest parent containing package.json
    let backendDir = path.dirname(scriptPath);
    while (backendDir && backendDir !== path.dirname(backendDir)) {
      const packageJsonPath = path.join(backendDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          if (packageJson.name === 'backend') {
            break;
          }
        } catch {}
      }
      backendDir = path.dirname(backendDir);
    }
    
    console.log('Setting child process cwd to:', backendDir);
    
    const child = fork(scriptPath, args, { 
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'], 
      cwd: backendDir,
      silent: false
    });

    const pid = child.pid;
    console.log('Child process forked with PID:', pid);
    
    if (typeof pid === 'number') {
      children.set(pid, child);
      console.log('Child process added to children map. Total children:', children.size);
      
      // Give the child process a moment to fully initialize
      setTimeout(() => {
        console.log('Child process should be ready for messages now');
      }, 1000);
    } else {
      console.error('Child process PID is undefined');
      return { ok: false, reason: 'fork-failed-no-pid' };
    }

    // Handle child process errors
    child.on('error', (error) => {
      console.error('Child process error:', error);
      if (typeof child.pid === 'number') {
        children.delete(child.pid);
      }
    });

    child.on('exit', (code, signal) => {
      console.log(`Child process ${child.pid} exited with code ${code} and signal ${signal}`);
      if (typeof child.pid === 'number') children.delete(child.pid);
      if (win && !win.isDestroyed()) {
        win.webContents.send('child-exit', { pid: child.pid, code, signal });
      }
    });

    // forward messages from child to renderer
    child.on('message', (msg) => {
      console.log('Message from child:', msg);
      if (win && !win.isDestroyed()) {
        win.webContents.send('child-message', { pid: child.pid, msg });
      }
    });

    // forward stdout/stderr
    if (child.stdout) {
      child.stdout.on('data', (chunk) => {
        console.log('Child stdout:', chunk.toString());
        if (win && !win.isDestroyed()) {
          win.webContents.send('child-stdout', { pid: child.pid, data: chunk.toString() });
        }
      });
    }
    if (child.stderr) {
      child.stderr.on('data', (chunk) => {
        console.error('Child stderr:', chunk.toString());
        if (win && !win.isDestroyed()) {
          win.webContents.send('child-stderr', { pid: child.pid, data: chunk.toString() });
        }
      });
    }

    return { ok: true, pid: child.pid };
  } catch (error) {
    console.error('Failed to fork child process:', error);
    return { ok: false, reason: `fork-error: ${error}` };
  }
});

// Send an IPC message from main to a specific child process
ipcMain.handle('send-to-child', async (_event: IpcMainInvokeEvent, { pid, msg }: { pid?: number; msg?: any } = {}) => {
  console.log('send-to-child called with PID:', pid, 'Message type:', msg?.type);
  console.log('Available children PIDs:', Array.from(children.keys()));
  
  if (typeof pid !== 'number') return { ok: false, reason: 'invalid-pid' };
  
  const child = children.get(pid);
  if (!child) {
    console.log('Child not found for PID:', pid);
    return { ok: false, reason: 'not-found' };
  }
  
  try {
    console.log('Sending message to child:', msg);
    child.send(msg);
    return { ok: true };
  } catch (err) {
    console.error('Error sending message to child:', err);
    return { ok: false, reason: String(err) };
  }
});

// Stop (kill) a specific child process
ipcMain.handle('stop-child', async (_event: IpcMainInvokeEvent, { pid }: { pid?: number } = {}) => {
  if (typeof pid !== 'number') return { ok: false, reason: 'invalid-pid' };
  const child = children.get(pid);
  if (!child) return { ok: false, reason: 'not-found' };
  try {
    // try graceful, then forceful if needed
    child.kill('SIGTERM');
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: String(err) };
  }
});
/***********/

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