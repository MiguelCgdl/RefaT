'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCliente, getClientes } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, User, Mail, Phone, FileText } from 'lucide-react';

export default function ClientesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => getClientes(token!),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createCliente(token!, {
        nombre: String(form.get('nombre')),
        email: String(form.get('email') ?? ''),
        telefono: String(form.get('telefono') ?? ''),
        rfc: String(form.get('rfc') ?? ''),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Directorio de Clientes</h2>
        <p className="text-slate-500 mt-2">Gestiona la información y contactos de tus clientes.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" /> Nuevo Cliente
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
              <User className="w-4 h-4 text-slate-400" /> Nombre *
            </label>
            <input
              name="nombre"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> Email
            </label>
            <input
              name="email"
              type="email"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" /> Teléfono
            </label>
            <input
              name="telefono"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> RFC
            </label>
            <input
              name="rfc"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="XAXX010101000"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar Cliente'}
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
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Nombre</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Email</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Teléfono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.results?.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-medium">{c.nombre}</td>
                    <td className="px-6 py-4 text-slate-500">{c.email || '—'}</td>
                    <td className="px-6 py-4 text-slate-500">{c.telefono || '—'}</td>
                  </tr>
                ))}
                {!data?.results?.length && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No hay clientes registrados aún.
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
