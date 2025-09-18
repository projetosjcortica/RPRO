import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Batch } from './Batch';

@Entity()
export class Row {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Batch, (b) => b.rows)
  batch!: Batch;
  @Column({ type: 'datetime', nullable: true }) datetime!: Date | null;
  @Column({ type: 'varchar', nullable: true }) Nome!: string | null;
  @Column({ name: 'Código Fórmula', type: 'int', nullable: true }) Form1!: number | null;
  @Column({ name: 'Número Fórmula', type: 'int', nullable: true }) Form2!: number | null;
  @Column({ type: 'simple-json', nullable: true }) values!: number[] | null;
}
