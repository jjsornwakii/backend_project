import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { VipService } from "./vip.service";
import { CreateVipDto } from "./dto/vip-create.dto";
import { VipPaginationDto } from "./dto/vip-pagination.dto";
import { UpdateVipDto } from "./dto/vip-update.dto";

@Controller('vip')
export class VipController {
    constructor(private vipService: VipService) { }

    @Post('reg')
        async create(@Body() createVipDto: CreateVipDto) {
        return await this.vipService.create(createVipDto);
    }

    @Get('getall')
    async findAll() {
        return await this.vipService.findAll();
    }

    @Get('findbyphone/:tel')
async findByPhone(@Param('tel') tel: string) {
   return await this.vipService.findByPhone(tel);
}

   @Post('list')
   findAllWithDetails(@Body() paginationDto: VipPaginationDto) {
       return this.vipService.findAllWithDetails(paginationDto.page, paginationDto.limit);
   }

   @Post('update')
   async updateVip(@Body() updateVipDto: UpdateVipDto) {
       return this.vipService.updateVip(updateVipDto);
   }

}
