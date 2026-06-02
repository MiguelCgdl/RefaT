import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginated, skipTake } from '../common/utils/paginate';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 20) {
    const where: Prisma.UsuarioWhereInput = { rol: 'CLIENTE' };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({ where, orderBy: { username: 'asc' }, ...skipTake(page, pageSize) }),
    ]);
    return paginated(items, total, page, pageSize);
  }

  async findOne(id: number) {
    const item = await this.prisma.usuario.findUnique({ where: { id, rol: 'CLIENTE' } });
    if (!item) throw new NotFoundException('Cliente no encontrado');
    return item;
  }

  create(dto: CreateClienteDto) {
    const { vehiculo, nombre, email, activo } = dto;
    return this.prisma.usuario.create({
      data: {
        username: nombre + '_' + Date.now().toString(),
        email: email || `cliente_${Date.now()}@refa.local`,
        passwordHash: 'dummy',
        rol: 'CLIENTE',
        activo: activo ?? true,
        ...(vehiculo
          ? {
              vehiculos: {
                create: [{
                  marca: vehiculo.marca,
                  modelo: vehiculo.modelo,
                  serieVin: vehiculo.serieVin || '',
                  anio: vehiculo.anio,
                  placas: vehiculo.placas,
                  color: vehiculo.color || '',
                  kilometrajeActual: vehiculo.kilometrajeActual || 0,
                  notas: vehiculo.notas || ''
                }],
              },
            }
          : {}),
      },
      include: {
        vehiculos: true,
      },
    });
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.findOne(id);
    return this.prisma.usuario.update({ where: { id }, data: { 
      email: dto.email, 
      activo: dto.activo 
    } });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.usuario.delete({ where: { id } });
    return { message: 'Cliente eliminado' };
  }
}
