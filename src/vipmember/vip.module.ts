import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { VipMember } from "./vip.entity";
import { VipService } from "./vip.service";
import { VipController } from "./vip.controller";


@Module({
    imports: [TypeOrmModule.forFeature([VipMember])],
    providers: [VipService],
    controllers: [VipController],
    exports: [VipService],
  })
export class VipModule {}

