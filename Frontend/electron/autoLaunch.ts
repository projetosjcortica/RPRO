import { app } from 'electron';

/**
 * Gerenciador de Auto-Launch (Iniciar com Windows)
 * 
 * Usa o registro do Windows para adicionar o app no startup
 * Alternativa: usar o pacote 'auto-launch' do npm
 */

const APP_NAME = 'Cortez';

/**
 * Obtém o caminho do executável do app
 */
function getExePath(): string {
  if (app.isPackaged) {
    return process.execPath;
  }
  // Em desenvolvimento, retorna o electron
  return process.execPath;
}

/**
 * Obtém os argumentos para iniciar minimizado
 */
function getStartupArgs(): string {
  return '--minimized';
}

/**
 * Verifica se o auto-launch está habilitado
 */
export async function isAutoLaunchEnabled(): Promise<boolean> {
  if (process.platform !== 'win32') {
    console.log('[autoLaunch] Auto-launch only supported on Windows');
    return false;
  }

  try {
    const { execSync } = require('child_process');
    const result = execSync(
      `reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${APP_NAME}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return result.includes(APP_NAME);
  } catch (e) {
    // Chave não existe = não está habilitado
    return false;
  }
}

/**
 * Habilita o auto-launch (iniciar com Windows)
 */
export async function enableAutoLaunch(): Promise<boolean> {
  if (process.platform !== 'win32') {
    console.log('[autoLaunch] Auto-launch only supported on Windows');
    return false;
  }

  try {
    const exePath = getExePath();
    const args = getStartupArgs();
    const value = `"${exePath}" ${args}`;

    const { execSync } = require('child_process');
    execSync(
      `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${APP_NAME}" /t REG_SZ /d "${value}" /f`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    console.log('[autoLaunch] Auto-launch enabled');
    return true;
  } catch (e) {
    console.error('[autoLaunch] Failed to enable auto-launch:', e);
    return false;
  }
}

/**
 * Desabilita o auto-launch
 */
export async function disableAutoLaunch(): Promise<boolean> {
  if (process.platform !== 'win32') {
    console.log('[autoLaunch] Auto-launch only supported on Windows');
    return false;
  }

  try {
    const { execSync } = require('child_process');
    execSync(
      `reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${APP_NAME}" /f`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    console.log('[autoLaunch] Auto-launch disabled');
    return true;
  } catch (e) {
    // Pode falhar se a chave não existir
    console.warn('[autoLaunch] Failed to disable auto-launch (may not exist):', e);
    return false;
  }
}

/**
 * Alterna o estado do auto-launch
 */
export async function toggleAutoLaunch(): Promise<boolean> {
  const isEnabled = await isAutoLaunchEnabled();
  if (isEnabled) {
    return await disableAutoLaunch();
  } else {
    return await enableAutoLaunch();
  }
}
