import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Parking_Rates } from "./parking-rate.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ParkingRatesService {
 constructor(
   @InjectRepository(Parking_Rates)
   private parkingRatesRepository: Repository<Parking_Rates>
 ) {}

 async create(data: { hours: number; rate_per_hour: number }) {
   try {
     const newRate = this.parkingRatesRepository.create(data);
     await this.parkingRatesRepository.save(newRate);
     return {
       status: 'success',
       message: 'Parking rate created successfully',
       data: newRate
     };
   } catch (error) {
     if (error.code === '23505') {
       throw new ConflictException('Hours must be unique');
     }
     throw error;
   }
 }

 async update(id: number, data: { hours?: number; rate_per_hour?: number }) {
   try {
     await this.parkingRatesRepository.update(id, data);
     const updated = await this.parkingRatesRepository.findOne({ where: { id } });
     if (!updated) {
       throw new NotFoundException('Rate not found');
     }
     return {
       status: 'success',
       message: 'Parking rate updated successfully',
       data: updated
     };
   } catch (error) {
     if (error.code === '23505') {
       throw new ConflictException('Hours must be unique');
     }
     throw error;
   }
 }

 async delete(id: number) {
   const result = await this.parkingRatesRepository.delete(id);
   if (result.affected === 0) {
     throw new NotFoundException('Rate not found');
   }
   return {
     status: 'success',
     message: 'Parking rate deleted successfully'
   };
 }

 async findAll() {
   const rates = await this.parkingRatesRepository.find({
     order: { hours: 'ASC' }
   });
   return {
     status: 'success',
     data: rates
   };
 }
}