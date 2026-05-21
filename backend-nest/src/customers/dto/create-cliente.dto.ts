import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, ValidateNested, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class VehiculoNestedDto {
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
}

export class CreateClienteDto {
  @IsString()
  @MaxLength(200)
  nombre!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  rfc?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => VehiculoNestedDto)
  vehiculo?: VehiculoNestedDto;
}
