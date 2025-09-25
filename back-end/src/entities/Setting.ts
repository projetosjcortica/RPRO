import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryColumn()
  key!: string;

  // Use TEXT instead of default varchar(255) so large JSON blobs can be stored
  // without causing ER_DATA_TOO_LONG errors when saving big configs.
  @Column({ type: 'text' })
  value!: string;
}
