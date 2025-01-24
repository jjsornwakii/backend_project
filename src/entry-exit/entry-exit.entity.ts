import { Car } from 'src/car/car.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('entryexitrecord')
export class EntryExitRecord {
    @PrimaryGeneratedColumn()
    entryexitrecord_id: number;

    // Column สำหรับเก็บ foreign key
    @Column({ name: 'car_id' })
    car_id: number;

    @Column({ type: 'timestamp without time zone' })
    entrytime: Date;

    @Column({ type: 'timestamp without time zone', nullable: true })
    exittime: Date | null;


    @Column({ type: 'text', nullable: true })
    car_image_path: string | null;

    // ความสัมพันธ์กับ Car entity
  @ManyToOne(() => Car, { onDelete: 'NO ACTION' }) // หรือเปลี่ยนเป็น CASCADE ถ้าต้องการลบ record เมื่อลบรถ
  @JoinColumn({ name: 'car_id', referencedColumnName: 'car_id' }) // เชื่อมกับ car_id ใน table car
  car: Car;
}