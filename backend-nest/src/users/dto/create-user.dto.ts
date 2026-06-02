// src/users/dto/create-user.dto.ts
import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;
}
