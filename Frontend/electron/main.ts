import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  IpcMainInvokeEvent,
} from "electron";
import * as path from "path";
import Store from "electron-store";
import fs from "fs";
import { fileURLToPath } from "url";
import { fork, ChildProcess } from "child_process";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let splashScreen: BrowserWindow | null = null;
let lastScriptPath: string | null = null;
// Map to track forked child processes by PID
const children: Map<number, ChildProcess> = new Map();
// Track spawned backend exe when packaged
let spawnedBackend: ChildProcessWithoutNullStreams | null = null;

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
    formData: initialFormData,
  },
  name: "app-config",
});

// IPC Handlers using electron-store
ipcMain.handle(
  "save-data",
  async (_, key: string, data: Partial<FormData>): Promise<boolean> => {
    try {
      if (key === "all") {
        // Save all form data
        store.set("formData", data);
      } else {
        // Update specific section while preserving other data
        const existingData = store.get("formData", initialFormData) as FormData;
        const updatedData = { ...existingData, ...data };
        store.set("formData", updatedData);
      }

      console.log("Dados salvos com sucesso para a chave:", key);
      return true;
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      return false;
    }
  }
);

ipcMain.handle("load-data", async (): Promise<FormData> => {
  try {
    const data = store.get("formData", initialFormData) as FormData;
    return data;
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    return initialFormData;
  }
});

ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog(win!, {
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    console.log("Nenhuma pasta selecionada");
    return null;
  }

  const folderPath = result.filePaths[0];
  console.log("Pasta selecionada:", folderPath);
  return folderPath;
});

ipcMain.handle("select-file", async () => {
  const result = await dialog.showOpenDialog(win!, {
    properties: ["openFile"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    console.log("Nenhum arquivo selecionado");
    return null;
  }

  const filePath = result.filePaths[0];
  console.log("Arquivo selecionado:", filePath);
  return filePath;
});

ipcMain.handle("clean-db", async (): Promise<boolean> => {
  // Implement your database cleaning logic here
  console.log("Limpando banco de dados...");

  // Simulate success for demonstration
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Banco de dados limpo com sucesso");
      resolve(true);
    }, 1000);
  });
});

ipcMain.handle(
  "print-pdf",
  async (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      const printWin = new BrowserWindow({
        width: 800,
        height: 600,
        show: true,
        webPreferences: {
          preload: path.join(__dirname, "preload.mjs"),
          nodeIntegration: true,
          contextIsolation: false,
        },
      });

      await printWin.loadFile(filePath);
      printWin.setMenu(null)

      printWin.webContents.on("did-finish-load", () => {
        printWin.webContents.print({
          silent: false, // false para mostrar diálogo de impressão
          printBackground: true,
        });
      });

      return { ok: true };
    } catch (err) {
      console.error("Erro ao imprimir PDF:", err);
      return { ok: false, error: err };
    }
  }
);

// Helper function to resolve backend script path
function getBackendScriptPath(): string { 
    return path.join("backend", "index.js") 
}

