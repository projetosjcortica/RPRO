import { toast, Id as ToastId, UpdateOptions } from 'react-toastify';

type ToastMap = Map<string, ToastId>;

const activeToasts: ToastMap = new Map();
const shownOnce = new Set<string>();

// Configurações
const MAX_TOASTS = 3;
const TOAST_DEDUPE_WINDOW = 1000; // 1 segundo

// Rastreamento de mensagens recentes para evitar duplicatas
const recentMessages = new Map<string, number>();

/**
 * Limpa toasts antigos se exceder o limite
 */
function enforceToastLimit() {
  const toastCount = activeToasts.size;
  if (toastCount >= MAX_TOASTS) {
    // Remove o toast mais antigo
    const oldestKey = Array.from(activeToasts.keys())[0];
    const oldestId = activeToasts.get(oldestKey);
    if (oldestId) {
      toast.dismiss(oldestId);
      activeToasts.delete(oldestKey);
    }
  }
}

/**
 * Verifica se mensagem é duplicata recente
 */
function isDuplicate(message: string): boolean {
  const now = Date.now();
  const lastShown = recentMessages.get(message);
  
  if (lastShown && (now - lastShown) < TOAST_DEDUPE_WINDOW) {
    return true;
  }
  
  recentMessages.set(message, now);
  
  // Limpeza de mensagens antigas
  for (const [msg, timestamp] of recentMessages.entries()) {
    if (now - timestamp > TOAST_DEDUPE_WINDOW) {
      recentMessages.delete(msg);
    }
  }
  
  return false;
}

export function showLoading(key: string, message: string) {
  try {
    if (isDuplicate(message)) return activeToasts.get(key) || null as unknown as ToastId;
    if (activeToasts.has(key)) return activeToasts.get(key)!;
    
    enforceToastLimit();
    const id = toast.loading(message, { autoClose: false });
    activeToasts.set(key, id);
    return id;
  } catch (e) {
    return null as unknown as ToastId;
  }
}

export function updateSuccess(key: string, message: string, autoClose = 3000) {
  try {
    if (isDuplicate(message)) return null as unknown as ToastId;
    
    const id = activeToasts.get(key);
    if (id) {
      toast.update(id, { render: message, type: 'success', isLoading: false, autoClose } as UpdateOptions);
      activeToasts.delete(key);
      return id;
    }
    
    enforceToastLimit();
    return toast.success(message, { autoClose });
  } catch (e) {
    return null as unknown as ToastId;
  }
}

export function updateError(key: string, message: string, autoClose = 6000) {
  try {
    if (isDuplicate(message)) return null as unknown as ToastId;
    
    const id = activeToasts.get(key);
    if (id) {
      toast.update(id, { render: message, type: 'error', isLoading: false, autoClose } as UpdateOptions);
      activeToasts.delete(key);
      return id;
    }
    
    enforceToastLimit();
    return toast.error(message, { autoClose });
  } catch (e) {
    return null as unknown as ToastId;
  }
}

export function showInfoOnce(key: string, message: string, autoClose = 3000) {
  try {
    if (shownOnce.has(key) || isDuplicate(message)) return null as unknown as ToastId;
    shownOnce.add(key);
    enforceToastLimit();
    return toast.info(message, { autoClose });
  } catch (e) {
    return null as unknown as ToastId;
  }
}

export function showWarningOnce(key: string, message: string, autoClose = 4000) {
  try {
    if (shownOnce.has(key) || isDuplicate(message)) return null as unknown as ToastId;
    shownOnce.add(key);
    enforceToastLimit();
    return toast.warning(message, { autoClose });
  } catch (e) {
    return null as unknown as ToastId;
  }
}

export function dismiss(key: string) {
  try {
    const id = activeToasts.get(key);
    if (id) {
      toast.dismiss(id);
      activeToasts.delete(key);
    }
  } catch (e) {}
}

export function clearShownOnce(key: string) {
  shownOnce.delete(key);
}

export default {
  showLoading,
  updateSuccess,
  updateError,
  showInfoOnce,
  showWarningOnce,
  dismiss,
  clearShownOnce,
};
