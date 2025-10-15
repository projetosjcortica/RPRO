import { Express } from 'express';
import { getCollectorStatus, startCollector, stopCollector } from '../services/collectorService';

/**
 * Collector control routes
 */
export function collectorRoutes(app: Express): void {
  /**
   * GET /api/collector/status - Retorna o status do collector
   */
  app.get('/api/collector/status', (req, res) => {
    try {
      const status = getCollectorStatus();
      return res.json(status);
    } catch (e: any) {
      console.error('[collector/status] error:', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });

  /**
   * POST /api/collector/start - Inicia o collector
   */
  app.post('/api/collector/start', async (req, res) => {
    try {
      const { ip, user, password } = req.body || {};
      const result = await startCollector({ ip, user, password });
      return res.json(result);
    } catch (e: any) {
      console.error('[collector/start] error:', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });

  /**
   * POST /api/collector/stop - Para o collector
   */
  app.post('/api/collector/stop', async (req, res) => {
    try {
      const result = await stopCollector();
      return res.json(result);
    } catch (e: any) {
      console.error('[collector/stop] error:', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });
}