ipcMain.handle(
  "start-fork",
  async (
    _event: IpcMainInvokeEvent,
    { script, args = [] }: { script?: string; args?: string[] } = {}
  ) => {
    let scriptPath: string;

    if (script) {
      // Se um script for fornecido, use-o
      scriptPath = script;
    } else {
      scriptPath = getBackendScriptPath();
    }

    if (!fs.existsSync(scriptPath)) {
      console.error("Backend script não encontrado:", scriptPath);
      return { ok: false, reason: "backend-script-not-found" };
    }

    try {
      // save last script path so auto-refork and monitor can restart same script
      lastScriptPath = scriptPath;

      const child = fork(scriptPath, args, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: path.dirname(scriptPath),
        silent: true,
        env: { ...process.env },
      });

      const pid = child.pid;
      console.log("Child process forked with PID:", pid);

      if (typeof pid === "number") {
        children.set(pid, child);
        console.log(
          "Child process added to children map. Total children:",
          children.size
        );
      } else {
        console.error("Child process PID is undefined");
        return { ok: false, reason: "fork-failed-no-pid" };
      }

      // Return a promise that resolves with the WebSocket port
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Timeout waiting for WebSocket port from backend"));
        }, 10000); // 10 second timeout

        // Listen for the websocket-port message from the backend
        const messageHandler = (msg: any) => {
          if (
            msg &&
            msg.type === "websocket-port" &&
            typeof msg.port === "number"
          ) {
            clearTimeout(timeoutId);
            child.off("message", messageHandler);
            resolve({ ok: true, port: msg.port, pid });
          }
        };

        child.on("message", messageHandler);

        // Handle child process errors
        child.on("error", (error) => {
          console.error("Child process error:", error);
          if (typeof child.pid === "number") {
            children.delete(child.pid);
          }
          clearTimeout(timeoutId);
          reject(error);
        });

        child.on("exit", (code, signal) => {
          console.log(
            `Child process ${child.pid} exited with code ${code} and signal ${signal}`
          );
          if (typeof child.pid === "number") children.delete(child.pid);
          try {
            if (win && !win.isDestroyed()) {
              win.webContents.send("child-exit", {
                pid: child.pid,
                code,
                signal,
              });
            }
          } catch (e) {
            console.warn('[main] Error sending child-exit:', e);
          }
          clearTimeout(timeoutId);
          reject(new Error(`Child process exited with code ${code}`));
        });

        // forward messages from child to renderer (except websocket-port which we handle here)
        child.on("message", (msg) => {
          console.log("Message from child:", msg);
          if (
            msg &&
            typeof msg === "object" &&
            "type" in msg &&
            (msg as any).type === "websocket-port"
          ) {
            // Already handled above
            return;
          }
          try {
            if (win && !win.isDestroyed()) {
              win.webContents.send("child-message", { pid: child.pid, msg });
            }
          } catch (e) {
            console.warn('[main] Error sending child-message:', e);
          }
        });
      });
    } catch (error) {
      console.error("Failed to fork child process:", error);
      return { ok: false, reason: `fork-error: ${error}` };
    }
  }
);

// Monitor that periodically pings the backend and attempts to restart it when unresponsive
let backendMonitorInterval: NodeJS.Timeout | null = null;
let backendStartupGracePeriod = true; // durante inicialização, não reinicia
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3; // só reinicia após 3 falhas consecutivas

