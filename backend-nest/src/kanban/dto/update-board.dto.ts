import { IsString, IsOptional } from 'class-validator';

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  title?: string;
}
