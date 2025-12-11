import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Tipos de notificação
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  count: number; // Para agrupamento
  groupKey?: string; // Chave para agrupar notificações similares
  timestamp: Date;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details?: string;
  page: string;
  timestamp: Date;
  userId?: number;
  userName?: string;
}

interface NotificationContextValue {
  notifications: Notification[];
  activityLogs: ActivityLog[];
  unreadCount: number;
  
  // Notificações
  addNotification: (notification: Omit<Notification, 'id' | 'count' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Activity Logs
  logActivity: (action: string, details?: string, page?: string) => void;
  clearActivityLogs: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const STORAGE_KEY_NOTIFICATIONS = 'rpro_notifications';
const STORAGE_KEY_LOGS = 'rpro_activity_logs';
const MAX_NOTIFICATIONS = 100;
const MAX_LOGS = 500;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }));
      }
    } catch (e) {}
    return [];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
      }
    } catch (e) {}
    return [];
  });

  // Persistir notificações
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
    } catch (e) {}
  }, [notifications]);

  // Persistir logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(activityLogs.slice(0, MAX_LOGS)));
    } catch (e) {}
  }, [activityLogs]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'count' | 'timestamp' | 'read'>) => {
    setNotifications(prev => {
      // Se tem groupKey, tentar agrupar com notificação existente
      if (notification.groupKey) {
        const existingIndex = prev.findIndex(
          n => n.groupKey === notification.groupKey && !n.read
        );
        
        if (existingIndex >= 0) {
          // Incrementar contador da notificação existente
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            count: updated[existingIndex].count + 1,
            timestamp: new Date(),
            message: notification.message || updated[existingIndex].message,
          };
          return updated;
        }
      }

      // Criar nova notificação
      const newNotification: Notification = {
        ...notification,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        count: 1,
        timestamp: new Date(),
        read: false,
      };

      return [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const logActivity = useCallback((action: string, details?: string, page?: string) => {
    // Obter usuário do localStorage
    let userId: number | undefined;
    let userName: string | undefined;
    try {
      const userStr = localStorage.getItem('rpro_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id;
        userName = user.displayName || user.username;
      }
    } catch (e) {}

    const currentPage = page || window.location.pathname;

    const newLog: ActivityLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      details,
      page: currentPage,
      timestamp: new Date(),
      userId,
      userName,
    };

    setActivityLogs(prev => [newLog, ...prev].slice(0, MAX_LOGS));
  }, []);

  const clearActivityLogs = useCallback(() => {
    setActivityLogs([]);
  }, []);

  // Escutar eventos de toast para criar notificações automaticamente
  useEffect(() => {
    const handleToastNotification = (event: CustomEvent<{ type: NotificationType; message: string }>) => {
      const { type, message } = event.detail;
      if (message) {
        addNotification({
          type,
          title: message,
          groupKey: `toast-${type}`,
        });
      }
    };

    window.addEventListener('toast-notification', handleToastNotification as EventListener);
    return () => {
      window.removeEventListener('toast-notification', handleToastNotification as EventListener);
    };
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        activityLogs,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        logActivity,
        clearActivityLogs,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }
  return ctx;
}

// Hook auxiliar para facilitar o uso de notificações tipadas
export function useNotify() {
  const { addNotification, logActivity } = useNotifications();

  return {
    success: (title: string, message?: string, groupKey?: string) => {
      addNotification({ type: 'success', title, message, groupKey });
    },
    error: (title: string, message?: string, groupKey?: string) => {
      addNotification({ type: 'error', title, message, groupKey });
    },
    warning: (title: string, message?: string, groupKey?: string) => {
      addNotification({ type: 'warning', title, message, groupKey });
    },
    info: (title: string, message?: string, groupKey?: string) => {
      addNotification({ type: 'info', title, message, groupKey });
    },
    log: logActivity,
  };
}

export default useNotifications;