function startBackendMonitor({ intervalMs = 15000, gracePeriodMs = 45000 }: { intervalMs?: number; gracePeriodMs?: number } = {}) {
  if (backendMonitorInterval) return; // already running
  console.log(`[main] starting backend monitor (interval ${intervalMs}ms, grace period ${gracePeriodMs}ms)`);

  // Durante o período de graça, não mata o backend mesmo se o ping falhar
  backendStartupGracePeriod = true;
  setTimeout(() => {
    backendStartupGracePeriod = false;
    console.log('[main.monitor] grace period ended, monitoring active');
  }, gracePeriodMs);

  backendMonitorInterval = setInterval(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch("http://localhost:3000/api/ping", { signal: controller.signal });
      clearTimeout(timeout);
      if (res && res.ok) {
        // healthy - reset failure counter
        consecutiveFailures = 0;
        return;
      }
    } catch (e) {
      consecutiveFailures++;
      console.warn(`[main.monitor] backend ping failed (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES})`);
    }

    // Durante o período de graça, apenas logamos mas não reiniciamos
    if (backendStartupGracePeriod) {
      console.log('[main.monitor] still in grace period, waiting for backend to start...');
      return;
    }

    // Só reinicia após N falhas consecutivas
    if (consecutiveFailures < MAX_CONSECUTIVE_FAILURES) {
      return;
    }

    // If ping failed multiple times, attempt to restart backend using lastScriptPath/refork logic
    console.warn('[main.monitor] backend appears down — attempting restart/refork');
    consecutiveFailures = 0; // reset para evitar loops rápidos de restart
    
    // Notificar o frontend que o backend está sendo reiniciado
    try {
      if (win && !win.isDestroyed()) {
        win.webContents.send('backend-status', { 
          status: 'restarting', 
          message: 'Backend está sendo reiniciado automaticamente...' 
        });
      }
    } catch (e) {
      console.warn('[main.monitor] Error sending backend-status:', e);
    }
    
    try {
      // Kill any existing children that seem to be backend processes
      for (const [pid, child] of Array.from(children.entries())) {
        try {
          console.log(`[main.monitor] killing child PID ${pid}`);
          child.kill('SIGTERM');
        } catch (e) {
          console.warn('[main.monitor] error killing child', e);
        }
        children.delete(pid);
      }

      if (lastScriptPath && fs.existsSync(lastScriptPath)) {
        // Aguarda um pouco antes de reforkar para dar tempo do processo morrer
        await new Promise(r => setTimeout(r, 2000));
        
        const backendDir = path.dirname(lastScriptPath);
        const refork = fork(lastScriptPath, [], {
          stdio: ["pipe", "pipe", "ipc"],
          cwd: backendDir,
          silent: true,
          env: { ...process.env },
        });
        const newPid = refork.pid;
        if (typeof newPid === 'number') {
          children.set(newPid, refork);
          console.log('[main.monitor] reforked backend PID', newPid);
          
          // Período de graça para o novo processo
          backendStartupGracePeriod = true;
          setTimeout(() => {
            backendStartupGracePeriod = false;
          }, 30000); // 30s para inicializar
          
          // Notificar o frontend que o backend foi reiniciado com sucesso
          try {
            if (win && !win.isDestroyed()) {
              win.webContents.send('backend-status', { 
                status: 'restarted', 
                message: 'Backend reiniciado com sucesso',
                pid: newPid 
              });
              win.webContents.send('child-message', { pid: newPid, msg: { type: 'event', event: 'monitor-reforked' } });
            }
          } catch (e) {
            console.warn('[main.monitor] Error sending backend-status:', e);
          }
          
          // Capturar erros do processo filho
          refork.on('error', (err) => {
            console.error('[backend:error]', err);
            try {
              if (win && !win.isDestroyed()) {
                win.webContents.send('backend-status', { 
                  status: 'error', 
                  message: `Erro no backend: ${err.message}` 
                });
              }
            } catch (e) {}
          });

          // Wire up logging for the new child
          refork.on('message', (msg) => {
            try {
              if (win && !win.isDestroyed()) win.webContents.send('child-message', { pid: newPid, msg });
            } catch (e) {
              console.warn('[main.monitor] Error sending child-message:', e);
            }
          });
          
          // Log stdout/stderr do backend
          refork.stdout?.on('data', (data) => {
            console.log('[backend]', data.toString().trim());
          });
          refork.stderr?.on('data', (data) => {
            console.error('[backend:err]', data.toString().trim());
          });
        }
      } else {
        console.warn('[main.monitor] lastScriptPath not set or not found — cannot refork automatically');
      }
    } catch (e) {
      console.error('[main.monitor] failed to refork backend', e);
    }
  }, intervalMs);
}

function stopBackendMonitor() {
  if (!backendMonitorInterval) return;
  clearInterval(backendMonitorInterval);
  backendMonitorInterval = null;
  console.log('[main] backend monitor stopped');
}

// Convenience: start collector runner as a separate forked process
ipcMain.handle(
  "start-collector-fork",
  async (
    _event: IpcMainInvokeEvent,
    { args = [] }: { args?: string[] } = {}
  ) => {
    let scriptPath: string;

    if (app.isPackaged) {
      scriptPath = path.join(process.resourcesPath, "backend", "dist", "collector", "runner.js");
    } else {
      const projectRoot = path.dirname(path.dirname(__dirname));
      scriptPath = path.join(projectRoot, "back-end", "dist", "collector", "runner.js");
    }

    if (!fs.existsSync(scriptPath)) {
      return { ok: false, reason: "collector-not-found", attempted: [scriptPath] };
    }

    try {
      const child = fork(scriptPath, args, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: path.dirname(scriptPath),
        silent: true,
        env: { ...process.env },
      });
      const pid = child.pid;
      if (typeof pid === "number") {
        children.set(pid, child);
        child.on("message", (msg) => {
          try {
            if (win && !win.isDestroyed())
              win.webContents.send("child-message", { pid, msg });
          } catch (e) {
            console.warn('[collector] Error sending child-message:', e);
          }
        });
      }
      return { ok: true, pid };
    } catch (err) {
      return { ok: false, reason: String(err) };
    }
  }
);

