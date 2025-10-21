import { useState, useEffect, useCallback } from 'react';

export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status?: number;
  duration?: number;
  timestamp: number;
  size?: number;
  error?: string;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  duration: number;
  timestamp: number;
  type: 'render' | 'api' | 'action';
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: number;
  stack?: string;
}

interface DevModeState {
  enabled: boolean;
  refreshKey: number;
  componentRefreshKeys: Record<string, number>;
  showNetworkMonitor: boolean;
  showPerformanceMonitor: boolean;
  showConsoleMonitor: boolean;
  networkRequests: NetworkRequest[];
  performanceMetrics: PerformanceMetric[];
  consoleLogs: ConsoleLog[];
  maxLogs: number;
}

/**
 * Hook para controlar o modo desenvolvedor avançado
 * Atalhos de teclado:
 * - Ctrl + Shift + D: Ativar/Desativar modo dev
 * - Ctrl + Shift + R: Refresh geral
 * - Ctrl + Shift + N: Toggle network monitor
 * - Ctrl + Shift + P: Toggle performance monitor
 * - Ctrl + Shift + C: Toggle console monitor
 * - Ctrl + Shift + X: Limpar todos os logs
 */
export function useDevMode() {
  const [devMode, setDevMode] = useState<DevModeState>(() => {
    const stored = localStorage.getItem('cortez-dev-mode');
    return stored ? JSON.parse(stored) : {
      enabled: false,
      refreshKey: 0,
      componentRefreshKeys: {},
      showNetworkMonitor: false,
      showPerformanceMonitor: false,
      showConsoleMonitor: false,
      networkRequests: [],
      performanceMetrics: [],
      consoleLogs: [],
      maxLogs: 100
    };
  });



  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('cortez-dev-mode', JSON.stringify(devMode));
  }, [devMode]);

  // Interceptar console para capturar logs
  useEffect(() => {
    if (!devMode.enabled || !devMode.showConsoleMonitor) return;

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (type: 'log' | 'warn' | 'error' | 'info', args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      // Use requestAnimationFrame to avoid blocking
      requestAnimationFrame(() => {
        setDevMode(prev => ({
          ...prev,
          consoleLogs: [
            {
              id: `log-${Date.now()}-${Math.random()}`,
              type,
              message,
              timestamp: Date.now(),
              stack: type === 'error' ? new Error().stack : undefined
            },
            ...prev.consoleLogs.slice(0, prev.maxLogs - 1)
          ]
        }));
      });
    };

    console.log = (...args: any[]) => {
      originalLog(...args);
      if (devMode.showConsoleMonitor) addLog('log', args);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      if (devMode.showConsoleMonitor) addLog('warn', args);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      if (devMode.showConsoleMonitor) addLog('error', args);
    };

    console.info = (...args: any[]) => {
      originalInfo(...args);
      if (devMode.showConsoleMonitor) addLog('info', args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, [devMode.enabled, devMode.showConsoleMonitor]);

  // Interceptar fetch para monitorar requisições
  useEffect(() => {
    if (!devMode.enabled || !devMode.showNetworkMonitor) return;

    const originalFetch = window.fetch;

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      if (!devMode.showNetworkMonitor) {
        return originalFetch(...args);
      }

      const requestId = `req-${Date.now()}-${Math.random()}`;
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : String(args[0]));
      const method = (args[1]?.method || 'GET').toUpperCase();

      // Adicionar requisição iniciada
      requestAnimationFrame(() => {
        setDevMode(prev => ({
          ...prev,
          networkRequests: [
            {
              id: requestId,
              url,
              method,
              timestamp: Date.now(),
            },
            ...prev.networkRequests.slice(0, prev.maxLogs - 1)
          ]
        }));
      });

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Clonar response para poder ler o body sem consumir o original
        const clonedResponse = response.clone();
        let size = 0;
        try {
          const blob = await clonedResponse.blob();
          size = blob.size;
        } catch {}

        // Atualizar requisição com resultado
        requestAnimationFrame(() => {
          setDevMode(prev => ({
            ...prev,
            networkRequests: prev.networkRequests.map(req =>
              req.id === requestId
                ? { ...req, status: response.status, duration, size }
                : req
            )
          }));
        });

        return response;
      } catch (error: any) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Atualizar requisição com erro
        requestAnimationFrame(() => {
          setDevMode(prev => ({
            ...prev,
            networkRequests: prev.networkRequests.map(req =>
              req.id === requestId
                ? { ...req, error: error.message, duration }
                : req
            )
          }));
        });

        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [devMode.enabled, devMode.showNetworkMonitor]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + D: Toggle modo dev
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDevMode();
        console.log(`🔧 [Dev Mode] ${!devMode.enabled ? 'Ativado' : 'Desativado'}`);
      }

      if (!devMode.enabled) return;

      // Ctrl + Shift + R: Refresh geral
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        refreshAll();
        console.log('🔄 [Dev Mode] Refresh geral aplicado');
      }

      // Ctrl + Shift + N: Toggle network monitor
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        toggleNetworkMonitor();
      }

      // Ctrl + Shift + P: Toggle performance monitor
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        togglePerformanceMonitor();
      }

      // Ctrl + Shift + C: Toggle console monitor
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        toggleConsoleMonitor();
      }

      // Ctrl + Shift + X: Limpar logs
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        clearAllLogs();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [devMode.enabled]);

  const toggleDevMode = useCallback(() => {
    setDevMode(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  }, []);

  const refreshAll = useCallback(() => {
    setDevMode(prev => ({
      ...prev,
      refreshKey: prev.refreshKey + 1,
      componentRefreshKeys: Object.keys(prev.componentRefreshKeys).reduce((acc, key) => {
        acc[key] = prev.componentRefreshKeys[key] + 1;
        return acc;
      }, {} as Record<string, number>)
    }));
  }, []);

  const refreshComponent = useCallback((componentName: string) => {
    setDevMode(prev => ({
      ...prev,
      componentRefreshKeys: {
        ...prev.componentRefreshKeys,
        [componentName]: (prev.componentRefreshKeys[componentName] || 0) + 1
      }
    }));
    console.log(`🔄 [Dev Mode] Componente "${componentName}" atualizado`);
  }, []);

  const getComponentKey = useCallback((componentName: string) => {
    return devMode.componentRefreshKeys[componentName] || 0;
  }, [devMode.componentRefreshKeys]);

  const toggleNetworkMonitor = useCallback(() => {
    setDevMode(prev => ({
      ...prev,
      showNetworkMonitor: !prev.showNetworkMonitor
    }));
  }, []);

  const togglePerformanceMonitor = useCallback(() => {
    setDevMode(prev => ({
      ...prev,
      showPerformanceMonitor: !prev.showPerformanceMonitor
    }));
  }, []);

  const toggleConsoleMonitor = useCallback(() => {
    setDevMode(prev => ({
      ...prev,
      showConsoleMonitor: !prev.showConsoleMonitor
    }));
  }, []);

  const clearAllLogs = useCallback(() => {
    setDevMode(prev => ({
      ...prev,
      networkRequests: [],
      performanceMetrics: [],
      consoleLogs: []
    }));
    console.log('🧹 [Dev Mode] Todos os logs foram limpos');
  }, []);

  const addPerformanceMetric = useCallback((name: string, duration: number, type: PerformanceMetric['type'] = 'action') => {
    setDevMode(prev => ({
      ...prev,
      performanceMetrics: [
        {
          id: `perf-${Date.now()}-${Math.random()}`,
          name,
          duration,
          timestamp: Date.now(),
          type
        },
        ...prev.performanceMetrics.slice(0, prev.maxLogs - 1)
      ]
    }));
  }, []);

  const measurePerformance = useCallback(<T,>(name: string, fn: () => T | Promise<T>, type: PerformanceMetric['type'] = 'action'): Promise<T> => {
    return new Promise(async (resolve, reject) => {
      const startTime = performance.now();
      try {
        const result = await Promise.resolve(fn());
        const duration = performance.now() - startTime;
        addPerformanceMetric(name, duration, type);
        resolve(result);
      } catch (error) {
        const duration = performance.now() - startTime;
        addPerformanceMetric(`${name} (error)`, duration, type);
        reject(error);
      }
    });
  }, [addPerformanceMetric]);

  return {
    enabled: devMode.enabled,
    refreshKey: devMode.refreshKey,
    showNetworkMonitor: devMode.showNetworkMonitor,
    showPerformanceMonitor: devMode.showPerformanceMonitor,
    showConsoleMonitor: devMode.showConsoleMonitor,
    networkRequests: devMode.networkRequests,
    performanceMetrics: devMode.performanceMetrics,
    consoleLogs: devMode.consoleLogs,
    toggleDevMode,
    refreshAll,
    refreshComponent,
    getComponentKey,
    toggleNetworkMonitor,
    togglePerformanceMonitor,
    toggleConsoleMonitor,
    clearAllLogs,
    addPerformanceMetric,
    measurePerformance
  };
}

/**
 * Hook para componentes individuais receberem refresh
 */
export function useComponentRefresh(componentName: string, devMode: ReturnType<typeof useDevMode>) {
  const [localKey, setLocalKey] = useState(0);

  useEffect(() => {
    const componentKey = devMode.getComponentKey(componentName);
    setLocalKey(componentKey);
  }, [devMode.getComponentKey(componentName)]);

  return localKey;
}
