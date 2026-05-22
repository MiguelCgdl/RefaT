import { IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { TipoLineaPresupuesto } from '@prisma/client';

export class CreateLineaDto {
  @IsInt()
  presupuestoId!: number;

  @IsEnum(TipoLineaPresupuesto)
  tipo!: TipoLineaPresupuesto;

  @ValidateIf((o) => o.tipo === TipoLineaPresupuesto.SERVICIO)
  @IsString()
  @MaxLength(300)
  descripcion?: string;

  @ValidateIf((o) => o.tipo === TipoLineaPresupuesto.REFACCION)
  @IsOptional()
  @IsInt()
  refaccionId?: number;

  @IsNumber()
  cantidad!: number;

  @ValidateIf((o) => o.tipo === TipoLineaPresupuesto.SERVICIO)
  @IsOptional()
  @IsNumber()
  precioUnitario?: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;
}
