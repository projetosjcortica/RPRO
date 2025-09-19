import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MateriaPrima } from './MateriaPrima';

/**
 * Entidade para gerenciamento de estoque de matérias-primas.
 * Armazena informações sobre quantidade disponível, mínima e máxima.
 */
@Entity({ name: 'estoque' })
export class Estoque {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => MateriaPrima)
  @JoinColumn({ name: 'materia_prima_id' })
  materiaPrima!: MateriaPrima;

  @Column({ type: 'varchar', length: 36 })
  materia_prima_id!: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantidade!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantidade_minima!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  quantidade_maxima!: number;

  @Column({ type: 'varchar', length: 20, default: 'kg' })
  unidade!: string;

  @Column({ type: 'boolean', default: true })
  ativo!: boolean;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  localizacao?: string;

  @CreateDateColumn()
  criado_em!: Date;

  @UpdateDateColumn()
  atualizado_em!: Date;
}