import { toast, Id as ToastId, UpdateOptions } from 'react-toastify';

type ToastMap = Map<string, ToastId>;

const activeToasts: ToastMap = new Map();
const shownOnce = new Set<string>();

export function showLoading(key: string, message: string) {
  try {
    if (activeToasts.has(key)) return activeToasts.get(key)!;
    const id = toast.loading(message, { autoClose: false });
    activeToasts.set(key, id);
    return id;
  } catch (e) {
    // fallback
    return null as unknown as ToastId;
  }
}

export function updateSuccess(key: string, message: string, autoClose = 3000) {
  try {
    const id = activeToasts.get(key);
    if (id) {
      toast.update(id, { render: message, type: 'success', isLoading: false, autoClose } as UpdateOptions);
      activeToasts.delete(key);
      return id;
    }
    return toast.success(message, { autoClose });
  } catch (e) {
    return null as unknown as ToastId;
  }
}

export function updateError(key: string, message: string, autoClose = 6000) {
  try {
    const id = activeToasts.get(key);
    if (id) {
      toast.update(id, { render: message, type: 'error', isLoading: false, autoClose } as UpdateOptions);
      activeToasts.delete(key);
      return id;
    }
    return toast.error(message, { autoClose });
  } catch (e) {
    return null as unknown as ToastId;
  }
}

export function showInfoOnce(key: string, message: string, autoClose = 3000) {
  try {
    if (shownOnce.has(key)) return null as unknown as ToastId;
    shownOnce.add(key);
    return toast.info(message, { autoClose });
  } catch (e) {
    return null as unknown as ToastId;
  }
}

export function showWarningOnce(key: string, message: string, autoClose = 4000) {
  try {
    if (shownOnce.has(key)) return null as unknown as ToastId;
    shownOnce.add(key);
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
