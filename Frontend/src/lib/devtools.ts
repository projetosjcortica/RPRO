/**
 * Utilitários para integração com DevTools
 * Permite adicionar métricas de performance facilmente
 */

let devModeInstance: any = null;

export function setDevModeInstance(instance: any) {
  devModeInstance = instance;
}

export function getDevModeInstance() {
  return devModeInstance;
}

/**
 * Wrapper para funções que adiciona medição de performance automática
 */
export function withPerformance<T extends (...args: any[]) => any>(
  name: string,
  fn: T,
  type: 'render' | 'api' | 'action' = 'action'
): T {
  return ((...args: any[]) => {
    const devMode = getDevModeInstance();
    
    if (devMode?.enabled && devMode?.showPerformanceMonitor) {
      return devMode.measurePerformance(name, () => fn(...args), type);
    }
    
    return fn(...args);
  }) as T;
}

/**
 * Hook para medir performance de useEffect
 */
export function measureEffect(name: string, callback: () => void | Promise<void>, type: 'render' | 'api' | 'action' = 'render') {
  const devMode = getDevModeInstance();
  
  if (devMode?.enabled && devMode?.showPerformanceMonitor) {
    const startTime = performance.now();
    const result = callback();
    
    if (result instanceof Promise) {
      result.then(() => {
        const duration = performance.now() - startTime;
        devMode.addPerformanceMetric(name, duration, type);
      });
    } else {
      const duration = performance.now() - startTime;
      devMode.addPerformanceMetric(name, duration, type);
    }
  } else {
    callback();
  }
}

/**
 * Decorator para classes
 */
export function WithPerformanceMonitoring(className: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        const devMode = getDevModeInstance();
        
        if (devMode?.enabled && devMode?.showPerformanceMonitor) {
          const startTime = performance.now();
          super(...args);
          const duration = performance.now() - startTime;
          devMode.addPerformanceMetric(`${className} Constructor`, duration, 'render');
        } else {
          super(...args);
        }
      }
    };
  };
}

/**
 * Log personalizado que aparece no DevTools Console Monitor
 */
export function devLog(message: string, type: 'log' | 'warn' | 'error' | 'info' = 'log') {
  // Sempre logar no console real
  console[type](message);
  
  // Se DevTools estiver ativo e console monitor ativo, já será capturado automaticamente
  // Este helper é apenas para facilitar o uso
}

/**
 * Medir tempo de execução manualmente
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;
  private type: 'render' | 'api' | 'action';
  
  constructor(name: string, type: 'render' | 'api' | 'action' = 'action') {
    this.name = name;
    this.type = type;
    this.startTime = performance.now();
  }
  
  end() {
    const duration = performance.now() - this.startTime;
    const devMode = getDevModeInstance();
    
    if (devMode?.enabled && devMode?.showPerformanceMonitor) {
      devMode.addPerformanceMetric(this.name, duration, this.type);
    }
    
    return duration;
  }
}

/**
 * Exemplo de uso:
 * 
 * // 1. Wrapper de função
 * const fetchData = withPerformance('Fetch Data', async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * }, 'api');
 * 
 * // 2. Timer manual
 * const timer = new PerformanceTimer('Complex Calculation');
 * // ... código complexo ...
 * timer.end();
 * 
 * // 3. Em useEffect
 * useEffect(() => {
 *   measureEffect('Load Component', () => {
 *     // lógica de inicialização
 *   }, 'render');
 * }, []);
 */
