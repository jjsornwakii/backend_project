import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { VipMember } from "./vip.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateVipDto } from "./dto/vip-create.dto";

@Injectable()
export class VipService {
    constructor(
        @InjectRepository(VipMember)
        private vipRepository: Repository<VipMember>
    ) {}

    async create(createVipDto: CreateVipDto): Promise<any> {
        try {
            // ค้นหาสมาชิกจากเบอร์โทร
            const existNumber = await this.vipRepository.findOne({
                where: { tel: createVipDto.tel }
            });

            // ถ้าเบอร์ซ้ำ ส่ง error กลับไป
            if (existNumber) {
                throw new HttpException(
                    {
                        status: 'error',
                        message: 'Phone number already exists.',
                    },
                    HttpStatus.BAD_REQUEST
                );
            }

            // ถ้าไม่พบเบอร์โทรซ้ำ สมัครสมาชิกใหม่
            const vip = new VipMember();
            vip.fname = createVipDto.fname;
            vip.lname = createVipDto.lname;
            vip.tel = createVipDto.tel;
            const savedVip = await this.vipRepository.save(vip);

            return {
                status: 'success',
                message: 'VIP member created successfully.',
                data: savedVip,
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}