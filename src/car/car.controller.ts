import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CarService } from "./car.service";
import { CreateCarDto } from "./dto/create-car.dto";
import { Car } from "./car.entity";
import { LinkCarVipDto } from "./dto/link-car-vip.dto";


@Controller('cars')
export class CarController {
    constructor(private carService: CarService) { }

    @Get('listAll')
    async findAll() {
        return await this.carService.findAll();
    }

    @Post('findbylp')
    async findlp(@Query('lp') licensePlate: string): Promise<Car[]> {
        return await this.carService.findlp(licensePlate);
    }


    @Get('list')
    async findSplitPage(
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        const pageNumber = parseInt(page) || 1; // หน้าเริ่มต้นคือ 1
        const limitNumber = parseInt(limit) || 10; // จำนวนรายการต่อหน้าเริ่มต้นคือ 10

        return await this.carService.findSplitPage(pageNumber, limitNumber);
    }

    @Post('vipcarreg')
    async create(@Body() createCarDto: CreateCarDto) {
        return await this.carService.create(createCarDto);
    }

    @Post('link-vip')
    async linkCarToVip(@Body() linkCarVipDto: LinkCarVipDto) {
        return await this.carService.linkCarToVip(linkCarVipDto);
    }
}