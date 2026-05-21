'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrden, getOrdenes, getVehiculos } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Car, ClipboardList, AlertCircle, FileText, Eye } from 'lucide-react';
import Link from 'next/link';

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

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createOrden(token!, {
        vehiculoId: Number(form.get('vehiculoId')),
        quejaCliente: String(form.get('quejaCliente')),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  });

  const getStatusColor = (estado: string) => {
    switch(estado) {
      case 'COMPLETADO': return 'bg-green-100 text-green-700';
      case 'EN_PROGRESO': return 'bg-blue-100 text-blue-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Órdenes de Trabajo</h2>
        <p className="text-slate-500 mt-2">Registra y administra los servicios del taller.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" /> Nueva Orden
        </h3>
        
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(new FormData(e.currentTarget));
            e.currentTarget.reset();
          }}
        >
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-400" /> Vehículo *
            </label>
            <select
              name="vehiculoId"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            >
              <option value="">Seleccionar vehículo…</option>
              {vehiculos?.results?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placas} — {v.marca} {v.modelo}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400" /> Queja del Cliente / Motivo de Ingreso *
            </label>
            <textarea
              name="quejaCliente"
              rows={3}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              placeholder="Ej. El cliente reporta ruido en los frenos al detenerse..."
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending ? 'Guardando...' : 'Crear Orden de Trabajo'}
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
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Folio</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Vehículo (Placas)</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Estado</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Prioridad</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordenes?.results?.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-900 font-medium">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {o.folio}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                      {o.vehiculo_placas}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(o.estado)}`}>
                        {o.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        o.prioridad === 'ALTA' ? 'bg-red-100 text-red-700' :
                        o.prioridad === 'URGENTE' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {o.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        href={`/ordenes/${o.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
                {!ordenes?.results?.length && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No hay órdenes de trabajo activas.
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
