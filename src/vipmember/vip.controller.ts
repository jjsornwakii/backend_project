import { Body, Controller, Post } from "@nestjs/common";
import { VipService } from "./vip.service";
import { CreateVipDto } from "./dto/vip-create.dto";

@Controller('vip')
export class VipController {
    constructor(private vipService: VipService) { }

    @Post('reg')
        async create(@Body() createVipDto: CreateVipDto) {
        return await this.vipService.create(createVipDto);
    }
    

}
