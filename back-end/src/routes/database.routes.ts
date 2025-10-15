import { Express } from 'express';
import { dbService } from '../services/dbService';
import { cacheService } from '../services/CacheService';

/**
 * Database management routes
 */
export function databaseRoutes(app: Express): void {
  /**
   * POST /api/db/clear - Limpa todo o banco de dados
   */
  app.post('/api/db/clear', async (req, res) => {
    try {
      await dbService.init();
      await dbService.clearAll();
      return res.json({ ok: true });
    } catch (e: any) {
      console.error('[api/db/clear] error', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });

  /**
   * POST /api/database/clean - Compatibilidade: limpa banco e cache
   */
  app.post('/api/database/clean', async (req, res) => {
    try {
      await dbService.clearAll();
      await cacheService.clearAll();
      return res.json({ ok: true });
    } catch (e: any) {
      console.error('[api/database/clean] error', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });

  /**
   * GET /api/db/dump - Exporta dump do banco como JSON
   */
  app.get('/api/db/dump', async (req, res) => {
    try {
      await dbService.init();
      const result = await dbService.exportDump(true);
      return res.json({
        ok: true,
        savedPath: result.savedPath,
        meta: result.dump._meta,
      });
    } catch (e: any) {
      console.error('[api/db/dump] error', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });

  /**
   * POST /api/db/import - Importa dump do banco (JSON)
   */
  app.post('/api/db/import', async (req, res) => {
    try {
      const dumpObj = req.body;
      if (!dumpObj) return res.status(400).json({ error: 'dump body required' });
      await dbService.init();
      const result = await dbService.importDump(dumpObj);
      return res.json({ ok: true, ...result });
    } catch (e: any) {
      console.error('[api/db/import] error', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });

  /**
   * POST /api/db/import-legacy - Upload e importa dump SQL com suporte a formatos legados
   */
  const multer = require('multer');
  const dumpUpload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
  });

  app.post('/api/db/import-legacy', dumpUpload.single('dump'), async (req: any, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const { dumpConverterService } = await import('../services/dumpConverterService');
      
      const TMP_DIR = path.resolve(process.cwd(), 'tmp');
      if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

      if (!req.file) {
        return res.status(400).json({ error: 'No dump file uploaded' });
      }

      console.log(`[api/db/import-legacy] Received file: ${req.file.originalname}, size: ${(req.file.size / 1024).toFixed(2)} KB`);

      // Check if file has legacy dates
      const originalContent = req.file.buffer.toString('utf-8');
      const hadLegacyDates = dumpConverterService.hasLegacyDates(originalContent);

      let finalContent = originalContent;
      let convertedSizes = {
        originalSize: req.file.size,
        convertedSize: req.file.size
      };
      let warnings: string[] = [];

      // Convert legacy dates if detected
      if (hadLegacyDates) {
        console.log('[api/db/import-legacy] Legacy dates detected, converting...');
        const converted = dumpConverterService.convertDumpFromBuffer(
          req.file.buffer,
          req.file.originalname
        );
        finalContent = converted.convertedContent;
        convertedSizes = {
          originalSize: converted.originalSize,
          convertedSize: converted.convertedSize
        };
      } else {
        console.log('[api/db/import-legacy] No legacy dates detected, importing as-is');
      }

      // Sanitize dump for compatibility
      const sanitized = dumpConverterService.sanitizeDump(finalContent);
      finalContent = sanitized.sanitized;
      warnings = sanitized.warnings;
      
      if (warnings.length > 0) {
        console.log('[api/db/import-legacy] Dump sanitized with warnings:', warnings);
      }

      // Save dump to temporary file for import
      const tmpDumpPath = path.join(TMP_DIR, `import_${Date.now()}.sql`);
      fs.writeFileSync(tmpDumpPath, finalContent, 'utf-8');

      console.log(`[api/db/import-legacy] Dump saved to: ${tmpDumpPath}`);

      // Get import options from query params
      const clearBefore = req.query.clearBefore === 'true';
      const skipCreateTable = req.query.skipCreateTable === 'true';

      // Execute SQL dump using dbService
      await dbService.init();
      
      const result = await dbService.executeSqlFile(tmpDumpPath, {
        failOnError: false,
        clearBefore,
        skipCreateTable
      });

      // Clean up temporary file
      try {
        fs.unlinkSync(tmpDumpPath);
      } catch (e) {
        console.warn(`[api/db/import-legacy] Failed to delete temp file: ${tmpDumpPath}`, e);
      }

      return res.json({
        ok: true,
        message: 'Dump importado com sucesso',
        hadLegacyDates,
        originalSize: convertedSizes.originalSize,
        convertedSize: convertedSizes.convertedSize,
        dateConversionApplied: hadLegacyDates,
        clearBefore,
        skipCreateTable,
        warnings,
        result
      });
    } catch (e: any) {
      console.error('[api/db/import-legacy] error', e);
      return res.status(500).json({ 
        error: e?.message || 'Erro ao importar dump',
        details: e?.stack 
      });
    }
  });

  /**
   * GET /api/db/export-sql - Exporta banco como arquivo SQL
   */
  app.get('/api/db/export-sql', async (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      await dbService.init();
      
      console.log('[api/db/export-sql] Generating SQL dump...');
      
      const result = await dbService.exportSqlDump();
      
      console.log(`[api/db/export-sql] Dump generated: ${result.filePath}, ${(result.size / 1024).toFixed(2)} KB`);

      // Read the file and send it as download
      const fileContent = fs.readFileSync(result.filePath, 'utf-8');
      const filename = path.basename(result.filePath);

      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', result.size);
      
      return res.send(fileContent);
    } catch (e: any) {
      console.error('[api/db/export-sql] error', e);
      return res.status(500).json({ 
        error: e?.message || 'Erro ao exportar dump',
        details: e?.stack 
      });
    }
  });

  /**
   * POST /api/cache/clear - Limpa cache do cacheService
   */
  app.post('/api/cache/clear', async (req, res) => {
    try {
      await cacheService.clearAll();
      return res.json({ ok: true });
    } catch (e: any) {
      console.error('[api/cache/clear] error', e);
      return res.status(500).json({ error: e?.message || 'internal' });
    }
  });
}
