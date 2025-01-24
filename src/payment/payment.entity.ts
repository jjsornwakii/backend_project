import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { EntryExitRecord } from "src/entry-exit/entry-exit.entity";

@Entity("payment")
export class Payment {
    @PrimaryGeneratedColumn()
    payment_id: number;

    @Column()
    entryexitrecord_id: number;

    @Column("decimal", { precision: 10, scale: 2 })
    amount: number;

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    discount: number;

    @Column("timestamp")
    paid_at: Date;

    @ManyToOne(() => EntryExitRecord)
    @JoinColumn({ name: "entryexitrecord_id" })
    entryExitRecord: EntryExitRecord;
}