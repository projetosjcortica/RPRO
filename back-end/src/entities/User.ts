import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  // Plain-text password (per user request). WARNING: storing plain passwords is insecure.
  @Column()
  password!: string;

  @Column({ default: false })
  isAdmin!: boolean;

  // Optional display name and photo path (stored relative to server data dir)
  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true, type: 'text' })
  photoPath?: string;

}
