import { 
    Controller, 
    Post, 
    Body, 
    HttpCode, 
    HttpStatus 
  } from '@nestjs/common';
  import { CheckInService } from './check-in.service';
  import { CheckInDto } from './dto/check-in.dto';
  
  @Controller('check-in')
  export class CheckInController {
    constructor(private readonly checkInService: CheckInService) {}
  
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async checkIn(@Body() checkInDto: CheckInDto) {
      return this.checkInService.checkIn(checkInDto.licenseplate);
    }
  
    @Post('find-car')
    @HttpCode(HttpStatus.OK)
    async findCarByLicensePlate(@Body('licensePlate') licensePlate: string) {
      return this.checkInService.findCarByLicensePlate(licensePlate);
    }
  }