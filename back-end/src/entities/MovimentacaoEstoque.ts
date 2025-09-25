import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MateriaPrima } from './MateriaPrima';

/**
 * Tipos de movimentação de estoque
 */
export enum TipoMovimentacao {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
  AJUSTE = 'ajuste',
  INVENTARIO = 'inventario'
}

/**
 * Entidade para registro de movimentações de estoque.
 * Registra entradas, saídas e ajustes de inventário.
 */
@Entity({ name: 'movimentacao_estoque' })
export class MovimentacaoEstoque {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => MateriaPrima)
  @JoinColumn({ name: 'materia_prima_id' })
  materiaPrima!: MateriaPrima;

  @Column({ type: 'varchar', length: 36 })
  materia_prima_id!: string;

  // Use varchar for portability: SQLite doesn't support enum types.
  // Keep the TypeScript enum for typing and use the enum values as defaults.
  @Column({ type: 'varchar', length: 20, default: TipoMovimentacao.ENTRADA })
  tipo!: TipoMovimentacao;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantidade!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantidade_anterior!: number;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantidade_atual!: number;

  @Column({ type: 'varchar', length: 20, default: 'kg' })
  unidade!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  documento_referencia?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  responsavel?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @CreateDateColumn()
  data_movimentacao!: Date;
}