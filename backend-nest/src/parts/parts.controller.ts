import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PartsService } from './parts.service';
import { CreateRefaccionDto } from './dto/create-refaccion.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class PartsController {
  constructor(private service: PartsService) {}

  @Get('refacciones')
  listRefacciones(@Query() q: PaginationQueryDto) {
    return this.service.findAllRefacciones(q.page, q.pageSize);
  }

  @Post('refacciones')
  createRefaccion(@Body() dto: CreateRefaccionDto) {
    return this.service.createRefaccion(dto);
  }

  @Patch('refacciones/:id')
  updateRefaccion(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateRefaccionDto>) {
    return this.service.updateRefaccion(id, dto);
  }

  @Delete('refacciones/:id')
  deleteRefaccion(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteRefaccion(id);
  }

  @Get('movimientos-inventario')
  listMovimientos(@Query() q: PaginationQueryDto) {
    return this.service.findAllMovimientos(q.page, q.pageSize);
  }

  @Post('movimientos-inventario')
  createMovimiento(@Body() dto: CreateMovimientoDto) {
    return this.service.createMovimiento(dto);
  }
}
