// src/kanban/dto/create-column.dto.ts
import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateColumnDto {
  @IsInt()
  boardId: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

// src/kanban/dto/update-column.dto.ts
import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

// src/kanban/dto/create-card.dto.ts
import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateCardDto {
  @IsInt()
  columnId: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

// src/kanban/dto/update-card.dto.ts
import { IsString, IsOptional, IsInt } from 'class-validator';

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
