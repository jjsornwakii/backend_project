import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { PaymentService } from "./payment.service";

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}


  @Post('create')
  createPayment(@Body() body: { 
    licenseplate: string;
    amount: number;
    discount?: number;
  }) {
    return this.paymentService.createPayment(body);
  }



  @Post('latest')
  async checkPayment(@Body() body: { licenseplate?: string }) {
    if (!body?.licenseplate) {
      throw new BadRequestException('กรุณาระบุเลขทะเบียนรถ');
    }
 
    // ดึงข้อมูลการคำนวณค่าจอด
    const parkingInfo = await this.paymentService.calculateParkingInfo(body.licenseplate);
    
    // ดึงข้อมูลการจ่ายเงินล่าสุด
    const latestPayment = await this.paymentService.getLatestPayment(body.licenseplate);
 
    return {
      status: 'success',
      data: {
        currentParking: parkingInfo.data,
        latestPayment: latestPayment.data
      }
    };
  }
}