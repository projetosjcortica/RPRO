import fs from 'fs';
import path from 'path';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: {
    endpoint?: string;
    method?: string;
    userId?: string;
    duration?: number;
    ip?: string;
  };
}

const LOG_COLORS = {
  DEBUG: '\x1b[36m',   // Cyan
  INFO: '\x1b[32m',    // Green
  WARN: '\x1b[33m',    // Yellow
  ERROR: '\x1b[31m',   // Red
  FATAL: '\x1b[35m',   // Magenta
  RESET: '\x1b[0m'
};

class BackendLogger {
  private logsDir: string;
  private currentLogFile: string;
  private writeStream: fs.WriteStream | null = null;
  private minLevel: LogLevel = 'DEBUG';
  private logToConsole: boolean = true;
  private logToFile: boolean = true;
  private buffer: string[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private maxBufferSize = 100;
  
  private levelPriority: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
  };

  constructor() {
    this.logsDir = path.resolve(process.cwd(), 'logs');
    
    // Criar diretório se não existir
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    
    this.currentLogFile = this.getLogFileName();
    this.initializeStream();
    
    // Flush buffer a cada 5 segundos
    this.flushInterval = setInterval(() => this.flushBuffer(), 5000);
    
    // Flush on exit
    process.on('beforeExit', () => this.close());
    process.on('SIGINT', () => this.close());
    process.on('SIGTERM', () => this.close());
  }

