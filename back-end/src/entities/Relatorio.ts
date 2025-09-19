import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'relatorio' })
export class Relatorio {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 10 }) Dia!: string | null;
  @Column({ type: 'time' }) Hora!: string | null;
  @Column({ type: 'varchar', length: 30 }) Nome!: string | null;
  @Column({ type: 'int' }) Form1!: number   | 0;
  @Column({ type: 'int' }) Form2!: number   | 0;
  @Column({ type: 'int' }) Prod_1!: number  | 0;
  @Column({ type: 'int' }) Prod_2!: number  | 0;
  @Column({ type: 'int' }) Prod_3!: number  | 0;
  @Column({ type: 'int' }) Prod_4!: number  | 0;
  @Column({ type: 'int' }) Prod_5!: number  | 0;
  @Column({ type: 'int' }) Prod_6!: number  | 0;
  @Column({ type: 'int' }) Prod_7!: number  | 0;
  @Column({ type: 'int' }) Prod_8!: number  | 0;
  @Column({ type: 'int' }) Prod_9!: number  | 0;
  @Column({ type: 'int' }) Prod_10!: number | 0;
  @Column({ type: 'int' }) Prod_11!: number | 0;
  @Column({ type: 'int' }) Prod_12!: number | 0;
  @Column({ type: 'int' }) Prod_13!: number | 0;
  @Column({ type: 'int' }) Prod_14!: number | 0;
  @Column({ type: 'int' }) Prod_15!: number | 0;
  @Column({ type: 'int' }) Prod_16!: number | 0;
  @Column({ type: 'int' }) Prod_17!: number | 0;
  @Column({ type: 'int' }) Prod_18!: number | 0;
  @Column({ type: 'int' }) Prod_19!: number | 0;
  @Column({ type: 'int' }) Prod_20!: number | 0;
  @Column({ type: 'int' }) Prod_21!: number | 0;
  @Column({ type: 'int' }) Prod_22!: number | 0;
  @Column({ type: 'int' }) Prod_23!: number | 0;
  @Column({ type: 'int' }) Prod_24!: number | 0;
  @Column({ type: 'int' }) Prod_25!: number | 0;
  @Column({ type: 'int' }) Prod_26!: number | 0;
  @Column({ type: 'int' }) Prod_27!: number | 0;
  @Column({ type: 'int' }) Prod_28!: number | 0;
  @Column({ type: 'int' }) Prod_29!: number | 0;
  @Column({ type: 'int' }) Prod_30!: number | 0;
  @Column({ type: 'int' }) Prod_31!: number | 0;
  @Column({ type: 'int' }) Prod_32!: number | 0;
  @Column({ type: 'int' }) Prod_33!: number | 0;
  @Column({ type: 'int' }) Prod_34!: number | 0;
  @Column({ type: 'int' }) Prod_35!: number | 0;
  @Column({ type: 'int' }) Prod_36!: number | 0;
  @Column({ type: 'int' }) Prod_37!: number | 0;
  @Column({ type: 'int' }) Prod_38!: number | 0;
  @Column({ type: 'int' }) Prod_39!: number | 0;
  @Column({ type: 'int' }) Prod_40!: number | 0;
  
  @Column({ type: 'varchar', length: 255, nullable: true }) processedFile!: string | null;
  
  // Propriedade para indexação dinâmica
  [key: string]: any;
}
