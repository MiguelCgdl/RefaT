import { Controller, Get, Header, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reportes')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('resumen')
  resumen() {
    return this.reports.resumenDashboard();
  }

  @Get('presupuestos/:id/pdf')
  @Header('Content-Type', 'application/pdf')
  async pdfPresupuesto(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const buf = await this.reports.generarPdfPresupuesto(id);
    res.setHeader('Content-Disposition', `attachment; filename=presupuesto-${id}.pdf`);
    res.send(buf);
  }

  @Get('refacciones/excel')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async excelRefacciones(@Res() res: Response) {
    const buf = await this.reports.exportarRefaccionesExcel();
    res.setHeader('Content-Disposition', 'attachment; filename=refacciones.xlsx');
    res.send(buf);
  }
}
