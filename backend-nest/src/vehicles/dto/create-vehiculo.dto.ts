import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateVehiculoDto {
  @IsInt()
  clienteId!: number;

  @IsString()
  @MaxLength(80)
  marca!: string;

  @IsString()
  @MaxLength(80)
  modelo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(17)
  serieVin?: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  anio!: number;

  @IsString()
  @MaxLength(15)
  placas!: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  kilometrajeActual?: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
