import { IsEnum, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoMovimientoInventario } from '@prisma/client';

export class CreateMovimientoDto {
  @IsInt()
  refaccionId!: number;

  @IsEnum(TipoMovimientoInventario)
  tipo!: TipoMovimientoInventario;

  @IsNumber()
  cantidad!: number;

  @IsOptional()
  @IsInt()
  ordenId?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}
