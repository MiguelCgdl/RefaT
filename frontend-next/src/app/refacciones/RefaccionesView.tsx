'use client';
import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRefaccion, getRefacciones, updateRefaccion, deleteRefaccion, exportPdfInventarioValorizado, exportExcelInventarioValorizado } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Package, Pencil, Trash2, Search, Download, Upload, FileSpreadsheet, Tag as TagIcon, Filter, FileText } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { Refaccion } from '@/lib/types';

export default function RefaccionesView({ hideHeader = false }: { hideHeader?: boolean }) {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  const { data: refaccionesResponse, isLoading } = useQuery({ 
    queryKey: ['refacciones'], 
    queryFn: () => getRefacciones(token!), 
    enabled: Boolean(token) 
  });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Refaccion | null>(null);
  const [deleteItem, setDeleteItem] = useState<Refaccion | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Refaccion[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkDisableConfirm, setShowBulkDisableConfirm] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [showBulkCategoryEdit, setShowBulkCategoryEdit] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => createRefaccion(token!, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['refacciones'] }); 
      setShowCreate(false);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Refacción agregada' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateRefaccion(token!, id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['refacciones'] }); 
      setEditItem(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Refacción actualizada' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRefaccion(token!, id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['refacciones'] }); 
      setDeleteItem(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Refacción eliminada' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    let ok = 0; let fail = 0;
    for (const item of selectedItems) {
      try { await deleteRefaccion(token!, item.id); ok++; } catch { fail++; }
    }
    qc.invalidateQueries({ queryKey: ['refacciones'] });
    setSelectedItems([]);
    setShowBulkDeleteConfirm(false);
    setIsBulkProcessing(false);
    toast.current?.show({ severity: fail === 0 ? 'success' : 'warn', summary: 'Eliminación en Lote', detail: `${ok} eliminadas, ${fail} errores.` });
  };

  const handleBulkDisable = async () => {
    setIsBulkProcessing(true);
    let ok = 0; let fail = 0;
    for (const item of selectedItems) {
      try { await updateRefaccion(token!, item.id, { activo: false }); ok++; } catch { fail++; }
    }
    qc.invalidateQueries({ queryKey: ['refacciones'] });
    setSelectedItems([]);
    setShowBulkDisableConfirm(false);
    setIsBulkProcessing(false);
    toast.current?.show({ severity: fail === 0 ? 'success' : 'warn', summary: 'Deshabilitar en Lote', detail: `${ok} deshabilitadas, ${fail} errores.` });
  };

  const handleBulkCategoryUpdate = async () => {
    if (!bulkCategory) return;
    setIsBulkProcessing(true);
    let ok = 0; let fail = 0;
    for (const item of selectedItems) {
      try { await updateRefaccion(token!, item.id, { categoria: bulkCategory }); ok++; } catch { fail++; }
    }
    qc.invalidateQueries({ queryKey: ['refacciones'] });
    setSelectedItems([]);
    setShowBulkCategoryEdit(false);
    setBulkCategory('');
    setIsBulkProcessing(false);
    toast.current?.show({ severity: fail === 0 ? 'success' : 'warn', summary: 'Categoría Actualizada', detail: `${ok} actualizadas, ${fail} errores.` });
  };

  const refacciones = refaccionesResponse?.results ?? [];

  // Derive sorted unique categories from data
  const allCategories = ['Todos', ...Array.from(new Set(refacciones.map((r) => (r as any).categoria).filter(Boolean))).sort()];

  const filtered = refacciones.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      r.nombre.toLowerCase().includes(q) ||
      r.sku.toLowerCase().includes(q) ||
      ((r as any).categoria ?? '').toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'Todos' || (r as any).categoria === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Excel Logic
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered.map(r => ({
      SKU: r.sku,
      Nombre: r.nombre,
      Categoría: (r as any).categoria || '',
      Costo: r.costo,
      'Precio Venta': r.precio_venta,
      Stock: r.stock,
      'Stock Mínimo': (r as any).stock_minimo || 0,
      Ubicación: (r as any).ubicacion || ''
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Almacen");
    XLSX.writeFile(workbook, "Almacen_Refacciones.xlsx");
    toast.current?.show({ severity: 'info', summary: 'Excel', detail: 'Archivo exportado correctamente' });
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla');

    // Headers
    worksheet.columns = [
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 25 },
      { header: 'Costo', key: 'costo', width: 15 },
      { header: 'Precio Venta', key: 'precioVenta', width: 15 },
      { header: 'Stock', key: 'stock', width: 15 },
      { header: 'Stock Mínimo', key: 'stockMinimo', width: 15 },
      { header: 'Ubicación', key: 'ubicacion', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };

    worksheet.addRow({
      sku: 'REF-001',
      nombre: 'Filtro de Aceite',
      categoria: 'Filtros',
      costo: 150.00,
      precioVenta: 250.00,
      stock: 10,
      stockMinimo: 2,
      ubicacion: 'Estante A-1'
    });

    const categorias = [
      'Aceites y Lubricantes',
      'Filtros',
      'Frenos',
      'Motor',
      'Suspensión',
      'Eléctrico',
      'Energía / Baterías',
      'Carrocería',
      'Transmisión',
      'Refrigeración',
      'Escape',
      'Neumáticos',
      'Herramientas',
      'Consumibles',
      'Otro'
    ];

    for (let i = 2; i <= 1000; i++) {
      worksheet.getCell(`C${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${categorias.join(',')}"`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Categoría inválida',
        error: 'Por favor, selecciona una categoría de la lista.'
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'Plantilla_Refacciones.xlsx');
    toast.current?.show({ severity: 'info', summary: 'Plantilla', detail: 'Plantilla con categorías descargada correctamente' });
  };

  const downloadPdfReport = async () => {
    try {
      const blob = await exportPdfInventarioValorizado(token!);
      saveAs(blob, 'Inventario_Valorizado.pdf');
      toast.current?.show({ severity: 'success', summary: 'Reporte', detail: 'Reporte PDF descargado' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el reporte PDF' });
    }
  };

  const downloadExcelReport = async () => {
    try {
      const blob = await exportExcelInventarioValorizado(token!);
      saveAs(blob, 'Inventario_Valorizado.xlsx');
      toast.current?.show({ severity: 'success', summary: 'Reporte', detail: 'Reporte Excel descargado' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el reporte Excel' });
    }
  };

  const onUpload = async (event: any) => {
    const file = event.files[0];
    setIsImporting(true);

    const buffer = await file.arrayBuffer();
    try {
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', codepage: 65001 });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[];

      let successCount = 0;
      let errorCount = 0;

      // Helper: busca un valor en el row ignorando diferencias de mayúsculas, 
      // acentos y espacios extra en las claves
      const getVal = (row: any, ...keys: string[]): string => {
        // Normalize: lowercase, remove accents, trim
        const norm = (s: string) =>
          s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
        const rowNormKeys = Object.keys(row).reduce((acc: any, k) => {
          acc[norm(k)] = row[k];
          return acc;
        }, {});
        for (const key of keys) {
          const v = rowNormKeys[norm(key)];
          if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
        }
        return '';
      };

      for (const row of rows) {
        try {
          const sku = getVal(row, 'SKU', 'sku');
          const nombre = getVal(row, 'Nombre', 'nombre');
          if (!sku || !nombre) continue;

          const payload = {
            sku,
            nombre,
            categoria: getVal(row, 'Categoría', 'Categoria', 'categoria', 'category'),
            costo: Number(getVal(row, 'Costo', 'costo', 'cost') || 0),
            precioVenta: Number(getVal(row, 'Precio Venta', 'precioVenta', 'precio_venta', 'price') || 0),
            stock: Number(getVal(row, 'Stock', 'stock') || 0),
            stockMinimo: Number(getVal(row, 'Stock Minimo', 'Stock Mínimo', 'stockMinimo', 'stock_minimo') || 0),
            ubicacion: getVal(row, 'Ubicación', 'Ubicacion', 'ubicacion', 'location'),
          };

          const existing = refacciones.find((r) => r.sku === payload.sku);
          if (existing) {
            await updateRefaccion(token!, existing.id, payload);
          } else {
            await createRefaccion(token!, payload);
          }
          successCount++;
        } catch {
          errorCount++;
        }
      }

      qc.invalidateQueries({ queryKey: ['refacciones'] });
      toast.current?.show({
        severity: 'success',
        summary: 'Importación Finalizada',
        detail: `${successCount} procesados correctamente, ${errorCount} errores.`
      });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar el archivo Excel' });
    } finally {
      setIsImporting(false);
      fileUploadRef.current?.clear();
    }
    return;
  };

  const pieceBodyTemplate = (rowData: Refaccion) => (
    <span className="font-bold text-slate-800">{rowData.nombre}</span>
  );

  const skuBodyTemplate = (rowData: Refaccion) => (
    <span className="text-xs font-mono font-bold text-blue-600 tracking-wider uppercase">{rowData.sku}</span>
  );


  const stockBodyTemplate = (rowData: Refaccion) => (
    <div className="flex items-center gap-2">
      <span className={`font-bold ${rowData.bajo_stock ? 'text-red-500' : 'text-slate-700'}`}>
        {rowData.stock}
      </span>
      {rowData.bajo_stock && <Tag severity="danger" value="Bajo Stock" rounded className="text-[9px]" />}
    </div>
  );

  const priceBodyTemplate = (rowData: Refaccion) => (
    <span className="font-bold text-slate-900">
      ${Number(rowData.precio_venta).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
    </span>
  );

  const actionBodyTemplate = (rowData: Refaccion) => (
    <div className="flex gap-2 justify-center">
      <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => setEditItem(rowData)} tooltip="Editar" />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setDeleteItem(rowData)} tooltip="Eliminar" />
    </div>
  );

  const RefaccionForm = ({ item }: { item?: Refaccion }) => (
    <form className="grid grid-cols-1 gap-4 pt-4" onSubmit={e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const data = {
        sku: String(fd.get('sku')),
        nombre: String(fd.get('nombre')),
        costo: Number(fd.get('costo') || 0),
        precioVenta: Number(fd.get('precioVenta')),
        stock: Number(fd.get('stock') || 0),
        stockMinimo: Number(fd.get('stockMinimo') || 0),
        categoria: String(fd.get('categoria') || ''),
        ubicacion: String(fd.get('ubicacion') || ''),
      };
      if (item) updateMutation.mutate({ id: item.id, data });
      else createMutation.mutate(data);
    }}>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase">SKU *</label>
          <InputText name="sku" defaultValue={item?.sku} required className="rounded-xl uppercase font-mono shadow-inner" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
          <select
            name="categoria"
            defaultValue={(item as any)?.categoria || ''}
            className="refa-native-select rounded-xl shadow-inner"
          >
            <option value="">Sin categoría</option>
            <option value="Aceites y Lubricantes">Aceites y Lubricantes</option>
            <option value="Filtros">Filtros</option>
            <option value="Frenos">Frenos</option>
            <option value="Motor">Motor</option>
            <option value="Suspensión">Suspensión</option>
            <option value="Eléctrico">Eléctrico</option>
            <option value="Energía / Baterías">Energía / Baterías</option>
            <option value="Carrocería">Carrocería</option>
            <option value="Transmisión">Transmisión</option>
            <option value="Refrigeración">Refrigeración</option>
            <option value="Escape">Escape</option>
            <option value="Neumáticos">Neumáticos</option>
            <option value="Herramientas">Herramientas</option>
            <option value="Consumibles">Consumibles</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Nombre de la Pieza *</label>
        <InputText name="nombre" defaultValue={item?.nombre} required className="rounded-xl shadow-inner" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Costo</label>
          <InputNumber name="costo" value={item?.costo ? Number(item.costo) : null} mode="currency" currency="MXN" locale="es-MX" onInput={(e: any) => {
            const input = e.target.querySelector('input');
            if (input) input.name = 'costo';
          }} className="rounded-xl shadow-inner" />
          <input type="hidden" name="costo" defaultValue={item?.costo ? Number(item.costo) : undefined} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Precio Venta *</label>
          <InputNumber name="precioVenta" value={item?.precio_venta ? Number(item.precio_venta) : null} mode="currency" currency="MXN" locale="es-MX" required className="rounded-xl shadow-inner" />
          <input type="hidden" name="precioVenta" defaultValue={item?.precio_venta ? Number(item.precio_venta) : undefined} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Stock</label>
          <InputNumber name="stock" value={item?.stock ? Number(item.stock) : 0} className="rounded-xl shadow-inner" />
          <input type="hidden" name="stock" defaultValue={item?.stock ? Number(item.stock) : 0} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Stock Mínimo</label>
          <InputNumber name="stockMinimo" value={(item as any)?.stock_minimo ? Number((item as any).stock_minimo) : 0} className="rounded-xl shadow-inner" />
          <input type="hidden" name="stockMinimo" defaultValue={(item as any)?.stock_minimo ? Number((item as any).stock_minimo) : 0} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Ubicación</label>
        <InputText name="ubicacion" defaultValue={(item as any)?.ubicacion} className="rounded-xl shadow-inner" placeholder="Ej. Estante A-3" />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button label="Cancelar" type="button" text onClick={() => { setShowCreate(false); setEditItem(null); }} />
        <Button label={item ? "Actualizar" : "Guardar"} type="submit" loading={createMutation.isPending || updateMutation.isPending} className="p-button-raised shadow-md" />
      </div>
    </form>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <Toast ref={toast} />
      
      {/* Header - 3D Look */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl shadow-blue-600/30 ring-4 ring-white">
              <Package className="w-8 h-8 text-white" />
            </div>
            {hideHeader ? 'Inventario' : 'Almacén y Refacciones'}
          </h2>
          {!hideHeader && <p className="text-slate-500 mt-2 font-medium">Control de existencias, piezas, stock y movimientos del almacén.</p>}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {user?.rol === 'ADMIN' && (
            <Button 
              label="Reportes" 
              icon={<FileText className="w-4 h-4 mr-2" />} 
              onClick={() => setShowReports(true)} 
              className="p-button-outlined p-button-warning rounded-2xl shadow-sm bg-orange-50/50 text-orange-600 hover:shadow-md border-orange-200 transition-all" 
            />
          )}
          <Button 
            label="Exportar" 
            icon={<Download className="w-4 h-4 mr-2" />} 
            onClick={exportToExcel} 
            className="p-button-outlined p-button-secondary rounded-2xl shadow-sm bg-white/50 hover:shadow-md transition-all" 
          />
          <Button 
            label="Plantilla CSV/Excel" 
            icon={<FileSpreadsheet className="w-4 h-4 mr-2" />} 
            onClick={downloadTemplate} 
            className="p-button-outlined p-button-info rounded-2xl shadow-sm bg-blue-50/50 text-blue-600 hover:shadow-md border-blue-200 transition-all" 
          />
          <FileUpload 
            mode="basic" 
            auto 
            ref={fileUploadRef}
            chooseLabel="Importar" 
            chooseOptions={{ icon: <Upload className="w-4 h-4 mr-2" />, className: 'p-button-outlined p-button-secondary rounded-2xl shadow-sm bg-white/50 hover:shadow-md transition-all' }}
            onUpload={onUpload}
            customUpload
            uploadHandler={onUpload}
            accept=".xlsx, .xls"
          />
          <Button 
            label="Nueva Refacción" 
            icon={<Plus className="w-4 h-4 mr-2" />} 
            onClick={() => setShowCreate(true)} 
            className="p-button-raised p-button-primary rounded-2xl shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 border-none transition-all active:scale-95" 
          />
        </div>
      </div>

      {/* Main Content Card - 3D Glassmorphism/Neumorphism feel */}
      <div className="card bg-white rounded-[2.5rem] shadow-3d border border-slate-100 overflow-hidden transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)]">
        <div className="p-5 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-transparent flex flex-col gap-4">
          {/* Search + count row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="refa-search-shell flex-1">
              <Search className="refa-search-icon" />
              <InputText 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Buscar por SKU, nombre o categoría..." 
                className="refa-search-input rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-inner flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-black text-blue-700 uppercase tracking-widest">{filtered.length} Items</span>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all duration-200 ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                    : 'bg-white/5 text-slate-400 border-slate-700 hover:border-blue-500 hover:text-blue-400'
                }`}
              >
                {cat === 'Todos' ? <span className="flex items-center gap-1"><Filter className="w-3 h-3" /> Todos</span> : cat}
              </button>
            ))}
          </div>
        </div>

        <DataTable 
          value={filtered} 
          loading={isLoading || isImporting}
          dataKey="id"
          className="p-datatable-modern"
          selection={user?.rol === 'ADMIN' ? selectedItems : undefined}
          onSelectionChange={user?.rol === 'ADMIN' ? (e) => setSelectedItems(e.value as Refaccion[]) : undefined}
          emptyMessage={
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="p-6 bg-slate-50 rounded-full">
                <Package className="w-12 h-12 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay refacciones que mostrar</p>
            </div>
          }
          rows={10}
          paginator
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}"
          rowHover
          stripedRows
          showGridlines={false}
        >
          {user?.rol === 'ADMIN' && <Column selectionMode="multiple" style={{ width: '3rem' }} />}
          <Column header="SKU" body={skuBodyTemplate} sortable sortField="sku" className="px-8 py-6" />
          <Column header="Pieza / Modelo" body={pieceBodyTemplate} sortable sortField="nombre" className="px-8 py-6" />
          <Column field="categoria" header="Categoría" body={(r) => <Tag value={(r as any).categoria || 'N/A'} severity="secondary" className="text-[10px] font-bold uppercase tracking-wider px-3" />} sortable className="px-8 py-6" />
          <Column header="Existencia" body={stockBodyTemplate} sortable sortField="stock" className="px-8 py-6" />
          <Column header="Precio Venta" body={priceBodyTemplate} sortable sortField="precio_venta" className="px-8 py-6" />
          <Column header="Acciones" body={actionBodyTemplate} style={{ width: '12rem', textAlign: 'center' }} className="px-8 py-6" />
        </DataTable>
      </div>

      {/* Bulk Action Floating Bar */}
      {user?.rol === 'ADMIN' && selectedItems.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-slate-900/40 border border-slate-700">
            <div className="flex items-center gap-2 pr-4 border-r border-slate-600">
              <span className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-black">{selectedItems.length}</span>
              <span className="text-sm font-bold text-slate-200">seleccionadas</span>
            </div>
            <Button
              label="Cambiar Categoría"
              icon="pi pi-tag"
              size="small"
              onClick={() => setShowBulkCategoryEdit(true)}
              className="p-button-info p-button-outlined rounded-xl text-xs border-blue-500 text-blue-300 hover:bg-blue-900 transition-all"
            />
            <Button
              label="Deshabilitar"
              icon="pi pi-eye-slash"
              size="small"
              onClick={() => setShowBulkDisableConfirm(true)}
              className="p-button-warning p-button-outlined rounded-xl text-xs border-amber-500 text-amber-300 hover:bg-amber-900 transition-all"
            />
            <Button
              label="Eliminar"
              icon="pi pi-trash"
              size="small"
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="p-button-danger rounded-xl text-xs bg-red-600 border-none hover:bg-red-700 transition-all shadow-md shadow-red-900/50"
            />
            <button
              onClick={() => setSelectedItems([])}
              className="ml-2 p-1 text-slate-400 hover:text-white transition-all"
              title="Limpiar selección"
            >
              <span className="pi pi-times text-xs" />
            </button>
          </div>
        </div>
      )}

      {/* Modals - 3D/Elevated Look */}
      <Dialog 
        header={<div className="flex items-center gap-3 text-slate-800"><Package className="w-6 h-6 text-blue-600" /> Nueva Refacción</div>}
        visible={showCreate} 
        style={{ width: '90vw', maxWidth: '500px' }} 
        onHide={() => setShowCreate(false)}
        className="rounded-[2.5rem] shadow-2xl border-none"
        maskClassName="backdrop-blur-sm"
      >
        <RefaccionForm />
      </Dialog>

      <Dialog 
        header={<div className="flex items-center gap-3 text-slate-800"><Pencil className="w-6 h-6 text-blue-600" /> Editar Refacción</div>}
        visible={!!editItem} 
        style={{ width: '90vw', maxWidth: '500px' }} 
        onHide={() => setEditItem(null)}
        className="rounded-[2.5rem] shadow-2xl border-none"
        maskClassName="backdrop-blur-sm"
      >
        {editItem && <RefaccionForm item={editItem} />}
      </Dialog>

      <Dialog 
        header={<div className="flex items-center gap-3 text-red-600"><Trash2 className="w-6 h-6" /> Confirmar Eliminación</div>}
        visible={!!deleteItem} 
        style={{ width: '90vw', maxWidth: '400px' }} 
        onHide={() => setDeleteItem(null)}
        footer={
          <div className="flex justify-end gap-3 p-4">
            <Button label="Cancelar" text onClick={() => setDeleteItem(null)} className="rounded-xl font-bold" />
            <Button label="Sí, eliminar" severity="danger" onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending} className="rounded-xl p-button-raised shadow-lg shadow-red-600/20 font-bold" />
          </div>
        }
        className="rounded-[2.5rem] shadow-2xl border-none"
        maskClassName="backdrop-blur-sm"
      >
        <p className="text-slate-600 font-medium px-4">
          ¿Estás seguro de eliminar <span className="font-black text-slate-900">[{deleteItem?.sku}] {deleteItem?.nombre}</span>? 
          Esta acción es permanente y no se puede deshacer.
        </p>
      </Dialog>

      <Dialog 
        header={<div className="flex items-center gap-3 text-slate-800"><FileText className="w-6 h-6 text-orange-600" /> Reportes de Almacén</div>}
        visible={showReports} 
        style={{ width: '90vw', maxWidth: '400px' }} 
        onHide={() => setShowReports(false)}
        className="rounded-[2.5rem] shadow-2xl border-none"
        maskClassName="backdrop-blur-sm"
      >
        <div className="flex flex-col gap-4 mt-4">
          <p className="text-slate-600 font-medium px-4 text-center">
            Selecciona el formato para descargar el reporte de Inventario Valorizado (existencias y costos por categoría):
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 pb-4">
            <Button label="PDF" icon="pi pi-file-pdf" onClick={downloadPdfReport} className="p-button-danger rounded-xl flex-1 shadow-md hover:shadow-lg transition-all" />
            <Button label="Excel" icon="pi pi-file-excel" onClick={downloadExcelReport} className="p-button-success rounded-xl flex-1 shadow-md hover:shadow-lg transition-all" />
          </div>
        </div>
      </Dialog>

      {/* Bulk Delete Confirm */}
      <Dialog
        header={<div className="flex items-center gap-3 text-red-600"><Trash2 className="w-6 h-6" /> Eliminar en Lote</div>}
        visible={showBulkDeleteConfirm}
        style={{ width: '90vw', maxWidth: '420px' }}
        onHide={() => setShowBulkDeleteConfirm(false)}
        className="rounded-[2.5rem] shadow-2xl border-none"
        maskClassName="backdrop-blur-sm"
        footer={
          <div className="flex justify-end gap-3 p-4">
            <Button label="Cancelar" text onClick={() => setShowBulkDeleteConfirm(false)} className="rounded-xl" />
            <Button label={`Sí, eliminar ${selectedItems.length}`} severity="danger" loading={isBulkProcessing} onClick={handleBulkDelete} className="rounded-xl p-button-raised shadow-lg" />
          </div>
        }
      >
        <p className="text-slate-600 font-medium px-4 pt-4">
          ¿Estás seguro de eliminar <span className="font-black text-red-600">{selectedItems.length} refacciones</span>? Esta acción es permanente.
        </p>
      </Dialog>

      {/* Bulk Disable Confirm */}
      <Dialog
        header={<div className="flex items-center gap-3 text-amber-600"><span className="pi pi-eye-slash" /> Deshabilitar en Lote</div>}
        visible={showBulkDisableConfirm}
        style={{ width: '90vw', maxWidth: '420px' }}
        onHide={() => setShowBulkDisableConfirm(false)}
        className="rounded-[2.5rem] shadow-2xl border-none"
        maskClassName="backdrop-blur-sm"
        footer={
          <div className="flex justify-end gap-3 p-4">
            <Button label="Cancelar" text onClick={() => setShowBulkDisableConfirm(false)} className="rounded-xl" />
            <Button label={`Deshabilitar ${selectedItems.length}`} severity="warning" loading={isBulkProcessing} onClick={handleBulkDisable} className="rounded-xl p-button-raised shadow-lg" />
          </div>
        }
      >
        <p className="text-slate-600 font-medium px-4 pt-4">
          Se deshabilitarán <span className="font-black text-amber-600">{selectedItems.length} refacciones</span>. Ya no serán visibles en el catálogo activo.
        </p>
      </Dialog>

      {/* Bulk Category Edit */}
      <Dialog
        header={<div className="flex items-center gap-3 text-blue-600"><span className="pi pi-tag" /> Cambiar Categoría en Lote</div>}
        visible={showBulkCategoryEdit}
        style={{ width: '90vw', maxWidth: '420px' }}
        onHide={() => { setShowBulkCategoryEdit(false); setBulkCategory(''); }}
        className="rounded-[2.5rem] shadow-2xl border-none"
        maskClassName="backdrop-blur-sm"
        footer={
          <div className="flex justify-end gap-3 p-4">
            <Button label="Cancelar" text onClick={() => setShowBulkCategoryEdit(false)} className="rounded-xl" />
            <Button label={`Aplicar a ${selectedItems.length}`} severity="info" loading={isBulkProcessing} disabled={!bulkCategory} onClick={handleBulkCategoryUpdate} className="rounded-xl p-button-raised shadow-lg" />
          </div>
        }
      >
        <div className="px-4 pt-4 flex flex-col gap-3">
          <p className="text-slate-600 font-medium">
            Selecciona la nueva categoría para las <span className="font-black text-blue-600">{selectedItems.length} refacciones</span> seleccionadas:
          </p>
          <select
            value={bulkCategory}
            onChange={e => setBulkCategory(e.target.value)}
            className="refa-native-select rounded-xl shadow-inner"
          >
            <option value="">— Selecciona una categoría —</option>
            <option value="Aceites y Lubricantes">Aceites y Lubricantes</option>
            <option value="Filtros">Filtros</option>
            <option value="Frenos">Frenos</option>
            <option value="Motor">Motor</option>
            <option value="Suspensión">Suspensión</option>
            <option value="Eléctrico">Eléctrico</option>
            <option value="Energía / Baterías">Energía / Baterías</option>
            <option value="Carrocería">Carrocería</option>
            <option value="Transmisión">Transmisión</option>
            <option value="Refrigeración">Refrigeración</option>
            <option value="Escape">Escape</option>
            <option value="Neumáticos">Neumáticos</option>
            <option value="Herramientas">Herramientas</option>
            <option value="Consumibles">Consumibles</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </Dialog>

    </div>
  );
}
