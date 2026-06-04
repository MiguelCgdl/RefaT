import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto, UpdatePermisoDto } from './dto/permisos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('permisos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.permisosService.findAll();
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() createPermisoDto: CreatePermisoDto) {
    return this.permisosService.create(createPermisoDto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updatePermisoDto: UpdatePermisoDto) {
    return this.permisosService.update(+id, updatePermisoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.permisosService.remove(+id);
  }

  @Post(':id/usuarios/:usuarioId')
  @Roles('ADMIN')
  assignUser(@Param('id') id: string, @Param('usuarioId') usuarioId: string) {
    return this.permisosService.assignUser(+id, +usuarioId);
  }

  @Get('roles/:rol')
  @Roles('ADMIN')
  getPermissionsByRole(@Param('rol') rol: string) {
    return this.permisosService.getPermissionsByRole(rol as any);
  }

  @Post('roles/:rol/:permisoId')
  @Roles('ADMIN')
  assignPermissionToRole(@Param('rol') rol: string, @Param('permisoId') permisoId: string) {
    return this.permisosService.assignPermissionToRole(rol as any, +permisoId);
  }

  @Delete('roles/:rol/:permisoId')
  @Roles('ADMIN')
  removePermissionFromRole(@Param('rol') rol: string, @Param('permisoId') permisoId: string) {
    return this.permisosService.removePermissionFromRole(rol as any, +permisoId);
  }


  @Delete(':id/usuarios/:usuarioId')
  @Roles('ADMIN')
  removeUser(@Param('id') id: string, @Param('usuarioId') usuarioId: string) {
    return this.permisosService.removeUser(+id, +usuarioId);
  }
}
