import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('amendoim_raw')
export class AmendoimRaw {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 10, default: 'entrada' })
  tipo!: 'entrada' | 'saida';

  @Column({ type: 'varchar', length: 10 })
  dia!: string;

  @Column({ type: 'varchar', length: 8 })
  hora!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigoProduto!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigoCaixa!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomeProduto!: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  peso!: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  balanca?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sourceIhm?: string;

  @Column({ type: 'text', nullable: true })
  rawLine?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
