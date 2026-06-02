// src/roles/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    return this.prisma.rolUsuario.create({ data: dto });
  }

  async findAll() {
    return this.prisma.rolUsuario.findMany({ include: { permissions: true } });
  }

  async findOne(id: number) {
    const role = await this.prisma.rolUsuario.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    return this.prisma.rolUsuario.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    return this.prisma.rolUsuario.delete({ where: { id } });
  }

  /** Assign permissions to a role */
  async assignPermissions(roleId: number, permissionIds: number[]) {
    // clear existing
    await this.prisma.rolPermission.deleteMany({ where: { rolId: roleId } });
    const data = permissionIds.map(pid => ({ rolId: roleId, permissionId: pid }));
    await this.prisma.rolPermission.createMany({ data });
    return this.findOne(roleId);
  }
}
