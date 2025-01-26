import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingRatesController } from './parking-rate.cntroller'; 
import { ParkingRatesService } from './parking-rate.service';
import { Parking_Rates } from './parking-rate.entity';

@Module({
 imports: [TypeOrmModule.forFeature([Parking_Rates])],
 controllers: [ParkingRatesController],
 providers: [ParkingRatesService],
 exports: [ParkingRatesService]
})
export class ParkingRatesModule {}