'use client';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPresupuesto, deletePresupuesto, enviarPresupuesto, exportPdfPresupuesto, getOrdenes, getPresupuestos, updatePresupuesto } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Calculator, FileText, Plus, Search, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

const STATUS_OPTS = [
  { label: 'BORRADOR', value: 'BORRADOR' },
  { label: 'ENVIADO', value: 'ENVIADO' },
  { label: 'APROBADO', value: 'APROBADO' },
  { label: 'RECHAZADO', value: 'RECHAZADO' }
];

export default function PresupuestosView({ hideHeader = false }: { hideHeader?: boolean }) {
  const { token } = useAuth();
  const qc = useQueryClient();
  const toast = useRef<Toast>(null);
  const dialogBaseZIndex = 2000;

  const { data: presupuestos, isLoading } = useQuery({
    queryKey: ['presupuestos'],
    queryFn: () => getPresupuestos(token!),
    enabled: Boolean(token),
  });
  
  const { data: ordenes } = useQuery({
    queryKey: ['ordenes-select'],
    queryFn: () => getOrdenes(token!),
    enabled: Boolean(token),
  });

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [sendItem, setSendItem] = useState<any>(null);
  const [createOrdenId, setCreateOrdenId] = useState<number | null>(null);
  const [editEstado, setEditEstado] = useState('');

  useEffect(() => {
    if (!editItem) {
      setEditEstado('');
      return;
    }

    setEditEstado(String(editItem.estado || '').toUpperCase());
  }, [editItem]);

  const createMutation = useMutation({
    mutationFn: (data: any) => createPresupuesto(token!, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['presupuestos'] }); 
      setShowCreate(false);
      setCreateOrdenId(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Presupuesto creado' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updatePresupuesto(token!, id, data),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['presupuestos'] }); 
      setEditItem(null);
      setEditEstado('');
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Estado actualizado' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePresupuesto(token!, id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['presupuestos'] }); 
      setDeleteItem(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Presupuesto eliminado' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const sendMutation = useMutation({
    mutationFn: ({ id, method }: { id: number; method: 'email' | 'whatsapp' }) =>
      enviarPresupuesto(token!, id, method),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['presupuestos'] }); 
      setSendItem(null);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Enviado correctamente' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const downloadPdf = async (id: number, folio: string) => {
    try {
      const blob = await exportPdfPresupuesto(token!, id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Presupuesto_${folio}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error?.message || 'No se pudo generar el PDF',
      });
    }
  };

  const filtered = (presupuestos?.results ?? []).filter((p: any) =>
    (p.folio ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.orden_folio ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const statusBodyTemplate = (rowData: any) => {
    const status = String(rowData.estado).toUpperCase();
    const getSeverity = (s: string) => {
      switch (s) {
        case 'APROBADO': return 'success';
        case 'RECHAZADO': return 'danger';
        case 'ENVIADO': return 'info';
        default: return 'warning';
      }
    };
    return <Tag value={status} severity={getSeverity(status)} />;
  };

  const totalBodyTemplate = (rowData: any) => {
    return (
      <span className="font-bold text-slate-900">
        ${Number(rowData.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </span>
    );
  };

  const actionBodyTemplate = (rowData: any) => (
    <div className="flex gap-2 justify-center">
      <Link href={`/presupuestos/${rowData.id}`}>
        <Button icon="pi pi-eye" rounded text severity="secondary" tooltip="Ver / Editar" />
      </Link>
      <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => setEditItem(rowData)} tooltip="Cambiar Estado" />
      <Button icon="pi pi-send" rounded text severity="success" onClick={() => setSendItem(rowData)} tooltip="Enviar" />
      <Button icon="pi pi-file-pdf" rounded text severity="help" onClick={() => downloadPdf(rowData.id, rowData.folio)} tooltip="Descargar PDF" />
      <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => setDeleteItem(rowData)} tooltip="Eliminar" />
    </div>
  );

  const ordenOptions = ordenes?.results?.map((o: any) => ({
    label: `Folio: ${o.folio} — ${o.vehiculo_placas}`,
    value: o.id
  })) || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <Toast ref={toast} />
      
      {/* Header - 3D Look */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
            <div className="p-4 bg-gradient-3d rounded-2xl shadow-3d shadow-blue-600/30 ring-4 ring-white/10">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            {hideHeader ? 'Presupuestos' : 'Área de Cotizaciones'}
          </h2>
          {!hideHeader && <p className="text-slate-500 mt-2 font-medium text-lg ml-1">Generación y seguimiento de presupuestos comerciales.</p>}
        </div>
        <Button 
          label="Nuevo Presupuesto" 
          icon={<Plus className="w-5 h-5 mr-2" />} 
          onClick={() => setShowCreate(true)} 
          className="p-button-raised p-button-primary rounded-2xl shadow-3d shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 border-none px-8 py-4 font-black transition-all active:scale-95" 
        />
      </div>

      <div className="card bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-3d border border-slate-100 overflow-hidden transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)]">
        <div className="p-8 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-transparent">
          <div className="refa-search-shell max-w-2xl">
            <Search className="refa-search-icon" />
            <InputText 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Buscar por folio de presupuesto u orden..." 
              className="refa-search-input rounded-[2rem] border-slate-100 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
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
                <Calculator className="w-16 h-16 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">No hay presupuestos registrados</p>
            </div>
          }
          rows={10}
          paginator
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="{first} - {last} de {totalRecords}"
          rowHover
        >
          <Column field="folio" header="Folio" sortable body={(p) => (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-black text-slate-800 tracking-tight">{p.folio}</span>
            </div>
          )} className="px-8 py-6" />
          
          <Column field="orden_folio" header="Orden Referencia" body={(p) => (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="font-bold text-slate-600 text-sm tracking-tight">{p.orden_folio}</span>
            </div>
          )} sortable className="px-8 py-6" />
          
          <Column field="estado" header="Estado" body={statusBodyTemplate} sortable className="px-8 py-6" />
          <Column field="total" header="Total Bruto" body={totalBodyTemplate} sortable className="px-8 py-6" />
          <Column header="Acciones" body={actionBodyTemplate} style={{ width: '16rem', textAlign: 'center' }} className="px-8 py-6" />
        </DataTable>
      </div>

      {/* Modal: Crear */}
      <Dialog 
        header="Nuevo Presupuesto" 
        visible={showCreate} 
        style={{ width: '450px' }} 
        onHide={() => {
          setShowCreate(false);
          setCreateOrdenId(null);
        }}
        className="rounded-3xl"
        baseZIndex={dialogBaseZIndex}
      >
        <form className="grid grid-cols-1 gap-4 pt-4" onSubmit={e => {
          e.preventDefault();
          if (!createOrdenId) {
            toast.current?.show({
              severity: 'warn',
              summary: 'Orden requerida',
              detail: 'Selecciona una orden de trabajo para crear el presupuesto.',
            });
            return;
          }

          createMutation.mutate({ ordenId: createOrdenId });
        }}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Orden de Trabajo *</label>
            <select
              value={createOrdenId ?? ''}
              onChange={(e) => setCreateOrdenId(e.target.value ? Number(e.target.value) : null)}
              required
              className="refa-native-select rounded-xl"
            >
              <option value="" disabled>
                Seleccionar orden...
              </option>
              {ordenOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              label="Cancelar"
              type="button"
              text
              onClick={() => {
                setShowCreate(false);
                setCreateOrdenId(null);
              }}
            />
            <Button label="Crear Presupuesto" type="submit" loading={createMutation.isPending} />
          </div>
        </form>
      </Dialog>

      {/* Modal: Editar estado */}
      <Dialog 
        header="Actualizar Estado" 
        visible={!!editItem} 
        style={{ width: '400px' }} 
        onHide={() => {
          setEditItem(null);
          setEditEstado('');
        }}
        className="rounded-3xl"
        baseZIndex={dialogBaseZIndex}
      >
        {editItem && (
          <form className="grid grid-cols-1 gap-4 pt-4" onSubmit={e => {
            e.preventDefault();
            updateMutation.mutate({ 
              id: editItem.id, 
              data: { estado: editEstado } 
            });
          }}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Estado del Presupuesto</label>
              <select
                value={editEstado}
                onChange={(e) => setEditEstado(e.target.value)}
                className="refa-native-select rounded-xl"
              >
                {STATUS_OPTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                label="Cancelar"
                type="button"
                text
                onClick={() => {
                  setEditItem(null);
                  setEditEstado('');
                }}
              />
              <Button label="Actualizar" type="submit" loading={updateMutation.isPending} />
            </div>
          </form>
        )}
      </Dialog>

      {/* Modal: Enviar */}
      <Dialog 
        header="Enviar Presupuesto" 
        visible={!!sendItem} 
        style={{ width: '450px' }} 
        onHide={() => setSendItem(null)}
        className="rounded-3xl"
        baseZIndex={dialogBaseZIndex}
      >
        {sendItem && (
          <div className="space-y-4 pt-2">
            <p className="text-slate-600">
              Selecciona el medio para enviar el presupuesto <span className="font-bold text-blue-600">{sendItem.folio}</span>:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                label="Email" 
                icon="pi pi-envelope" 
                className="p-button-outlined flex-column gap-2 py-4" 
                onClick={() => sendMutation.mutate({ id: sendItem.id, method: 'email' })}
                loading={sendMutation.isPending}
              />
              <Button 
                label="WhatsApp" 
                icon="pi pi-whatsapp" 
                className="p-button-outlined p-button-success flex-column gap-2 py-4" 
                onClick={() => sendMutation.mutate({ id: sendItem.id, method: 'whatsapp' })}
                loading={sendMutation.isPending}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Modal: Eliminar */}
      <Dialog 
        header="Confirmar eliminación" 
        visible={!!deleteItem} 
        style={{ width: '350px' }} 
        onHide={() => setDeleteItem(null)}
        baseZIndex={dialogBaseZIndex}
        footer={
          <div className="flex justify-end gap-2">
            <Button label="No" text onClick={() => setDeleteItem(null)} />
            <Button label="Sí, eliminar" severity="danger" onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)} loading={deleteMutation.isPending} />
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          ¿Eliminar el presupuesto <span className="font-bold">v{deleteItem?.version}</span> de la orden <span className="font-bold">{deleteItem?.orden_folio}</span>? 
          Esta acción no se puede deshacer.
        </p>
      </Dialog>
    </div>
  );
}
