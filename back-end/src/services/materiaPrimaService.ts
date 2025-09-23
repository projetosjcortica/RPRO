import { BaseService } from '../core/baseService';
import { MateriaPrima } from '../entities/MateriaPrima';
import { AppDataSource, dbService } from './dbService';
import { In } from 'typeorm';

export class MateriaPrimaService extends BaseService {
  constructor() {
    super('MateriaPrimaService');
  }

  async getAll(): Promise<MateriaPrima[]> {
    await dbService.init();
    const repo = AppDataSource.getRepository(MateriaPrima);
    return repo.find({
      order: {
        num: 'ASC'
      }
    });
  }

  async saveMany(items: Partial<MateriaPrima>[]): Promise<MateriaPrima[]> {
    await dbService.init();
    const repo = AppDataSource.getRepository(MateriaPrima);

    // Processar cada item antes de salvar
    const processedItems = items.map(item => {
      const { categoria, ...rest } = item as any;
      const medida = item.medida === 0 ? 0 : 1;
      // Coerce num to number when possible
      if (rest.num !== undefined && rest.num !== null) rest.num = Number(rest.num);
      return { ...rest, medida };
    });

    // Deduplicate incoming items by `num` (keep last occurrence) to avoid attempting
    // multiple inserts with the same unique `num` in a single save operation.
    const dedupMap = new Map<number, Partial<MateriaPrima>>();
    for (const p of processedItems) {
      const n = p.num !== undefined && p.num !== null ? Number(p.num) : NaN;
      if (!Number.isFinite(n)) continue;
      dedupMap.set(n, p);
    }
    const dedupedItems = Array.from(dedupMap.values());

    // Collect numeric nums to check existing records and avoid duplicate unique-key errors
    const nums = dedupedItems.map(p => Number(p.num)).filter(n => Number.isFinite(n)) as number[];

    const existing: MateriaPrima[] = nums.length > 0 ? await repo.find({ where: { num: In(nums) } }) : [];
    const existingByNum = new Map<number, MateriaPrima>();
    for (const e of existing) existingByNum.set(e.num, e);

    const toSave: Partial<MateriaPrima>[] = [];
    for (const p of dedupedItems) {
      const n = p.num !== undefined && p.num !== null ? Number(p.num) : NaN;
      if (!Number.isFinite(n)) {
        console.warn('[MateriaPrimaService] skipping item with invalid num', p);
        continue;
      }

      if (existingByNum.has(n)) {
        // merge into existing record (will perform update because id is present)
        const existingRec = existingByNum.get(n)!;
        toSave.push({ ...existingRec, ...p });
      } else {
        toSave.push(p);
      }
    }

    try {
      return await repo.save(toSave as any);
    } catch (err) {
      console.error('[MateriaPrimaService] failed to save items', err);
      throw err;
    }
  }
  
  /**
   * Converte um valor com base na unidade de medida da matéria prima
   * @param valorOriginal O valor original
   * @param materia A matéria prima com informação de medida
   * @returns O valor convertido
   */
  convertValue(valorOriginal: number, materia: MateriaPrima): number {
    // Se for gramas (medida = 0), divide por 1000 para converter para kg
    if (materia.medida === 0) {
      return valorOriginal / 1000;
    }
    
    // Se já estiver em kg, retorna o valor original
    return valorOriginal;
  }
  
  /**
   * Obtém a unidade de medida como string
   * @param materia A matéria prima
   * @returns A unidade de medida (g ou kg)
   */
  getUnidade(materia: MateriaPrima): string {
    return materia.medida === 0 ? 'g' : 'kg';
  }
}

export const materiaPrimaService = new MateriaPrimaService();