import { IsInt, IsOptional } from 'class-validator';

export class CreatePresupuestoDto {
  @IsInt()
  ordenId!: number;

  @IsOptional()
  @IsInt()
  version?: number;
}
