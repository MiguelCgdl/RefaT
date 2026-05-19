import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginated, skipTake } from '../common/utils/paginate';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  private mapVehiculo(v: {
    id: number;
    clienteId: number;
    marca: string;
    modelo: string;
    serieVin: string;
    anio: number;
    placas: string;
    color: string;
    kilometrajeActual: number;
    notas: string;
    activo: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
    cliente?: { nombre: string };
  }) {
    return {
      id: v.id,
      cliente: v.clienteId,
      cliente_nombre: v.cliente?.nombre,
      marca: v.marca,
      modelo: v.modelo,
      serie_vin: v.serieVin,
      anio: v.anio,
      placas: v.placas,
      color: v.color,
      kilometraje_actual: v.kilometrajeActual,
      notas: v.notas,
      activo: v.activo,
      creado_en: v.creadoEn,
      actualizado_en: v.actualizadoEn,
    };
  }

  async findAll(page = 1, pageSize = 20) {
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.vehiculo.count(),
      this.prisma.vehiculo.findMany({
        include: { cliente: { select: { nombre: true } } },
        orderBy: [{ marca: 'asc' }, { modelo: 'asc' }],
        ...skipTake(page, pageSize),
      }),
    ]);
    return paginated(rows.map((r) => this.mapVehiculo(r)), total, page, pageSize);
  }

  async findOne(id: number) {
    const row = await this.prisma.vehiculo.findUnique({
      where: { id },
      include: { cliente: { select: { nombre: true } } },
    });
    if (!row) throw new NotFoundException('Vehículo no encontrado');
    return this.mapVehiculo(row);
  }

  async historial(id: number) {
    await this.findOne(id);
    const ordenes = await this.prisma.ordenTrabajo.findMany({
      where: { vehiculoId: id },
      orderBy: { fechaIngreso: 'desc' },
    });
    return ordenes.map((o) => ({
      id: o.id,
      folio: o.folio,
      estado: o.estado.toLowerCase(),
      fecha_ingreso: o.fechaIngreso,
      fecha_cierre: o.fechaCierre,
      queja_cliente: o.quejaCliente,
      diagnostico: o.diagnostico,
      prioridad: o.prioridad.toLowerCase(),
    }));
  }

  async create(dto: CreateVehiculoDto) {
    const row = await this.prisma.vehiculo.create({
      data: {
        clienteId: dto.clienteId,
        marca: dto.marca,
        modelo: dto.modelo,
        serieVin: dto.serieVin ?? '',
        anio: dto.anio,
        placas: dto.placas,
        color: dto.color ?? '',
        kilometrajeActual: dto.kilometrajeActual ?? 0,
        notas: dto.notas ?? '',
        activo: dto.activo ?? true,
      },
      include: { cliente: { select: { nombre: true } } },
    });
    return this.mapVehiculo(row);
  }

  async update(id: number, dto: UpdateVehiculoDto) {
    await this.findOne(id);
    const row = await this.prisma.vehiculo.update({
      where: { id },
      data: {
        clienteId: dto.clienteId,
        marca: dto.marca,
        modelo: dto.modelo,
        serieVin: dto.serieVin,
        anio: dto.anio,
        placas: dto.placas,
        color: dto.color,
        kilometrajeActual: dto.kilometrajeActual,
        notas: dto.notas,
        activo: dto.activo,
      },
      include: { cliente: { select: { nombre: true } } },
    });
    return this.mapVehiculo(row);
  }
}
