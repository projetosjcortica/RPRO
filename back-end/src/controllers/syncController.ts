import { Request, Response, NextFunction } from 'express';
import localBackupDb from '../services/localBackupDbService';
import dbService, { insertRelatorioRows } from '../services/dbService';

/**
 * Sincroniza registros armazenados no local backup (SQLite) para o banco principal.
 * Endpoint: POST /api/sync/local-to-main
 */
const syncController = {
  syncLocalToMain: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.body.limit || 500);
      const rows = await localBackupDb.listPendingForSync(limit);
      if (!rows || rows.length === 0) return res.json({ synced: 0 });

      // Transform rows to plain objects expected by dbService (they already match shape)
      const processedFile = 'local-backup-sync';
      await dbService.init();
      const inserted = await insertRelatorioRows(rows as any[], processedFile);

      // After successful insert, remove them from local backup
      const ids = (rows as any[]).map((r: any) => r.id).filter(Boolean);
      if (ids.length > 0) await localBackupDb.deleteByIds(ids as string[]);

      return res.json({ synced: Array.isArray(inserted) ? inserted.length : ids.length });
    } catch (e) {
      next(e);
    }
  }
};

export default syncController;
