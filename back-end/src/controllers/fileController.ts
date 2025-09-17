/**
 * Controller responsável pelo upload e processamento de arquivos enviados manualmente via API.
 * Realiza backup do arquivo e, se for CSV, processa e retorna os dados normalizados.
 * @module fileController
 */

import { Request, Response, NextFunction } from 'express';
import BackupService from '../services/backupService';
import parserService from '../services/parserService';
import * as path from 'path';

// Controlador para operações com arquivos
const fileController = {
  /**
   * Endpoint para upload de arquivo.
   * Realiza backup do arquivo enviado e, se for CSV, processa e retorna os dados.
   * @function uploadFile
   * @param {Request} req - Requisição Express contendo o arquivo
   * @param {Response} res - Resposta Express
   * @param {NextFunction} next - Próxima função middleware
   * @returns {Promise<Response>} - Resposta JSON com metadados e dados processados
   */
  uploadFile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Obtém o arquivo enviado pelo usuário
      const file = (req as any).file;
      if (!file) {
        const err = new Error('Nenhum arquivo enviado');
        (err as any).status = 400;
        throw err;
      }
      const backupService = new BackupService();
      // Realiza backup do arquivo
      const meta = await backupService.backupFile(file);
      // Verifica se o arquivo é CSV
      const ext = path.extname(meta.originalName).toLowerCase();
      if (ext === '.csv' || file.mimetype === 'text/csv') {
        // Processa o arquivo CSV e retorna os dados normalizados
        const csvPath = meta.workPath || meta.backupPath;
        const processed = await parserService.processFile(csvPath);
        return res.json({ meta, processed });
      }
      // Retorna apenas os metadados se não for CSV
      res.json({ meta });
    } catch (error) {
      next(error);
    }
  },
};

export default fileController;
