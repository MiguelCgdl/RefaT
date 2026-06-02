// src/roles/roles.service.ts
import { Injectable } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class RolesService {
  async findAll() {
    return Object.values(RolUsuario);
  }
}
