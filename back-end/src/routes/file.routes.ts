import { Express } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { backupSvc } from '../services/backupService';
import { parserService } from '../services/parserService';
import { dbService } from '../services/dbService';

const TMP_DIR = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
const upload = multer({ dest: TMP_DIR });

export function fileRoutes(app: Express): void {
  // POST /api/file/upload
  app.post('/api/file/upload', upload.single('file'), async (req: any, res) => {
    try {
      const f = req.file;
      if (!f)
        return res
          .status(400)
          .json({ error: 'file is required (field name: file)' });
      const savedPath = f.path || (f.destination ? path.join(f.destination, f.filename) : null);
      if (!savedPath || !fs.existsSync(savedPath))
        return res.status(500).json({ error: 'uploaded file not found on server' });

      const meta = await backupSvc.backupFile({
        originalname: f.originalname || f.filename,
        path: savedPath,
        size: f.size,
      });
      const parsed = await parserService.processFile(savedPath);
      if (parsed.rows && parsed.rows.length > 0) {
        await dbService.insertRelatorioRows(
          parsed.rows as any[],
          meta.workPath || meta.backupPath || path.basename(savedPath)
        );
      }
      return res.json({
        ok: true,
        meta,
        processed: {
          rowsCount: parsed.rows.length,
          processedPath: parsed.processedPath,
        },
      });
    } catch (e: any) {
      console.error('[api/file/upload] error:', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });
}