// Send an IPC message from main to a specific child process
ipcMain.handle(
  "send-to-child",
  async (
    _event: IpcMainInvokeEvent,
    { pid, msg }: { pid?: number; msg?: any } = {}
  ) => {
    console.log(
      "send-to-child called with PID:",
      pid,
      "Message type:",
      msg?.type
    );
    console.log("Available children PIDs:", Array.from(children.keys()));

    if (typeof pid !== "number") return { ok: false, reason: "invalid-pid" };

    const child = children.get(pid);
    if (!child) {
      console.log("Child not found for PID:", pid);
      // Try to auto-refork if possible
      if (lastScriptPath) {
        try {
          const backendDir = path.dirname(lastScriptPath);
          const refork = fork(lastScriptPath, [], {
            stdio: ["pipe", "pipe", "ipc"],
            cwd: backendDir,
            silent: true,
            env: { ...process.env },
          });
          const newPid = refork.pid;
          if (typeof newPid === "number") {
            children.set(newPid, refork);
            try {
              if (win && !win.isDestroyed()) {
                win.webContents.send("child-message", {
                  pid: newPid,
                  msg: {
                    type: "event",
                    event: "reforked",
                    payload: { oldPid: pid, newPid },
                  },
                });
              }
            } catch (e) {
              console.warn('[main] Error sending reforked message:', e);
            }
            try {
              refork.send(msg);
              return { ok: true };
            } catch (sendErr) {
              console.error("Error sending message after refork:", sendErr);
              return { ok: false, reason: String(sendErr) };
            }
          }
        } catch (rfErr) {
          console.error("Auto-refork failed:", rfErr);
        }
      }
      return { ok: false, reason: "not-found" };
    }

    try {
      console.log("Sending message to child:", msg);
      child.send(msg);
      return { ok: true };
    } catch (err) {
      console.error("Error sending message to child:", err);
      return { ok: false, reason: String(err) };
    }
  }
);

// Stop (kill) a specific child process
ipcMain.handle(
  "stop-child",
  async (_event: IpcMainInvokeEvent, { pid }: { pid?: number } = {}) => {
    if (typeof pid !== "number") return { ok: false, reason: "invalid-pid" };
    const child = children.get(pid);
    if (!child) return { ok: false, reason: "not-found" };
    try {
      // try graceful, then forceful if needed
      child.kill("SIGTERM");
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: String(err) };
    }
  }
);

// ========== SPLASH SCREEN ==========
function getLogoBase64(logoFileName: string): string {
  try {
    // Tentar múltiplos caminhos possíveis para as logos
    const possiblePaths = [
      // Caminhos para app empacotado
      path.join(process.resourcesPath || '', 'dist', 'assets', logoFileName),
      path.join(process.resourcesPath || '', 'app.asar', 'dist', 'assets', logoFileName),
      // Caminhos para desenvolvimento
      path.join(__dirname, '..', 'dist', 'assets', logoFileName),
      path.join(__dirname, '..', 'src', 'public', logoFileName),
      path.join(process.env.APP_ROOT || '', 'dist', 'assets', logoFileName),
      path.join(process.env.APP_ROOT || '', 'src', 'public', logoFileName),
      path.join(process.env.VITE_PUBLIC || '', logoFileName),
    ];

    // Se nome do arquivo não tem hash, tentar buscar com padrão
    const baseName = logoFileName.replace(/\.[^.]+$/, '');
    const extension = logoFileName.split('.').pop();
    
    for (const basePath of possiblePaths) {
      // Tentar path exato primeiro
      if (fs.existsSync(basePath)) {
        const logoBuffer = fs.readFileSync(basePath);
        console.log(`[splash] Logo found at: ${basePath}`);
        return logoBuffer.toString('base64');
      }
      
      // Tentar buscar arquivo com hash (ex: logo-abc123.png)
      const dir = path.dirname(basePath);
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          // Busca case-insensitive
          const baseNameLower = baseName.toLowerCase();
          const matchingFile = files.find(f => 
            f.toLowerCase().startsWith(baseNameLower) && f.toLowerCase().endsWith(`.${extension}`)
          );
          if (matchingFile) {
            const fullPath = path.join(dir, matchingFile);
            const logoBuffer = fs.readFileSync(fullPath);
            console.log(`[splash] Logo found with hash at: ${fullPath}`);
            return logoBuffer.toString('base64');
          }
        } catch (e) {
          // Diretório pode não ser legível
        }
      }
    }
    console.warn(`[splash] Logo not found in any of the paths for: ${logoFileName}`);
  } catch (error) {
    console.warn(`Could not load logo: ${logoFileName}`, error);
  }
  
  // Fallback: retorna uma imagem SVG simples como placeholder
  const isCortica = logoFileName.includes('logo.png');
  const fallbackSvg = `<svg width="70" height="70" viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg">
    <rect width="70" height="70" rx="10" fill="${isCortica ? '#ffffff' : '#e74c3c'}"/>
    <text x="35" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${isCortica ? '#e74c3c' : '#ffffff'}" text-anchor="middle">${isCortica ? 'J' : 'C'}</text>
  </svg>`;
  return Buffer.from(fallbackSvg).toString('base64');
}

