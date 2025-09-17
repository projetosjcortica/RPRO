/**
 * Controller para operações simples relacionadas a batches (lotes) armazenados no banco.
 */

import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../services/dbService';
import { Batch } from '../entities/Batch';
import { MateriaPrima } from '../entities/MateriaPrima';

// Controlador para operações no banco de dados
const dbController = {
  /**
   * Lista batches (lotes) com paginação.
   *
   * @async
   * @function listBatches
   * @param {Request} req - Requisição Express, espera query params `page` e `pageSize`.
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erro.
   * @returns {void} Retorna um JSON com os batches paginados e metadados.
   * @example
   * // GET /batches?page=1&pageSize=50
   * {
   *   "items": [...],
   *   "total": 100,
   *   "page": 1,
   *   "pageSize": 50
   * }
   */
  listBatches: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page || 1));
      const pageSize = Math.max(1, Number(req.query.pageSize || 50));

      if (!AppDataSource.isInitialized) await AppDataSource.initialize();
      const repo = AppDataSource.getRepository(Batch);
      const [items, total] = await repo.findAndCount({ skip: (page - 1) * pageSize, take: pageSize });
      res.json({ items, total, page, pageSize });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Realiza o setup da tabela de matéria-prima.
   *
   * @async
   * @function setupMateriaPrima
   * @param {Request} req - Requisição Express, espera um array de objetos no corpo:
   *   [
   *     { num: number, produto: string, medida: number },
   *     ...
   *   ]
   * @param {Response} res - Resposta Express.
   * @param {NextFunction} next - Função para tratamento de erro.
   * @returns {void} Retorna status 201 e o array salvo.
   * @example
   * // POST /api/materiaprima
   * [
   *   { "num": 1, "produto": "Sem Produto 1", "medida": 1 },
   *   { "num": 2, "produto": "Sem Produto 2", "medida": 1 }
   * ]
   */
  setupMateriaPrima: async (req: Request, res: Response, next: NextFunction) => {
    let queryRunner;
    try {
      if (!AppDataSource.isInitialized) await AppDataSource.initialize();
      queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      req.body = req.body as { num: number; produto: string; medida: number }[];
      const repo = queryRunner.manager.getRepository(MateriaPrima);
      await repo.save(req.body);
      await queryRunner.commitTransaction();
      res.status(201).json(req.body);
    } catch (err) {
      if (queryRunner) await queryRunner.rollbackTransaction();
      next(err);
    } finally {
      if (queryRunner) await queryRunner.release();
    }
  }

};

export default dbController;
