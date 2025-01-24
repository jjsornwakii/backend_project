import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  admin_id: number;

  @Column()
  admin_name: string;

  @Column()
  admin_password: string;

  @Column()
  admin_username: string;
}
