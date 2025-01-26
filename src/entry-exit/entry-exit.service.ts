// entry-exit.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntryExitRecord } from './entry-exit.entity';

@Injectable()
export class EntryExitService {
 constructor(
   @InjectRepository(EntryExitRecord)
   private entryExitRepository: Repository<EntryExitRecord>,
 ) {}

// entry-exit.service.ts
async findAll() {
    const records = await this.entryExitRepository
      .createQueryBuilder('entryExit')
      .leftJoinAndSelect('entryExit.car', 'car')
      .leftJoinAndSelect('entryExit.payments', 'payment')
      .orderBy('entryExit.entrytime', 'DESC')
      .getMany();
 
    return records.map(record => {
      const durationMs = record.exittime ? new Date(record.exittime).getTime() - new Date(record.entrytime).getTime() : 0;
      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
 
      return {
        licenseplate: record.car.licenseplate,
        date: new Date(record.entrytime).toLocaleDateString(),
        entrytime: new Date(record.entrytime).toLocaleTimeString(),
        exittime: record.exittime ? new Date(record.exittime).toLocaleTimeString() : null,
        duration: `${durationHours} ชั่วโมง`,
        fee: record.payments?.[0]?.amount || 0
      };
    });
 }

 async findAllWithDetails(page: number = 1, limit: number = 10) {
  try {
      const skip = (page - 1) * limit;
      
      const [records, total] = await this.entryExitRepository
          .createQueryBuilder('entryExit')
          .leftJoinAndSelect('entryExit.car', 'car')
          .leftJoinAndSelect('car.vipMember', 'vipMember') //////
          .leftJoinAndSelect('entryExit.payments', 'payment')
          .orderBy('entryExit.entrytime', 'DESC')
          .skip(skip)
          .take(limit)
          .getManyAndCount();

          const formattedRecords = records.map(record => {
            const durationMs = record.exittime ? 
                new Date(record.exittime).getTime() - new Date(record.entrytime).getTime() : 0;
                const totalMinutes = Math.round(durationMs / (1000 * 60));
                const durationHours = Math.floor(totalMinutes / 60);
                const durationMinutes = totalMinutes % 60;

            const currentDate = new Date();


            console.log('Current Date:', currentDate.toISOString());
   console.log('Expire Date:', record.car.vipMember?.expire_date);



   const isVIP = record.car.vipMember?.expire_date 
   ? new Date(record.car.vipMember.expire_date) > currentDate 
   && record.car.vipMember.expire_date != null  // Additional null check
   : false;
         
   return {
    licenseplate: record.car.licenseplate,
    date: new Date(record.entrytime).toLocaleDateString(),
    entrytime: new Date(record.entrytime).toLocaleTimeString(),
    exittime: record.exittime ? new Date(record.exittime).toLocaleTimeString() : null,
    duration: `${durationHours} ชั่วโมง ${durationMinutes} นาที`,
    fee: record.payments?.[0]?.amount || 0,
    isVIP,
    expireDate: record.car.vipMember?.expire_date ? 
        new Date(record.car.vipMember.expire_date).toLocaleDateString() : null
};
         });

      return {
          status: 'success',
          data: {
              items: formattedRecords,
              meta: {
                  total,
                  page,
                  limit,
                  totalPages: Math.ceil(total / limit)
              }
          }
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