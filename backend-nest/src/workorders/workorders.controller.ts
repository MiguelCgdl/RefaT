import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { WorkordersService } from './workorders.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@Controller('ordenes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkordersController {
  constructor(private service: WorkordersService) {}

  @Get()
  @Roles('ADMIN', 'ASESOR', 'MECANICO')
  list(@Query() q: PaginationQueryDto) {
    return this.service.findAll(q.page, q.pageSize);
  }

  @Get(':id')
  @Roles('ADMIN', 'ASESOR', 'MECANICO')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'ASESOR')
  create(@Body() dto: CreateOrdenDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ASESOR', 'MECANICO')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrdenDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ASESOR')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
