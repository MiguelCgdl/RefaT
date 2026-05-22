'use client';
import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrden, deleteOrden, getOrdenes, getVehiculos, updateOrden } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Plus, Search, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import type { OrdenTrabajo } from '@/lib/types';

const STATUS = [
  { label: 'RECIBIDO', value: 'RECIBIDO' },
  { label: 'DIAGNÓSTICO', value: 'DIAGNOSTICO' },
  { label: 'ESPERA APROBACIÓN', value: 'ESPERA_APROBACION' },
  { label: 'EN PROCESO', value: 'EN_PROCESO' },
  { label: 'COMPLETADO', value: 'COMPLETADO' },
  { label: 'ENTREGADO', value: 'ENTREGADO' },
  { label: 'CANCELADO', value: 'CANCELADO' }
];

const PRIORIDADES = [
  { label: 'NORMAL', value: 'NORMAL' },
  { label: 'ALTA', value: 'ALTA' },
  { label: 'URGENTE', value: 'URGENTE' }
];

export default function OrdenesPage({ hideHeader = false }: { hideHeader?: boolean }) {
  const { token } = useAuth();
  const qc = useQueryClient();
  const toast = useRef<Toast>(null);

  const { data: ordenes, isLoading } = useQuery({
    queryKey: ['ordenes'],
    queryFn: () => getOrdenes(token!),
    enabled: Boolean(token),
  });
  
  const { data: vehiculos } = useQuery({
    queryKey: ['vehiculos-select'],
    queryFn: () => getVehiculos(token!),
    enabled: Boolean(token),
  });

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<OrdenTrabajo | null>(null);
  const [deleteItem, setDeleteItem] = useState<OrdenTrabajo | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => createOrden(token!, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['ordenes'] }); 
      setShowCreate(false);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Orden creada correctamente' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateOrden(token!, id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['ordenes'] }); 
      setEditItem(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Orden actualizada' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOrden(token!, id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['ordenes'] }); 
      setDeleteItem(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Orden eliminada' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const filtered = (ordenes?.results ?? []).filter(o =>
    o.folio.toLowerCase().includes(search.toLowerCase()) ||
    (o.vehiculo_placas ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const statusBodyTemplate = (rowData: OrdenTrabajo) => {
    const getSeverity = (status: string) => {
      switch (status) {
        case 'COMPLETADO':
        case 'ENTREGADO': return 'success';
        case 'EN_PROCESO': return 'info';
        case 'CANCELADO': return 'danger';
        case 'DIAGNOSTICO': return 'warning';
        case 'ESPERA_APROBACION': return 'secondary';
        default: return null;
      }
    };
    return <Tag value={rowData.estado?.replace(/_/g, ' ')} severity={getSeverity(rowData.estado)} />;
  };

  const priorityBodyTemplate = (rowData: OrdenTrabajo) => {
    const getSeverity = (priority: string) => {
      switch (priority) {
        case 'URGENTE': return 'danger';
        case 'ALTA': return 'warning';
        default: return 'info';
      }
    };
    return <Tag value={rowData.prioridad} severity={getSeverity(rowData.prioridad)} />;
  };

  const actionBodyTemplate = (rowData: OrdenTrabajo) => (
    <div className="flex gap-2 justify-center">
      <Link href={`/ordenes/${rowData.id}`}>
        <Button icon="pi pi-eye" rounded text severity="secondary" tooltip="Ver detalle" />
      </Link>
      <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => setEditItem(rowData)} tooltip="Editar" />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setDeleteItem(rowData)} tooltip="Eliminar" />
    </div>
  );

  const vehicleOptions = vehiculos?.results?.map(v => ({
    label: `${v.placas} — ${v.marca} ${v.modelo}`,
    value: v.id
  })) || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <Toast ref={toast} />
      
      {/* Header - 3D Look */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
            <div className="p-4 bg-gradient-3d rounded-2xl shadow-3d shadow-blue-600/30 ring-4 ring-white/10">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            {hideHeader ? 'Órdenes de Trabajo' : 'Gestión de Taller'}
          </h2>
          {!hideHeader && <p className="text-slate-500 mt-2 font-medium text-lg ml-1">Flujo de trabajo y reparaciones en curso.</p>}
        </div>
        <Button 
          label="Nueva Orden" 
          icon={<Plus className="w-5 h-5 mr-2" />} 
          onClick={() => setShowCreate(true)} 
          className="p-button-raised p-button-primary rounded-2xl shadow-3d shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 border-none px-8 py-4 font-black transition-all active:scale-95" 
        />
      </div>

      <div className="card bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-3d border border-slate-100 overflow-hidden transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
        <div className="p-8 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-transparent">
          <div className="relative group max-w-2xl">
            <Search className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <InputText 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Buscar por folio o placas..." 
              className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-bold shadow-inner"
            />
          </div>
        </div>

        <DataTable 
          value={filtered} 
          loading={isLoading}
          dataKey="id"
          className="p-datatable-modern"
          emptyMessage={
            <div className="py-24 text-center flex flex-col items-center gap-4">
              <div className="p-8 bg-slate-50 rounded-full">
                <ClipboardList className="w-16 h-16 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">No hay órdenes de trabajo registradas</p>
            </div>
          }
          rows={10}
          paginator
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}"
          rowHover
        >
          <Column field="folio" header="Folio" sortable body={(o) => (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-black text-slate-800 tracking-tight">{o.folio}</span>
            </div>
          )} className="px-8 py-6" />
          
          <Column field="vehiculo_placas" header="Vehículo" body={(o) => (
            <div className="flex flex-col">
              <span className="font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl text-xs w-fit shadow-sm border border-blue-100 mb-1">{o.vehiculo_placas}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">{o.vehiculo_marca || 'N/A'} {o.vehiculo_modelo || ''}</span>
            </div>
          )} className="px-8 py-6" />
          
          <Column field="estado" header="Estado" body={statusBodyTemplate} sortable className="px-8 py-6" />
          <Column field="prioridad" header="Prioridad" body={priorityBodyTemplate} sortable className="px-8 py-6" />
          <Column header="Acciones" body={actionBodyTemplate} style={{ width: '12rem', textAlign: 'center' }} className="px-8 py-6" />
        </DataTable>
      </div>

      {/* Modal: Crear */}
      <Dialog 
        header="Nueva Orden de Trabajo" 
        visible={showCreate} 
        style={{ width: '450px' }} 
        onHide={() => setShowCreate(false)}
        className="rounded-3xl"
      >
        <form className="grid grid-cols-1 gap-4 pt-4" onSubmit={e => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          createMutation.mutate({
            vehiculoId: Number(fd.get('vehiculoId')),
            quejaCliente: String(fd.get('quejaCliente')),
            prioridad: String(fd.get('prioridad') || 'NORMAL'),
          });
        }}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Vehículo *</label>
            <Dropdown name="vehiculoId" options={vehicleOptions} placeholder="Seleccionar vehículo…" required className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Prioridad</label>
            <Dropdown name="prioridad" options={PRIORIDADES} defaultValue="NORMAL" className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Queja del Cliente *</label>
            <InputTextarea name="quejaCliente" rows={3} required className="rounded-xl" placeholder="El cliente reporta..." />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Cancelar" type="button" text onClick={() => setShowCreate(false)} />
            <Button label="Crear Orden" type="submit" loading={createMutation.isPending} />
          </div>
        </form>
      </Dialog>

      {/* Modal: Editar */}
      <Dialog 
        header="Editar Orden de Trabajo" 
        visible={!!editItem} 
        style={{ width: '500px' }} 
        onHide={() => setEditItem(null)}
        className="rounded-3xl"
      >
        {editItem && (
          <form className="grid grid-cols-1 gap-4 pt-4" onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            updateMutation.mutate({
              id: editItem.id,
              data: {
                vehiculoId: Number(fd.get('vehiculoId')),
                quejaCliente: String(fd.get('quejaCliente')),
                estado: String(fd.get('estado')),
                prioridad: String(fd.get('prioridad')),
                diagnostico: String(fd.get('diagnostico') || ''),
              }
            });
          }}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Vehículo *</label>
              <Dropdown name="vehiculoId" value={editItem.vehiculo} options={vehicleOptions} placeholder="Seleccionar vehículo…" required className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                <Dropdown name="estado" value={editItem.estado} options={STATUS} className="rounded-xl" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Prioridad</label>
                <Dropdown name="prioridad" value={editItem.prioridad} options={PRIORIDADES} className="rounded-xl" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Queja del Cliente *</label>
              <InputTextarea name="quejaCliente" rows={2} required defaultValue={editItem.queja_cliente} className="rounded-xl" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Diagnóstico Técnico</label>
              <InputTextarea name="diagnostico" rows={2} defaultValue={editItem.diagnostico} className="rounded-xl" placeholder="Se detectó..." />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button label="Cancelar" type="button" text onClick={() => setEditItem(null)} />
              <Button label="Actualizar" type="submit" loading={updateMutation.isPending} />
            </div>
          </form>
        )}
      </Dialog>

      {/* Modal: Eliminar */}
      <Dialog 
        header="Confirmar eliminación" 
        visible={!!deleteItem} 
        style={{ width: '350px' }} 
        onHide={() => setDeleteItem(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button label="No" text onClick={() => setDeleteItem(null)} />
            <Button label="Sí, eliminar" severity="danger" onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending} />
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          ¿Eliminar la orden <span className="font-bold">{deleteItem?.folio}</span>? 
          También se eliminarán sus presupuestos. Esta acción no se puede deshacer.
        </p>
      </Dialog>
    </div>
  );
}
