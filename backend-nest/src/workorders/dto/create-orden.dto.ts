import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EstadoOrden, PrioridadOrden } from '@prisma/client';

export class CreateOrdenDto {
  @IsInt()
  vehiculoId!: number;

  @IsString()
  quejaCliente!: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsInt()
  mecanicoId?: number;

  @IsOptional()
  @IsEnum(EstadoOrden)
  estado?: EstadoOrden;

  @IsOptional()
  @IsEnum(PrioridadOrden)
  prioridad?: PrioridadOrden;

  @IsOptional()
  @IsDateString()
  fechaEstimada?: string;
}
