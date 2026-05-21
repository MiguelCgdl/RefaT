'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCliente, getClientes, updateCliente, deleteCliente } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, User, Mail, Phone, FileText, Car, Pencil, Trash2, Search } from 'lucide-react';
import { Modal } from '@/components/Modal';
import type { Cliente } from '@/lib/types';

const EMPTY: Partial<Cliente> = { nombre: '', email: '', telefono: '', rfc: '', direccion: '' };

export default function ClientesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['clientes'], queryFn: () => getClientes(token!), enabled: Boolean(token) });

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Cliente | null>(null);
  const [deleteItem, setDeleteItem] = useState<Cliente | null>(null);
  const [incluirVehiculo, setIncluirVehiculo] = useState(false);

  const createMutation = useMutation({
    mutationFn: (form: FormData) => {
      const data: any = {
        nombre: String(form.get('nombre')),
        email: String(form.get('email') ?? ''),
        telefono: String(form.get('telefono') ?? ''),
        rfc: String(form.get('rfc') ?? ''),
        direccion: String(form.get('direccion') ?? ''),
      };
      if (incluirVehiculo) {
        data.vehiculo = {
          marca: String(form.get('marca') ?? ''),
          modelo: String(form.get('modelo') ?? ''),
          anio: parseInt(String(form.get('anio')) || '0', 10),
          placas: String(form.get('placas') ?? ''),
          color: String(form.get('color') ?? ''),
        };
      }
      return createCliente(token!, data);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); setShowCreate(false); setIncluirVehiculo(false); },
    onError: (e: any) => alert(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: number; form: FormData }) =>
      updateCliente(token!, id, {
        nombre: String(form.get('nombre')),
        email: String(form.get('email') ?? ''),
        telefono: String(form.get('telefono') ?? ''),
        rfc: String(form.get('rfc') ?? ''),
        direccion: String(form.get('direccion') ?? ''),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); setEditItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCliente(token!, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); setDeleteItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const filtered = (data?.results ?? []).filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.telefono ?? '').includes(search)
  );

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Clientes</h2>
          <p className="text-slate-500 mt-1">Gestiona los datos de tus clientes.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, email o teléfono..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">RFC</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{c.nombre}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{c.email || '—'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{c.telefono || '—'}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm font-mono">{c.rfc || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setEditItem(c)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteItem(c)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No hay clientes{search ? ' que coincidan con la búsqueda' : ' registrados'}.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear */}
      <Modal open={showCreate} title="Nuevo Cliente" onClose={() => { setShowCreate(false); setIncluirVehiculo(false); }}>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); createMutation.mutate(new FormData(e.currentTarget)); }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><User className="w-3 h-3" /> Nombre *</label><input name="nombre" required className={inputCls} placeholder="Juan Pérez" /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label><input name="email" type="email" className={inputCls} placeholder="juan@mail.com" /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Phone className="w-3 h-3" /> Teléfono</label><input name="telefono" className={inputCls} placeholder="555-1234" /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><FileText className="w-3 h-3" /> RFC</label><input name="rfc" className={inputCls} placeholder="XAXX010101" /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Dirección</label><input name="direccion" className={inputCls} placeholder="Calle 123" /></div>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" checked={incluirVehiculo} onChange={e => setIncluirVehiculo(e.target.checked)} className="rounded border-slate-300" />
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1"><Car className="w-4 h-4 text-slate-400" /> Registrar vehículo ahora</span>
            </label>
            {incluirVehiculo && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in">
                <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Marca *</label><input name="marca" required={incluirVehiculo} className={inputCls} placeholder="Toyota" /></div>
                <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Modelo *</label><input name="modelo" required={incluirVehiculo} className={inputCls} placeholder="Corolla" /></div>
                <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Año *</label><input name="anio" type="number" required={incluirVehiculo} className={inputCls} placeholder="2020" /></div>
                <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Placas *</label><input name="placas" required={incluirVehiculo} className={inputCls} placeholder="ABC-123" /></div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
              {createMutation.isPending ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Editar */}
      <Modal open={!!editItem} title="Editar Cliente" onClose={() => setEditItem(null)}>
        {editItem && (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); updateMutation.mutate({ id: editItem.id, form: new FormData(e.currentTarget) }); }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><label className="text-xs font-medium text-slate-700">Nombre *</label><input name="nombre" required defaultValue={editItem.nombre} className={inputCls} /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Email</label><input name="email" type="email" defaultValue={editItem.email} className={inputCls} /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Teléfono</label><input name="telefono" defaultValue={editItem.telefono} className={inputCls} /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">RFC</label><input name="rfc" defaultValue={editItem.rfc} className={inputCls} /></div>
              <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Dirección</label><input name="direccion" defaultValue={editItem.direccion} className={inputCls} /></div>
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

      {/* Modal: Confirmar Eliminación */}
      <Modal open={!!deleteItem} title="Eliminar Cliente" onClose={() => setDeleteItem(null)}>
        {deleteItem && (
          <div className="space-y-5">
            <p className="text-slate-600">¿Estás seguro de eliminar a <span className="font-semibold text-slate-900">{deleteItem.nombre}</span>? Esta acción no se puede deshacer.</p>
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
