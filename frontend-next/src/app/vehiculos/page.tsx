'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVehiculo, getClientes, getVehiculos } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Car, User, Hash, Calendar } from 'lucide-react';

export default function VehiculosPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data: vehiculos, isLoading } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: () => getVehiculos(token!),
    enabled: Boolean(token),
  });
  const { data: clientes } = useQuery({
    queryKey: ['clientes-select'],
    queryFn: () => getClientes(token!),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createVehiculo(token!, {
        clienteId: Number(form.get('clienteId')),
        marca: String(form.get('marca')),
        modelo: String(form.get('modelo')),
        anio: Number(form.get('anio')),
        placas: String(form.get('placas')),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehiculos'] }),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Registro de Vehículos</h2>
        <p className="text-slate-500 mt-2">Gestiona la flota y los autos de tus clientes.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" /> Nuevo Vehículo
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
              <User className="w-4 h-4 text-slate-400" /> Cliente Propietario *
            </label>
            <select
              name="clienteId"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            >
              <option value="">Seleccionar cliente…</option>
              {clientes?.results?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-400" /> Marca *
            </label>
            <input
              name="marca"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Ej. Honda"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-400" /> Modelo *
            </label>
            <input
              name="modelo"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Ej. Civic"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Año *
            </label>
            <input
              name="anio"
              type="number"
              required
              min="1950"
              max={new Date().getFullYear() + 1}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="2020"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-400" /> Placas *
            </label>
            <input
              name="placas"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
              placeholder="ABC-123"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar Vehículo'}
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
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Placas</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Vehículo</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Propietario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehiculos?.results?.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-700 font-mono py-1 px-2.5 rounded text-sm border border-slate-200 uppercase">
                        {v.placas}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">
                      {v.marca} {v.modelo} <span className="text-slate-400 font-normal ml-1">({v.anio})</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{v.cliente_nombre || '—'}</td>
                  </tr>
                ))}
                {!vehiculos?.results?.length && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No hay vehículos registrados aún.
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
