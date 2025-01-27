import { Controller, Post, Body } from "@nestjs/common";
import { ParkingDiscountService } from "./parking-discounts.service";

// parking-discount.controller.ts
@Controller('parking-discounts')
export class ParkingDiscountController {
  constructor(private readonly parkingDiscountService: ParkingDiscountService) {}

  @Post('create')
  create(@Body() createDto: {
    title: string;
    min_purchase: number;
    max_purchase: number;
    hours_granted: number;
    customer_type: number;
  }) {
    return this.parkingDiscountService.create(createDto);
  }

  @Post('update')
  update(@Body() updateDto: {
    id: number;
    title?: string;
    min_purchase?: number;
    max_purchase?: number;
    hours_granted?: number;
    customer_type?: number;
    is_active?: boolean;
  }) {
    return this.parkingDiscountService.update(updateDto.id, updateDto);
  }

  @Post('delete')
  remove(@Body() deleteDto: { id: number }) {
    return this.parkingDiscountService.delete(deleteDto.id);
  }

  @Post('list')
  findAll() {
    return this.parkingDiscountService.findAll();
  }

  @Post('toggle-status')
 toggleStatus(@Body() body: { id: number }) {
   return this.parkingDiscountService.toggleStatus(body.id);
 }
}
