import { Express } from 'express';
import path from 'path';
import fs from 'fs';
import { IHMService } from '../services/IHMService';
import { backupSvc } from '../services/backupService';
import { parserService } from '../services/parserService';

export function ihmRoutes(app: Express): void {
  // GET /api/ihm/fetchLatest
  app.get('/api/ihm/fetchLatest', async (req, res) => {
    try {
      const ip = String(req.query.ip || '');
      const user = String(req.query.user || 'anonymous');
      const password = String(req.query.password || '');
      if (!ip) return res.status(400).json({ error: 'ip is required' });
      const tmpDir = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const ihm = new IHMService(ip, user, password);
      const downloaded = await ihm.findAndDownloadNewFiles(tmpDir);
      if (!downloaded || downloaded.length === 0)
        return res.json({ ok: true, message: 'Nenhum CSV novo encontrado' });
      const result = downloaded[0];
      const fileStat = fs.statSync(result.localPath);
      const fileObj: any = {
        originalname: result.name,
        path: result.localPath,
        mimetype: 'text/csv',
        size: fileStat.size,
      };
      const meta = await backupSvc.backupFile(fileObj);
      const processed = await parserService.processFile(
        meta.workPath || meta.backupPath
      );
      return res.json({ meta, processed });
    } catch (e: any) {
      console.error('[api/ihm/fetchLatest] error', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });
}
