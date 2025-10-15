import { Express } from 'express';
import { healthRoutes } from './health.routes';
import { collectorRoutes } from './collector.routes';
import { relatorioRoutes } from './relatorio.routes';
import { materiaPrimaRoutes } from './materiaPrima.routes';
import { userRoutes } from './user.routes';
import { configRoutes } from './config.routes';
import { databaseRoutes } from './database.routes';

/**
 * Registra todas as rotas da aplicação
 */
export function registerRoutes(app: Express): void {
  // Health check routes
  healthRoutes(app);
  
  // Collector routes
  collectorRoutes(app);
  
  // Relatório routes
  relatorioRoutes(app);
  
  // Matéria Prima routes
  materiaPrimaRoutes(app);
  
  // User routes
  userRoutes(app);
  
  // Config routes
  configRoutes(app);
  
  // Database routes
  databaseRoutes(app);
}
