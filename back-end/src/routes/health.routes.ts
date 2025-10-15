import { Express } from 'express';
import { AppDataSource, dbService } from '../services/dbService';
import { Relatorio } from '../entities';

/**
 * Health check routes
 */
export function healthRoutes(app: Express): void {
  /**
   * GET /api/ping - Health check básico
   */
  app.get('/api/ping', async (req, res) => {
    try {
      return res.json({ pong: true, ts: new Date().toISOString() });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'internal' });
    }
  });

  /**
   * GET /api/db/status - Status da conexão com banco de dados
   */
  app.get('/api/db/status', async (req, res) => {
    try {
      await dbService.init();
      const repo = AppDataSource.getRepository(Relatorio);
      const count = await repo.count();
      return res.json({
        status: 'connected',
        isInitialized: AppDataSource.isInitialized,
        relatorioCount: count,
        ts: new Date().toISOString(),
      });
    } catch (e: any) {
      console.error('[db/status] Error:', e);
      return res.status(500).json({
        status: 'error',
        error: e?.message || 'internal',
        isInitialized: AppDataSource.isInitialized,
        ts: new Date().toISOString(),
      });
    }
  });
}
