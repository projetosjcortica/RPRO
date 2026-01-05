/**
 * Activity Tracker - Sistema de rastreamento de todas as interações do usuário
 * 
 * Este módulo registra:
 * - Clicks em elementos
 * - Navegação entre páginas
 * - Requisições HTTP
 * - Eventos de formulário
 * - Erros
 * 
 * Os logs são armazenados localmente e podem ser exportados para análise.
 */

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'click' | 'navigation' | 'request' | 'form' | 'error' | 'action' | 'system';
  action: string;
  details?: string;
  target?: string;
  url?: string;
  method?: string;
  status?: number;
  duration?: number;
  userId?: number;
  username?: string;
}

const MAX_LOGS = 10000; // Máximo de logs em memória
const STORAGE_KEY = 'rpro_activity_logs';
const LOG_FILE_PREFIX = 'rpro_activity_';

class ActivityTracker {
  private logs: ActivityLog[] = [];
  private isInitialized = false;
  private userId?: number;
  private username?: string;
  private originalFetch: typeof fetch;
  private logBuffer: ActivityLog[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.originalFetch = window.fetch.bind(window);
    this.loadFromStorage();
  }

  /**
   * Inicializa o tracker com o usuário atual
   */
  init(userId?: number, username?: string) {
    if (this.isInitialized) return;
    
    this.userId = userId;
    this.username = username;
    this.isInitialized = true;

    // Interceptar fetch para logar requisições
    this.interceptFetch();

    // Interceptar clicks globais
    this.interceptClicks();

    // Interceptar erros
    this.interceptErrors();

    // Interceptar navegação
    this.interceptNavigation();

    // Log de inicialização
    this.log('system', 'Tracker inicializado', `Usuário: ${username || 'anônimo'}`);

    console.log('[ActivityTracker] Inicializado');
  }

  /**
   * Atualiza o usuário atual
   */
  setUser(userId?: number, username?: string) {
    this.userId = userId;
    this.username = username;
  }

  /**
   * Registra uma atividade
   */
  log(
    type: ActivityLog['type'],
    action: string,
    details?: string,
    extra?: Partial<ActivityLog>
  ) {
    const log: ActivityLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      action,
      details,
      userId: this.userId,
      username: this.username,
      ...extra,
    };

    this.logs.push(log);
    this.logBuffer.push(log);

