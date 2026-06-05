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

    // Vehículos únicos actualmente en taller (con órdenes activas)
    const vehiculosEnTallerResult = await this.prisma.ordenTrabajo.findMany({
      where: { estado: { notIn: [EstadoOrden.ENTREGADO, EstadoOrden.CANCELADO] } },
      select: { vehiculoId: true },
      distinct: ['vehiculoId'],
    });
    const vehiculosEnTaller = vehiculosEnTallerResult.length;

    return {
      ordenes_por_estado: grupos.map((g) => ({
        estado: g.estado.toLowerCase(),
        total: g._count.id,
      })),
      refacciones_bajo_stock: refaccionesBajoStock,
      ordenes_activas: ordenesActivas,
      vehiculos_en_taller: vehiculosEnTaller,
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
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Precio', key: 'precio', width: 12 },
    ];
    refacciones.forEach((r) => {
      ws.addRow({
        sku: r.sku,
        nombre: r.nombre,
        categoria: r.categoria || '',
        stock: r.stock.toString(),
        precio: r.precioVenta.toString()
      });
    });
    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  async generarPdfInventarioValorizado(): Promise<Buffer> {
    const refacciones = await this.prisma.refaccion.findMany({
      where: { activo: true },
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });

    const categorias: Record<string, { items: any[]; subtotal: number }> = {};
    let granTotal = 0;

    refacciones.forEach(r => {
      const cat = r.categoria || 'Sin Categoría';
      if (!categorias[cat]) categorias[cat] = { items: [], subtotal: 0 };
      
      const valor = Number(r.costo || 0) * Number(r.stock || 0);
      categorias[cat].items.push({ ...r, valor });
      categorias[cat].subtotal += valor;
      granTotal += valor;
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: any) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Reporte de Inventario Valorizado', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, { align: 'right' });
      doc.moveDown();

      for (const [cat, data] of Object.entries(categorias)) {
        doc.fontSize(16).font('Helvetica-Bold').text(`Categoría: ${cat}`);
        doc.moveDown(0.5);
        
        const tableTop = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('SKU', 50, tableTop);
        doc.text('Nombre', 120, tableTop);
        doc.text('Stock', 350, tableTop);
        doc.text('Costo', 400, tableTop);
        doc.text('Valor Total', 470, tableTop);
        
        let y = tableTop + 15;
        doc.font('Helvetica');

        data.items.forEach(item => {
          if (y > 700) {
            doc.addPage();
            y = 50;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('SKU', 50, y);
            doc.text('Nombre', 120, y);
            doc.text('Stock', 350, y);
            doc.text('Costo', 400, y);
            doc.text('Valor Total', 470, y);
            y += 15;
            doc.font('Helvetica');
          }
          doc.text(item.sku, 50, y);
          doc.text(item.nombre.substring(0, 40), 120, y);
          doc.text(item.stock.toString(), 350, y);
          doc.text(`$${Number(item.costo).toFixed(2)}`, 400, y);
          doc.text(`$${item.valor.toFixed(2)}`, 470, y);
          y += 15;
        });

        doc.y = y;
        doc.moveDown(1);
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`Subtotal ${cat}: $${data.subtotal.toFixed(2)}`, { align: 'right' });
        doc.moveDown(2);
      }

      doc.addPage();
      doc.fontSize(18).font('Helvetica-Bold');
      doc.text(`Valor Total del Inventario: $${granTotal.toFixed(2)}`, { align: 'center' });
      
      doc.end();
    });
  }

  async exportarInventarioValorizadoExcel(): Promise<Buffer> {
    const refacciones = await this.prisma.refaccion.findMany({
      where: { activo: true },
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Inventario Valorizado');

    ws.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Nombre', key: 'nombre', width: 40 },
      { header: 'Categoría', key: 'categoria', width: 25 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Costo', key: 'costo', width: 15 },
      { header: 'Valor Total', key: 'valor', width: 15 },
    ];

    ws.getRow(1).font = { bold: true };

    let granTotal = 0;

    refacciones.forEach((r) => {
      const valor = Number(r.costo || 0) * Number(r.stock || 0);
      granTotal += valor;
      ws.addRow({
        sku: r.sku,
        nombre: r.nombre,
        categoria: r.categoria || 'Sin Categoría',
        stock: Number(r.stock),
        costo: Number(r.costo),
        valor: valor
      });
    });

    ws.addRow({});
    const totalRow = ws.addRow({
      categoria: 'Gran Total',
      valor: granTotal
    });
    totalRow.font = { bold: true };

    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }
}
