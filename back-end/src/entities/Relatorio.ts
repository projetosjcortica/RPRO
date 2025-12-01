import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'relatorio' })
@Index(['Dia', 'Hora'])
@Index(['Nome'])
@Index(['Form1']) // Codigo
@Index(['Form2']) // Numero
export class Relatorio {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 10, nullable: true }) Dia!: string | null;
  @Column({ type: 'time', nullable: true }) Hora!: string | null;
  @Column({ type: 'varchar', length: 255, nullable: true }) Nome!: string | null;
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
  @Column({ type: 'int', default: 0 }) Prod_41!: number;
  @Column({ type: 'int', default: 0 }) Prod_42!: number;
  @Column({ type: 'int', default: 0 }) Prod_43!: number;
  @Column({ type: 'int', default: 0 }) Prod_44!: number;
  @Column({ type: 'int', default: 0 }) Prod_45!: number;
  @Column({ type: 'int', default: 0 }) Prod_46!: number;
  @Column({ type: 'int', default: 0 }) Prod_47!: number;
  @Column({ type: 'int', default: 0 }) Prod_48!: number;
  @Column({ type: 'int', default: 0 }) Prod_49!: number;
  @Column({ type: 'int', default: 0 }) Prod_50!: number;
  @Column({ type: 'int', default: 0 }) Prod_51!: number;
  @Column({ type: 'int', default: 0 }) Prod_52!: number;
  @Column({ type: 'int', default: 0 }) Prod_53!: number;
  @Column({ type: 'int', default: 0 }) Prod_54!: number;
  @Column({ type: 'int', default: 0 }) Prod_55!: number;
  @Column({ type: 'int', default: 0 }) Prod_56!: number;
  @Column({ type: 'int', default: 0 }) Prod_57!: number;
  @Column({ type: 'int', default: 0 }) Prod_58!: number;
  @Column({ type: 'int', default: 0 }) Prod_59!: number;
  @Column({ type: 'int', default: 0 }) Prod_60!: number;
  @Column({ type: 'int', default: 0 }) Prod_61!: number;
  @Column({ type: 'int', default: 0 }) Prod_62!: number;
  @Column({ type: 'int', default: 0 }) Prod_63!: number;
  @Column({ type: 'int', default: 0 }) Prod_64!: number;
  @Column({ type: 'int', default: 0 }) Prod_65!: number;
  
  @Column({ type: 'varchar', length: 255, nullable: true }) processedFile!: string | null;
  
  // Propriedade para indexação dinâmica
  [key: string]: any;
}
