import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { VipMember } from '../vipmember/vip.entity';

@Entity('car')
export class Car {
  @PrimaryGeneratedColumn()
  car_id: number;

  @Column({ 
    length: 20,
    unique: true 
  })
  licenseplate: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // ความสัมพันธ์แบบ Many-to-One กับ VipMember
  @ManyToOne(() => VipMember, (vipMember) => vipMember.cars, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'vip_member_id' }) // ระบุชื่อคอลัมน์ในฐานข้อมูล
  vipMember: VipMember;

  @Column({ 
    nullable: true,
    name: 'vip_member_id'
  })
  vip_member_id: number; // คอลัมน์สำหรับเก็บ vip_member_id
}
