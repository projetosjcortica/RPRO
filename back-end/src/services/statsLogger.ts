import fs from 'fs';
import path from 'path';

interface StatsEntry {
  timestamp: string;
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  filters?: any;
  resultCount?: number;
  cacheHit?: boolean;
  error?: string;
  userAgent?: string;
  ip?: string;
}

export class StatsLogger {
  private logsDir: string;
  private currentLogFile: string;
  private writeStream: fs.WriteStream | null = null;
  
  constructor(logsDir = 'logs') {
    this.logsDir = path.resolve(process.cwd(), logsDir);
    
    // Criar diretório de logs se não existir
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    
    // Definir arquivo de log atual
    this.currentLogFile = this.getLogFileName();
    this.initializeStream();
  }
  
  private getLogFileName(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return path.join(this.logsDir, `stats_${year}-${month}-${day}.jsonl`);
  }
  
  private initializeStream(): void {
    try {
      this.writeStream = fs.createWriteStream(this.currentLogFile, { flags: 'a' });
    } catch (err) {
      console.error('[StatsLogger] Failed to initialize write stream:', err);
    }
  }
  
  private checkRotateLog(): void {
    const newLogFile = this.getLogFileName();
    if (newLogFile !== this.currentLogFile) {
      // Rotacionar para novo arquivo
      if (this.writeStream) {
        this.writeStream.end();
      }
      this.currentLogFile = newLogFile;
      this.initializeStream();
    }
  }
  
  /**
   * Registra estatísticas de uma requisição
   */
  log(entry: StatsEntry): void {
    try {
      this.checkRotateLog();
      
      if (!this.writeStream) {
        this.initializeStream();
      }
      
      if (this.writeStream && this.writeStream.writable) {
        const line = JSON.stringify(entry) + '\n';
        this.writeStream.write(line);
      }
    } catch (err) {
      console.error('[StatsLogger] Failed to write log:', err);
    }
  }
  
  /**
   * Lê estatísticas de um período
   */
  readStats(options: {
    startDate?: Date;
    endDate?: Date;
    endpoint?: string;
    limit?: number;
  } = {}): StatsEntry[] {
    const entries: StatsEntry[] = [];
    
    try {
      // Listar todos os arquivos de log no período
      const files = fs.readdirSync(this.logsDir)
        .filter(f => f.startsWith('stats_') && f.endsWith('.jsonl'))
        .sort()
        .reverse();
      
      for (const file of files) {
        const filePath = path.join(this.logsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
          try {
            const entry: StatsEntry = JSON.parse(line);
            
            // Aplicar filtros
            if (options.startDate && new Date(entry.timestamp) < options.startDate) continue;
            if (options.endDate && new Date(entry.timestamp) > options.endDate) continue;
            if (options.endpoint && entry.endpoint !== options.endpoint) continue;
            
            entries.push(entry);
            
            // Limitar resultados
            if (options.limit && entries.length >= options.limit) {
              return entries;
            }
          } catch (parseErr) {
            // Ignorar linhas malformadas
          }
        }
      }
    } catch (err) {
      console.error('[StatsLogger] Failed to read stats:', err);
    }
    
    return entries;
  }
  
  /**
   * Calcula métricas agregadas
   */
  getMetrics(entries: StatsEntry[]): {
    totalRequests: number;
    avgDuration: number;
    medianDuration: number;
    minDuration: number;
    maxDuration: number;
    errorRate: number;
    cacheHitRate: number;
    requestsByEndpoint: Record<string, number>;
    avgResultCount: number;
  } {
    if (entries.length === 0) {
      return {
        totalRequests: 0,
        avgDuration: 0,
        medianDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        errorRate: 0,
        cacheHitRate: 0,
        requestsByEndpoint: {},
        avgResultCount: 0
      };
    }
    
    const durations = entries.map(e => e.duration).sort((a, b) => a - b);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const errors = entries.filter(e => e.error || e.statusCode >= 400).length;
    const cacheHits = entries.filter(e => e.cacheHit === true).length;
    const resultCounts = entries.filter(e => e.resultCount != null).map(e => e.resultCount!);
    
    const requestsByEndpoint: Record<string, number> = {};
    for (const entry of entries) {
      requestsByEndpoint[entry.endpoint] = (requestsByEndpoint[entry.endpoint] || 0) + 1;
    }
    
    return {
      totalRequests: entries.length,
      avgDuration: totalDuration / entries.length,
      medianDuration: durations[Math.floor(durations.length / 2)],
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      errorRate: (errors / entries.length) * 100,
      cacheHitRate: (cacheHits / entries.length) * 100,
      requestsByEndpoint,
      avgResultCount: resultCounts.length > 0 
        ? resultCounts.reduce((sum, c) => sum + c, 0) / resultCounts.length 
        : 0
    };
  }
  
  /**
   * Limpa logs antigos (mantém apenas últimos N dias)
   */
  cleanup(daysToKeep = 30): void {
    try {
      const files = fs.readdirSync(this.logsDir)
        .filter(f => f.startsWith('stats_') && f.endsWith('.jsonl'));
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      for (const file of files) {
        // Extrair data do nome do arquivo
        const match = file.match(/stats_(\d{4})-(\d{2})-(\d{2})\.jsonl/);
        if (match) {
          const [, year, month, day] = match;
          const fileDate = new Date(Number(year), Number(month) - 1, Number(day));
          
          if (fileDate < cutoffDate) {
            const filePath = path.join(this.logsDir, file);
            fs.unlinkSync(filePath);
            console.log(`[StatsLogger] Removed old log file: ${file}`);
          }
        }
      }
    } catch (err) {
      console.error('[StatsLogger] Failed to cleanup logs:', err);
    }
  }
  
  /**
   * Fecha o stream de escrita
   */
  close(): void {
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = null;
    }
  }
}

// Singleton instance
export const statsLogger = new StatsLogger();

// Middleware Express para logging automático
export function statsMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();
  
  // Capturar resposta
  const originalSend = res.send;
  const originalJson = res.json;
  
  let resultCount: number | undefined;
  
  res.send = function(data: any) {
    try {
      // Tentar extrair contagem de resultados
      if (typeof data === 'string') {
        const parsed = JSON.parse(data);
        if (parsed.rows) resultCount = parsed.rows.length;
        if (parsed.total) resultCount = parsed.total;
      }
    } catch (e) {
      // Ignorar erros de parsing
    }
    return originalSend.call(this, data);
  };
  
  res.json = function(data: any) {
    try {
      if (data.rows) resultCount = data.rows.length;
      if (data.total) resultCount = data.total;
    } catch (e) {
      // Ignorar
    }
    return originalJson.call(this, data);
  };
  
  // Ao finalizar resposta
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    const entry: StatsEntry = {
      timestamp: new Date().toISOString(),
      endpoint: req.path,
      method: req.method,
      duration,
      statusCode: res.statusCode,
      filters: req.query || req.body,
      resultCount,
      cacheHit: res.locals?.cacheHit,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress
    };
    
    // Só logar endpoints relevantes (não assets estáticos)
    if (!req.path.includes('.') && req.path.startsWith('/api')) {
      statsLogger.log(entry);
    }
  });
  
  next();
}

// Cleanup automático diário
setInterval(() => {
  statsLogger.cleanup(30);
}, 24 * 60 * 60 * 1000); // A cada 24 horas
