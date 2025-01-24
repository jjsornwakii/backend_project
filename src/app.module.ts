import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CarModule } from './car/car.module';
import { VipModule } from './vipmember/vip.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // ระบุประเภทฐานข้อมูลเป็น PostgreSQL
      host: 'localhost', // ที่อยู่ของฐานข้อมูล
      port: 5433, // พอร์ตที่ใช้ในการเชื่อมต่อ (ค่าปกติของ PostgreSQL คือ 5432)
      username: 'postgres', // ชื่อผู้ใช้ PostgreSQL
      password: 'zxcv1234gg#', // รหัสผ่าน PostgreSQL
      database: 'CarFee', // ชื่อฐานข้อมูลที่ใช้
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // กำหนดตำแหน่งของ Entity ที่ใช้
      synchronize: true, // ให้ TypeORM ซิงค์ฐานข้อมูลกับ Entity อัตโนมัติ (ใช้ใน development เท่านั้น)
  }),  
  
  AdminModule,AuthModule,CarModule,VipModule],


  controllers: [AppController],
  providers: [AppService  ],
})
export class AppModule { }
