import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'cache_file' })
export class CacheFile {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 255 }) originalName!: string;
  @Column({ type: 'varchar', length: 64, nullable: true }) lastHash!: string | null;
  @Column({ type: 'varchar', length: 32, nullable: true }) lastLineHash!: string | null; // Hash da última linha processada
  @Column({ type: 'int', nullable: true }) lastSize!: number | null;
  @Column({ type: 'varchar', length: 32, nullable: true }) lastMTime!: string | null;
  @Column({ type: 'varchar', length: 32, nullable: true }) lastRowDia!: string | null;
  @Column({ type: 'varchar', length: 16, nullable: true }) lastRowHora!: string | null;
  @Column({ type: 'varchar', length: 40, nullable: true }) lastRowTimestamp!: string | null;
  @Column({ type: 'int', nullable: true }) lastRowCount!: number | null;
  @Column({ type: 'varchar', length: 40, nullable: true }) lastProcessedAt!: string | null;
  @Column({ type: 'int', nullable: true }) ingestedRows!: number | null;
}
