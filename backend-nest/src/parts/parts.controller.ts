import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PartsService } from './parts.service';
import { CreateRefaccionDto } from './dto/create-refaccion.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartsController {
  constructor(private service: PartsService) {}

  /** ASESOR can read parts to reference them in quotes */
  @Get('refacciones')
  @Roles('ADMIN', 'ALMACEN', 'ASESOR')
  listRefacciones(@Query() q: PaginationQueryDto) {
    return this.service.findAllRefacciones(q.page, q.pageSize);
  }

  @Post('refacciones')
  @Roles('ADMIN', 'ALMACEN')
  createRefaccion(@Body() dto: CreateRefaccionDto) {
    return this.service.createRefaccion(dto);
  }

  @Patch('refacciones/:id')
  @Roles('ADMIN', 'ALMACEN')
  updateRefaccion(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateRefaccionDto>) {
    return this.service.updateRefaccion(id, dto);
  }

  @Delete('refacciones/:id')
  @Roles('ADMIN', 'ALMACEN')
  deleteRefaccion(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteRefaccion(id);
  }

  @Get('movimientos-inventario')
  @Roles('ADMIN', 'ALMACEN')
  listMovimientos(@Query() q: PaginationQueryDto) {
    return this.service.findAllMovimientos(q.page, q.pageSize);
  }

  @Post('movimientos-inventario')
  @Roles('ADMIN', 'ALMACEN')
  createMovimiento(@Body() dto: CreateMovimientoDto) {
    return this.service.createMovimiento(dto);
  }
}
