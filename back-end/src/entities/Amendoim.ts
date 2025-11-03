import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

/**
 * Entity para registros de pesagem de amendoim.
 * Estrutura do CSV: Dia, Hora, ?, Código Produto, Código Caixa, Nome Produto, ?, ?, Peso, ?, Número Balança
 */
@Entity("amendoim")
@Index(["dia", "hora"]) // Índice composto para busca por data/hora
@Index(["codigoProduto"]) // Índice para busca por produto
@Index(["codigoCaixa"]) // Índice para busca por caixa
export class Amendoim {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Data da pesagem no formato DD-MM-YY */
  @Column({ type: "varchar", length: 10 })
  dia!: string;

  /** Hora da pesagem no formato HH:MM:SS */
  @Column({ type: "varchar", length: 8 })
  hora!: string;

  /** Código do produto (ex: 789, 123, 456) */
  @Column({ type: "varchar", length: 50 })
  codigoProduto!: string;

  /** Código da caixa (ex: 1, 2, 3) */
  @Column({ type: "varchar", length: 50 })
  codigoCaixa!: string;

  /** Nome do produto (ex: "Amendoim", "Amendoim 20/30") */
  @Column({ type: "varchar", length: 255 })
  nomeProduto!: string;

  /** Peso em gramas ou kg (conforme CSV) */
  @Column({ type: "decimal", precision: 10, scale: 3 })
  peso!: number;

  /** Número da balança utilizada */
  @Column({ type: "varchar", length: 10 })
  numeroBalanca!: string;

  /** Data de criação do registro no banco */
  @CreateDateColumn()
  createdAt!: Date;
}
