import { useEffect, useRef, useCallback } from 'react';
import { useNotify } from './useNotifications';

interface BackendError {
  timestamp: string;
  type: string;
  message: string;
  stack?: string;
}

interface BackendErrorsResponse {
  ok: boolean;
  errors: BackendError[];
  totalErrors: number;
}

interface BackendStatusData {
  status: string;
  message: string;
  pid?: number;
}

/**
 * Hook que monitora erros do backend e notifica o usuário
 * 
 * - Verifica periodicamente se há novos erros no backend
 * - Notifica o usuário via sistema de notificações
 * - Não interrompe a aplicação, apenas informa
 */
export function useBackendHealthMonitor(intervalMs: number = 30000) {
  const notify = useNotify();
  const lastErrorTimestamp = useRef<string | null>(null);
  const consecutiveFailures = useRef(0);
  const hasNotifiedOffline = useRef(false);

  const checkBackendHealth = useCallback(async () => {
    try {
      const backendPort = (window as any).backendPort || 3000;
      const baseUrl = `http://localhost:${backendPort}`;

      // Primeiro, verificar se o backend está online
      const pingResponse = await fetch(`${baseUrl}/api/ping`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!pingResponse.ok) {
        throw new Error('Backend não respondeu');
      }

      // Backend está online, resetar contadores
      consecutiveFailures.current = 0;
      
      if (hasNotifiedOffline.current) {
        hasNotifiedOffline.current = false;
        notify.success('Backend reconectado', 'O servidor voltou a responder normalmente');
      }

      // Verificar se há erros recentes
      const errorsResponse = await fetch(`${baseUrl}/api/backend-errors`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (errorsResponse.ok) {
        const data: BackendErrorsResponse = await errorsResponse.json();
        
        if (data.errors && data.errors.length > 0) {
          const latestError = data.errors[0];
          
          // Só notificar se for um erro novo
          if (latestError.timestamp !== lastErrorTimestamp.current) {
            lastErrorTimestamp.current = latestError.timestamp;
            
            // Notificar o usuário sobre o erro
            notify.warning(
              'Erro no servidor',
              `${latestError.type}: ${latestError.message.slice(0, 100)}`,
              'backend-error'
            );
            
            console.warn('[BackendHealthMonitor] Erro detectado:', latestError);
          }
        }
      }
    } catch (error) {
      consecutiveFailures.current++;
      
      // Só notificar após 2 falhas consecutivas para evitar falsos positivos
      if (consecutiveFailures.current >= 2 && !hasNotifiedOffline.current) {
        hasNotifiedOffline.current = true;
        notify.error(
          'Backend offline',
          'O servidor não está respondendo. Algumas funcionalidades podem não funcionar.',
          'backend-offline'
        );
        console.error('[BackendHealthMonitor] Backend não está respondendo:', error);
      }
    }
  }, [notify]);

  // Ref para debounce de notificações - evitar spam
  const lastNotificationTime = useRef<Record<string, number>>({});
  const NOTIFICATION_DEBOUNCE_MS = 5000; // 5 segundos entre notificações do mesmo tipo

  useEffect(() => {
    // Verificar imediatamente ao montar
    checkBackendHealth();

    // Configurar verificação periódica
    const interval = setInterval(checkBackendHealth, intervalMs);

    // Listener para notificações do Electron IPC sobre status do backend
    const electronAPI = (window as any).electronAPI;
    let removeListener: (() => void) | null = null;
    
    if (electronAPI && typeof electronAPI.onBackendStatus === 'function') {
      const handler = (_evt: any, data: BackendStatusData) => {
        // Debounce: evitar spam de notificações do mesmo tipo
        const now = Date.now();
        const lastTime = lastNotificationTime.current[data.status] || 0;
        if (now - lastTime < NOTIFICATION_DEBOUNCE_MS) {
          return; // Ignorar notificação duplicada
        }
        lastNotificationTime.current[data.status] = now;
        
        console.log('[BackendHealthMonitor] Recebeu status do Electron:', data);
        
        switch (data.status) {
          case 'restarting':
            notify.warning(
              'Reiniciando servidor',
              data.message || 'O backend está sendo reiniciado...',
              'backend-restarting'
            );
            break;
          case 'restarted':
            notify.success(
              'Servidor reiniciado',
              data.message || `Backend reiniciado (PID: ${data.pid})`,
              'backend-restarted'
            );
            // Reset states
            hasNotifiedOffline.current = false;
            consecutiveFailures.current = 0;
            break;
          case 'error':
            notify.error(
              'Erro no servidor',
              data.message || 'Ocorreu um erro no backend',
              'backend-error'
            );
            break;
          case 'crash':
            notify.error(
              'Servidor travou',
              data.message || 'O backend encerrou inesperadamente',
              'backend-crash'
            );
            break;
          case 'failed':
            notify.error(
              'Backend falhou',
              data.message || 'O backend não conseguiu iniciar',
              'backend-failed'
            );
            break;
          default:
            // Não logar status desconhecido para evitar spam
            break;
        }
      };
      
      // Usar ipcRenderer.once se disponível para evitar múltiplos listeners
      // ou manter referência para remover depois
      electronAPI.onBackendStatus(handler);
      
      // Guardar referência para cleanup (se a API suportar removeListener)
      if (electronAPI.removeBackendStatusListener) {
        removeListener = () => electronAPI.removeBackendStatusListener(handler);
      }
    }

    return () => {
      clearInterval(interval);
      if (removeListener) {
        removeListener();
      }
    };
  }, [checkBackendHealth, intervalMs, notify]);

  // Retornar função para verificar manualmente se necessário
  return { checkNow: checkBackendHealth };
}

export default useBackendHealthMonitor;
