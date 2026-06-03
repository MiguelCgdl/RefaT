import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { VehiclesService } from './vehicles.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';

@Controller('vehiculos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
  constructor(private service: VehiclesService) {}

  @Get()
  @Roles('ADMIN', 'ASESOR', 'MECANICO')
  list(@Query() q: PaginationQueryDto) {
    return this.service.findAll(q.page, q.pageSize);
  }

  @Get(':id/historial')
  @Roles('ADMIN', 'ASESOR', 'MECANICO')
  historial(@Param('id', ParseIntPipe) id: number) {
    return this.service.historial(id);
  }

  @Get(':id')
  @Roles('ADMIN', 'ASESOR', 'MECANICO')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'ASESOR')
  create(@Body() dto: CreateVehiculoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ASESOR')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehiculoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ASESOR')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
