// src/kanban/dto/create-column.dto.ts
import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateColumnDto {
  @IsInt()
  boardId!: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class CreateCardDto {
  @IsInt()
  columnId!: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
