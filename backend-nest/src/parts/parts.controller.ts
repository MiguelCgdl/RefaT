import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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

  @Get('movimientos-inventario')
  listMovimientos(@Query() q: PaginationQueryDto) {
    return this.service.findAllMovimientos(q.page, q.pageSize);
  }

  @Post('movimientos-inventario')
  createMovimiento(@Body() dto: CreateMovimientoDto) {
    return this.service.createMovimiento(dto);
  }
}
