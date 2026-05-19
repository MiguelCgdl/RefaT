import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { QueueService } from './queue.service';

@Controller('cola')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QueueController {
  constructor(private queue: QueueService) {}

  @Post('recordatorio')
  @Roles(RolUsuario.ADMIN, RolUsuario.RECEPCION)
  recordatorio(@Body() body: Record<string, unknown>) {
    return this.queue.encolarRecordatorio(body);
  }

  @Post('stock-alert')
  @Roles(RolUsuario.ADMIN, RolUsuario.ALMACEN)
  stockAlert(@Body('refaccionId') refaccionId: number) {
    return this.queue.encolarStockAlert(refaccionId);
  }
}
