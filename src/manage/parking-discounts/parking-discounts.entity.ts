// parking_discount.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('parking_discounts')
export class ParkingDiscount {
 @PrimaryGeneratedColumn()
 id: number;

 @Column({ type: 'varchar', length: 255 })
 title: string;

 @Column({ type: 'decimal', precision: 10, scale: 2 })
 min_purchase: number;

 @Column({ type: 'decimal', precision: 10, scale: 2 }) 
 max_purchase: number;

 @Column()
 hours_granted: number;

 @Column()
 customer_type: number; // 1=ทั้งหมด, 2=ลูกค้าทั่วไป, 3=ลูกค้าVIP

 @Column({ default: true })
 is_active: boolean;

 @CreateDateColumn()
 created_at: Date;

 @UpdateDateColumn() 
 updated_at: Date;
}