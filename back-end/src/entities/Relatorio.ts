import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'relatorio' })
export class Relatorio {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 10, nullable: true }) Dia!: string | null;
  @Column({ type: 'time', nullable: true }) Hora!: string | null;
  @Column({ type: 'varchar', length: 30, nullable: true }) Nome!: string | null;
  @Column({ type: 'int', default: 0 }) Form1!: number;
  @Column({ type: 'int', default: 0 }) Form2!: number;
  @Column({ type: 'int', default: 0 }) Prod_1!: number;
  @Column({ type: 'int', default: 0 }) Prod_2!: number;
  @Column({ type: 'int', default: 0 }) Prod_3!: number;
  @Column({ type: 'int', default: 0 }) Prod_4!: number;
  @Column({ type: 'int', default: 0 }) Prod_5!: number;
  @Column({ type: 'int', default: 0 }) Prod_6!: number;
  @Column({ type: 'int', default: 0 }) Prod_7!: number;
  @Column({ type: 'int', default: 0 }) Prod_8!: number;
  @Column({ type: 'int', default: 0 }) Prod_9!: number;
  @Column({ type: 'int', default: 0 }) Prod_10!: number;
  @Column({ type: 'int', default: 0 }) Prod_11!: number;
  @Column({ type: 'int', default: 0 }) Prod_12!: number;
  @Column({ type: 'int', default: 0 }) Prod_13!: number;
  @Column({ type: 'int', default: 0 }) Prod_14!: number;
  @Column({ type: 'int', default: 0 }) Prod_15!: number;
  @Column({ type: 'int', default: 0 }) Prod_16!: number;
  @Column({ type: 'int', default: 0 }) Prod_17!: number;
  @Column({ type: 'int', default: 0 }) Prod_18!: number;
  @Column({ type: 'int', default: 0 }) Prod_19!: number;
  @Column({ type: 'int', default: 0 }) Prod_20!: number;
  @Column({ type: 'int', default: 0 }) Prod_21!: number;
  @Column({ type: 'int', default: 0 }) Prod_22!: number;
  @Column({ type: 'int', default: 0 }) Prod_23!: number;
  @Column({ type: 'int', default: 0 }) Prod_24!: number;
  @Column({ type: 'int', default: 0 }) Prod_25!: number;
  @Column({ type: 'int', default: 0 }) Prod_26!: number;
  @Column({ type: 'int', default: 0 }) Prod_27!: number;
  @Column({ type: 'int', default: 0 }) Prod_28!: number;
  @Column({ type: 'int', default: 0 }) Prod_29!: number;
  @Column({ type: 'int', default: 0 }) Prod_30!: number;
  @Column({ type: 'int', default: 0 }) Prod_31!: number;
  @Column({ type: 'int', default: 0 }) Prod_32!: number;
  @Column({ type: 'int', default: 0 }) Prod_33!: number;
  @Column({ type: 'int', default: 0 }) Prod_34!: number;
  @Column({ type: 'int', default: 0 }) Prod_35!: number;
  @Column({ type: 'int', default: 0 }) Prod_36!: number;
  @Column({ type: 'int', default: 0 }) Prod_37!: number;
  @Column({ type: 'int', default: 0 }) Prod_38!: number;
  @Column({ type: 'int', default: 0 }) Prod_39!: number;
  @Column({ type: 'int', default: 0 }) Prod_40!: number;
  
  @Column({ type: 'varchar', length: 255, nullable: true }) processedFile!: string | null;
  
  // Propriedade para indexação dinâmica
  [key: string]: any;
}
