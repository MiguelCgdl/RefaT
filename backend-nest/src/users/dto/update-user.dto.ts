// src/users/dto/update-user.dto.ts
import { IsString, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;
}
