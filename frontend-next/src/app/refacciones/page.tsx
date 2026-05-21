'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRefaccion, getRefacciones, updateRefaccion, deleteRefaccion } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Package, Tag, Hash, DollarSign, AlertTriangle, Pencil, Trash2, Search } from 'lucide-react';
import { Modal } from '@/components/Modal';
import type { Refaccion } from '@/lib/types';

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all';

export default function RefaccionesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['refacciones'], queryFn: () => getRefacciones(token!), enabled: Boolean(token) });

  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Refaccion | null>(null);
  const [deleteItem, setDeleteItem] = useState<Refaccion | null>(null);

  const createMutation = useMutation({
    mutationFn: (form: FormData) => createRefaccion(token!, {
      sku: String(form.get('sku')),
      nombre: String(form.get('nombre')),
      costo: Number(form.get('costo') || 0),
      precioVenta: Number(form.get('precioVenta')),
      stock: Number(form.get('stock') || 0),
      stockMinimo: Number(form.get('stockMinimo') || 0),
      categoria: String(form.get('categoria') || ''),
      ubicacion: String(form.get('ubicacion') || ''),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['refacciones'] }); setShowCreate(false); },
    onError: (e: any) => alert(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, form }: { id: number; form: FormData }) => updateRefaccion(token!, id, {
      sku: String(form.get('sku')),
      nombre: String(form.get('nombre')),
      costo: Number(form.get('costo') || 0),
      precioVenta: Number(form.get('precioVenta')),
      stock: Number(form.get('stock') || 0),
      stockMinimo: Number(form.get('stockMinimo') || 0),
      categoria: String(form.get('categoria') || ''),
      ubicacion: String(form.get('ubicacion') || ''),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['refacciones'] }); setEditItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRefaccion(token!, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['refacciones'] }); setDeleteItem(null); },
    onError: (e: any) => alert(e.message),
  });

  const filtered = (data?.results ?? []).filter(r =>
    r.nombre.toLowerCase().includes(search.toLowerCase()) ||
    r.sku.toLowerCase().includes(search.toLowerCase())
  );

  const RefaccionForm = ({ item, onSubmit, isPending }: { item?: Refaccion; onSubmit: (f: FormData) => void; isPending: boolean }) => (
    <form className="space-y-4" onSubmit={e => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Hash className="w-3 h-3" /> SKU *</label><input name="sku" required defaultValue={item?.sku} className={inputCls + ' font-mono uppercase'} placeholder="FIL-01" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Tag className="w-3 h-3" /> Categoría</label><input name="categoria" defaultValue={(item as any)?.categoria} className={inputCls} placeholder="Filtros" /></div>
        <div className="col-span-2 space-y-1"><label className="text-xs font-medium text-slate-700">Nombre de la Pieza *</label><input name="nombre" required defaultValue={item?.nombre} className={inputCls} placeholder="Filtro de aceite sintético" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Costo</label><input name="costo" type="number" step="0.01" min="0" defaultValue={item?.costo} className={inputCls} placeholder="80.00" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Precio Venta *</label><input name="precioVenta" type="number" step="0.01" min="0" required defaultValue={item?.precio_venta} className={inputCls} placeholder="150.00" /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700 flex items-center gap-1"><Package className="w-3 h-3" /> Stock</label><input name="stock" type="number" min="0" defaultValue={item?.stock ?? '0'} className={inputCls} /></div>
        <div className="space-y-1"><label className="text-xs font-medium text-slate-700">Stock Mínimo</label><input name="stockMinimo" type="number" min="0" defaultValue={(item as any)?.stock_minimo ?? '0'} className={inputCls} /></div>
        <div className="col-span-2 space-y-1"><label className="text-xs font-medium text-slate-700">Ubicación en Almacén</label><input name="ubicacion" defaultValue={(item as any)?.ubicacion} className={inputCls} placeholder="Ej. Estante A-3" /></div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={() => { setShowCreate(false); setEditItem(null); }} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancelar</button>
        <button type="submit" disabled={isPending} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl disabled:opacity-50 transition-colors">
          {isPending ? 'Guardando...' : item ? 'Actualizar' : 'Agregar al Inventario'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Inventario de Refacciones</h2>
          <p className="text-slate-500 mt-1">Gestiona el catálogo de partes y existencias del almacén.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Nueva Refacción
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o SKU..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Refacción</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Costo</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">P. Venta</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4"><span className="bg-slate-100 text-slate-700 font-mono py-1 px-2.5 rounded text-xs border border-slate-200 uppercase">{r.sku}</span></td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {r.nombre}
                        {r.bajo_stock && <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" />Escaso</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 text-sm">${Number(r.costo).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">${Number(r.precio_venta).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center"><span className={`font-semibold text-sm ${r.bajo_stock ? 'text-red-600' : 'text-slate-700'}`}>{r.stock}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setEditItem(r)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteItem(r)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No hay refacciones{search ? ' que coincidan' : ' registradas'}.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showCreate} title="Nueva Refacción" onClose={() => setShowCreate(false)}>
        <RefaccionForm onSubmit={f => createMutation.mutate(f)} isPending={createMutation.isPending} />
      </Modal>

      <Modal open={!!editItem} title="Editar Refacción" onClose={() => setEditItem(null)}>
        {editItem && <RefaccionForm item={editItem} onSubmit={f => updateMutation.mutate({ id: editItem.id, form: f })} isPending={updateMutation.isPending} />}
      </Modal>

      <Modal open={!!deleteItem} title="Eliminar Refacción" onClose={() => setDeleteItem(null)}>
        {deleteItem && (
          <div className="space-y-5">
            <p className="text-slate-600">¿Eliminar <span className="font-semibold">[{deleteItem.sku}] {deleteItem.nombre}</span>? Esta acción no se puede deshacer.</p>
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
