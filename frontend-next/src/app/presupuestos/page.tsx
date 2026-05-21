'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPresupuesto, deletePresupuesto, enviarPresupuesto, exportPdfPresupuesto, getOrdenes, getPresupuestos, updatePresupuesto } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Calculator, Download, FileText, Mail, MessageCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/Modal';

const sel = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white';

const STATUS_OPTS = ['BORRADOR','ENVIADO','APROBADO','RECHAZADO'];

function statusBadge(s: string) {
  if (s === 'APROBADO') return 'bg-green-100 text-green-700';
  if (s === 'RECHAZADO') return 'bg-red-100 text-red-700';
  if (s === 'ENVIADO') return 'bg-blue-100 text-blue-700';
  return 'bg-amber-100 text-amber-700';
}

export default function PresupuestosPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
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

  const createMutation = useMutation({
    mutationFn: (f: FormData) => createPresupuesto(token!, { ordenId: Number(f.get('ordenId')) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['presupuestos'] }); setShowCreate(false); },
    onError: (e: any) => alert(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, f }: { id: number; f: FormData }) =>
      updatePresupuesto(token!, id, { estado: String(f.get('estado')) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['presupuestos'] }); setEditItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePresupuesto(token!, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['presupuestos'] }); setDeleteItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const sendMutation = useMutation({
    mutationFn: ({ id, method }: { id: number; method: 'email' | 'whatsapp' }) =>
      enviarPresupuesto(token!, id, method),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['presupuestos'] }); setSendItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const downloadPdf = async (id: number, folio: string) => {
    try {
      const blob = await exportPdfPresupuesto(token!, id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `Presupuesto_${folio}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Error al generar el PDF.');
    }
  };

  const filtered = (presupuestos?.results ?? []).filter((p: any) =>
    (p.orden_folio ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Presupuestos</h2>
          <p className="text-slate-500 mt-1">Genera cotizaciones con cálculo automático y envíalas al cliente.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Nuevo Presupuesto
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por folio de orden..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Orden</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Ver.</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <FileText className="w-4 h-4 text-slate-400" />{p.orden_folio}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">v{p.version}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(String(p.estado).toUpperCase())}`}>
                        {String(p.estado).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">${Number(p.total).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1.5">
                        <Link href={`/presupuestos/${p.id}`} className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Ver / Editar líneas">
                          <Calculator className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setEditItem(p)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Cambiar estado">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSendItem(p)} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Enviar al cliente">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button onClick={() => downloadPdf(p.id, p.orden_folio)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Descargar PDF">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteItem(p)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No hay presupuestos{search ? ' que coincidan' : ' generados'}.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear */}
      <Modal open={showCreate} title="Nuevo Presupuesto" onClose={() => setShowCreate(false)}>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); createMutation.mutate(new FormData(e.currentTarget)); }}>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 flex items-center gap-1"><FileText className="w-3 h-3" /> Orden de Trabajo *</label>
            <select name="ordenId" required className={sel}>
              <option value="">Seleccionar orden…</option>
              {ordenes?.results?.map(o => <option key={o.id} value={o.id}>Folio: {o.folio} — {o.vehiculo_placas}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
              {createMutation.isPending ? 'Creando...' : 'Crear Presupuesto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Editar estado */}
      <Modal open={!!editItem} title="Actualizar Estado" onClose={() => setEditItem(null)}>
        {editItem && (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); updateMutation.mutate({ id: editItem.id, f: new FormData(e.currentTarget) }); }}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Estado del Presupuesto</label>
              <select name="estado" defaultValue={String(editItem.estado).toUpperCase()} className={sel}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={updateMutation.isPending} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
                {updateMutation.isPending ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Enviar */}
      <Modal open={!!sendItem} title="Enviar Presupuesto al Cliente" onClose={() => setSendItem(null)}>
        {sendItem && (
          <div className="space-y-5">
            <p className="text-slate-600">Selecciona cómo enviar el presupuesto <span className="font-semibold">{sendItem.orden_folio}</span> al cliente:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => sendMutation.mutate({ id: sendItem.id, method: 'email' })}
                disabled={sendMutation.isPending}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors disabled:opacity-50"
              >
                <Mail className="w-7 h-7" />
                <span className="font-medium text-sm">Email</span>
              </button>
              <button
                onClick={() => sendMutation.mutate({ id: sendItem.id, method: 'whatsapp' })}
                disabled={sendMutation.isPending}
                className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors disabled:opacity-50"
              >
                <MessageCircle className="w-7 h-7" />
                <span className="font-medium text-sm">WhatsApp</span>
              </button>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setSendItem(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cerrar</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Eliminar */}
      <Modal open={!!deleteItem} title="Eliminar Presupuesto" onClose={() => setDeleteItem(null)}>
        {deleteItem && (
          <div className="space-y-5">
            <p className="text-slate-600">¿Eliminar el presupuesto <span className="font-semibold">v{deleteItem.version}</span> de la orden <span className="font-semibold">{deleteItem.orden_folio}</span>? Esta acción no se puede deshacer.</p>
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
