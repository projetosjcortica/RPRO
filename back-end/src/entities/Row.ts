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
  label!: string | null;

  /**
   * Valor numérico correspondente ao primeiro formulário (Form1 no DB oficial).
   * Mantemos o nome da propriedade `group` no código para compatibilidade, mas
   * mapeamos a coluna para `Form1` explicitamente para coincidir com o esquema
   * do banco oficial.
   */
  @Column({ name: 'Form1', type: 'int', nullable: true })
  group!: number | null;

  /**
   * Valor numérico correspondente ao segundo formulário (Form2 no DB oficial).
   * Propriedade em código: `flag` (mantida por compatibilidade).
   */
  @Column({ name: 'Form2', type: 'int', nullable: true })
  flag!: number | null;

  /** Valores numéricos restantes da linha, armazenados como JSON */
  @Column({ type: 'simple-json', nullable: true })
  values!: number[] | null;
}
