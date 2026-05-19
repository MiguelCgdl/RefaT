'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardResumen } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { token } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardResumen(token!),
    enabled: Boolean(token),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
        No se pudo cargar la información del dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bienvenido al Dashboard</h2>
        <p className="text-slate-500 mt-2">Aquí tienes un resumen de la actividad de tu taller.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Órdenes Activas</p>
              <h3 className="text-2xl font-bold text-slate-900">{data?.ordenes_activas ?? 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Bajo Stock</p>
              <h3 className="text-2xl font-bold text-slate-900">{data?.refacciones_bajo_stock ?? 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Estado de Órdenes</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {data?.ordenes_por_estado.map((item) => (
            <div key={item.estado} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  item.estado === 'COMPLETADO' ? 'bg-green-500' :
                  item.estado === 'EN_PROGRESO' ? 'bg-blue-500' : 'bg-amber-500'
                }`} />
                <span className="font-medium text-slate-700">{item.estado}</span>
              </div>
              <span className="bg-slate-100 text-slate-700 py-1 px-3 rounded-full text-sm font-semibold">
                {item.total}
              </span>
            </div>
          ))}
          {!data?.ordenes_por_estado?.length && (
            <div className="px-6 py-8 text-center text-slate-500">
              No hay datos de órdenes disponibles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
