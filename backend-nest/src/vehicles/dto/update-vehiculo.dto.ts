import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateVehiculoDto {
  @IsOptional()
  @IsInt()
  clienteId?: number;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  serieVin?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsString()
  placas?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  kilometrajeActual?: number;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
