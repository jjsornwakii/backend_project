import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../admin/admin.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,

    private readonly jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const admin = await this.adminRepository.findOne({
      where: { admin_username: username },
    });

    // ตรวจสอบรหัสผ่าน
    if (admin && admin.admin_password === password) {
      return { userId: admin.admin_id, username: admin.admin_username };
    }

    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
      status: "success",
    };
  }
}
