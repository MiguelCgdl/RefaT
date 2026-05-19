import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({ where: { username: dto.username } });
    if (!user?.activo) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, username: user.username, rol: user.rol };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      token: accessToken,
      user: { id: user.id, username: user.username, rol: user.rol },
    };
  }
}
