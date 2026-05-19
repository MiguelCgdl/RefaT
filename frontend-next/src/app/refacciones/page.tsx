'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRefaccion, getRefacciones } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Package, Tag, Hash, DollarSign, AlertTriangle } from 'lucide-react';

export default function RefaccionesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['refacciones'],
    queryFn: () => getRefacciones(token!),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createRefaccion(token!, {
        sku: String(form.get('sku')),
        nombre: String(form.get('nombre')),
        precioVenta: Number(form.get('precioVenta')),
        stock: Number(form.get('stock') ?? 0),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['refacciones'] }),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Inventario de Refacciones</h2>
        <p className="text-slate-500 mt-2">Gestiona el catálogo de partes y existencias del almacén.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" /> Nueva Refacción
        </h3>
        
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(new FormData(e.currentTarget));
            e.currentTarget.reset();
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-400" /> SKU *
            </label>
            <input
              name="sku"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono uppercase"
              placeholder="FIL-ACE-01"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" /> Nombre de la pieza *
            </label>
            <input
              name="nombre"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Filtro de Aceite Sintético"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" /> Precio Venta *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-500">$</span>
              <input
                name="precioVenta"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="250.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" /> Stock Inicial
            </label>
            <input
              name="stock"
              type="number"
              step="0.01"
              defaultValue={0}
              min="0"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending ? 'Guardando...' : 'Agregar al Inventario'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">SKU</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Refacción</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Stock</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Precio Venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.results?.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 font-mono py-1 px-2.5 rounded text-sm border border-slate-200">
                        {r.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">
                      <div className="flex items-center gap-2">
                        {r.nombre}
                        {r.bajo_stock && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full" title="Bajo stock">
                            <AlertTriangle className="w-3 h-3" />
                            Escaso
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-semibold ${r.bajo_stock ? 'text-red-600' : 'text-slate-700'}`}>
                        {r.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900 font-medium">
                      ${Number(r.precio_venta).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {!data?.results?.length && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No hay refacciones registradas en el catálogo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
