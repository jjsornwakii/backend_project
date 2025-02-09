import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from '../car/car.entity';
import { EntryExitRecord } from '../entry-exit/entry-exit.entity';
import { Payment } from '../payment/payment.entity';

@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(Car)
    private carRepository: Repository<Car>,
    @InjectRepository(EntryExitRecord)
    private entryExitRecordRepository: Repository<EntryExitRecord>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async checkIn(licensePlate: string): Promise<EntryExitRecord> {
    // First, find or create the car
    let car = await this.carRepository.findOne({ 
      where: { licenseplate: licensePlate } 
    });

    if (!car) {
      // Create new car if not exists
      car = this.carRepository.create({
        licenseplate: licensePlate
      });
      await this.carRepository.save(car);
    }

    // Create entry-exit record
    const entryExitRecord = this.entryExitRecordRepository.create({
      car_id: car.car_id,
      car: car,
      entrytime: new Date(),
      exittime: null,
      car_image_path: null
    });
    await this.entryExitRecordRepository.save(entryExitRecord);

    // Create initial payment record (with zero amount for now)
    const payment = this.paymentRepository.create({
      entryexitrecord_id: entryExitRecord.entryexitrecord_id,
      entryExitRecord: entryExitRecord,
      amount: 0,
      discount: 0,
      paid_at: new Date()
    });
    await this.paymentRepository.save(payment);

    return entryExitRecord;
  }

  // Optional: Method to find car by license plate
  async findCarByLicensePlate(licensePlate: string): Promise<Car | null> {
    return this.carRepository.findOne({ 
      where: { licenseplate: licensePlate }
    });
  }
}