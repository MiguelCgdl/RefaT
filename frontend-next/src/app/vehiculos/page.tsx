'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVehiculo, getClientes, getVehiculos, updateVehiculo, deleteVehiculo, getVehiculoHistorial, updateOrden } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Car, User, Hash, Calendar, Pencil, Trash2, Search, History, Wrench } from 'lucide-react';
import { Modal } from '@/components/Modal';
import type { Vehiculo } from '@/lib/types';

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all';

export default function VehiculosPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data: vehiculos, isLoading } = useQuery({ queryKey: ['vehiculos'], queryFn: () => getVehiculos(token!), enabled: Boolean(token) });
  const { data: clientes } = useQuery({ queryKey: ['clientes-select'], queryFn: () => getClientes(token!), enabled: Boolean(token) });

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Vehiculo | null>(null);
  const [deleteItem, setDeleteItem] = useState<Vehiculo | null>(null);

  const [historyVehiculo, setHistoryVehiculo] = useState<Vehiculo | null>(null);
  const [closingOrder, setClosingOrder] = useState<any | null>(null);
  const [diagnosticoText, setDiagnosticoText] = useState('');
  const [closingStatus, setClosingStatus] = useState<'LISTO' | 'ENTREGADO'>('LISTO');

  const { data: historial, isLoading: loadingHistorial } = useQuery({
    queryKey: ['vehiculo-historial', historyVehiculo?.id],
    queryFn: () => getVehiculoHistorial(token!, historyVehiculo!.id),
    enabled: Boolean(token && historyVehiculo),
  });

  const closeOrderMutation = useMutation({
    mutationFn: ({ id, diagnostico, estado }: { id: number; diagnostico: string; estado: 'LISTO' | 'ENTREGADO' }) =>
      updateOrden(token!, id, { diagnostico, estado }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehiculo-historial', historyVehiculo?.id] });
      setClosingOrder(null);
      setDiagnosticoText('');
    },
    onError: (e: any) => alert(e.message),
  });

  const parseForm = (form: FormData) => ({
    clienteId: Number(form.get('clienteId')),
    marca: String(form.get('marca')),
    modelo: String(form.get('modelo')),
    anio: Number(form.get('anio')),
    placas: String(form.get('placas')),
    color: String(form.get('color') || ''),
    serieVin: String(form.get('serieVin') || ''),
    kilometrajeActual: Number(form.get('kilometrajeActual') || 0),
  });

  const createMutation = useMutation({
    mutationFn: (form: FormData) => createVehiculo(token!, parseForm(form)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehiculos'] }); setShowCreate(false); },
    onError: (e: any) => alert(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: number; form: FormData }) => updateVehiculo(token!, id, parseForm(form)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehiculos'] }); setEditItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVehiculo(token!, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehiculos'] }); setDeleteItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const filtered = (vehiculos?.results ?? []).filter(v =>
    v.placas.toLowerCase().includes(search.toLowerCase()) ||
    v.marca.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo.toLowerCase().includes(search.toLowerCase()) ||
    (v.cliente_nombre ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const VehiculoForm = ({ item, onSubmit, isPending }: { item?: Vehiculo; onSubmit: (f: FormData) => void; isPending: boolean }) => (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-xs font-medium text-slate-700 flex items-center gap-1"><User className="w-3 h-3" /> Cliente Propietario *</label>
          <select name="clienteId" required defaultValue={item?.cliente} className={inputCls + ' bg-white'}>
            <option value="">Seleccionar cliente…</option>
            {clientes?.results?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Car className="w-3 h-3" /> Marca *</label><input name="marca" required defaultValue={item?.marca} className={inputCls} placeholder="Honda" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Car className="w-3 h-3" /> Modelo *</label><input name="modelo" required defaultValue={item?.modelo} className={inputCls} placeholder="Civic" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Calendar className="w-3 h-3" /> Año *</label><input name="anio" type="number" required min="1950" max={new Date().getFullYear() + 1} defaultValue={item?.anio} className={inputCls} placeholder="2020" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Hash className="w-3 h-3" /> Placas *</label><input name="placas" required defaultValue={item?.placas} className={inputCls + ' uppercase'} placeholder="ABC-123" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Color</label><input name="color" defaultValue={item?.color} className={inputCls} placeholder="Blanco" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Km Actuales</label><input name="kilometrajeActual" type="number" min="0" defaultValue={item?.kilometraje_actual} className={inputCls} placeholder="45000" /></div>
        <div className="col-span-2 space-y-1"><label className="text-xs font-medium text-slate-700">Serie VIN</label><input name="serieVin" defaultValue={item?.serie_vin} className={inputCls + ' font-mono uppercase'} placeholder="1HGBH41JXMN109186" /></div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => { setShowCreate(false); setEditItem(null); }} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
        <button type="submit" disabled={isPending} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
          {isPending ? 'Guardando...' : item ? 'Actualizar' : 'Guardar Vehículo'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Registro de Vehículos</h2>
          <p className="text-slate-500 mt-1">Gestiona la flota y los autos de tus clientes.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Nuevo Vehículo
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por placas, marca, modelo o propietario..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Placas</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Vehículo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Propietario</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4"><span className="bg-slate-100 text-slate-700 font-mono py-1 px-2.5 rounded text-sm border border-slate-200 uppercase">{v.placas}</span></td>
                    <td className="px-6 py-4 font-medium text-slate-900">{v.marca} {v.modelo} <span className="text-slate-400 font-normal">({v.anio})</span></td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{v.color || '—'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{v.cliente_nombre || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setHistoryVehiculo(v)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Ver Historial"><History className="w-4 h-4" /></button>
                        <button onClick={() => setEditItem(v)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteItem(v)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No hay vehículos{search ? ' que coincidan' : ' registrados'}.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showCreate} title="Nuevo Vehículo" onClose={() => setShowCreate(false)}>
        <VehiculoForm onSubmit={f => createMutation.mutate(f)} isPending={createMutation.isPending} />
      </Modal>
      <Modal open={!!editItem} title="Editar Vehículo" onClose={() => setEditItem(null)}>
        {editItem && <VehiculoForm item={editItem} onSubmit={f => updateMutation.mutate({ id: editItem.id, form: f })} isPending={updateMutation.isPending} />}
      </Modal>
      <Modal open={!!deleteItem} title="Eliminar Vehículo" onClose={() => setDeleteItem(null)}>
        {deleteItem && (
          <div className="space-y-5">
            <p className="text-slate-600">¿Eliminar el vehículo <span className="font-semibold">{deleteItem.placas} — {deleteItem.marca} {deleteItem.modelo}</span>? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteItem(null)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={() => deleteMutation.mutate(deleteItem.id)} disabled={deleteMutation.isPending} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!historyVehiculo} title={`Historial de Reparaciones — ${historyVehiculo?.marca} ${historyVehiculo?.modelo} (${historyVehiculo?.placas})`} onClose={() => { setHistoryVehiculo(null); setClosingOrder(null); }}>
        {historyVehiculo && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {loadingHistorial ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : !historial?.length ? (
              <div className="text-center py-8 text-slate-400">
                <Car className="w-12 h-12 mx-auto opacity-20 mb-3" />
                <p>No se encontraron visitas o reparaciones registradas para este vehículo.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historial.map((ot: any) => {
                  const isClosed = ot.estado === 'listo' || ot.estado === 'entregado';
                  const isBeingClosed = closingOrder?.id === ot.id;

                  return (
                    <div key={ot.id} className="p-4 bg-slate-900 border border-slate-200 rounded-xl space-y-3 transition-colors hover:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-white px-2 py-0.5 bg-[#1c1b1b] border border-[#222222] rounded">
                          {ot.folio}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                            ot.estado === 'entregado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            ot.estado === 'listo' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            ot.estado === 'en_proceso' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {ot.estado}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div>
                          <span className="font-medium text-slate-500 block">Ingreso:</span>
                          {new Date(ot.fecha_ingreso).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                        </div>
                        {ot.fecha_cierre && (
                          <div>
                            <span className="font-medium text-slate-500 block">Cierre:</span>
                            {new Date(ot.fecha_cierre).toLocaleDateString('es-MX', { dateStyle: 'medium' })}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Problema / Queja:</h4>
                        <p className="text-sm text-white font-medium bg-[#0b0a0a] p-2.5 rounded border border-[#222222]">{ot.queja_cliente}</p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reparación / Diagnóstico:</h4>
                        {ot.diagnostico ? (
                          <p className="text-sm text-slate-200 font-mono bg-[#0b0a0a] p-2.5 rounded border border-[#222222] whitespace-pre-line">{ot.diagnostico}</p>
                        ) : (
                          <p className="text-sm text-slate-500 italic">Pendiente de diagnóstico técnico.</p>
                        )}
                      </div>

                      {!isClosed && !isBeingClosed && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => { setClosingOrder(ot); setDiagnosticoText(ot.diagnostico ?? ''); }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-brand"
                          >
                            <Wrench className="w-3.5 h-3.5" /> Cerrar Reparación / Caso
                          </button>
                        </div>
                      )}

                      {isBeingClosed && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            closeOrderMutation.mutate({
                              id: ot.id,
                              diagnostico: diagnosticoText,
                              estado: closingStatus,
                            });
                          }}
                          className="pt-3 border-t border-slate-800 space-y-3 animate-in slide-in-from-top-2 duration-200"
                        >
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Solución / Reparación Efectuada *</label>
                            <textarea
                              required
                              value={diagnosticoText}
                              onChange={(e) => setDiagnosticoText(e.target.value)}
                              placeholder="Describe detalladamente los trabajos, reparaciones y refacciones utilizadas..."
                              rows={3}
                              className="w-full px-3 py-2 bg-[#0b0a0a] border border-[#222222] text-white text-sm focus:outline-none focus:border-blue-500 rounded-sm"
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <input
                                  type="radio"
                                  name="status"
                                  checked={closingStatus === 'LISTO'}
                                  onChange={() => setClosingStatus('LISTO')}
                                  className="text-blue-600 focus:ring-0"
                                />
                                Listo para entregar
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <input
                                  type="radio"
                                  name="status"
                                  checked={closingStatus === 'ENTREGADO'}
                                  onChange={() => setClosingStatus('ENTREGADO')}
                                  className="text-blue-600 focus:ring-0"
                                />
                                Entregado
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setClosingOrder(null)}
                                className="px-3 py-1.5 text-xs rounded border border-slate-800 hover:bg-[#1c1b1b] transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                disabled={closeOrderMutation.isPending}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded transition-colors"
                              >
                                {closeOrderMutation.isPending ? 'Guardando...' : 'Guardar y Cerrar'}
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
