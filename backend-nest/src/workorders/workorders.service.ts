import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginated, skipTake } from '../common/utils/paginate';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@Injectable()
export class WorkordersService {
  constructor(private prisma: PrismaService) {}

  private async generarFolio(tx: Prisma.TransactionClient): Promise<string> {
    const prefijo = `OT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    const ultima = await tx.ordenTrabajo.findFirst({
      where: { folio: { startsWith: prefijo } },
      orderBy: { folio: 'desc' },
    });
    const secuencia = ultima ? parseInt(ultima.folio.split('-').pop() ?? '0', 10) + 1 : 1;
    return `${prefijo}-${String(secuencia).padStart(4, '0')}`;
  }

  private mapOrden(o: {
    id: number;
    folio: string;
    vehiculoId: number;
    fechaIngreso: Date;
    fechaEstimada: Date | null;
    fechaCierre: Date | null;
    estado: string;
    quejaCliente: string;
    diagnostico: string;
    mecanicoId: number | null;
    prioridad: string;
    creadoEn: Date;
    actualizadoEn: Date;
    vehiculo?: { placas: string };
    mecanico?: { username: string } | null;
  }) {
    return {
      id: o.id,
      folio: o.folio,
      vehiculo: o.vehiculoId,
      vehiculo_placas: o.vehiculo?.placas,
      fecha_ingreso: o.fechaIngreso,
      fecha_estimada: o.fechaEstimada,
      fecha_cierre: o.fechaCierre,
      estado: o.estado.toLowerCase(),
      queja_cliente: o.quejaCliente,
      diagnostico: o.diagnostico,
      mecanico: o.mecanicoId,
      mecanico_nombre: o.mecanico?.username ?? null,
      prioridad: o.prioridad.toLowerCase(),
      creado_en: o.creadoEn,
      actualizado_en: o.actualizadoEn,
    };
  }

  async findAll(page = 1, pageSize = 20) {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.ordenTrabajo.count(),
      this.prisma.ordenTrabajo.findMany({
        include: {
          vehiculo: { select: { placas: true } },
          mecanico: { select: { username: true } },
        },
        orderBy: { fechaIngreso: 'desc' },
        ...skipTake(page, pageSize),
      }),
    ]);
    return paginated(rows.map((r) => this.mapOrden(r)), total, page, pageSize);
  }

  async findOne(id: number) {
    const row = await this.prisma.ordenTrabajo.findUnique({
      where: { id },
      include: {
        vehiculo: { select: { placas: true } },
        mecanico: { select: { username: true } },
      },
    });
    if (!row) throw new NotFoundException('Orden no encontrada');
    return this.mapOrden(row);
  }

  async create(dto: CreateOrdenDto) {
    const row = await this.prisma.$transaction(async (tx) => {
      const folio = await this.generarFolio(tx);
      return tx.ordenTrabajo.create({
        data: {
          folio,
          vehiculoId: dto.vehiculoId,
          quejaCliente: dto.quejaCliente,
          diagnostico: dto.diagnostico ?? '',
          mecanicoId: dto.mecanicoId,
          estado: dto.estado,
          prioridad: dto.prioridad,
          fechaEstimada: dto.fechaEstimada ? new Date(dto.fechaEstimada) : undefined,
        },
        include: {
          vehiculo: { select: { placas: true } },
          mecanico: { select: { username: true } },
        },
      });
    });
    return this.mapOrden(row);
  }

  async update(id: number, dto: UpdateOrdenDto) {
    await this.findOne(id);
    
    let fechaCierre: Date | undefined = dto.fechaCierre ? new Date(dto.fechaCierre) : undefined;
    if ((dto.estado === 'LISTO' || dto.estado === 'ENTREGADO') && !fechaCierre) {
      fechaCierre = new Date();
    }

    const row = await this.prisma.ordenTrabajo.update({
      where: { id },
      data: {
        estado: dto.estado,
        diagnostico: dto.diagnostico,
        mecanicoId: dto.mecanicoId,
        prioridad: dto.prioridad,
        fechaEstimada: dto.fechaEstimada ? new Date(dto.fechaEstimada) : undefined,
        fechaCierre: fechaCierre,
      },
      include: {
        vehiculo: { select: { placas: true } },
        mecanico: { select: { username: true } },
      },
    });
    return this.mapOrden(row);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.ordenTrabajo.delete({ where: { id } });
    return { message: 'Orden eliminada' };
  }
}
