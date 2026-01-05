/**
 * Toast Wrapper - Intercepta chamadas do react-toastify e adiciona notificações
 * 
 * Este módulo substitui as funções do toast original para:
 * 1. Reduzir o tempo de exibição (3s ao invés de 7s)
 * 2. Emitir eventos para o sistema de notificações
 */

import { toast as originalToast, ToastOptions } from 'react-toastify';

const DEFAULT_AUTO_CLOSE = 3000; // 3 segundos

function emitNotification(type: 'success' | 'error' | 'info' | 'warning', message: string) {
  try {
    window.dispatchEvent(new CustomEvent('toast-notification', {
      detail: { type, message }
    }));
  } catch (e) {
    // Ignora erro se não estiver no browser
  }
}

// Wrapper para toast.success
const success = (message: string, options?: ToastOptions) => {
  emitNotification('success', message);
  return originalToast.success(message, { autoClose: DEFAULT_AUTO_CLOSE, ...options });
};

// Wrapper para toast.error
const error = (message: string, options?: ToastOptions) => {
  emitNotification('error', message);
  return originalToast.error(message, { autoClose: 4000, ...options });
};

// Wrapper para toast.info
const info = (message: string, options?: ToastOptions) => {
  emitNotification('info', message);
  return originalToast.info(message, { autoClose: DEFAULT_AUTO_CLOSE, ...options });
};

// Wrapper para toast.warning
const warning = (message: string, options?: ToastOptions) => {
  emitNotification('warning', message);
  return originalToast.warning(message, { autoClose: DEFAULT_AUTO_CLOSE, ...options });
};

// Alias para warn
const warn = warning;

// Exportar objeto toast com wrappers
export const toast = {
  ...originalToast,
  success,
  error,
  info,
  warning,
  warn,
};

export default toast;
