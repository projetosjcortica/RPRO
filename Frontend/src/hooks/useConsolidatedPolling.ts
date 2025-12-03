import { useEffect, useState, useRef, useCallback } from 'react';

interface CollectorStatus {
  running: boolean;
  lastRun?: string;
  nextRun?: string;
  error?: string;
}

// OTIMIZAÇÃO: Consolidar múltiplos intervalos em um único
export function useConsolidatedPolling(
  collectorRunning: boolean,
  onStatusUpdate: (status: CollectorStatus) => void,
  onDataRefresh: () => void,
  onResumoRefresh: () => void
) {
  const intervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    if (!mountedRef.current) return;
    
    try {
      const res = await fetch('http://localhost:3000/api/collector/status');
      if (res.ok) {
        const status = await res.json();
        onStatusUpdate(status);
      }
    } catch (err) {
      console.error('[ConsolidatedPolling] Status fetch error:', err);
    }
  }, [onStatusUpdate]);

  useEffect(() => {
    mountedRef.current = true;

    // Buscar status inicial
    fetchStatus();

    // OTIMIZAÇÃO: Um único intervalo ao invés de múltiplos
    if (collectorRunning) {
      // Durante coleta: atualizar dados + status a cada 5s
      intervalRef.current = window.setInterval(() => {
        fetchStatus();
        onDataRefresh();
        onResumoRefresh();
      }, 5000);
    } else {
      // Sem coleta: apenas status a cada 5s (ao invés de 2.5s)
      intervalRef.current = window.setInterval(() => {
        fetchStatus();
      }, 5000);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [collectorRunning, fetchStatus, onDataRefresh, onResumoRefresh]);
}

// OTIMIZAÇÃO: Server-Sent Events para substituir polling
export function useCollectorSSE(onStatusUpdate: (status: CollectorStatus) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Tentar conectar ao SSE
    try {
      const eventSource = new EventSource('http://localhost:3000/api/collector/events');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[SSE] Conectado ao servidor');
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const status = JSON.parse(event.data);
          onStatusUpdate(status);
        } catch (err) {
          console.error('[SSE] Erro ao parsear mensagem:', err);
        }
      };

      eventSource.onerror = () => {
        console.warn('[SSE] Erro de conexão, reconectando...');
        setIsConnected(false);
      };

      return () => {
        eventSource.close();
        setIsConnected(false);
      };
    } catch (err) {
      console.warn('[SSE] Não disponível, usando polling fallback');
      return;
    }
  }, [onStatusUpdate]);

  return { isConnected };
}
