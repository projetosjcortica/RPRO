import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'materia_prima' })
export class MateriaPrima {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'int', unique: true }) num!: number;
  @Column({ type: 'varchar', length: 30, default: 'Sem Produto'}) produto!: string;
  @Column({ type: 'int', default: 1}) medida!: number;
  @Column({ type: 'boolean', default: true }) ativo!: boolean;
}

/* e aqui que os produtos são definidos por coluna (num), nome (varchar) e tipo (1[kilos] ou 0[gramas]) */
