import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Row } from './row';

@Entity()
export class Batch {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() source!: string;
  @Column() fileName!: string;
  @Column({ type: 'datetime', nullable: true }) fileTimestamp!: Date | null;
  @Column({ type: 'int', default: 0 }) rowCount!: number;
  @Column({ type: 'simple-json', nullable: true }) meta!: any;
  @OneToMany(() => Row, (r) => r.batch, { cascade: true })
  rows!: Row[];
}
