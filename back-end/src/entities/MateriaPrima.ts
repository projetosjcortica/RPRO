import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'materia_prima' })
export class MateriaPrima {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'int', unique: true }) num!: number;
  @Column({ type: 'varchar', length: 30 }) produto!: string;
  @Column({ type: 'int' }) medida!: number;
}
