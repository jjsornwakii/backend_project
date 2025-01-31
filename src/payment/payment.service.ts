import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Car } from "src/car/car.entity";
import { EntryExitRecord } from "src/entry-exit/entry-exit.entity";
import { Repository, IsNull } from "typeorm";
import { Payment } from "./payment.entity";

@Injectable()
export class PaymentService {
 constructor(
   @InjectRepository(Payment)
   private paymentRepository: Repository<Payment>,
   @InjectRepository(EntryExitRecord)
   private entryExitRepository: Repository<EntryExitRecord>,
   @InjectRepository(Car)
   private carRepository: Repository<Car>
 ) {}

 async calculateParkingInfo(licenseplate: string) {
    try {
      const car = await this.carRepository.findOne({
        where: { licenseplate },
        relations: ['vipMember']
      });
 
      if (!car) {
        throw new NotFoundException('ไม่พบข้อมูลรถ');
      }
 
      const parkingRecord = await this.entryExitRepository.findOne({
        where: {
          car_id: car.car_id,
          exittime: IsNull() 
        },
        relations: ['payments'],
        order: { entrytime: 'DESC' }
      });
 
      if (!parkingRecord) {
        throw new NotFoundException('ไม่พบข้อมูลการเข้าจอด');
      }
 
      // เช็คการจ่ายเงิน
      const isPaid = parkingRecord.payments && parkingRecord.payments.length > 0;
 
      const currentTime = new Date();
      const entryTime = new Date(parkingRecord.entrytime);
      const durationMs = currentTime.getTime() - entryTime.getTime();
      
      const totalMinutes = Math.round(durationMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
 
      const vipStatus = {
        isVIP: false,
        expireDate: null
      };
 
      if (car.vipMember) {
        vipStatus.isVIP = new Date(car.vipMember.expire_date) > currentTime;
        vipStatus.expireDate = car.vipMember.expire_date;
      }
 
      const freeHours = vipStatus.isVIP ? 24 : 2;
 
      let parkingFee = 0;
      if (hours > freeHours) {
        const chargeableHours = hours - freeHours;
        if (chargeableHours <= 4) {
          parkingFee = chargeableHours * 30;
        } else {
          parkingFee = (4 * 30) + ((chargeableHours - 4) * 60);
        }
      }
 
      return {
        status: 'success',
        data: {
          entryexitrecord_id: parkingRecord.entryexitrecord_id,
          licenseplate: car.licenseplate,
          entryTime: parkingRecord.entrytime,
          currentTime,
          duration: {
            hours,
            minutes
          },
          vipStatus,
          freeHours,
          parkingFee,
          discount: 0,
          isPaid: isPaid ? 1 : 0 // เพิ่ม field isPaid เป็น 1 หรือ 0
        }
      };
 
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('ไม่สามารถคำนวณค่าจอดรถได้');
    }
  }

 async createPayment(paymentData: {
   licenseplate: string;
   amount: number;
   discount?: number;
 }) {
   try {
     // คำนวณข้อมูลการจอดก่อน
     const parkingInfo = await this.calculateParkingInfo(paymentData.licenseplate);

     // สร้าง payment record
     const payment = this.paymentRepository.create({
       entryexitrecord_id: parkingInfo.data.entryexitrecord_id,
       amount: paymentData.amount,
       discount: paymentData.discount || 0,
       paid_at: new Date()
     });

     await this.paymentRepository.save(payment);

     // อัพเดท exittime ใน entry-exit record
     await this.entryExitRepository.update(
       parkingInfo.data.entryexitrecord_id,
       { exittime: new Date() }
     );

     return {
       status: 'success',
       message: 'บันทึกการชำระเงินสำเร็จ',
       data: payment
     };

   } catch (error) {
     if (error instanceof NotFoundException || error instanceof BadRequestException) {
       throw error;
     }
     throw new Error('ไม่สามารถบันทึกการชำระเงินได้');
   }
 }

 async getPaymentHistory(licenseplate: string) {
   try {
     const car = await this.carRepository.findOne({
       where: { licenseplate }
     });

     if (!car) {
       throw new NotFoundException('ไม่พบข้อมูลรถ');
     }

     const records = await this.entryExitRepository.find({
       where: { car_id: car.car_id },
       relations: ['payments'],
       order: { entrytime: 'DESC' }
     });

     return {
       status: 'success',
       data: records.map(record => ({
         entryTime: record.entrytime,
         exitTime: record.exittime,
         payment: record.payments[0] || null
       }))
     };

   } catch (error) {
     if (error instanceof NotFoundException) {
       throw error;
     }
     throw new Error('ไม่สามารถดึงประวัติการชำระเงินได้');
   }
 }
 async getLatestPayment(licenseplate: string) {
    try {
      // หารถจาก licenseplate
      const car = await this.carRepository.findOne({
        where: { licenseplate }
      });
 
      if (!car) {
        throw new NotFoundException('ไม่พบข้อมูลรถ');
      }
 
      // หา record การจ่ายเงินล่าสุด
      const latestPayment = await this.entryExitRepository
        .createQueryBuilder('entryExit')
        .leftJoinAndSelect('entryExit.payments', 'payment')
        .where('entryExit.car_id = :carId', { carId: car.car_id })
        .orderBy('payment.paid_at', 'DESC') // เรียงตามเวลาจ่ายเงินล่าสุด
        .limit(1)
        .getOne();
 
      if (!latestPayment || !latestPayment.payments.length) {
        return {
          status: 'success',
          message: 'ไม่พบประวัติการชำระเงิน',
          data: null
        };
      }
 
      return {
        status: 'success',
        message: 'ดึงข้อมูลการชำระเงินล่าสุดสำเร็จ',
        data: {
          entryTime: latestPayment.entrytime,
          exitTime: latestPayment.exittime,
          payment: latestPayment.payments[0]
        }
      };
 
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('ไม่สามารถดึงข้อมูลการชำระเงินล่าสุดได้');
    }
  }


  
 
}