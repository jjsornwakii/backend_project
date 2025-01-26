import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { VipMember } from "./vip.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateVipDto } from "./dto/vip-create.dto";
import { UpdateVipDto } from "./dto/vip-update.dto";

@Injectable()
export class VipService {
   
    constructor(
        @InjectRepository(VipMember)
        private vipRepository: Repository<VipMember>
    ) {}

    async create(createVipDto: CreateVipDto): Promise<any> {
        try {
            const existNumber = await this.vipRepository.findOne({
                where: { tel: createVipDto.tel }
            });
     
            if (existNumber) {
                throw new HttpException({
                    status: 'error',
                    message: 'Phone number already exists.',
                }, HttpStatus.BAD_REQUEST);
            }
     
            const vip = new VipMember();
            vip.fname = createVipDto.fname;
            vip.lname = createVipDto.lname;
            vip.tel = createVipDto.tel;
           
            // คำนวณวันหมดอายุ
            const now = new Date();
            vip.expire_date = new Date(now.setDate(now.getDate() + createVipDto.vip_days));
            
            const savedVip = await this.vipRepository.save(vip);
     
            return {
                status: 'success',
                message: 'VIP member created successfully.',
                data: savedVip,
            };
        } catch (error) {
            throw new HttpException({
                status: 'error',
                message: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
     }
     


     async findAll() {
        try {
            const members = await this.vipRepository
                .createQueryBuilder('vip')
                .leftJoinAndSelect('vip.cars', 'car')
                .select([
                    'vip.vip_member_id',
                    'vip.fname',
                    'vip.lname', 
                    'vip.tel',
                    'vip.created_at',
                    'vip.expire_date', // เพิ่ม
                    'car.car_id',
                    'car.licenseplate'
                ])
                .getMany();
     
            return {
                status: 'success',
                data: members
            };
        } catch (error) {
            throw new HttpException({
                status: 'error',
                message: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
     }

    // vip.service.ts
async findByPhone(tel: string) {
    try {
        const member = await this.vipRepository
            .createQueryBuilder('vip')
            .leftJoinAndSelect('vip.cars', 'car')
            .where('vip.tel = :tel', { tel })
            .select([
                'vip.vip_member_id',
                'vip.fname',
                'vip.lname',
                'vip.tel',
                'vip.created_at',
                'car.car_id',
                'car.licenseplate'
            ])
            .getOne();
 
        if (!member) {
            throw new HttpException(
                { status: 'error', message: 'Member not found' },
                HttpStatus.NOT_FOUND
            );
        }
 
        return { status: 'success', data: member };
    } catch (error) {
        throw new HttpException(
            { status: 'error', message: error.message },
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
 }












 async findAllWithDetails(page: number = 1, limit: number = 10) {
    try {
        const skip = (page - 1) * limit;
        
        const [members, total] = await this.vipRepository
            .createQueryBuilder('vip')
            .leftJoinAndSelect('vip.cars', 'car')
            .select([
                'vip.vip_member_id',
                'vip.fname',
                'vip.lname',
                'vip.tel',
                'vip.created_at',
                'vip.expire_date',
                'car.car_id',
                'car.licenseplate'
            ])
            .addSelect(`EXTRACT(DAYS FROM (vip.expire_date - vip.created_at))`, 'remaining_days')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            status: 'success',
            data: {
                items: members.map(member => ({
                    ...member,
                    remaining_days: member['remaining_days'] 
                        ? parseInt(member['remaining_days']) 
                        : null
                })),
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        };
    } catch (error) {
        throw new HttpException({
            status: 'error',
            message: error.message,
        }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
async updateVip(updateData: UpdateVipDto): Promise<any> {
    try {
        const { vip_member_id, fname, lname, tel, extend_days } = updateData;
 
        const vip = await this.vipRepository.findOne({ where: { vip_member_id } });
        if (!vip) {
            throw new HttpException(
                { status: 'error', message: 'VIP member not found' },
                HttpStatus.NOT_FOUND
            );
        }
 
        vip.fname = fname || vip.fname;
        vip.lname = lname || vip.lname;
        vip.tel = tel || vip.tel;
 
        // Convert extend_days to number and add to current expire date
        if (extend_days) {
            const days = Number(extend_days);
            const currentExpireDate = new Date(vip.expire_date || new Date());
            currentExpireDate.setDate(currentExpireDate.getDate() + days);
            vip.expire_date = currentExpireDate;
        }
 
        const updatedVip = await this.vipRepository.save(vip);
 
        return {
            status: 'success',
            message: 'VIP member updated successfully.',
            data: updatedVip,
        };
    } catch (error) {
        throw new HttpException(
            { status: 'error', message: error.message },
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
 }
 
}