import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from './payment.entity';
import { EntryExitRecord } from '../entry-exit/entry-exit.entity';
import { Car } from '../car/car.entity';

@Module({
 imports: [
   TypeOrmModule.forFeature([Payment, EntryExitRecord, Car])
 ],
 controllers: [PaymentController],
 providers: [PaymentService],
 exports: [PaymentService]
})
export class PaymentModule {}