  private getLogFileName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return path.join(this.logsDir, `backend_${year}-${month}-${day}.log`);
  }

  private initializeStream(): void {
    try {
      if (this.writeStream) {
        this.writeStream.end();
      }
      this.writeStream = fs.createWriteStream(this.currentLogFile, { flags: 'a' });
      this.writeStream.on('error', (err) => {
        console.error('[BackendLogger] Write stream error:', err);
        this.logToFile = false;
      });
    } catch (err) {
      console.error('[BackendLogger] Failed to initialize stream:', err);
      this.logToFile = false;
    }
  }

  private checkRotateLog(): void {
    const newLogFile = this.getLogFileName();
    if (newLogFile !== this.currentLogFile) {
      this.flushBuffer();
      this.currentLogFile = newLogFile;
      this.initializeStream();
    }
  }

  private formatForConsole(entry: LogEntry): string {
    const color = LOG_COLORS[entry.level];
    const reset = LOG_COLORS.RESET;
    const time = entry.timestamp.split('T')[1].replace('Z', '');
    let msg = `${color}[${entry.level}]${reset} ${time} [${entry.category}] ${entry.message}`;
    
    if (entry.error) {
      msg += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack && (entry.level === 'ERROR' || entry.level === 'FATAL')) {
        msg += `\n  Stack: ${entry.error.stack.split('\n').slice(1, 4).join('\n        ')}`;
      }
    }
    
    if (entry.data && Object.keys(entry.data).length > 0) {
      const dataStr = JSON.stringify(entry.data);
      if (dataStr.length < 200) {
        msg += ` | Data: ${dataStr}`;
      }
    }
    
    return msg;
  }

  private formatForFile(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private flushBuffer(): void {
    if (this.buffer.length === 0 || !this.logToFile) return;
    
    this.checkRotateLog();
    
    if (this.writeStream && this.writeStream.writable) {
      const content = this.buffer.join('\n') + '\n';
      this.writeStream.write(content);
      this.buffer = [];
    }
  }

  private write(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    // Console output
    if (this.logToConsole) {
      console.log(this.formatForConsole(entry));
    }

    // File output (buffered)
    if (this.logToFile) {
      this.buffer.push(this.formatForFile(entry));
      
      // Flush immediately on error/fatal or if buffer is full
      if (entry.level === 'ERROR' || entry.level === 'FATAL' || this.buffer.length >= this.maxBufferSize) {
        this.flushBuffer();
      }
    }
  }

  // ============ PUBLIC API ============

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  enableConsole(enable: boolean): void {
    this.logToConsole = enable;
  }

  enableFile(enable: boolean): void {
    this.logToFile = enable;
  }

  debug(category: string, message: string, data?: any): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      category,
      message,
      data
    });
  }

  info(category: string, message: string, data?: any): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category,
      message,
      data
    });
  }

  warn(category: string, message: string, data?: any): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      category,
      message,
      data
    });
  }

  error(category: string, message: string, error?: Error | unknown, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      category,
      message,
      data
    };

    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else if (error) {
      entry.error = {
        name: 'Unknown',
        message: String(error)
      };
    }

    this.write(entry);
  }

  fatal(category: string, message: string, error?: Error | unknown, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'FATAL',
      category,
      message,
      data
    };

    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    } else if (error) {
      entry.error = {
        name: 'Unknown',
        message: String(error)
      };
    }

    this.write(entry);
  }

  /**
   * Log HTTP request
   */
  request(method: string, endpoint: string, statusCode: number, duration: number, data?: any): void {
    const level: LogLevel = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';
    
    this.write({
      timestamp: new Date().toISOString(),
      level,
      category: 'HTTP',
      message: `${method} ${endpoint} ${statusCode} (${duration}ms)`,
      data,
      context: {
        endpoint,
        method,
        duration
      }
    });
  }

  /**
   * Log database operation
   */
  db(operation: string, table: string, duration?: number, data?: any): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      category: 'DB',
      message: `${operation} on ${table}${duration ? ` (${duration}ms)` : ''}`,
      data
    });
  }

  /**
   * Log service operation
   */
  service(serviceName: string, operation: string, data?: any): void {
    this.write({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: serviceName,
      message: operation,
      data
    });
  }

  /**
   * Get recent logs (last N entries from current file)
   */
  async getRecentLogs(count: number = 100): Promise<LogEntry[]> {
    try {
      this.flushBuffer();
      
      if (!fs.existsSync(this.currentLogFile)) {
        return [];
      }

      const content = fs.readFileSync(this.currentLogFile, 'utf-8');
      const lines = content.trim().split('\n').filter(l => l);
      const recentLines = lines.slice(-count);
      
      return recentLines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { timestamp: '', level: 'INFO' as LogLevel, category: 'PARSE', message: line };
        }
      });
    } catch (err) {
      console.error('[BackendLogger] Failed to read logs:', err);
      return [];
    }
  }

  /**
   * Get logs by level
   */
  async getLogsByLevel(level: LogLevel, count: number = 50): Promise<LogEntry[]> {
    const logs = await this.getRecentLogs(500);
    return logs.filter(l => l.level === level).slice(-count);
  }

  /**
   * Get error logs
   */
  async getErrors(count: number = 50): Promise<LogEntry[]> {
    const logs = await this.getRecentLogs(500);
    return logs.filter(l => l.level === 'ERROR' || l.level === 'FATAL').slice(-count);
  }

  /**
   * Get log file paths
   */
  getLogFiles(): string[] {
    try {
      const files = fs.readdirSync(this.logsDir);
      return files
        .filter(f => f.startsWith('backend_') && f.endsWith('.log'))
        .map(f => path.join(this.logsDir, f))
        .sort()
        .reverse();
    } catch {
      return [];
    }
  }

  /**
   * Clean old log files (keep last N days)
   */
  cleanOldLogs(keepDays: number = 30): number {
    try {
      const files = this.getLogFiles();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepDays);
      
      let deleted = 0;
      for (const file of files) {
        const stats = fs.statSync(file);
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(file);
          deleted++;
        }
      }
      
      if (deleted > 0) {
        this.info('Logger', `Cleaned ${deleted} old log files`);
      }
      
      return deleted;
    } catch (err) {
      this.error('Logger', 'Failed to clean old logs', err);
      return 0;
    }
  }

  close(): void {
    this.flushBuffer();
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = null;
    }
  }
}

// Singleton instance
export const logger = new BackendLogger();

// Convenience exports
export const log = {
  debug: (category: string, message: string, data?: any) => logger.debug(category, message, data),
  info: (category: string, message: string, data?: any) => logger.info(category, message, data),
  warn: (category: string, message: string, data?: any) => logger.warn(category, message, data),
  error: (category: string, message: string, error?: Error | unknown, data?: any) => logger.error(category, message, error, data),
  fatal: (category: string, message: string, error?: Error | unknown, data?: any) => logger.fatal(category, message, error, data),
  request: (method: string, endpoint: string, statusCode: number, duration: number, data?: any) => logger.request(method, endpoint, statusCode, duration, data),
  db: (operation: string, table: string, duration?: number, data?: any) => logger.db(operation, table, duration, data),
  service: (serviceName: string, operation: string, data?: any) => logger.service(serviceName, operation, data)
};
