import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(private auth: AuthService) {}

  /** POST /api/auth/login — JWT (compatible con /api/auth/token/ del legacy) */
  @Post('auth/login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('auth/token')
  token(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
