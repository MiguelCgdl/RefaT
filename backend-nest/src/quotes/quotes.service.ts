import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  EstadoOrden,
  EstadoPresupuesto,
  Prisma,
  TipoLineaPresupuesto,
  TipoMovimientoInventario,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginated, skipTake } from '../common/utils/paginate';
import { CreateLineaDto } from './dto/create-linea.dto';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  private async recalcularTotales(presupuestoId: number, tx?: Prisma.TransactionClient) {
    const db = tx ?? this.prisma;
    const lineas = await db.lineaPresupuesto.findMany({ where: { presupuestoId } });
    const subtotal = lineas.reduce((acc, l) => {
      const bruto = Number(l.cantidad) * Number(l.precioUnitario);
      return acc + bruto - Number(l.descuento);
    }, 0);
    const iva = Math.round(subtotal * 0.16 * 100) / 100;
    const total = subtotal + iva;
    await db.presupuesto.update({
      where: { id: presupuestoId },
      data: { subtotal, iva, total },
    });
  }

  private mapPresupuesto(p: {
    id: number;
    ordenId: number;
    version: number;
    estado: string;
    subtotal: Prisma.Decimal;
    iva: Prisma.Decimal;
    total: Prisma.Decimal;
    aprobadoEn: Date | null;
    creadoEn: Date;
    actualizadoEn: Date;
    orden?: { folio: string };
    lineas?: Array<{
      id: number;
      presupuestoId: number;
      tipo: string;
      descripcion: string;
      refaccionId: number | null;
      cantidad: Prisma.Decimal;
      precioUnitario: Prisma.Decimal;
      descuento: Prisma.Decimal;
    }>;
  }) {
    return {
      id: p.id,
      orden: p.ordenId,
      orden_folio: p.orden?.folio,
      version: p.version,
      estado: p.estado.toLowerCase(),
      subtotal: p.subtotal.toString(),
      iva: p.iva.toString(),
      total: p.total.toString(),
      aprobado_en: p.aprobadoEn,
      creado_en: p.creadoEn,
      actualizado_en: p.actualizadoEn,
      lineas: p.lineas?.map((l) => ({
        id: l.id,
        presupuesto: l.presupuestoId,
        tipo: l.tipo.toLowerCase(),
        descripcion: l.descripcion,
        refaccion: l.refaccionId,
        cantidad: l.cantidad.toString(),
        precio_unitario: l.precioUnitario.toString(),
        descuento: l.descuento.toString(),
        importe_neto: (
          Number(l.cantidad) * Number(l.precioUnitario) -
          Number(l.descuento)
        ).toFixed(2),
      })),
    };
  }

  async findAll(page = 1, pageSize = 20) {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.presupuesto.count(),
      this.prisma.presupuesto.findMany({
        include: { orden: { select: { folio: true } }, lineas: true },
        orderBy: { creadoEn: 'desc' },
        ...skipTake(page, pageSize),
      }),
    ]);
    return paginated(rows.map((r) => this.mapPresupuesto(r)), total, page, pageSize);
  }

  async findOne(id: number) {
    const row = await this.prisma.presupuesto.findUnique({
      where: { id },
      include: { orden: { select: { folio: true } }, lineas: true },
    });
    if (!row) throw new NotFoundException('Presupuesto no encontrado');
    return this.mapPresupuesto(row);
  }

  async create(dto: CreatePresupuestoDto) {
    const maxVersion = await this.prisma.presupuesto.aggregate({
      where: { ordenId: dto.ordenId },
      _max: { version: true },
    });
    const version = dto.version ?? (maxVersion._max.version ?? 0) + 1;
    const row = await this.prisma.presupuesto.create({
      data: { ordenId: dto.ordenId, version },
      include: { orden: { select: { folio: true } }, lineas: true },
    });
    return this.mapPresupuesto(row);
  }

  async createLinea(dto: CreateLineaDto) {
    let precio = dto.precioUnitario;
    if (dto.tipo === TipoLineaPresupuesto.REFACCION && dto.refaccionId && precio == null) {
      const ref = await this.prisma.refaccion.findUnique({ where: { id: dto.refaccionId } });
      if (!ref) throw new NotFoundException('Refacción no encontrada');
      precio = Number(ref.precioVenta);
    }
    if (precio == null) throw new BadRequestException('precioUnitario requerido');

    await this.prisma.lineaPresupuesto.create({
      data: {
        presupuestoId: dto.presupuestoId,
        tipo: dto.tipo,
        descripcion: dto.descripcion,
        refaccionId: dto.refaccionId,
        cantidad: dto.cantidad,
        precioUnitario: precio,
        descuento: dto.descuento ?? 0,
      },
    });
    await this.recalcularTotales(dto.presupuestoId);
    return this.findOne(dto.presupuestoId);
  }

  async aprobar(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const presupuesto = await tx.presupuesto.findUnique({
        where: { id },
        include: { orden: true, lineas: true },
      });
      if (!presupuesto) throw new NotFoundException('Presupuesto no encontrado');

      if (presupuesto.estado === EstadoPresupuesto.APROBADO) {
        throw new BadRequestException({ detalle: 'El presupuesto ya está aprobado.' });
      }
      if (presupuesto.estado === EstadoPresupuesto.RECHAZADO) {
        throw new BadRequestException({ detalle: 'No se puede aprobar un presupuesto rechazado.' });
      }

      const lineasRef = presupuesto.lineas.filter(
        (l) => l.tipo === TipoLineaPresupuesto.REFACCION && l.refaccionId,
      );

      for (const linea of lineasRef) {
        const ref = await tx.refaccion.findUniqueOrThrow({ where: { id: linea.refaccionId! } });
        const cantidad = Number(linea.cantidad);
        if (Number(ref.stock) < cantidad) {
          throw new BadRequestException({
            detalle: `Stock insuficiente para ${ref.sku}: disponible ${ref.stock}, requerido ${cantidad}.`,
          });
        }
      }

      for (const linea of lineasRef) {
        const ref = await tx.refaccion.update({
          where: { id: linea.refaccionId! },
          data: { stock: { decrement: linea.cantidad } },
        });
        await tx.movimientoInventario.create({
          data: {
            refaccionId: ref.id,
            tipo: TipoMovimientoInventario.SALIDA,
            cantidad: linea.cantidad,
            ordenId: presupuesto.ordenId,
            notas: `Salida por aprobación presupuesto v${presupuesto.version}`,
          },
        });
      }

      const actualizado = await tx.presupuesto.update({
        where: { id },
        data: { estado: EstadoPresupuesto.APROBADO, aprobadoEn: new Date() },
        include: { orden: { select: { folio: true } }, lineas: true },
      });

      const estadosPrevios: EstadoOrden[] = [
        EstadoOrden.RECIBIDO,
        EstadoOrden.DIAGNOSTICO,
        EstadoOrden.ESPERA_APROBACION,
      ];
      if (estadosPrevios.includes(presupuesto.orden.estado)) {
        await tx.ordenTrabajo.update({
          where: { id: presupuesto.ordenId },
          data: { estado: EstadoOrden.EN_PROCESO },
        });
      }

      return this.mapPresupuesto(actualizado);
    });
  }

  async enviar(id: number, method: 'email' | 'whatsapp') {
    const presupuesto = await this.prisma.presupuesto.findUnique({
      where: { id },
      include: {
        orden: {
          include: {
            vehiculo: {
              include: { cliente: true },
            },
          },
        },
      },
    });

    if (!presupuesto) throw new NotFoundException('Presupuesto no encontrado');

    const cliente = presupuesto.orden.vehiculo.cliente;
    if (method === 'email' && !cliente.email) {
      throw new BadRequestException('El cliente no tiene un correo electrónico registrado.');
    }
    if (method === 'whatsapp' && !cliente.telefono) {
      throw new BadRequestException('El cliente no tiene un teléfono registrado.');
    }

    // TODO: In a real app, you would send the email or whatsapp here via external APIs.
    console.log(`Enviando presupuesto ${presupuesto.id} a ${cliente.nombre} vía ${method}...`);

    const actualizado = await this.prisma.presupuesto.update({
      where: { id },
      data: { estado: EstadoPresupuesto.ENVIADO },
      include: { orden: { select: { folio: true } }, lineas: true },
    });

    return this.mapPresupuesto(actualizado);
  }

  async deleteLinea(lineaId: number) {
    const linea = await this.prisma.lineaPresupuesto.findUnique({ where: { id: lineaId } });
    if (!linea) throw new NotFoundException('Línea de presupuesto no encontrada');
    await this.prisma.lineaPresupuesto.delete({ where: { id: lineaId } });
    await this.recalcularTotales(linea.presupuestoId);
    return this.findOne(linea.presupuestoId);
  }

  async update(id: number, dto: { estado?: string; observaciones?: string }) {
    await this.findOne(id);
    const row = await this.prisma.presupuesto.update({
      where: { id },
      data: {
        ...(dto.estado ? { estado: dto.estado as EstadoPresupuesto } : {}),
      },
      include: { orden: { select: { folio: true } }, lineas: true },
    });
    return this.mapPresupuesto(row);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.presupuesto.delete({ where: { id } });
    return { message: 'Presupuesto eliminado' };
  }
}
