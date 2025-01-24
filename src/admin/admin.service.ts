// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async getAllUsernames(): Promise<string[]> {
    const admins = await this.adminRepository.find({ select: ['admin_username'] });
    return admins.map(admin => admin.admin_username);
  }

  async findOneByUsername(username: string): Promise<Admin | undefined> {
    return this.adminRepository.findOne({ where: { admin_name: username } });
  }




}
