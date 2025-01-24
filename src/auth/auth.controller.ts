import { Controller, Post, Body, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { adminname: string; password: string }) {
    const user = await this.authService.validateUser(body.adminname, body.password);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  

  @Post('protected')
  @UseGuards(JwtAuthGuard)
  getProtected(@Request() req) {
    return { message: 'This is a protected route', user: req.user };
  }

  @Get('getAdmin')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req){
    return { adminname : req.user.username}
  }


}
