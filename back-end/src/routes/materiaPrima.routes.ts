import { Express } from 'express';
import { materiaPrimaService } from '../services/materiaPrimaService';

/**
 * Rotas de Matéria-Prima
 */
export function materiaPrimaRoutes(app: Express): void {
  // GET /api/materiaprima/labels
  app.get('/api/materiaprima/labels', async (req, res) => {
    try {
      const materias = await materiaPrimaService.getAll();
      const mapping: any = {};
      const colOffset = 5; // Prod_1 -> col6
      for (const m of materias) {
        if (!m) continue;
        const num = typeof m.num === 'number' ? m.num : Number(m.num);
        if (Number.isNaN(num)) continue;
        const colKey = `col${num + colOffset}`;
        mapping[colKey] = {
          produto: m.produto ?? `Produto ${num}`,
          medida: typeof m.medida === 'number' ? m.medida : m.medida ? Number(m.medida) : 1,
        };
      }
      return res.json(mapping);
    } catch (e) {
      console.error('[materiaprima/labels] error', e);
      return res.status(500).json({});
    }
  });
}
