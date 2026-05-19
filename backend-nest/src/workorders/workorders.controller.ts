import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { WorkordersService } from './workorders.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@Controller('ordenes')
@UseGuards(JwtAuthGuard)
export class WorkordersController {
  constructor(private service: WorkordersService) {}

  @Get()
  list(@Query() q: PaginationQueryDto) {
    return this.service.findAll(q.page, q.pageSize);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrdenDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrdenDto) {
    return this.service.update(id, dto);
  }
}
