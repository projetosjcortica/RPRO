import { BaseService } from '../core/baseService';
import { MateriaPrima } from '../entities/MateriaPrima';
import { AppDataSource, dbService } from './dbService';

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
      // Remover a categoria se estiver definida
      const { categoria, ...rest } = item as any;
      
      // Garantir que o valor de medida seja apenas 0 (gramas) ou 1 (kg)
      const medida = item.medida === 0 ? 0 : 1;
      
      return { ...rest, medida };
    });
    
    return repo.save(processedItems);
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