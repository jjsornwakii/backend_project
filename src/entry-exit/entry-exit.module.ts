
// entry-exit.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntryExitController } from './entry-exit.controller';
import { EntryExitService } from './entry-exit.service';
import { EntryExitRecord } from './entry-exit.entity';

@Module({
 imports: [TypeOrmModule.forFeature([EntryExitRecord])],
 controllers: [EntryExitController],
 providers: [EntryExitService],
 exports: [EntryExitService]
})
export class EntryExitModule {}