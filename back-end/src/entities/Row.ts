import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Batch } from './Batch';

/**
 * Entidade Row - representa uma linha individual pertencente a um Batch.
 * Contém datetime, label, valores numéricos e referências ao lote pai.
 */
@Entity()
export class Row {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Relação ManyToOne apontando para o Batch que contém esta linha */
  @ManyToOne(() => Batch as any, (b: any) => b.rows)
  batch!: Batch;

  /** Data e hora associadas à linha (quando disponíveis) */
  @Column({ type: 'datetime', nullable: true })
  datetime!: Date | null;

  /** Rótulo/nome da linha */
  @Column({ type: 'varchar', nullable: true })
  Nome!: string | null;
 
  @Column({ name: 'Código Fórmula', type: 'int', nullable: true })
  Form1!: number | null;
 
  @Column({ name: 'Número Fórmula', type: 'int', nullable: true })
  Form2!: number | null;

  /** Valores numéricos restantes da linha, armazenados como JSON */
  @Column({ type: 'simple-json', nullable: true })
  values!: number[] | null;
}
