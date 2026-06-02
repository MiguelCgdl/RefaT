import { IsString, IsInt } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  title!: string;
}
