// src/roles/dto/create-role.dto.ts
import { IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  nombre!: string;
  descripcion?: string;
}
