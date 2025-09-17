import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entidade Relatorio - representa uma linha de relatório extraída do CSV.
 * Campos Prod_1..Prod_40 mapeiam valores numéricos variáveis do CSV.
 */
@Entity({ name: 'relatorio' })
export class Relatorio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Dia no formato string (ex: '2025-09-11') */
  @Column({ type: 'varchar', length: 10, nullable: true })
  Dia!: string | null;

  /** Hora no formato HH:MM:SS */
  @Column({ type: 'time', nullable: true })
  Hora!: string | null;

  /** Nome/etiqueta da linha */
  @Column({ type: 'varchar', length: 30, nullable: true })
  Nome!: string | null;

  /** Formulário 1 (valor numérico) */
  @Column({ type: 'int', nullable: true })
  Form1!: number | null;

  /** Formulário 2 (valor numérico) */
  @Column({ type: 'int', nullable: true })
  Form2!: number | null;

  // Prod_1 .. Prod_40
  @Column({ type: 'int', nullable: true })
  Prod_1!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_2!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_3!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_4!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_5!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_6!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_7!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_8!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_9!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_10!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_11!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_12!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_13!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_14!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_15!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_16!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_17!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_18!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_19!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_20!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_21!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_22!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_23!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_24!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_25!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_26!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_27!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_28!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_29!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_30!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_31!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_32!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_33!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_34!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_35!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_36!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_37!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_38!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_39!: number | null;
  @Column({ type: 'int', nullable: true })
  Prod_40!: number | null;

  /** Nome do arquivo que gerou esta linha (útil para auditoria) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  processedFile!: string | null;
}
