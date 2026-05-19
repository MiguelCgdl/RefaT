import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EstadoOrden, PrioridadOrden } from '@prisma/client';

export class UpdateOrdenDto {
  @IsOptional()
  @IsEnum(EstadoOrden)
  estado?: EstadoOrden;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsInt()
  mecanicoId?: number;

  @IsOptional()
  @IsEnum(PrioridadOrden)
  prioridad?: PrioridadOrden;

  @IsOptional()
  @IsDateString()
  fechaEstimada?: string;

  @IsOptional()
  @IsDateString()
  fechaCierre?: string;
}
