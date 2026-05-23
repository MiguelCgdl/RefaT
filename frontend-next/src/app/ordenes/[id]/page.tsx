'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getRefacciones, createPresupuesto, getPresupuestos, addLineaPresupuesto } from '@/lib/api';
import Link from 'next/link';
import {
  ArrowLeft, ClipboardList, Package, Wrench, Plus,
  CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).detalle ?? (err as any).message ?? `Error ${res.status}`);
  }
  return res.json();
}

export default function OrdenDetallePage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const qc = useQueryClient();
  const toast = useRef<Toast>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const ordenId = parseInt(params.id, 10);

  const { data: orden, isLoading: loadingOrden } = useQuery({
    queryKey: ['orden', ordenId],
    queryFn: () => request<any>(`/ordenes/${ordenId}`, token!),
    enabled: Boolean(token),
  });

  const { data: refacciones } = useQuery({
    queryKey: ['refacciones'],
    queryFn: () => getRefacciones(token!),
    enabled: Boolean(token),
  });

  const { data: presupuestosData } = useQuery({
    queryKey: ['presupuestos-orden', ordenId],
    queryFn: () => getPresupuestos(token!),
    enabled: Boolean(token),
    select: (data: any) => data?.results?.filter((p: any) => p.orden === ordenId) ?? [],
  });

  const presupuestos: any[] = presupuestosData ?? [];
  const presupuestoActivo = presupuestos[0];

  const [tipoLinea, setTipoLinea] = useState<'SERVICIO' | 'REFACCION'>('REFACCION');
  const [selectedRefaccionId, setSelectedRefaccionId] = useState<number | null>(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [savingDiag, setSavingDiag] = useState(false);

  const crearPresupuestoMutation = useMutation({
    mutationFn: () => createPresupuesto(token!, { ordenId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuestos-orden', ordenId] });
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Presupuesto creado' });
    },
    onError: (e: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message }),
  });

  const addLineaMutation = useMutation({
    mutationFn: (data: any) => addLineaPresupuesto(token!, {
      ...data,
      presupuestoId: presupuestoActivo.id,
      tipo: tipoLinea,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuestos-orden', ordenId] });
      setSelectedRefaccionId(null);
      formRef.current?.reset();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Concepto agregado' });
    },
    onError: (err: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message }),
  });

  const saveDiagnostico = async () => {
    setSavingDiag(true);
    try {
      await request(`/ordenes/${ordenId}`, token!, {
        method: 'PATCH',
        body: JSON.stringify({ diagnostico }),
      });
      qc.invalidateQueries({ queryKey: ['orden', ordenId] });
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Diagnóstico guardado' });
    } catch (e: any) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message });
    } finally {
      setSavingDiag(false);
    }
  };

  const getEstadoSeverity = (estado: string) => {
    switch (estado) {
      case 'completado':
      case 'entregado': return 'success';
      case 'en_proceso': return 'info';
      case 'diagnostico': return 'warning';
      default: return 'secondary';
    }
  };

  if (loadingOrden || !orden) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ProgressBar mode="indeterminate" style={{ height: '6px', width: '300px' }} />
        <span className="text-slate-500 font-medium">Cargando detalle de orden...</span>
      </div>
    );
  }

  const refaccionOptions = refacciones?.results?.map((r: any) => ({
    label: `[${r.sku}] ${r.nombre} — Stock: ${r.stock}${Number(r.stock) <= 0 ? ' (Sin existencia)' : ''}`,
    value: r.id,
    disabled: Number(r.stock) <= 0,
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ordenes">
            <Button icon="pi pi-arrow-left" rounded text severity="secondary" className="border border-white/10 bg-white/5 hover:bg-slate-100" />
          </Link>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {orden.folio}
              <Tag value={orden.estado.toUpperCase().replace('_', ' ')} severity={getEstadoSeverity(orden.estado)} />
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Vehículo: <span className="text-blue-600 font-bold">{orden.vehiculo_placas}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: info + diagnóstico */}
        <div className="space-y-8">
          {/* Queja del cliente */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-3d relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full translate-x-8 translate-y-[-8] opacity-70 group-hover:scale-150 transition-transform duration-500" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6 relative z-10">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Queja del Cliente
            </h3>
            <p className="text-slate-700 text-lg leading-relaxed font-bold italic relative z-10">{orden.queja_cliente || '—'}</p>
          </div>

          {/* Hoja de Diagnóstico */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-3d group">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
              <ClipboardList className="w-4 h-4 text-blue-500" /> Hoja de Diagnóstico
            </h3>
            <InputTextarea
              rows={5}
              defaultValue={orden.diagnostico ?? ''}
              onChange={(e) => setDiagnostico(e.target.value)}
              className="w-full rounded-2xl border-slate-100 bg-slate-50/50 p-6 text-sm focus:bg-slate-100 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner font-medium"
              placeholder="Detalle el diagnóstico técnico del vehículo..."
            />
            <Button
              label="Guardar Diagnóstico"
              icon="pi pi-save"
              onClick={saveDiagnostico}
              loading={savingDiag}
              className="mt-6 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 border-none shadow-xl shadow-slate-900/20 font-black py-4 transition-all active:scale-95"
            />
          </div>

          {/* Acción: Crear presupuesto */}
          {!presupuestoActivo && (
            <div className="bg-white/50 p-10 rounded-[3rem] border-2 border-dashed border-slate-200 text-center backdrop-blur-sm shadow-inner">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-slate-200">
                <FileText className="w-10 h-10" />
              </div>
              <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-xs">Sin presupuesto activo</p>
              <Button
                label="Crear Presupuesto"
                icon="pi pi-plus"
                onClick={() => crearPresupuestoMutation.mutate()}
                loading={crearPresupuestoMutation.isPending}
                className="rounded-2xl px-8 bg-blue-600 border-none shadow-3d shadow-blue-600/20 font-black py-4 transition-all active:scale-95"
              />
            </div>
          )}

          {presupuestoActivo && (
            <Link href={`/presupuestos/${presupuestoActivo.id}`}>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-green-600/30 transition-all group cursor-pointer shadow-3d relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 translate-y-[-12] group-hover:scale-150 transition-transform duration-500" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Presupuesto Activo</span>
                      <h4 className="text-xl font-black text-white">v{presupuestoActivo.version}</h4>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-white">${Number(presupuestoActivo.total).toLocaleString()}</span>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-black text-white uppercase tracking-[0.2em] relative z-10">
                  <span>Administrar Conceptos</span>
                  <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Columna derecha: carga de refacciones y mano de obra */}
        {presupuestoActivo && (
          <div className="lg:col-span-2 space-y-8">
            {/* Form agregar concepto */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-3d">
              <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                  <Plus className="w-6 h-6" />
                </div>
                Cargar Concepto
              </h3>

              <div className="flex gap-3 mb-8 p-1.5 bg-slate-100 rounded-[2rem] border border-white/5">
                <button
                  type="button"
                  onClick={() => setTipoLinea('REFACCION')}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex justify-center items-center gap-3 ${tipoLinea === 'REFACCION' ? 'bg-white text-blue-600 shadow-xl ring-1 ring-blue-500/10' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Package className="w-5 h-5" /> Refacción
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipoLinea('SERVICIO');
                    setSelectedRefaccionId(null);
                  }}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all flex justify-center items-center gap-3 ${tipoLinea === 'SERVICIO' ? 'bg-white text-blue-600 shadow-xl ring-1 ring-blue-500/10' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Wrench className="w-5 h-5" /> Mano de Obra
                </button>
              </div>

              <form
                ref={formRef}
                className="grid grid-cols-1 gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const data: any = {
                    cantidad: Number(fd.get('cantidad')),
                    descuento: Number(fd.get('descuento') || 0),
                  };
                  if (tipoLinea === 'REFACCION') {
                    if (!selectedRefaccionId) {
                      toast.current?.show({
                        severity: 'warn',
                        summary: 'Selecciona una refacción',
                        detail: 'Debes elegir una pieza del inventario antes de agregarla.',
                      });
                      return;
                    }
                    data.refaccionId = selectedRefaccionId;
                  } else {
                    data.descripcion = String(fd.get('descripcion'));
                    data.precioUnitario = Number(fd.get('precioUnitario'));
                  }
                  addLineaMutation.mutate(data);
                }}
              >
                {tipoLinea === 'REFACCION' ? (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Seleccionar Refacción del Inventario</label>
                    <Dropdown
                      value={selectedRefaccionId}
                      options={refaccionOptions}
                      onChange={(e) => setSelectedRefaccionId(e.value == null ? null : Number(e.value))}
                      optionLabel="label"
                      optionValue="value"
                      optionDisabled="disabled"
                      placeholder="Buscar pieza por SKU o nombre..."
                      filter
                      filterBy="label"
                      showClear
                      appendTo="self"
                      panelClassName="refa-dropdown-panel"
                      className="rounded-2xl border-slate-100 bg-slate-50/50 py-1"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Descripción del Servicio</label>
                      <InputText name="descripcion" required className="rounded-2xl border-slate-100 bg-slate-50/50 p-4 font-bold shadow-inner" placeholder="Ej. Alineación y balanceo" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Precio de Mano de Obra</label>
                      <InputText name="precioUnitario" type="number" step="0.01" min="0" required className="rounded-2xl border-slate-100 bg-slate-50/50 p-4 font-bold shadow-inner" placeholder="0.00" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Cantidad</label>
                    <InputText name="cantidad" type="number" min="1" step="0.01" defaultValue="1" required className="rounded-2xl border-slate-100 bg-slate-50/50 p-4 font-bold shadow-inner" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Descuento Directo ($)</label>
                    <InputText name="descuento" type="number" min="0" step="0.01" defaultValue="0" className="rounded-2xl border-slate-100 bg-slate-50/50 p-4 font-bold shadow-inner" />
                  </div>
                </div>

                <Button
                  type="submit"
                  label={addLineaMutation.isPending ? 'Agregando...' : 'Vincular a Presupuesto'}
                  icon={<Plus className="w-5 h-5 mr-2" />}
                  loading={addLineaMutation.isPending}
                  className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 border-none shadow-3d shadow-blue-600/20 font-black text-lg transition-all active:scale-95 mt-4"
                />
              </form>
            </div>

            {/* Tabla de conceptos */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-3d overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-transparent">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Conceptos Cargados</h3>
                <Tag value={`VERSION ${presupuestoActivo.version}`} severity="info" className="px-5 py-2 rounded-xl font-black text-[10px] tracking-widest" />
              </div>
              
              <DataTable value={presupuestoActivo.lineas} className="p-datatable-modern" emptyMessage="Aún no hay conceptos cargados.">
                <Column header="Categoría" body={(l) => (
                  <Tag severity={l.tipo === 'refaccion' ? 'info' : 'warning'} value={l.tipo === 'refaccion' ? 'Refacción' : 'Servicio'} className="px-3 py-1 font-black text-[9px] uppercase tracking-widest" rounded />
                )} className="px-10 py-6" />
                <Column field="descripcion" header="Descripción del Concepto" className="px-10 py-6 font-bold text-slate-700" />
                <Column field="cantidad" header="Cant." className="text-center px-10 py-6 font-black" />
                <Column header="Unitario" body={(l) => <span className="font-bold text-slate-500">${Number(l.precio_unitario).toFixed(2)}</span>} className="text-right px-10 py-6" />
                <Column header="Importe Total" body={(l) => <span className="font-black text-slate-900 text-lg">${Number(l.importe_neto).toFixed(2)}</span>} className="text-right px-10 py-6" />
              </DataTable>

              {/* Totales */}
              <div className="bg-slate-900 p-12">
                <div className="max-w-xs ml-auto space-y-4">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <span>Subtotal</span>
                    <span className="text-white">${Number(presupuestoActivo.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <span>IVA (16%)</span>
                    <span className="text-white">${Number(presupuestoActivo.iva).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-3xl font-black text-white pt-6 border-t border-white/10">
                    <span className="tracking-tighter">TOTAL</span>
                    <span className="text-blue-500">${Number(presupuestoActivo.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!presupuestoActivo && (
          <div className="lg:col-span-2 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-16 text-center shadow-inner">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
              <FileText className="w-10 h-10 text-slate-200" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">Presupuesto Requerido</h4>
            <p className="text-slate-400 text-sm max-w-sm">Crea un presupuesto para comenzar a cargar refacciones del inventario y servicios de mano de obra a esta orden.</p>
          </div>
        )}
      </div>
    </div>
  );
}
