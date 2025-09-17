import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Row } from './Row';

/**
 * Entidade Batch - representa um lote/arquivo processado.
 * Cada Batch agrupa várias linhas (`Row`) que foram extraídas de um mesmo arquivo.
 */
@Entity()
export class Batch {
  /** Identificador único (UUID) do lote */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Origem do lote (ex: 'IHM', 'upload') */
  @Column()
  source!: string;

  /** Nome do arquivo original armazenado no backup */
  @Column()
  fileName!: string;

  /** Timestamp do arquivo (quando disponível) */
  @Column({ type: 'datetime', nullable: true })
  fileTimestamp!: Date | null;

  /** Quantidade de linhas presentes neste lote */
  @Column({ type: 'int', default: 0 })
  rowCount!: number;

  /** Metadados adicionais opcionais (armazenados como JSON) */
  @Column({ type: 'simple-json', nullable: true })
  meta!: any;

  /** Relação 1:N com as linhas (`Row`) pertencentes a este lote. */
  @OneToMany(() => Row as any, (r: any) => r.batch, { cascade: true })
  rows!: Row[];
}
