import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { QuotesService } from './quotes.service';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { CreateLineaDto } from './dto/create-linea.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private service: QuotesService) {}

  @Get('presupuestos')
  listPresupuestos(@Query() q: PaginationQueryDto) {
    return this.service.findAll(q.page, q.pageSize);
  }

  @Get('presupuestos/:id')
  getPresupuesto(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post('presupuestos')
  createPresupuesto(@Body() dto: CreatePresupuestoDto) {
    return this.service.create(dto);
  }

  @Post('presupuestos/:id/aprobar')
  aprobar(@Param('id', ParseIntPipe) id: number) {
    return this.service.aprobar(id);
  }

  @Post('lineas-presupuesto')
  createLinea(@Body() dto: CreateLineaDto) {
    return this.service.createLinea(dto);
  }
}
