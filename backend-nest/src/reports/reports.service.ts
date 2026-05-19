import { Injectable } from '@nestjs/common';
import { EstadoOrden } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
// pdfkit sin tipos ESM por defecto
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async resumenDashboard() {
    const grupos = await this.prisma.ordenTrabajo.groupBy({
      by: ['estado'],
      _count: { id: true },
      orderBy: { estado: 'asc' },
    });
    const refaccionesActivas = await this.prisma.refaccion.findMany({
      where: { activo: true },
      select: { stock: true, stockMinimo: true },
    });
    const refaccionesBajoStock = refaccionesActivas.filter(
      (r) => Number(r.stock) <= Number(r.stockMinimo),
    ).length;
    const ordenesActivas = await this.prisma.ordenTrabajo.count({
      where: { estado: { notIn: [EstadoOrden.ENTREGADO, EstadoOrden.CANCELADO] } },
    });

    return {
      ordenes_por_estado: grupos.map((g) => ({
        estado: g.estado.toLowerCase(),
        total: g._count.id,
      })),
      refacciones_bajo_stock: refaccionesBajoStock,
      ordenes_activas: ordenesActivas,
    };
  }

  /** Stub básico: PDF de presupuesto */
  async generarPdfPresupuesto(presupuestoId: number): Promise<Buffer> {
    const p = await this.prisma.presupuesto.findUniqueOrThrow({
      where: { id: presupuestoId },
      include: { orden: true, lineas: true },
    });
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.fontSize(18).text(`Presupuesto v${p.version} — ${p.orden.folio}`);
      doc.moveDown();
      p.lineas.forEach((l) => {
        doc.fontSize(12).text(`${l.descripcion} x${l.cantidad} — $${l.precioUnitario}`);
      });
      doc.moveDown().text(`Total: $${p.total}`);
      doc.end();
    });
  }

  /** Stub básico: export Excel de refacciones */
  async exportarRefaccionesExcel(): Promise<Buffer> {
    const refacciones = await this.prisma.refaccion.findMany({ orderBy: { nombre: 'asc' } });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Refacciones');
    ws.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Precio', key: 'precio', width: 12 },
    ];
    refacciones.forEach((r) => {
      ws.addRow({ sku: r.sku, nombre: r.nombre, stock: r.stock.toString(), precio: r.precioVenta.toString() });
    });
    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }
}
