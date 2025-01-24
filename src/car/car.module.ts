import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { Car } from "./car.entity";
import { CarService } from "./car.service";
import { CarController } from "./car.controller";
import { VipMember } from "src/vipmember/vip.entity";


@Module({
    imports: [TypeOrmModule.forFeature([Car,VipMember])],
    providers: [CarService],
    controllers: [CarController],
    exports: [CarService],
  })
export class CarModule {}

