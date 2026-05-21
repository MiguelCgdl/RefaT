import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginated, skipTake } from '../common/utils/paginate';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { CreateRefaccionDto } from './dto/create-refaccion.dto';

@Injectable()
export class PartsService {
  constructor(private prisma: PrismaService) {}

  private mapRefaccion(r: {
    id: number;
    sku: string;
    nombre: string;
    categoria: string;
    costo: Prisma.Decimal;
    precioVenta: Prisma.Decimal;
    stock: Prisma.Decimal;
    stockMinimo: Prisma.Decimal;
    ubicacion: string;
    activo: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
  }) {
    return {
      id: r.id,
      sku: r.sku,
      nombre: r.nombre,
      categoria: r.categoria,
      costo: r.costo.toString(),
      precio_venta: r.precioVenta.toString(),
      stock: r.stock.toString(),
      stock_minimo: r.stockMinimo.toString(),
      ubicacion: r.ubicacion,
      activo: r.activo,
      bajo_stock: Number(r.stock) <= Number(r.stockMinimo),
      creado_en: r.creadoEn,
      actualizado_en: r.actualizadoEn,
    };
  }

  async findAllRefacciones(page = 1, pageSize = 20) {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.refaccion.count(),
      this.prisma.refaccion.findMany({ orderBy: { nombre: 'asc' }, ...skipTake(page, pageSize) }),
    ]);
    return paginated(rows.map((r) => this.mapRefaccion(r)), total, page, pageSize);
  }

  createRefaccion(dto: CreateRefaccionDto) {
    return this.prisma.refaccion
      .create({
        data: {
          sku: dto.sku,
          nombre: dto.nombre,
          categoria: dto.categoria ?? '',
          costo: dto.costo ?? 0,
          precioVenta: dto.precioVenta,
          stock: dto.stock ?? 0,
          stockMinimo: dto.stockMinimo ?? 0,
          ubicacion: dto.ubicacion ?? '',
          activo: dto.activo ?? true,
        },
      })
      .then((r) => this.mapRefaccion(r));
  }

  async updateRefaccion(id: number, dto: Partial<CreateRefaccionDto>) {
    const ref = await this.prisma.refaccion.findUnique({ where: { id } });
    if (!ref) throw new NotFoundException('Refacción no encontrada');
    const row = await this.prisma.refaccion.update({
      where: { id },
      data: {
        sku: dto.sku,
        nombre: dto.nombre,
        categoria: dto.categoria,
        costo: dto.costo,
        precioVenta: dto.precioVenta,
        stock: dto.stock,
        stockMinimo: dto.stockMinimo,
        ubicacion: dto.ubicacion,
        activo: dto.activo,
      },
    });
    return this.mapRefaccion(row);
  }

  async deleteRefaccion(id: number) {
    const ref = await this.prisma.refaccion.findUnique({ where: { id } });
    if (!ref) throw new NotFoundException('Refacción no encontrada');
    await this.prisma.refaccion.delete({ where: { id } });
    return { message: 'Refacción eliminada' };
  }


  async findAllMovimientos(page = 1, pageSize = 20) {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.movimientoInventario.count(),
      this.prisma.movimientoInventario.findMany({
        orderBy: { creadoEn: 'desc' },
        ...skipTake(page, pageSize),
      }),
    ]);
    return paginated(rows, total, page, pageSize);
  }

  async createMovimiento(dto: CreateMovimientoDto) {
    const ref = await this.prisma.refaccion.findUnique({ where: { id: dto.refaccionId } });
    if (!ref) throw new NotFoundException('Refacción no encontrada');

    const mov = await this.prisma.$transaction(async (tx) => {
      const created = await tx.movimientoInventario.create({
        data: {
          refaccionId: dto.refaccionId,
          tipo: dto.tipo,
          cantidad: dto.cantidad,
          ordenId: dto.ordenId,
          notas: dto.notas ?? '',
        },
      });
      if (dto.tipo === 'ENTRADA') {
        await tx.refaccion.update({
          where: { id: dto.refaccionId },
          data: { stock: { increment: dto.cantidad } },
        });
      } else if (dto.tipo === 'SALIDA') {
        await tx.refaccion.update({
          where: { id: dto.refaccionId },
          data: { stock: { decrement: dto.cantidad } },
        });
      }
      return created;
    });
    return mov;
  }
}
