import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
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

  @Post('presupuestos/:id/enviar')
  enviar(@Param('id', ParseIntPipe) id: number, @Body('method') method: 'email' | 'whatsapp') {
    return this.service.enviar(id, method);
  }

  @Post('lineas-presupuesto')
  createLinea(@Body() dto: CreateLineaDto) {
    return this.service.createLinea(dto);
  }

  @Delete('lineas-presupuesto/:id')
  deleteLinea(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteLinea(id);
  }

  @Patch('presupuestos/:id')
  updatePresupuesto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { estado?: string; observaciones?: string },
  ) {
    return this.service.update(id, dto);
  }

  @Delete('presupuestos/:id')
  deletePresupuesto(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
