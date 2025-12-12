import { app, Tray, Menu, nativeImage, BrowserWindow, NativeImage, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { checkForUpdates } from './autoUpdater';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray: Tray | null = null;

interface TrayManagerOptions {
  getMainWindow: () => BrowserWindow | null;
  createMainWindow: () => void;
  onQuit: () => void;
}

/**
 * Obtém o caminho do ícone para o tray
 */
function getTrayIconPath(): string {
  // Tentar múltiplos nomes de arquivo em ordem de preferência
  // No Windows, .ico é preferível para tray
  const iconNames = ['icon.ico', 'tray-icon.ico', 'logoC.png', 'logoCmono.png', 'logo.png'];
  
  // Determinar o caminho base dependendo se está empacotado ou não
  const isPackaged = app.isPackaged;
  
  const basePaths = isPackaged ? [
    // Empacotado - recursos estão em resourcesPath
    path.join(process.resourcesPath, 'build', 'public'),
    path.join(process.resourcesPath, 'build'),
    path.join(process.resourcesPath, 'dist', 'assets'),
    path.join(process.resourcesPath, 'dist'),
    process.resourcesPath,
  ] : [
    // Desenvolvimento
    path.join(__dirname, '..', 'build', 'public'),
    path.join(__dirname, '..', 'src', 'public'),
    path.join(__dirname, '..', 'public'),
  ];
  
  console.log('[tray] Searching for icon, isPackaged:', isPackaged);
  
  for (const basePath of basePaths) {
    for (const iconName of iconNames) {
      const iconPath = path.join(basePath, iconName);
      console.log('[tray] Checking:', iconPath);
      if (fs.existsSync(iconPath)) {
        console.log('[tray] ✓ Icon found at:', iconPath);
        return iconPath;
      }
    }
  }
  
  console.warn('[tray] No icon found in any path, will use fallback');
  return '';
}

/**
 * Cria um ícone fallback - círculo vermelho com "C"
 */
function createFallbackIcon(): NativeImage {
  // Criar um ícone 16x16 em formato PNG usando raw pixels
  // RGBA: vermelho = 214, 40, 40
  const size = 16;
  const pixels = Buffer.alloc(size * size * 4);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 1;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= radius) {
        // Dentro do círculo - vermelho
        pixels[idx] = 214;     // R
        pixels[idx + 1] = 40;  // G
        pixels[idx + 2] = 40;  // B
        pixels[idx + 3] = 255; // A
      } else {
        // Fora - transparente
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
      }
    }
  }
  
  const icon = nativeImage.createFromBuffer(pixels, { width: size, height: size });
  console.log('[tray] Created fallback icon, isEmpty:', icon.isEmpty());
  return icon;
}

/**
 * Cria e configura o system tray
 */
export function createTray(options: TrayManagerOptions): Tray | null {
  if (tray) {
    console.log('[tray] Tray already exists');
    return tray;
  }
  
  try {
    const iconPath = getTrayIconPath();
    let icon: NativeImage;
    
    if (iconPath && fs.existsSync(iconPath)) {
      console.log('[tray] Loading icon from path:', iconPath);
      icon = nativeImage.createFromPath(iconPath);
      
      // Verificar se o ícone foi carregado corretamente
      if (icon.isEmpty()) {
        console.warn('[tray] Icon loaded but is empty, using fallback');
        icon = createFallbackIcon();
      } else {
        // Redimensionar para tamanho apropriado do tray (16x16 no Windows)
        const size = process.platform === 'win32' ? 16 : 22;
        icon = icon.resize({ width: size, height: size });
        console.log('[tray] Icon resized to', size, 'x', size);
      }
    } else {
      console.log('[tray] No icon file found, using fallback');
      icon = createFallbackIcon();
    }
    
    // Garantir que temos um ícone válido
    if (icon.isEmpty()) {
      console.error('[tray] Final icon is still empty!');
      icon = createFallbackIcon();
    }
    
    tray = new Tray(icon);
    tray.setToolTip('Cortez - Sistema de Controle');
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Abrir Cortez',
        click: () => {
          showWindow(options);
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Procurar atualizações',
        click: async () => {
          try {
            showTrayBalloon('Cortez', 'Verificando atualizações...');
            await checkForUpdates();
          } catch (e) {
            console.error('[tray] Error checking for updates:', e);
          }
        },
      },
      {
        label: 'Sobre',
        click: () => {
          dialog.showMessageBox({
            type: 'info',
            title: 'Sobre o Cortez',
            message: `Cortez v${app.getVersion()}`,
            detail: 'Sistema de Controle de Produção\n\nDesenvolvido por J.Cortiça',
          });
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Sair',
        click: () => {
          options.onQuit();
          app.quit();
        },
      },
    ]);
    
    tray.setContextMenu(contextMenu);
    
    // Duplo clique no ícone abre a janela
    tray.on('double-click', () => {
      showWindow(options);
    });
    
    // Clique simples também abre
    tray.on('click', () => {
      showWindow(options);
    });
    
    console.log('[tray] System tray created successfully');
    return tray;
  } catch (error) {
    console.error('[tray] Failed to create system tray:', error);
    return null;
  }
}

/**
 * Mostra a janela principal ou cria uma nova se não existir
 */
function showWindow(options: TrayManagerOptions): void {
  const win = options.getMainWindow();
  
  if (win && !win.isDestroyed()) {
    // Se a janela existe, mostrar e focar
    if (win.isMinimized()) {
      win.restore();
    }
    win.show();
    win.focus();
    console.log('[tray] Window restored and focused');
  } else {
    // Se não existe, criar nova janela
    console.log('[tray] Creating new main window');
    options.createMainWindow();
  }
}

/**
 * Destrói o tray
 */
export function destroyTray(): void {
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
    tray = null;
    console.log('[tray] Tray destroyed');
  }
}

/**
 * Atualiza o tooltip do tray
 */
export function updateTrayTooltip(message: string): void {
  if (tray && !tray.isDestroyed()) {
    tray.setToolTip(message);
  }
}

/**
 * Mostra uma notificação balão (Windows)
 */
export function showTrayBalloon(title: string, content: string): void {
  if (tray && !tray.isDestroyed() && process.platform === 'win32') {
    tray.displayBalloon({
      title,
      content,
      iconType: 'info',
    });
  }
}

export { tray };
