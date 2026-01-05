import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import { showTrayBalloon } from './trayManager';

// Configurações do auto-updater
autoUpdater.autoDownload = false; // Não baixar automaticamente
autoUpdater.autoInstallOnAppQuit = true; // Instalar ao fechar o app
autoUpdater.allowDowngrade = false;

// Para desenvolvimento, pode usar este logger
autoUpdater.logger = console;

let mainWindow: BrowserWindow | null = null;

interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  info?: UpdateInfo;
  progress?: ProgressInfo;
  error?: string;
}

/**
 * Envia status de update para o renderer
 */
function sendUpdateStatus(status: UpdateStatus): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', status);
  }
  console.log('[autoUpdater]', status.status, status.info?.version || status.error || '');
}

/**
 * Configura os event listeners do auto-updater
 */
function setupAutoUpdaterEvents(): void {
  // Verificando atualizações
  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus({ status: 'checking' });
  });

  // Atualização disponível
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    sendUpdateStatus({ status: 'available', info });
    showTrayBalloon('Atualização disponível', `Versão ${info.version} está disponível!`);
  });

  // Nenhuma atualização disponível
  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    sendUpdateStatus({ status: 'not-available', info });
  });

  // Progresso do download
  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    sendUpdateStatus({ status: 'downloading', progress });
    
    // Log de progresso
    const percent = Math.round(progress.percent);
    console.log(`[autoUpdater] Download: ${percent}% (${formatBytes(progress.transferred)}/${formatBytes(progress.total)})`);
  });

  // Download concluído
  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    sendUpdateStatus({ status: 'downloaded', info });
    showTrayBalloon('Atualização pronta', `Versão ${info.version} foi baixada. Reinicie para instalar.`);
  });

  // Erro
  autoUpdater.on('error', (error: Error) => {
    sendUpdateStatus({ status: 'error', error: error.message });
    console.error('[autoUpdater] Error:', error);
  });
}

/**
 * Formata bytes para string legível
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Inicializa o sistema de auto-update
 */
export function initAutoUpdater(win: BrowserWindow): void {
  mainWindow = win;
  
  // Configurar URL do GitHub (substitua pelo seu repo)
  // O electron-updater detecta automaticamente do package.json se configurado corretamente
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'projetosjcortica',
    repo: 'RPRO',
    private: false, // Se o repo for privado, precisa de token
    // token: 'seu-github-token' // Descomente se o repo for privado
  });
  
  setupAutoUpdaterEvents();
  
  // Verificar atualizações ao iniciar (após 10 segundos)
  setTimeout(() => {
    if (app.isPackaged) {
      checkForUpdates();
    } else {
      console.log('[autoUpdater] Skipping update check in development mode');
    }
  }, 10000);
  
  // Verificar atualizações a cada 4 horas
  setInterval(() => {
    if (app.isPackaged) {
      checkForUpdates();
    }
  }, 4 * 60 * 60 * 1000);
}

/**
 * Verifica se há atualizações disponíveis
 */
export async function checkForUpdates(): Promise<void> {
  try {
    console.log('[autoUpdater] Checking for updates...');
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('[autoUpdater] Error checking for updates:', error);
  }
}

/**
 * Inicia o download da atualização
 */
export async function downloadUpdate(): Promise<void> {
  try {
    console.log('[autoUpdater] Starting download...');
    await autoUpdater.downloadUpdate();
  } catch (error) {
    console.error('[autoUpdater] Error downloading update:', error);
  }
}

/**
 * Instala a atualização e reinicia o app
 */
export function installUpdate(): void {
  console.log('[autoUpdater] Installing update and restarting...');
  autoUpdater.quitAndInstall(false, true);
}

/**
 * Obtém a versão atual do app
 */
export function getCurrentVersion(): string {
  return app.getVersion();
}

// ========== IPC HANDLERS ==========

/**
 * Registra os handlers IPC para o renderer poder controlar o updater
 */
export function registerUpdateIpcHandlers(): void {
  // Verificar atualizações manualmente
  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return {
        ok: true,
        updateAvailable: result?.updateInfo ? true : false,
        version: result?.updateInfo?.version,
        releaseNotes: result?.updateInfo?.releaseNotes,
      };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  });

  // Baixar atualização
  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  });

  // Instalar atualização
  ipcMain.handle('install-update', () => {
    try {
      autoUpdater.quitAndInstall(false, true);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  });

  // Obter versão atual
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Verificar se está em modo de desenvolvimento
  ipcMain.handle('is-packaged', () => {
    return app.isPackaged;
  });
}
