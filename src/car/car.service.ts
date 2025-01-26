import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './car.entity';

import { CreateCarDto } from './dto/create-car.dto';
import { VipMember } from '../vipmember/vip.entity';
import { LinkCarVipDto } from './dto/link-car-vip.dto';


@Injectable()
export class CarService {
    constructor(
        @InjectRepository(Car)
        private carRepository: Repository<Car>,

        @InjectRepository(VipMember)
        private vipRepository: Repository<VipMember>
    ) {}

    async findAll(): Promise<Car[]> {
        return await this.carRepository.find();
    }

  
    async findlp(licensePlate: string): Promise<Car[]> {
        return await this.carRepository.find({
          where: { licenseplate : licensePlate },
        });
      }


    async findSplitPage(page: number, limit: number): Promise<any> {
        const [data, total] = await this.carRepository.findAndCount({
          skip: (page - 1) * limit,
          take: limit,
        });
      
        return {
          data,
          totalItems: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          pageSize: limit,
        };
    }


    // async create(createCarDto: CreateCarDto): Promise<Car> {
    //     // Create new car instance
    //     const car = new Car();
    //     car.licenseplate = createCarDto.licenseplate;
    //     car.vipMemberId = createCarDto.vipMemberId;
        
    //     // Save to database
    //     return await this.carRepository.save(car);
    // }

