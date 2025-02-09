import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInService } from './check-in.service';
import { CheckInController } from './check-in.controller';
import { Car } from '../car/car.entity';
import { EntryExitRecord } from '../entry-exit/entry-exit.entity';
import { Payment } from '../payment/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Car, 
      EntryExitRecord, 
      Payment
    ])
  ],
  controllers: [CheckInController],
  providers: [CheckInService],
  exports: [CheckInService]
})
export class CheckInModule {}