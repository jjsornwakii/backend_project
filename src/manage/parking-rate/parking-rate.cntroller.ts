import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ParkingRatesService } from './parking-rate.service';

@Controller('parking-rates')
export class ParkingRatesController {
  constructor(private readonly parkingRatesService: ParkingRatesService) {}

  @Post('create')
  create(@Body() createParkingRateDto: { hours: number; rate_per_hour: number }) {
    return this.parkingRatesService.create(createParkingRateDto);
  }

  @Post('update')
  update(@Body() updateDto: { id: number; hours?: number; rate_per_hour?: number }) {
    return this.parkingRatesService.update(updateDto.id, updateDto);
  }

  @Post('delete')
  remove(@Body() deleteDto: { id: number }) {
    return this.parkingRatesService.delete(deleteDto.id);
  }

  @Get('list')
  findAll() {
    return this.parkingRatesService.findAll();
  }
}