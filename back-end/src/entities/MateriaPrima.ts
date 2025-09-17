import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entidade simples que mapeia a "máscara" das colunas de valores (Prod_1..Prod_40)
 * para um nome amigável (matéria-prima).
 * On db Example row: 1...40,	Sem Produto 1,	1 | 0
 * Columns:
 * - Num: int(11)
 * - Produto: varchar(30)
 * - Medida: int(11)
 */
@Entity({ name: 'materia_prima' })
export class MateriaPrima {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', unique: true })
  num!: number;

  @Column({ type: 'varchar', length: 30 })
  produto!: string;

  @Column({ type: 'int' })
  medida!: number;
}
