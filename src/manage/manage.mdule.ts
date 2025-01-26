import { Module } from '@nestjs/common';
import { ParkingRatesModule } from './parking-rate/parking-rate.module';

@Module({
 imports: [ParkingRatesModule],
 exports: [ParkingRatesModule]
})
export class ManageModule {}