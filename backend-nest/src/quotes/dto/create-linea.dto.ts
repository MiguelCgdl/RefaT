import { IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { TipoLineaPresupuesto } from '@prisma/client';

export class CreateLineaDto {
  @IsInt()
  presupuestoId!: number;

  @IsEnum(TipoLineaPresupuesto)
  tipo!: TipoLineaPresupuesto;

  @IsString()
  @MaxLength(300)
  descripcion!: string;

  @IsOptional()
  @IsInt()
  refaccionId?: number;

  @IsNumber()
  cantidad!: number;

  @IsOptional()
  @IsNumber()
  precioUnitario?: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;
}
