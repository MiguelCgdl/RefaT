'use client';
import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRefaccion, getRefacciones, updateRefaccion, deleteRefaccion } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Package, Pencil, Trash2, Search, Download, Upload, FileSpreadsheet } from 'lucide-react';
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
import type { Refaccion } from '@/lib/types';

export default function RefaccionesView({ hideHeader = false }: { hideHeader?: boolean }) {
  const { token } = useAuth();
  const qc = useQueryClient();
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  const { data: refaccionesResponse, isLoading } = useQuery({ 
    queryKey: ['refacciones'], 
    queryFn: () => getRefacciones(token!), 
    enabled: Boolean(token) 
  });

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Refaccion | null>(null);
  const [deleteItem, setDeleteItem] = useState<Refaccion | null>(null);
  const [isImporting, setIsImporting] = useState(false);

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

  const refacciones = refaccionesResponse?.results ?? [];

  const filtered = refacciones.filter(r =>
    r.nombre.toLowerCase().includes(search.toLowerCase()) ||
    r.sku.toLowerCase().includes(search.toLowerCase())
  );

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

  const onUpload = async (event: any) => {
    const file = event.files[0];
    setIsImporting(true);

    const buffer = await file.arrayBuffer();
    try {
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        try {
          const payload = {
            sku: String(row.SKU || row.sku || ''),
            nombre: String(row.Nombre || row.nombre || ''),
            categoria: String(row.Categoría || row.categoria || ''),
            costo: Number(row.Costo || row.costo || 0),
            precioVenta: Number(row['Precio Venta'] || row.precioVenta || row.precio_venta || 0),
            stock: Number(row.Stock || row.stock || 0),
            stockMinimo: Number(row['Stock Mínimo'] || row.stockMinimo || row.stock_minimo || 0),
            ubicacion: String(row.Ubicación || row.ubicacion || '')
          };

          if (!payload.sku || !payload.nombre) continue;

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
    <div className="flex flex-col">
      <span className="font-bold text-slate-800">{rowData.nombre}</span>
      <span className="text-[10px] font-mono font-bold text-blue-500 tracking-wider uppercase">{rowData.sku}</span>
    </div>
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
          <InputText name="categoria" defaultValue={(item as any)?.categoria} className="rounded-xl shadow-inner" />
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
          <Button 
            label="Exportar" 
            icon={<Download className="w-4 h-4 mr-2" />} 
            onClick={exportToExcel} 
            className="p-button-outlined p-button-secondary rounded-2xl shadow-sm bg-white/50 hover:shadow-md transition-all" 
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
        <div className="p-8 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-transparent flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative flex-1 group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <InputText 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Buscar por SKU o nombre de pieza..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-inner">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-black text-blue-700 uppercase tracking-widest">{filtered.length} Items</span>
          </div>
        </div>

        <DataTable 
          value={filtered} 
          loading={isLoading || isImporting}
          dataKey="id"
          className="p-datatable-modern"
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
          <Column header="Pieza / Modelo" body={pieceBodyTemplate} sortable sortField="nombre" className="px-8 py-6" />
          <Column field="categoria" header="Categoría" body={(r) => <Tag value={(r as any).categoria || 'N/A'} severity="secondary" className="text-[10px] font-bold uppercase tracking-wider px-3" />} sortable className="px-8 py-6" />
          <Column header="Existencia" body={stockBodyTemplate} sortable sortField="stock" className="px-8 py-6" />
          <Column header="Precio Venta" body={priceBodyTemplate} sortable sortField="precio_venta" className="px-8 py-6" />
          <Column header="Acciones" body={actionBodyTemplate} style={{ width: '12rem', textAlign: 'center' }} className="px-8 py-6" />
        </DataTable>
      </div>

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

    </div>
  );
}
