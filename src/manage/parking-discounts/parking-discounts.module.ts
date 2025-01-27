import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkingDiscount } from "./parking-discounts.entity";
import { Module } from "@nestjs/common";
import { ParkingDiscountController } from "./parking-discounts.controller";
import { ParkingDiscountService } from "./parking-discounts.service";

// parking-discount.module.ts
@Module({
    imports: [TypeOrmModule.forFeature([ParkingDiscount])],
    controllers: [ParkingDiscountController],
    providers: [ParkingDiscountService],
    exports: [ParkingDiscountService]
  })
  export class ParkingDiscountModule {}