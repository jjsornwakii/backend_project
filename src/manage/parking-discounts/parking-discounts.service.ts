import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { ParkingDiscount } from "./parking-discounts.entity";
import { InjectRepository } from "@nestjs/typeorm";

// parking-discount.service.ts
@Injectable()
export class ParkingDiscountService {
 constructor(
   @InjectRepository(ParkingDiscount)
   private parkingDiscountRepository: Repository<ParkingDiscount>
 ) {}

 async create(data: { 
    title: string;
    min_purchase?: number | string; 
    max_purchase?: number | string;
    hours_granted: number | string;
    customer_type: number | string;
  }) {
    try {
      // แปลงค่าและตรวจสอบข้อมูล
      const formattedData = {
        title: data.title,
        min_purchase: data.min_purchase === "" ? undefined : Number(data.min_purchase),
        max_purchase: data.max_purchase === "" ? undefined : Number(data.max_purchase),
        hours_granted: Number(data.hours_granted),
        customer_type: Number(data.customer_type)
      };

      // ตรวจสอบว่าต้องมีการกำหนดอย่างน้อย min หรือ max
      if (formattedData.min_purchase === undefined && formattedData.max_purchase === undefined) {
        throw new BadRequestException('กรุณากำหนดอย่างน้อย ราคาขั้นต่ำ หรือ ราคาสูงสุด');
      }

      // ถ้ามีทั้งคู่ต้องตรวจสอบค่า
      if (formattedData.min_purchase !== undefined && formattedData.max_purchase !== undefined) {
        if (formattedData.min_purchase > formattedData.max_purchase) {
          throw new BadRequestException('ราคาขั้นต่ำต้องน้อยกว่าราคาสูงสุด');
        }
      }

      // กำหนดค่าเริ่มต้นถ้าไม่ได้ระบุ
      const newDiscount = {
        ...formattedData,
        min_purchase: formattedData.min_purchase ?? 0,
        max_purchase: formattedData.max_purchase ?? 99999
      };

      const created = await this.parkingDiscountRepository.save(newDiscount);
      return {
        status: 'success',
        message: 'เพิ่มส่วนลดสำเร็จ',
        data: created
      };

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('ไม่สามารถเพิ่มส่วนลดได้: ' + error.message);
    }
  }
  async update(id: number, data: {
    title?: string;
    min_purchase?: number | string;
    max_purchase?: number | string;
    hours_granted?: number | string;
    customer_type?: number | string;
    is_active?: boolean;
  }) {
    try {
      const currentDiscount = await this.parkingDiscountRepository.findOne({ where: { id }});
      if (!currentDiscount) {
        throw new NotFoundException('ไม่พบข้อมูลส่วนลด');
      }
 
      // แปลงค่าและตรวจสอบข้อมูล
      const formattedData = {
        title: data.title,
        min_purchase: data.min_purchase === "" ? undefined : 
                     data.min_purchase !== undefined ? Number(data.min_purchase) : undefined,
        max_purchase: data.max_purchase === "" ? undefined : 
                     data.max_purchase !== undefined ? Number(data.max_purchase) : undefined,
        hours_granted: data.hours_granted ? Number(data.hours_granted) : undefined,
        customer_type: data.customer_type ? Number(data.customer_type) : undefined,
        is_active: data.is_active
      };
 
      // ถ้าอัพเดททั้งคู่
      if (formattedData.min_purchase !== undefined && formattedData.max_purchase !== undefined) {
        if (formattedData.min_purchase > formattedData.max_purchase) {
          throw new BadRequestException('ราคาขั้นต่ำต้องน้อยกว่าราคาสูงสุด');
        }
      }
      // ถ้าอัพเดทแค่ min ต้องเช็คกับ max เดิม
      else if (formattedData.min_purchase !== undefined) {
        if (formattedData.min_purchase > currentDiscount.max_purchase) {
          throw new BadRequestException('ราคาขั้นต่ำต้องน้อยกว่าราคาสูงสุด');
        }
      }
      // ถ้าอัพเดทแค่ max ต้องเช็คกับ min เดิม
      else if (formattedData.max_purchase !== undefined) {
        if (currentDiscount.min_purchase > formattedData.max_purchase) {
          throw new BadRequestException('ราคาขั้นต่ำต้องน้อยกว่าราคาสูงสุด');
        }
      }
 
      // ลบ properties ที่เป็น undefined ออกก่อน update
      Object.keys(formattedData).forEach(key => 
        formattedData[key] === undefined && delete formattedData[key]
      );
 
      await this.parkingDiscountRepository.update(id, formattedData);
      const updated = await this.parkingDiscountRepository.findOne({ where: { id }});
      
      return {
        status: 'success',
        message: 'แก้ไขส่วนลดสำเร็จ',
        data: updated
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('ไม่สามารถแก้ไขส่วนลดได้: ' + error.message);
    }
  }

 async delete(id: number) {
   const result = await this.parkingDiscountRepository.delete(id);
   if (result.affected === 0) {
     throw new NotFoundException('ไม่พบข้อมูลส่วนลด');
   }
   return {
     status: 'success',
     message: 'ลบส่วนลดสำเร็จ'
   };
 }

 async findAll() {
   const discounts = await this.parkingDiscountRepository.find({
     order: { created_at: 'DESC' }
   });
   return {
     status: 'success',
     message: 'ดึงข้อมูลส่วนลดสำเร็จ',
     data: discounts
   };
 }



 async toggleStatus(id: number) {
    try {
      const discount = await this.parkingDiscountRepository.findOne({ where: { id }});
      
      if (!discount) {
        throw new NotFoundException('ไม่พบข้อมูลส่วนลด');
      }
 
      // Toggle status
      await this.parkingDiscountRepository.update(id, {
        is_active: !discount.is_active
      });
 
      const updated = await this.parkingDiscountRepository.findOne({ where: { id }});
 
      return {
        status: 'success',
        message: `${updated.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}ส่วนลดสำเร็จ`,
        data: updated
      };
 
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('ไม่สามารถเปลี่ยนสถานะส่วนลดได้');
    }
  }

  
}