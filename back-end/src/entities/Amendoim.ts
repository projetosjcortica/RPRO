import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

/**
 * Entity para registros de pesagem de amendoim.
 * Estrutura do CSV: Dia, Hora, ?, ?, Código Produto, Nome Produto, ?, ?, Peso, ?, Balanca
 * Sistema suporta dois tipos de registro: entrada (pré-debulhamento) e saída (pós-debulhamento)
 * 
 * NOTA: Campo codigoCaixa mantido por compatibilidade do banco de dados,
 * mas o sistema agora usa apenas codigoProduto (código de caixa foi descontinuado).
 */
@Entity("amendoim")
@Index(["dia", "hora"]) // Índice composto para busca por data/hora
@Index(["codigoProduto"]) // Índice para busca por produto
@Index(["tipo"]) // Índice para filtrar por tipo (entrada/saida)
@Index(["tipo", "dia"]) // Índice composto para métricas por período
@Index("unique_record", ["tipo", "dia", "hora", "codigoProduto", "peso"], { unique: true }) // PROTEÇÃO CONTRA DUPLICATAS
export class Amendoim {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Tipo de registro: entrada (pré-debulhamento) ou saida (pós-debulhamento) */
  @Column({ type: "varchar", length: 10, default: "entrada" })
  tipo!: "entrada" | "saida";

  /** Data da pesagem no formato DD-MM-YY */
  @Column({ type: "varchar", length: 10 })
  dia!: string;

  /** Hora da pesagem no formato HH:MM:SS */
  @Column({ type: "varchar", length: 8 })
  hora!: string;

  /** Código do produto (ex: 789, 123, 456) */
  @Column({ type: "varchar", length: 50 })
  codigoProduto!: string;

  /** @deprecated Código da caixa (descontinuado - mantido por compatibilidade DB) */
  @Column({ type: "varchar", length: 50 })
  codigoCaixa!: string;

  /** Nome do produto (ex: "Amendoim", "Amendoim 20/30") */
  @Column({ type: "varchar", length: 255 })
  nomeProduto!: string;

  /** Peso em gramas ou kg (conforme CSV) */
  @Column({ type: "decimal", precision: 10, scale: 3 })
  peso!: number;

  /** Identificador da balança (ex: 1, 2, 3, 9) */
  @Column({ type: "varchar", length: 10, nullable: true })
  balanca?: string;

  /** Data de criação do registro no banco */
  @CreateDateColumn()
  createdAt!: Date;
}
