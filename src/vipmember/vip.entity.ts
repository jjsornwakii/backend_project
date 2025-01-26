import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Car } from '../car/car.entity';

@Entity('vipmember')
export class VipMember {
  @PrimaryGeneratedColumn()
  vip_member_id: number;

  @Column({ 
    type: 'character varying',
    length: 255 
  })
  fname: string;

  @Column({ 
    type: 'character varying',
    length: 255 
  })
  lname: string;

  @Column({ 
    type: 'character varying',
    length: 15 
  })
  tel: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp' })
  expire_date: Date;


  // เพิ่มความสัมพันธ์แบบ One-to-Many
  @OneToMany(() => Car, (car) => car.vipMember)
  cars: Car[];
}
