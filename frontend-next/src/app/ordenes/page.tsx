'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrden, deleteOrden, getOrdenes, getVehiculos, updateOrden } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, Car, Eye, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/Modal';
import type { OrdenTrabajo } from '@/lib/types';

const sel = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white';
const inp = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm';
const txt = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none';

const STATUS = ['RECIBIDO','DIAGNOSTICO','ESPERA_APROBACION','EN_PROCESO','COMPLETADO','ENTREGADO','CANCELADO'];
const PRIORIDADES = ['NORMAL','ALTA','URGENTE'];

function statusBadge(s: string) {
  if (s === 'COMPLETADO' || s === 'ENTREGADO') return 'bg-green-100 text-green-700';
  if (s === 'EN_PROCESO') return 'bg-blue-100 text-blue-700';
  if (s === 'CANCELADO') return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
}
function prioridadBadge(p: string) {
  if (p === 'URGENTE') return 'bg-purple-100 text-purple-700';
  if (p === 'ALTA') return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-600';
}

export default function OrdenesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
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
    mutationFn: (f: FormData) => createOrden(token!, {
      vehiculoId: Number(f.get('vehiculoId')),
      quejaCliente: String(f.get('quejaCliente')),
      prioridad: String(f.get('prioridad') || 'NORMAL'),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); setShowCreate(false); },
    onError: (e: any) => alert(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, f }: { id: number; f: FormData }) => updateOrden(token!, id, {
      vehiculoId: Number(f.get('vehiculoId')),
      quejaCliente: String(f.get('quejaCliente')),
      estado: String(f.get('estado')),
      prioridad: String(f.get('prioridad')),
      diagnostico: String(f.get('diagnostico') || ''),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); setEditItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOrden(token!, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ordenes'] }); setDeleteItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const filtered = (ordenes?.results ?? []).filter(o =>
    o.folio.toLowerCase().includes(search.toLowerCase()) ||
    (o.vehiculo_placas ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Órdenes de Trabajo</h2>
          <p className="text-slate-500 mt-1">Registra y administra los servicios del taller.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Nueva Orden
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por folio o placas..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Folio</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Placas</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Prioridad</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <FileText className="w-4 h-4 text-slate-400" />{o.folio}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">{o.vehiculo_placas}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(o.estado)}`}>
                        {o.estado?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${prioridadBadge(o.prioridad)}`}>
                        {o.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Link href={`/ordenes/${o.id}`} className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Ver detalle">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setEditItem(o)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteItem(o)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                      No hay órdenes{search ? ' que coincidan' : ' de trabajo activas'}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear */}
      <Modal open={showCreate} title="Nueva Orden de Trabajo" onClose={() => setShowCreate(false)}>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); createMutation.mutate(new FormData(e.currentTarget)); }}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Car className="w-3 h-3" /> Vehículo *</label>
            <select name="vehiculoId" required className={sel}>
              <option value="">Seleccionar vehículo…</option>
              {vehiculos?.results?.map(v => <option key={v.id} value={v.id}>{v.placas} — {v.marca} {v.modelo}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">Prioridad</label>
            <select name="prioridad" defaultValue="NORMAL" className={sel}>
              {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Queja del Cliente *</label>
            <textarea name="quejaCliente" rows={3} required className={txt} placeholder="El cliente reporta ruido en los frenos…" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
              {createMutation.isPending ? 'Guardando...' : 'Crear Orden'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Editar */}
      <Modal open={!!editItem} title="Editar Orden de Trabajo" onClose={() => setEditItem(null)}>
        {editItem && (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); updateMutation.mutate({ id: editItem.id, f: new FormData(e.currentTarget) }); }}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Car className="w-3 h-3" /> Vehículo *</label>
              <select name="vehiculoId" required defaultValue={editItem.vehiculo} className={sel}>
                <option value="">Seleccionar vehículo…</option>
                {vehiculos?.results?.map(v => <option key={v.id} value={v.id}>{v.placas} — {v.marca} {v.modelo}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Estado</label>
                <select name="estado" defaultValue={editItem.estado} className={sel}>
                  {STATUS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Prioridad</label>
                <select name="prioridad" defaultValue={editItem.prioridad} className={sel}>
                  {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Queja del Cliente *</label>
              <textarea name="quejaCliente" rows={2} required defaultValue={editItem.queja_cliente} className={txt} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Diagnóstico Técnico</label>
              <textarea name="diagnostico" rows={2} defaultValue={editItem.diagnostico} className={txt} placeholder="Se detectó…" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={updateMutation.isPending} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
                {updateMutation.isPending ? 'Guardando...' : 'Actualizar Orden'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Eliminar */}
      <Modal open={!!deleteItem} title="Eliminar Orden" onClose={() => setDeleteItem(null)}>
        {deleteItem && (
          <div className="space-y-5">
            <p className="text-slate-600">¿Eliminar la orden <span className="font-semibold">{deleteItem.folio}</span>? También se eliminarán sus presupuestos. Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteItem(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={() => deleteMutation.mutate(deleteItem.id)} disabled={deleteMutation.isPending} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
