'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPresupuesto, addLineaPresupuesto, getRefacciones, enviarPresupuesto } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Send, Package, Wrench } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';

const normalizeInventorySearch = (value: string) => value.toUpperCase().trim();

export default function PresupuestoDetallePage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const qc = useQueryClient();
  const toast = useRef<Toast>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const id = parseInt(params.id, 10);

  const { data: presupuesto, isLoading } = useQuery({
    queryKey: ['presupuesto', id],
    queryFn: () => getPresupuesto(token!, id),
    enabled: Boolean(token),
  });

  const { data: refacciones } = useQuery({
    queryKey: ['refacciones'],
    queryFn: () => getRefacciones(token!),
    enabled: Boolean(token),
  });

  const [tipoLinea, setTipoLinea] = useState<'SERVICIO' | 'REFACCION'>('REFACCION');
  const [selectedRefaccionId, setSelectedRefaccionId] = useState<number | null>(null);
  const [refaccionSearch, setRefaccionSearch] = useState('');

  const addLineaMutation = useMutation({
    mutationFn: (data: any) => addLineaPresupuesto(token!, {
      ...data,
      presupuestoId: id,
      tipo: tipoLinea,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuesto', id] });
      setSelectedRefaccionId(null);
      setRefaccionSearch('');
      formRef.current?.reset();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Concepto agregado' });
    },
    onError: (err: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message }),
  });

  const enviarMutation = useMutation({
    mutationFn: (method: 'email' | 'whatsapp') => enviarPresupuesto(token!, id, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuesto', id] });
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Presupuesto enviado exitosamente' });
    },
    onError: (err: any) => toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message }),
  });

  if (isLoading || !presupuesto) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ProgressBar mode="indeterminate" style={{ height: '6px', width: '300px' }} />
        <span className="text-slate-500 font-medium">Cargando presupuesto...</span>
      </div>
    );
  }

  const refaccionOptions = refacciones?.results?.map((r: any) => ({
    label: `[${r.sku}] ${r.nombre} — Stock: ${r.stock}${Number(r.stock) <= 0 ? ' (Sin existencia)' : ''}`,
    value: r.id,
    disabled: Number(r.stock) <= 0,
  })) || [];
  const normalizedRefaccionSearch = normalizeInventorySearch(refaccionSearch);
  const filteredRefaccionOptions = normalizedRefaccionSearch
    ? refaccionOptions.filter((option) => normalizeInventorySearch(option.label).includes(normalizedRefaccionSearch))
    : refaccionOptions;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Toast ref={toast} />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/presupuestos">
            <Button icon="pi pi-arrow-left" rounded text severity="secondary" className="border border-white/10 bg-white/5 hover:bg-slate-100" />
          </Link>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Presupuesto v{presupuesto.version}
              <Tag value={presupuesto.estado.toUpperCase()} severity={presupuesto.estado === 'aprobado' ? 'success' : 'info'} />
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">Referencia: <span className="text-blue-600 font-bold">{presupuesto.orden_folio}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de agregar líneas */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-3d">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-6">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              Agregar Concepto
            </h3>
            
            <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setTipoLinea('REFACCION')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex justify-center items-center gap-2 ${tipoLinea === 'REFACCION' ? 'bg-white text-blue-600 shadow-lg shadow-blue-600/10 ring-1 ring-blue-500/10' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Package className="w-4 h-4" /> Refacción
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoLinea('SERVICIO');
                  setSelectedRefaccionId(null);
                }}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex justify-center items-center gap-2 ${tipoLinea === 'SERVICIO' ? 'bg-white text-blue-600 shadow-lg shadow-blue-600/10 ring-1 ring-blue-500/10' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Wrench className="w-4 h-4" /> Mano de Obra
              </button>
            </div>

            <form
              ref={formRef}
              className="grid grid-cols-1 gap-4"
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
                      detail: 'Debes elegir una pieza del catálogo antes de agregarla.',
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
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Refacción del Inventario *</label>
                  <InputText
                    value={refaccionSearch}
                    onChange={(e) => setRefaccionSearch(e.target.value.toUpperCase())}
                    className="rounded-xl border-slate-200 p-3 font-semibold"
                    placeholder="Buscar pieza por SKU o nombre..."
                  />
                  <select
                    value={selectedRefaccionId ?? ''}
                    onChange={(e) => setSelectedRefaccionId(e.target.value ? Number(e.target.value) : null)}
                    className="refa-native-select rounded-xl border-slate-200"
                  >
                    <option value="">
                      Seleccionar pieza...
                    </option>
                    {filteredRefaccionOptions.map((option) => (
                      <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Descripción del Servicio *</label>
                    <InputText name="descripcion" required className="rounded-xl border-slate-200 p-3" placeholder="Ej. Cambio de balatas" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Costo de Mano de Obra ($) *</label>
                    <InputText name="precioUnitario" type="number" step="0.01" required className="rounded-xl border-slate-200 p-3" placeholder="500.00" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cantidad *</label>
                  <InputText name="cantidad" type="number" min="1" step="0.01" defaultValue="1" required className="rounded-xl border-slate-200 p-3" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Descuento ($)</label>
                  <InputText name="descuento" type="number" min="0" step="0.01" defaultValue="0" className="rounded-xl border-slate-200 p-3" />
                </div>
              </div>

              <Button
                type="submit"
                label={addLineaMutation.isPending ? 'Agregando...' : 'Agregar Concepto'}
                icon="pi pi-plus"
                loading={addLineaMutation.isPending}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border-none shadow-xl shadow-slate-900/10 font-bold mt-2"
              />
            </form>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-3d space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Send className="w-5 h-5 text-green-600" />
              </div>
              Enviar al Cliente
            </h3>
            <p className="text-sm text-slate-500 font-medium">Notifica al cliente enviando este presupuesto por sus medios de contacto.</p>
            <div className="flex flex-col gap-3">
              <Button
                label="Enviar por Correo"
                icon="pi pi-envelope"
                onClick={() => enviarMutation.mutate('email')}
                loading={enviarMutation.isPending}
                className="w-full py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 font-bold transition-all"
              />
              <Button
                label="Enviar por WhatsApp"
                icon="pi pi-whatsapp"
                onClick={() => enviarMutation.mutate('whatsapp')}
                loading={enviarMutation.isPending}
                className="w-full py-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 font-bold transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Conceptos y Totales */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-3d overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Conceptos del Presupuesto</h3>
          </div>
          
          <DataTable value={presupuesto.lineas} className="p-datatable-sm" emptyMessage="Sin conceptos aún.">
            <Column header="Concepto" body={(l) => (
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${l.tipo === 'refaccion' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                  {l.tipo === 'refaccion' ? <Package className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                </div>
                <span className="font-bold text-slate-700">{l.descripcion || 'Pieza del inventario'}</span>
              </div>
            )} />
            <Column field="cantidad" header="Cant." className="text-center" />
            <Column header="Precio U." body={(l) => `$${Number(l.precio_unitario).toFixed(2)}`} className="text-right" />
            <Column header="Importe" body={(l) => <span className="font-black text-slate-900">${Number(l.importe_neto).toFixed(2)}</span>} className="text-right" />
          </DataTable>

          <div className="bg-slate-50/80 p-10 border-t border-slate-100 mt-auto">
            <div className="max-w-xs ml-auto space-y-3">
              <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="text-slate-600">${Number(presupuesto.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
                <span>IVA (16%)</span>
                <span className="text-slate-600">${Number(presupuesto.iva).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-slate-900 pt-6 border-t border-slate-200">
                <span className="uppercase tracking-tight">Total</span>
                <span className="text-blue-600">${Number(presupuesto.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
