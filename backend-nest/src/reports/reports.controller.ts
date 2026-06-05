import { Controller, Get, Header, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReportsService } from './reports.service';

@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('resumen')
  @Roles('ADMIN', 'ASESOR', 'MECANICO')
  resumen() {
    return this.reports.resumenDashboard();
  }

  @Get('presupuestos/:id/pdf')
  @Roles('ADMIN', 'ASESOR')
  @Header('Content-Type', 'application/pdf')
  async pdfPresupuesto(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const buf = await this.reports.generarPdfPresupuesto(id);
    res.setHeader('Content-Disposition', `attachment; filename=presupuesto-${id}.pdf`);
    res.send(buf);
  }

  @Get('refacciones/excel')
  @Roles('ADMIN', 'ALMACEN')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async excelRefacciones(@Res() res: Response) {
    const buf = await this.reports.exportarRefaccionesExcel();
    res.setHeader('Content-Disposition', 'attachment; filename=refacciones.xlsx');
    res.send(buf);
  }

  @Get('inventario/pdf')
  @Roles('ADMIN')
  @Header('Content-Type', 'application/pdf')
  async pdfInventarioValorizado(@Res() res: Response) {
    const buf = await this.reports.generarPdfInventarioValorizado();
    res.setHeader('Content-Disposition', 'attachment; filename=inventario-valorizado.pdf');
    res.send(buf);
  }

  @Get('inventario/excel')
  @Roles('ADMIN')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async excelInventarioValorizado(@Res() res: Response) {
    const buf = await this.reports.exportarInventarioValorizadoExcel();
    res.setHeader('Content-Disposition', 'attachment; filename=inventario-valorizado.xlsx');
    res.send(buf);
  }
}
