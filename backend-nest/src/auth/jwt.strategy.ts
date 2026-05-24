import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export type JwtPayload = { sub: number; username: string; rol: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = config.get<string>('JWT_SECRET');
    const nodeEnv = config.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
    const isProduction = nodeEnv === 'production';
    const secret = jwtSecret ?? (isProduction ? null : 'dev-jwt-secret');

    if (!secret) {
      throw new Error('JWT_SECRET environment variable must be set');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.usuario.findUnique({ where: { id: payload.sub } });
    if (!user?.activo) throw new UnauthorizedException('Usuario inactivo');
    return { id: user.id, username: user.username, rol: user.rol };
  }
}
