import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwtSecret = config.get<string>('JWT_SECRET');
        const nodeEnv = config.get<string>('NODE_ENV') ?? process.env.NODE_ENV;
        const isProduction = nodeEnv === 'production';
        const secret = jwtSecret ?? (isProduction ? null : 'dev-jwt-secret');

        if (!secret) {
          throw new Error('JWT_SECRET environment variable must be set');
        }
        
        return {
          secret,
          signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '8h') },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
