import { Express } from 'express';
import { setRuntimeConfigs, getRuntimeConfig } from '../core/runtimeConfig';

/**
 * Configuration routes
 */
export function configRoutes(app: Express): void {
  /**
   * GET /api/config - Retorna todas as configurações runtime
   */
  app.get('/api/config', (req, res) => {
    try {
      const allConfigs: Record<string, any> = {};
      // Não há método para obter todas as configs, então retornamos as mais comuns
      const commonKeys = ['ip', 'user', 'password', 'poll_interval_ms', 'ihm-config', 'granja', 'nomeCliente'];
      commonKeys.forEach(k => {
        const val = getRuntimeConfig(k);
        if (val !== null && val !== undefined) {
          allConfigs[k] = val;
        }
      });
      return res.json(allConfigs);
    } catch (e: any) {
      console.error('[api/config] error:', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });

  /**
   * POST /api/config - Atualiza configurações runtime
   */
  app.post('/api/config', async (req, res) => {
    try {
      const payload = req.body || {};
      await setRuntimeConfigs(payload);
      return res.json({ ok: true });
    } catch (e: any) {
      console.error('[api/config] error:', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });
}
