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
  // if (app.isPackaged) {
  //   return path.join(process.resourcesPath, "backend", "dist", "index.js");
  // } else {
  //   const projectRoot = path.dirname(path.dirname(__dirname));
  //   return path.join(projectRoot, "back-end", "dist", "index.js");
  // }
  // if (!app.isPackaged) {
    return path.join("backend", "index.js")
  // }
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
        silent: false,
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
          if (win && !win.isDestroyed()) {
            win.webContents.send("child-exit", {
              pid: child.pid,
              code,
              signal,
            });
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
          if (win && !win.isDestroyed()) {
            win.webContents.send("child-message", { pid: child.pid, msg });
          }
        });

        // forward stdout/stderr
        if (child.stdout) {
          child.stdout.on("data", (chunk) => {
            console.log("Child stdout:", chunk.toString());
            if (win && !win.isDestroyed()) {
              win.webContents.send("child-stdout", {
                pid: child.pid,
                data: chunk.toString(),
              });
            }
          });
        }
        if (child.stderr) {
          child.stderr.on("data", (chunk) => {
            console.error("Child stderr:", chunk.toString());
            if (win && !win.isDestroyed()) {
              win.webContents.send("child-stderr", {
                pid: child.pid,
                data: chunk.toString(),
              });
            }
          });
        }
      });
    } catch (error) {
      console.error("Failed to fork child process:", error);
      return { ok: false, reason: `fork-error: ${error}` };
    }
  }
);

// Monitor that periodically pings the backend and attempts to restart it when unresponsive
let backendMonitorInterval: NodeJS.Timeout | null = null;
function startBackendMonitor({ intervalMs = 15000 }: { intervalMs?: number } = {}) {
  if (backendMonitorInterval) return; // already running
  console.log(`[main] starting backend monitor (interval ${intervalMs}ms)`);

  backendMonitorInterval = setInterval(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/ping");
      if (res && res.ok) {
        // healthy
        // console.log('[main.monitor] backend healthy');
        return;
      }
    } catch (e) {
      console.warn('[main.monitor] backend ping failed');
    }

    // If ping failed, attempt to restart backend using lastScriptPath/refork logic
    console.warn('[main.monitor] backend appears down — attempting restart/refork');
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
        const backendDir = path.dirname(lastScriptPath);
        const refork = fork(lastScriptPath, [], {
          stdio: ["pipe", "pipe", "ipc"],
          cwd: backendDir,
          env: { ...process.env },
        });
        const newPid = refork.pid;
        if (typeof newPid === 'number') {
          children.set(newPid, refork);
          console.log('[main.monitor] reforked backend PID', newPid);
          if (win && !win.isDestroyed()) {
            win.webContents.send('child-message', { pid: newPid, msg: { type: 'event', event: 'monitor-reforked' } });
          }

          // Wire up logging for the new child
          refork.on('message', (msg) => {
            if (win && !win.isDestroyed()) win.webContents.send('child-message', { pid: newPid, msg });
          });
          if (refork.stdout) refork.stdout.on('data', c => { if (win && !win.isDestroyed()) win.webContents.send('child-stdout', { pid: newPid, data: c.toString() }); console.log('[refork stdout]', c.toString()); });
          if (refork.stderr) refork.stderr.on('data', c => { if (win && !win.isDestroyed()) win.webContents.send('child-stderr', { pid: newPid, data: c.toString() }); console.error('[refork stderr]', c.toString()); });
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
        env: { ...process.env },
      });
      const pid = child.pid;
      if (typeof pid === "number") {
        children.set(pid, child);
        child.on("message", (msg) => {
          if (win && !win.isDestroyed())
            win.webContents.send("child-message", { pid, msg });
        });
        if (child.stdout)
          child.stdout.on("data", (c) => {
            if (win && !win.isDestroyed())
              win.webContents.send("child-stdout", { pid, data: c.toString() });
          });
        if (child.stderr)
          child.stderr.on("data", (c) => {
            if (win && !win.isDestroyed())
              win.webContents.send("child-stderr", { pid, data: c.toString() });
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
            silent: false,
            env: { ...process.env },
          });
          const newPid = refork.pid;
          if (typeof newPid === "number") {
            children.set(newPid, refork);
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
  win.setMenu(null);

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
          console.log(
            `[main] spawned backend exited with code ${code} and signal ${signal}`
          );
          spawnedBackend = null;
          if (win && !win.isDestroyed()) {
            win.webContents.send("child-exit", { pid: spawnedBackend?.pid, code, signal });
          }
        });
        if (spawnedBackend.stdout) {
          spawnedBackend.stdout.on("data", (c) => {
            console.log("[spawned backend stdout]", c.toString());
            if (win && !win.isDestroyed())
              win.webContents.send("child-stdout", {
                pid: spawnedBackend?.pid,
                data: c.toString(),
              });
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
                env: { ...process.env },
              });
              const pid = child.pid;
              if (typeof pid === "number") {
                children.set(pid, child);
                console.log("[main] dev backend forked with PID", pid);
              }
              // forward messages/stdout/stderr to renderer
              child.on("message", (msg) => {
                if (win && !win.isDestroyed())
                  win.webContents.send("child-message", {
                    pid: child.pid,
                    msg,
                  });
              });
              if (child.stdout)
                child.stdout.on("data", (c) => {
                  console.log("[child stdout]", c.toString());
                  if (win && !win.isDestroyed())
                    win.webContents.send("child-stdout", {
                      pid: child.pid,
                      data: c.toString(),
                    });
                });
              if (child.stderr)
                child.stderr.on("data", (c) => {
                  console.error("[child stderr]", c.toString());
                  if (win && !win.isDestroyed())
                    win.webContents.send("child-stderr", {
                      pid: child.pid,
                      data: c.toString(),
                    });
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

      createWindow();
  })();
});

// Encerrar backend e app corretamente
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
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