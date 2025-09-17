/**
 * Controller com helpers para paginação e endpoints legados relacionados à tabela `relatorio`.
 */

import { Request, Response, NextFunction } from 'express'; // ignore lint error 
import { AppDataSource } from '../services/dbService';
import dbService from '../services/dbService';
// import dbController from './dbController';
import { Relatorio } from '../entities/Relatorio';

/**
 * Helper function to query rows from the `relatorio` table and map them to the API response format.
 * @param {number} page - The current page number for pagination.
 * @param {number} pageSize - The number of records per page.
 * @returns {Promise<{ rows: any[], total: number }>} - An object containing the mapped rows and the total record count.
 */
async function queryDbRows(
  page: number,
  pageSize: number,
  filters: { formula?: string | null; dateStart?: string | null; dateEnd?: string | null; sortBy?: string | null; sortDir?: 'ASC' | 'DESC' }
) {
  await dbService.init();
  const repo = AppDataSource.getRepository(Relatorio);

  // Validate sort column against a whitelist to avoid injection
  const allowedSortColumns = new Set([
    'Dia',
    'Hora',
    'Nome',
    'Form1',
    'Form2',
    'processedFile'
  ]);
  const sortBy = filters.sortBy && allowedSortColumns.has(filters.sortBy) ? filters.sortBy : 'Dia';
  const sortDir = filters.sortDir === 'ASC' ? 'ASC' : 'DESC';

  const qb = repo.createQueryBuilder('r');

  // Apply formula filter (matches Nome or processedFile or exact Form1/Form2 if numeric)
  if (filters.formula) {
    const f = filters.formula.trim();
    // Filter by `Nome` only (partial match)
    qb.andWhere('r.Nome LIKE :q', { q: `%${f}%` });
  }

  // Apply date range filter (dates expected as YYYY-MM-DD)
  if (filters.dateStart) {
    qb.andWhere('r.Dia >= :ds', { ds: filters.dateStart });
  }
  if (filters.dateEnd) {
    qb.andWhere('r.Dia <= :de', { de: filters.dateEnd });
  }

  qb.orderBy(`r.${sortBy}`, sortDir).addOrderBy('r.Hora', sortDir);

  const [items, total] = await qb.skip((page - 1) * pageSize).take(pageSize).getManyAndCount();

  const rows = items.map((it: any) => {
    const values: Array<number | null> = [];
    for (let i = 1; i <= 40; i++) {
      const v = (it as any)[`Prod_${i}`];
      values.push(v == null ? null : Number(v));
    }
    return {
      Dia: it.Dia || null,
      Hora: it.Hora || null,
      Nome: it.Nome || null,
      Form1: it.Form1 != null ? Number(it.Form1) : null,
      Form2: it.Form2 != null ? Number(it.Form2) : null,
      values,
      processedFile: (it as any).processedFile || null,
    };
  });

  return { rows, total };
}

// Controlador para paginação de dados
const paginateController = {
  /**
   * Legacy endpoint to fetch paginated data from the database.
   * @route GET /data
   */
  paginate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page || 1)); // Determine the current page
      const pageSize = Math.max(1, Number(req.query.qtdPag || (req.query.pageSize as any) || 300)); // Determine the page size
      const filters = {
        formula: (req.query.formula as any) || null,
        dateStart: (req.query.dateStart as any) || null,
        dateEnd: (req.query.dateEnd as any) || null,
        sortBy: (req.query.sortBy as any) || null,
        sortDir: ((req.query.sortDir as any) === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC',
      };
      try {
        const { rows, total } = await queryDbRows(page, pageSize, filters);
        res.json({ page, pageSize, rows, total });
      } catch (e) {
        next(e);
      }
    } catch (err) {
      next(err); // Pass the error to the error-handling middleware
    }
  }
};

export default paginateController;
