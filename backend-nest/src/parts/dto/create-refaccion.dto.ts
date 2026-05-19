import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRefaccionDto {
  @IsString()
  @MaxLength(50)
  sku!: string;

  @IsString()
  @MaxLength(200)
  nombre!: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsNumber()
  costo?: number;

  @IsNumber()
  precioVenta!: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsNumber()
  stockMinimo?: number;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
