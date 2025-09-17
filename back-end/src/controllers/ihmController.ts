/**
 * Controller para endpoints relacionados ao IHM (coleta manual de arquivos via FTP).
 */

import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import IHMService from '../services/IHMService';
import BackupService from '../services/backupService';
import parserService from '../services/parserService';
import * as fs from 'fs';

// Controlador para operações relacionadas ao IHM
const ihmController = {
  /**
   * Endpoint que solicita ao IHM o arquivo CSV mais recente e o processa.
   * Recebe no body: { ip, user?, password? }
   */
  fetchLatestFromIHM: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ip, user = 'anonymous', password = '' } = req.body as any;
      if (!ip) {
        const err = new Error('ip é obrigatório');
        (err as any).status = 400;
        throw err;
      }

      const tmpDir = path.resolve(process.cwd(), process.env.COLLECTOR_TMP || 'tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const ihm = new IHMService(ip, user, password);
    const downloaded = await ihm.findAndDownloadNewFiles(tmpDir);
    if (!downloaded || downloaded.length === 0) return res.json({ message: 'nenhum csv encontrado' });

    const result = downloaded[0];
    if (!result) {
      return res.status(404).json({ message: 'Arquivo não encontrado após download.' });
    }
    const downloadedPath = result.localPath;
    const fileStat = fs.statSync(downloadedPath);
    const fileObj: any = { originalname: result.name, path: downloadedPath, mimetype: 'text/csv', size: fileStat.size };

    // Faz backup do arquivo baixado e processa o CSV
    const backupSvc = new BackupService();

      // Faz backup do arquivo baixado e processa o CSV
      const meta = await backupService.backupFile(fileObj);
      const csvPath = meta.workPath || meta.backupPath;
      const processed = await parserService.processFile(csvPath);

      res.json({ meta, processed });
    } catch (error) {
      next(error);
    }
  },
  list: async (req: Request, res: Response) => {
    try {
      const ihmService = new IHMService(
        process.env.IHM_HOST || '',
        process.env.IHM_USER || '',
        process.env.IHM_PASS || ''
      );
      const files = await ihmService.listFiles();
      res.json({ files });
    } catch (error) {
      res.status(500).send('Erro ao listar arquivos do IHM');
    }
  },
};

export default ihmController;

// Corrigir a declaração de backupService
const backupService = new BackupService();
