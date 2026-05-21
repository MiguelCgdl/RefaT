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
    const where: Prisma.ClienteWhereInput = {};
    const [total, items] = await this.prisma.$transaction([
      this.prisma.cliente.count({ where }),
      this.prisma.cliente.findMany({ where, orderBy: { nombre: 'asc' }, ...skipTake(page, pageSize) }),
    ]);
    return paginated(items, total, page, pageSize);
  }

  async findOne(id: number) {
    const item = await this.prisma.cliente.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Cliente no encontrado');
    return item;
  }

  create(dto: CreateClienteDto) {
    const { vehiculo, ...clienteData } = dto;
    return this.prisma.cliente.create({
      data: {
        ...clienteData,
        ...(vehiculo
          ? {
              vehiculos: {
                create: vehiculo,
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
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }
}
