import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { KanbanService } from './kanban.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { CreateColumnDto, UpdateColumnDto, CreateCardDto, UpdateCardDto } from './dto/create-column.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('kanban')
@Roles('ADMIN', 'MECANICO', 'ASESOR')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  // Boards
  @Post('boards')
  async createBoard(@Req() req: any, @Body() dto: CreateBoardDto) {
    const userId = req.user?.sub ?? 1;
    return this.kanbanService.createBoard(dto.title, userId);
  }

  @Get('boards')
  async getBoards(@Req() req: any) {
    const userId = req.user?.sub ?? 1;
    return this.kanbanService.getBoards(userId);
  }

  @Patch('boards/:id')
  async updateBoard(@Param('id') id: number, @Body() dto: UpdateBoardDto) {
    return this.kanbanService.updateBoard(id, dto.title);
  }

  @Delete('boards/:id')
  async deleteBoard(@Param('id') id: number) {
    return this.kanbanService.deleteBoard(id);
  }

  // Columns
  @Post('columns')
  async createColumn(@Body() dto: CreateColumnDto) {
    return this.kanbanService.createColumn(dto.boardId, dto.title);
  }

  @Patch('columns/:id')
  async updateColumn(@Param('id') id: number, @Body() dto: UpdateColumnDto) {
    return this.kanbanService.updateColumn(id, dto.title);
  }

  @Delete('columns/:id')
  async deleteColumn(@Param('id') id: number) {
    return this.kanbanService.deleteColumn(id);
  }

  // Cards
  @Post('cards')
  async createCard(@Body() dto: CreateCardDto) {
    return this.kanbanService.createCard(dto.columnId, dto.title, dto.description);
  }

  @Patch('cards/:id')
  async updateCard(@Param('id') id: number, @Body() dto: UpdateCardDto) {
    return this.kanbanService.updateCard(id, dto);
  }

  @Delete('cards/:id')
  async deleteCard(@Param('id') id: number) {
    return this.kanbanService.deleteCard(id);
  }
}