// ========== SPLASH SCREEN ==========
function createSplashScreen() {
  const logoCorticaBase64 = getLogoBase64('logo.png');
  const logoCortezBase64 = getLogoBase64('logoCmono.png');
  const appVersion = app.getVersion();

  splashScreen = new BrowserWindow({
    width: 620,
    height: 420,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body {
    width:100%;
    height:100%;
    overflow:hidden;
  }
  body {
    display:flex;
    flex-direction:column;
    background:#ffffff;
    font-family:'Segoe UI', sans-serif;
    position:relative;
  }

  .main-content {
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    flex:1;
    padding:20px;
  }

  .logo-cortez {
    width:250px;
    max-height:150px;
    object-fit:contain;
    animation:fadeInScale 0.8s ease-out forwards;
    filter:drop-shadow(0 4px 12px rgba(0,0,0,0.1));
  }

  .tagline {
    font-size:12px;
    color:#888;
    letter-spacing:0.5px;
    margin-top:10px;
    animation:fadeIn 1s ease-out 0.3s both;
  }

  .loading-section {
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:10px;
    margin-top:20px;
    animation:fadeIn 1.2s ease-out 0.5s both;
  }

  .spinner {
    width:28px;
    height:28px;
    border:3px solid #e8e8e8;
    border-top:3px solid #d62828;
    border-radius:50%;
    animation:spin 0.9s linear infinite;
  }

  .status {
    font-size:11px;
    color:#aaa;
    text-align:center;
  }

  .footer {
    padding:15px 0 20px 0;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:6px;
    animation:fadeIn 1.4s ease-out 0.7s both;
  }

  .logo-cortica {
    width:60px;
    opacity:0.85;
  }

  .version {
    font-size:10px;
    color:#bbb;
    letter-spacing:0.3px;
  }

  .bottom-accent {
    position:absolute;
    bottom:0;
    left:0;
    right:0;
    height:5px;
    background:linear-gradient(90deg,#aa1f1f,#d62828,#aa1f1f);
  }

  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
  @keyframes fadeInScale { 
    from { opacity:0; transform:scale(0.95); } 
    to { opacity:1; transform:scale(1); } 
  }
</style>
</head>
<body>

  <div class="main-content">
    <img class="logo-cortez" src="data:image/png;base64,${logoCortezBase64}" alt="Cortez">
    <div class="tagline">Onde os dados servem ao seu controle.</div>
    
    <div class="loading-section">
      <div class="spinner"></div>
      <div class="status" id="status">Iniciando...</div>
    </div>
  </div>

  <div class="footer">
    <img class="logo-cortica" src="data:image/png;base64,${logoCorticaBase64}" alt="J.Cortiça">
    <div class="version">v${appVersion}</div>
  </div>

  <div class="bottom-accent"></div>

  <script>
    const statusEl = document.getElementById('status');
    const msgs = [
      'Iniciando...',
      'Conectando ao banco de dados...',
      'Carregando configurações...',
      'Preparando interface...'
    ];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % msgs.length;
      statusEl.textContent = msgs[i];
    }, 1500);
  </script>

</body>
</html>
`;


  splashScreen.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);
  splashScreen.center();
}

function closeSplashScreen() {
  if (splashScreen && !splashScreen.isDestroyed()) {
    try {
      splashScreen.close();
    } catch (e) {
      console.warn('[splash] Error closing splash screen:', e);
    }
  }
  splashScreen = null;
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.maximize();
  // win.setMenu(null);

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    // win.setMenu(null); 
  } else {
    // When packaged, __dirname points inside app.asar. It's more reliable to resolve
    // the index.html relative to __dirname instead of constructing a path via process.resourcesPath
    // which may result in a file:// URL containing app.asar and trigger "Not allowed to load local resource".
    // win.setMenu(null);
    try {
      const packagedIndex = path.join(
        process.resourcesPath,
        "dist",
        "index.html"
      );
      console.log("[main] loading packaged index from", packagedIndex);
      if (fs.existsSync(packagedIndex)) {
        win.loadFile(packagedIndex);
      } else {
        // Fallback to original approach if file not found
        const alt = path.join(RENDERER_DIST, "index.html");
        console.warn(
          "[main] packaged index not found at",
          packagedIndex,
          "falling back to",
          alt
        );
        win.loadFile(alt);
      }
    } catch (e) {
      console.error("[main] failed to load packaged index.html", e);
      // Last resort: attempt to load via resourcesPath
      try {
        const alt2 = path.join(
          process.resourcesPath,
          "app.asar",
          "dist",
          "index.html"
        );
        console.log("[main] attempting alt loadFile", alt2);
        win.loadFile(alt2);
      } catch (e2) {
        console.error("[main] all index.html load attempts failed", e2);
      }
    }
  }
}

async function tryForkBackend(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:3000/api/ping");
    if (res && res.ok) {
      console.log("[main] backend is alive");
      return true;
    } else {
      console.log("[main] backend is not responding");
      return false;
    }
  } catch (e) {
    console.log("[main] backend ping failed");
    return false;
  }
}

app.whenReady().then(() => {
  (async () => {
    // If running packaged we will try to spawn the backend exe included in resources
    if (app.isPackaged) {
      const backendScript = path.join(
        process.resourcesPath,
        "backend",
        "index.js"
      );
      if (fs.existsSync(backendScript)) {
        console.log("[main] spawning backend exe at", backendScript);
        spawnedBackend = spawn("node", [backendScript], {
          stdio: ["pipe", "pipe", "pipe", "ipc"],
          cwd: path.dirname(backendScript),
          env: { ...process.env },
          shell: false,
        });
        spawnedBackend.on("error", (err) => {
          console.error("[main] spawned backend error:", err);
          spawnedBackend = null;
        });
        spawnedBackend.on("exit", (code, signal) => {
          const exitedPid = spawnedBackend?.pid;
          console.log(
            `[main] spawned backend exited with code ${code} and signal ${signal}`
          );
          spawnedBackend = null;
          try {
            if (win && !win.isDestroyed()) {
              win.webContents.send("child-exit", { pid: exitedPid, code, signal });
            }
          } catch (e) {
            console.warn('[main] Error sending child-exit:', e);
          }
        });
        if (spawnedBackend.stdout) {
          spawnedBackend.stdout.on("data", (c) => {
            console.log("[spawned backend stdout]", c.toString());
            try {
              if (win && !win.isDestroyed())
                win.webContents.send("child-stdout", {
                  pid: spawnedBackend?.pid,
                  data: c.toString(),
                });
            } catch (e) {
              console.warn('[main] Error sending child-stdout:', e);
            }
          });
          console.log("[main] spawned backend stdout attached");
        }
      }

    } else {
      // In dev, prefer to fork the backend JS so logs and IPC work as before
      try {
        // attempt to auto-start backend JS when running in development
        // send a ping, and if not answered in 2s, try to fork
        const loadedBackend = await tryForkBackend();
        if (loadedBackend) {
          console.log("[main] backend is already running, not auto-forking");
        } else {
          console.log(
            "[main] backend not responding, will attempt to auto-fork"
          );

          const projectRoot = path.dirname(path.dirname(__dirname));
          const possible = [
            path.join(projectRoot, "back-end", "dist", "index.js"),
            path.join(projectRoot, "back-end", "dist", "src", "index.js"),
            path.join(projectRoot, "back-end", "src", "index.ts"),
          ];
          const scriptPath = possible.find((p) => fs.existsSync(p));
          if (scriptPath && !loadedBackend) {
            try {
              console.log("[main] dev auto-forking backend at", scriptPath);
              lastScriptPath = scriptPath;
              const backendDir = path.dirname(scriptPath);
              const child = fork(scriptPath, [], {
                stdio: ["pipe", "pipe", "ipc"],
                cwd: backendDir,
                silent: true,
                env: { ...process.env },
              });
              const pid = child.pid;
              if (typeof pid === "number") {
                children.set(pid, child);
                console.log("[main] dev backend forked with PID", pid);
              }
              // forward messages to renderer
              child.on("message", (msg) => {
                try {
                  if (win && !win.isDestroyed())
                    win.webContents.send("child-message", {
                      pid: child.pid,
                      msg,
                    });
                } catch (e) {
                  console.warn('[main] Error sending child-message in dev:', e);
                }
              });
            } catch (devErr) {
              console.warn(
                "[main] failed to auto-fork backend in dev:",
                devErr
              );
            }
          } else {
            console.log(
              "[main] running in development mode, backend fork will be started by renderer when needed (no backend script found)"
            );
          }
        }

      } catch (e) {
        console.warn(
          "[main] failed to auto-fork backend in dev:",
          (e as Error).message || e
        );
      }  
    }

      // Start background monitor to keep backend alive and auto-refork if it dies
      try {
        startBackendMonitor({ intervalMs: 15000 });
      } catch (e) {
        console.warn('[main] failed to start backend monitor', e);
      }

      // Criar splash screen enquanto aguarda backend estar pronto
      createSplashScreen();
      
      // Esperar backend estar pronto antes de fechar splash
      const checkBackendReady = async () => {
        let retries = 0;
        const maxRetries = 60; // 60 segundos máximo
        
        while (retries < maxRetries) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            
            const response = await fetch('http://localhost:3000/api/health', { 
              signal: controller.signal 
            });
            clearTimeout(timeout);
            
            if (response.ok) {
              console.log('[main] backend is ready, closing splash screen');
              closeSplashScreen();
              // Abrir janela principal apenas quando splash fechar
              createWindow();
              break;
            }
          } catch (e) {
            // Backend não está pronto ainda
          }
          
          retries++;
          await new Promise(r => setTimeout(r, 1000)); // aguardar 1s entre tentativas
        }
        
        // Se chegou aqui e splash ainda está aberto, fechar mesmo assim
        closeSplashScreen();
        // E abrir janela principal
        if (!win) {
          createWindow();
        }
      };
      
      // Executar verificação em background
      checkBackendReady().catch(e => console.warn('[main] error checking backend readiness:', e));
      
  })();
});

// Encerrar backend e app corretamente
app.on("window-all-closed", () => {
  closeSplashScreen();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  closeSplashScreen();
  // stop monitor when quitting
  try { stopBackendMonitor(); } catch (e) {}
  // ensure spawned backend is terminated
  try {
    if (spawnedBackend && !spawnedBackend.killed) {
      spawnedBackend.kill();
      spawnedBackend = null;
    }
  } catch (e) {
    console.warn("[main] error killing spawned backend", e);
  }

  // also try to kill any forked child processes
  for (const [, child] of children.entries()) {
    try {
      child.kill("SIGTERM");
    } catch (e) {
      /* ignore */
    }
  }
});

// Logging
const logFilePath = path.join(app.getPath("userData"), "error.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

process.on("uncaughtException", (error: Error) => {
  logStream.write(
    `[${new Date().toISOString()}] Uncaught Exception: ${error.stack}\n`
  );
});

process.on("unhandledRejection", (reason: unknown) => {
  logStream.write(
    `[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n`
  );
});

// Save base64 PDF data to a temp file and return the path
ipcMain.handle(
  "save-pdf",
  async (_event: IpcMainInvokeEvent, base64: string) => {
    try {
      const tmpDir = app.getPath("temp");
      const filePath = path.join(tmpDir, `relatorio-${Date.now()}.pdf`);
      const buffer = Buffer.from(base64, "base64");
      fs.writeFileSync(filePath, buffer);
      return { ok: true, path: filePath };
    } catch (err) {
      console.error("Failed to save pdf from renderer:", err);
      return { ok: false, error: String(err) };
    }
  }
);