import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity("parking_rates")
export class Parking_Rates {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    hours: number;

    @Column()
    rate_per_hour: number;

}