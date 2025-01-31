import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CarModule } from './car/car.module';
import { VipModule } from './vipmember/vip.module';
import { EntryExitModule } from './entry-exit/entry-exit.module';
import { ManageModule } from './manage/manage.mdule';
import { ConfigModule } from '@nestjs/config';
import { ParkingDiscountModule } from './manage/parking-discounts/parking-discounts.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,  
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),  
  
  AdminModule,
  AuthModule,
  CarModule,
  VipModule,
  EntryExitModule,
  ManageModule,
  ParkingDiscountModule,
  PaymentModule,
],


  controllers: [AppController],
  providers: [AppService  ],
})
export class AppModule { }
