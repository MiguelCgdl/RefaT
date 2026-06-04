import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermisoDto, UpdatePermisoDto } from './dto/permisos.dto';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class PermisosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.permiso.findMany({
      include: {
        usuarios: {
          include: {
            usuario: {
              select: { id: true, username: true, email: true, rol: true, activo: true }
            }
          }
        }
      }
    });
  }

  async create(dto: CreatePermisoDto) {
    return this.prisma.permiso.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdatePermisoDto) {
    return this.prisma.permiso.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.permiso.delete({
      where: { id },
    });
  }

  async assignUser(permisoId: number, usuarioId: number) {
    // Verificar que existen
    const permiso = await this.prisma.permiso.findUnique({ where: { id: permisoId } });
    if (!permiso) throw new NotFoundException('Permiso no encontrado');
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.usuarioPermiso.upsert({
      where: {
        usuarioId_permisoId: { usuarioId, permisoId }
      },
      update: {},
      create: {
        usuarioId,
        permisoId
      }
    });
  }

  async removeUser(permisoId: number, usuarioId: number) {
    return this.prisma.usuarioPermiso.delete({
      where: {
        usuarioId_permisoId: { usuarioId, permisoId }
      }
    });
  }

  // ── Role based permission management ──
  async getPermissionsByRole(rol: RolUsuario) {
    return this.prisma.rolePermiso.findMany({
      where: { rol },
      include: { permiso: true },
    });
  }

  async assignPermissionToRole(rol: RolUsuario, permisoId: number) {
    // ensure permiso exists
    const permiso = await this.prisma.permiso.findUnique({ where: { id: permisoId } });
    if (!permiso) throw new NotFoundException('Permiso no encontrado');
    return this.prisma.rolePermiso.upsert({
      where: { rol_permisoId: { rol, permisoId } },
      update: {},
      create: { rol, permisoId },
    });
  }

  async removePermissionFromRole(rol: RolUsuario, permisoId: number) {
    return this.prisma.rolePermiso.delete({
      where: { rol_permisoId: { rol, permisoId } },
    });
  }
}