    // Limitar tamanho do array
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }

    // Agendar flush para localStorage
    this.scheduleFlush();

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Activity] ${type}: ${action}`, details || '');
    }
  }

  /**
   * Agenda salvamento no localStorage
   */
  private scheduleFlush() {
    if (this.flushTimer) return;
    
    this.flushTimer = setTimeout(() => {
      this.saveToStorage();
      this.flushTimer = null;
      this.logBuffer = [];
    }, 5000); // Flush a cada 5 segundos
  }

  /**
   * Salva logs no localStorage
   */
  private saveToStorage() {
    try {
      // Salvar apenas os últimos 1000 logs no localStorage
      const recentLogs = this.logs.slice(-1000);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentLogs));
    } catch (e) {
      console.warn('[ActivityTracker] Erro ao salvar logs:', e);
    }
  }

  /**
   * Carrega logs do localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[ActivityTracker] Erro ao carregar logs:', e);
    }
  }

  /**
   * Intercepta todas as requisições fetch
   */
  private interceptFetch() {
    const self = this;
    
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
      const startTime = Date.now();
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
      const method = init?.method || 'GET';

      // Ignorar requisições de tracking para evitar loop infinito
      if (url.includes('/api/tracking')) {
        return self.originalFetch(input, init);
      }

      try {
        const response = await self.originalFetch(input, init);
        const duration = Date.now() - startTime;

        // Logar requisição bem sucedida
        self.log('request', `${method} ${new URL(url, window.location.origin).pathname}`, 
          `Status: ${response.status}, Duration: ${duration}ms`,
          { url, method, status: response.status, duration }
        );

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Logar erro de requisição
        self.log('request', `${method} ${new URL(url, window.location.origin).pathname} FAILED`,
          `Error: ${error instanceof Error ? error.message : String(error)}, Duration: ${duration}ms`,
          { url, method, status: 0, duration }
        );

        throw error;
      }
    };
  }

  /**
   * Intercepta clicks em elementos
   */
  private interceptClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      // Identificar elemento clicado
      const tagName = target.tagName?.toLowerCase() || 'unknown';
      const id = target.id ? `#${target.id}` : '';
      const classes = target.className && typeof target.className === 'string' 
        ? `.${target.className.split(' ').filter(c => c).slice(0, 2).join('.')}` 
        : '';
      const text = target.textContent?.slice(0, 30)?.trim() || '';
      const ariaLabel = target.getAttribute('aria-label') || '';
      
      // Montar descrição do elemento
      let elementDesc = tagName + id + classes;
      if (text) elementDesc += ` "${text}"`;
      if (ariaLabel) elementDesc += ` [${ariaLabel}]`;

      // Ignorar clicks em elementos muito genéricos
      if (tagName === 'div' && !id && !text && !ariaLabel) return;

      this.log('click', `Click em ${tagName}`, elementDesc, { target: elementDesc });
    }, { passive: true, capture: true });
  }

  /**
   * Intercepta erros JavaScript
   */
  private interceptErrors() {
    window.addEventListener('error', (e) => {
      this.log('error', 'Erro JavaScript', 
        `${e.message} at ${e.filename}:${e.lineno}:${e.colno}`
      );
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.log('error', 'Promise não tratada', 
        e.reason instanceof Error ? e.reason.message : String(e.reason)
      );
    });
  }

  /**
   * Intercepta navegação (History API)
   */
  private interceptNavigation() {
    // Interceptar pushState
    const originalPushState = history.pushState.bind(history);
    history.pushState = (...args) => {
      originalPushState(...args);
      this.log('navigation', 'Navegação', `Para: ${args[2] || window.location.pathname}`);
    };

    // Interceptar replaceState
    const originalReplaceState = history.replaceState.bind(history);
    history.replaceState = (...args) => {
      originalReplaceState(...args);
      this.log('navigation', 'Navegação (replace)', `Para: ${args[2] || window.location.pathname}`);
    };

    // Interceptar popstate (back/forward)
    window.addEventListener('popstate', () => {
      this.log('navigation', 'Navegação (back/forward)', `Para: ${window.location.pathname}`);
    });
  }

  /**
   * Retorna todos os logs
   */
  getLogs(): ActivityLog[] {
    return [...this.logs];
  }

  /**
   * Retorna logs filtrados
   */
  getFilteredLogs(filter: {
    type?: ActivityLog['type'];
    startDate?: string;
    endDate?: string;
    search?: string;
  }): ActivityLog[] {
    return this.logs.filter(log => {
      if (filter.type && log.type !== filter.type) return false;
      if (filter.startDate && log.timestamp < filter.startDate) return false;
      if (filter.endDate && log.timestamp > filter.endDate) return false;
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matches = 
          log.action.toLowerCase().includes(searchLower) ||
          log.details?.toLowerCase().includes(searchLower) ||
          log.target?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }
      return true;
    });
  }

  /**
   * Limpa os logs
   */
  clearLogs() {
    this.logs = [];
    localStorage.removeItem(STORAGE_KEY);
    this.log('system', 'Logs limpos', 'Todos os logs de atividade foram removidos');
  }

  /**
   * Exporta logs para arquivo
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Exporta logs para arquivo CSV
   */
  exportLogsCSV(): string {
    const headers = ['Timestamp', 'Tipo', 'Ação', 'Detalhes', 'Usuário', 'URL', 'Método', 'Status', 'Duração'];
    const rows = this.logs.map(log => [
      log.timestamp,
      log.type,
      log.action,
      log.details || '',
      log.username || '',
      log.url || '',
      log.method || '',
      log.status?.toString() || '',
      log.duration?.toString() || '',
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Baixa logs como arquivo
   */
  downloadLogs(format: 'json' | 'csv' = 'json') {
    const content = format === 'csv' ? this.exportLogsCSV() : this.exportLogs();
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
    const extension = format;
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${LOG_FILE_PREFIX}${new Date().toISOString().slice(0, 10)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Obtém estatísticas dos logs
   */
  getStats(): {
    total: number;
    byType: Record<string, number>;
    last24h: number;
    lastHour: number;
  } {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

    const byType: Record<string, number> = {};
    let last24h = 0;
    let lastHour = 0;

    for (const log of this.logs) {
      byType[log.type] = (byType[log.type] || 0) + 1;
      if (log.timestamp >= oneDayAgo) last24h++;
      if (log.timestamp >= oneHourAgo) lastHour++;
    }

    return {
      total: this.logs.length,
      byType,
      last24h,
      lastHour,
    };
  }
}

// Instância singleton
export const activityTracker = new ActivityTracker();

// Expor no window para acesso via console do DevTools
if (typeof window !== 'undefined') {
  (window as any).activityTracker = activityTracker;
  (window as any).viewLogs = () => {
    console.table(activityTracker.getLogs().slice(-50));
    console.log('📊 Use activityTracker.getLogs() para ver todos os logs');
    console.log('📊 Use activityTracker.getStats() para estatísticas');
    console.log('📊 Use activityTracker.downloadLogs("json") ou downloadLogs("csv") para exportar');
    return `Total de logs: ${activityTracker.getLogs().length}`;
  };
  (window as any).exportLogs = (format: 'json' | 'csv' = 'json') => {
    activityTracker.downloadLogs(format);
    return `Exportando logs em formato ${format}...`;
  };
  console.log('🔍 [ActivityTracker] Comandos disponíveis no console:');
  console.log('   - viewLogs()      → Ver últimos 50 logs');
  console.log('   - exportLogs()    → Baixar logs como JSON');
  console.log('   - exportLogs("csv") → Baixar logs como CSV');
  console.log('   - activityTracker.getStats() → Ver estatísticas');
}

// Helper para logar ações manualmente
export function trackAction(action: string, details?: string) {
  activityTracker.log('action', action, details);
}

// Helper para logar eventos de formulário
export function trackForm(action: string, formName: string, details?: string) {
  activityTracker.log('form', `${action}: ${formName}`, details);
}

// Helper para logar eventos do sistema
export function trackSystem(action: string, details?: string) {
  activityTracker.log('system', action, details);
}

export default activityTracker;