    async create(createCarDto: CreateCarDto): Promise<any> {
        try {
            // ค้นหารถยนต์จากป้ายทะเบียน
            const existingCar = await this.carRepository.findOne({
                where: { licenseplate: createCarDto.licenseplate },
            });
    
            // ถ้าไม่พบรถยนต์ (ป้ายทะเบียนใหม่) ให้สร้างใหม่
            if (!existingCar) {
                // สร้าง instance ใหม่
                const car = this.carRepository.create({
                    licenseplate: createCarDto.licenseplate,
                    vip_member_id: createCarDto.vip_member_id
                });
    
                // บันทึกลงฐานข้อมูล
                const savedCar = await this.carRepository.save(car);
                
                return {
                    status: 'success',
                    message: 'Car created successfully',
                    data: savedCar
                };
            }
    
            // ถ้าพบรถยนต์และยังไม่มี vip_member_id (เป็น null) ให้อัพเดท vip_member_id ได้
            if (existingCar && existingCar.vip_member_id === null) {
                existingCar.vip_member_id = createCarDto.vip_member_id;
                const updatedCar = await this.carRepository.save(existingCar);

                return {
                    status: 'success',
                    message: 'Car updated with VIP member successfully',
                    data: updatedCar
                };
            }
    
            // กรณีที่พบรถยนต์และมี vip_member_id อยู่แล้ว
            return {
                status: 'error',
                message: 'Car already exists and has VIP member assigned',
                data: existingCar
            };
        } catch (error) {
            throw new HttpException(
                {
                    status: 'error',
                    message: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }



// car/car.service.ts
async linkCarToVip(linkCarVipDto: LinkCarVipDto): Promise<any> {
    try {
      // ตรวจสอบว่ามีข้อมูลครบไหม
      if (!linkCarVipDto.tel || !linkCarVipDto.licenseplate) {
        throw new HttpException(
          {
            status: 'error',
            message: 'Missing required parameters',
            errors: {
              tel: !linkCarVipDto.tel ? 'Phone number is required' : null,
              licenseplate: !linkCarVipDto.licenseplate ? 'License plate is required' : null
            }
          },
          HttpStatus.BAD_REQUEST
        );
      }

      // ค้นหา VIP member จากเบอร์โทร
      const vipMember = await this.vipRepository.findOne({
        where: { tel: linkCarVipDto.tel },
      });

      if (!vipMember) {
        throw new HttpException(
          {
            status: 'error',
            message: 'VIP member not found with this phone number.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // ค้นหารถจากเลขทะเบียน
      let car = await this.carRepository.findOne({
        where: { licenseplate: linkCarVipDto.licenseplate },
        relations: ['vipMember']
      });

      // ถ้าพบรถและมี vip_member_id แต่เป็นคนละคนกับที่ส่งมา
      if (car && car.vip_member_id && car.vip_member_id !== vipMember.vip_member_id) {
        throw new HttpException(
          {
            status: 'error',
            message: 'This license plate is already linked to another VIP member.',
            current_owner: {
              vip_member_id: car.vip_member_id,
              name: `${car.vipMember.fname} ${car.vipMember.lname}`,
              tel: car.vipMember.tel
            }
          },
          HttpStatus.BAD_REQUEST
        );
      }

      // ถ้าพบรถและเป็นเจ้าของเดิม ให้อัพเดทและส่ง response ว่าเป็นข้อมูลเดิม
      if (car && car.vip_member_id === vipMember.vip_member_id) {
        return {
          status: 'success',
          message: 'This license plate is already linked to this VIP member.',
          data: car
        };
      }

      // ถ้าไม่พบรถ ให้สร้าง record ใหม่
      if (!car) {
        car = new Car();
        car.licenseplate = linkCarVipDto.licenseplate;
        car.vip_member_id = vipMember.vip_member_id;
        car.vipMember = vipMember;
      } else {
        // ถ้าพบรถและยังไม่มี vip_member_id ให้อัพเดท
        car.vip_member_id = vipMember.vip_member_id;
        car.vipMember = vipMember;
      }
      
      const savedCar = await this.carRepository.save(car);

      return {
        status: 'success',
        message: car.car_id ? 'Car linked to VIP member successfully.' : 'New car created and linked to VIP member successfully.',
        data: savedCar,
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          status: 'error',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
}


// ฟังก์ชันที่ใช้ลบการลิงก์ VIP กับรถ
async unlinkVipFromCar(licenseplate: string): Promise<any> {
  try {
    // ค้นหารถคันนั้นตามเลขทะเบียน
    const car = await this.carRepository.findOne({ where: { licenseplate }, relations: ['vipMember'] });

    if (!car) {
      throw new HttpException(
        { status: 'error', message: 'Car not found' },
        HttpStatus.NOT_FOUND
      );
    }

    // ตรวจสอบว่ารถคันนั้นมีการเชื่อมโยงกับ VIP หรือไม่
    if (car.vipMember) {
      // หากมีการเชื่อมโยงกับ VIP, ลบการเชื่อมโยง
      car.vip_member_id = null;  // ยกเลิกการเชื่อมโยงกับ VIP
      car.vipMember = null;      // ตั้งค่า vipMember เป็น null

      // บันทึกการเปลี่ยนแปลง
      await this.carRepository.save(car);

      return {
        status: 'success',
        message: 'Successfully unlinked VIP from car',
      };
    } else {
      // ถ้าไม่มีการเชื่อมโยงกับ VIP
      return {
        status: 'info',
        message: 'Car is not linked to any VIP member',
      };
    }
  } catch (error) {
    throw new HttpException(
      { status: 'error', message: error.message },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}


async updateLicensePlate(updateData: { old_lp: string, new_lp: string }): Promise<any> {
  try {
      // Find the car with the old license plate
      const car = await this.carRepository.findOne({
          where: { licenseplate: updateData.old_lp }
      });

      // Check if car exists
      if (!car) {
          throw new HttpException(
              { 
                  status: 'error', 
                  message: 'Car with this license plate not found' 
              },
              HttpStatus.NOT_FOUND
          );
      }

      // Check if new license plate is already in use
      const existingCar = await this.carRepository.findOne({
          where: { licenseplate: updateData.new_lp }
      });

      if (existingCar) {
          throw new HttpException(
              { 
                  status: 'error', 
                  message: 'New license plate already exists' 
              },
              HttpStatus.BAD_REQUEST
          );
      }

      // Update license plate
      car.licenseplate = updateData.new_lp;
      const updatedCar = await this.carRepository.save(car);

      return {
          status: 'success',
          message: 'License plate updated successfully',
          data: updatedCar
      };
  } catch (error) {
      throw new HttpException(
          { 
              status: 'error', 
              message: error.message 
          },
          HttpStatus.INTERNAL_SERVER_ERROR
      );
  }
}
}