'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardResumen } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Activity, AlertTriangle, LayoutDashboard, TrendingUp, Users, Plus } from 'lucide-react';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import Link from 'next/link';

export default function DashboardPage() {
  const { token } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardResumen(token!),
    enabled: Boolean(token),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ProgressBar mode="indeterminate" style={{ height: '6px', width: '300px' }} />
        <span className="text-slate-500 font-medium">Cargando resumen...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] border border-red-200 flex items-center gap-4">
        <AlertTriangle className="w-8 h-8" />
        <div>
          <h3 className="font-bold">Error de conexión</h3>
          <p className="text-sm">No se pudo cargar la información del dashboard. Por favor, intenta de nuevo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-3">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
          <div className="p-4 bg-gradient-3d rounded-2xl shadow-3d shadow-blue-600/30 ring-4 ring-white/10">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          Panel de Control
        </h2>
        <p className="text-slate-500 font-medium text-lg ml-1">Estado operativo y métricas críticas del taller.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Link href="/ordenes" className="block">
          <Card className="rounded-[2.5rem] border-none shadow-3d bg-white/80 backdrop-blur-xl hover:shadow-3d-hover transition-all duration-500 group cursor-pointer">
            <div className="flex items-center gap-5 p-2">
              <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner ring-1 ring-blue-500/10">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Órdenes Activas</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{data?.ordenes_activas ?? 0}</h3>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/refacciones" className="block">
          <Card className="rounded-[2.5rem] border-none shadow-3d bg-white/80 backdrop-blur-xl hover:shadow-3d-hover transition-all duration-500 group cursor-pointer">
            <div className="flex items-center gap-5 p-2">
              <div className="p-5 bg-red-50 text-red-600 rounded-3xl group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-inner ring-1 ring-red-500/10">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Bajo Stock</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{data?.refacciones_bajo_stock ?? 0}</h3>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card 
          header={<div className="px-10 pt-10 font-black text-2xl text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            Estado de Órdenes
          </div>} 
          className="lg:col-span-2 rounded-[3rem] border-none shadow-3d bg-white/90 backdrop-blur-xl overflow-hidden"
        >
          <div className="space-y-4 px-6 pb-6">
            {data?.ordenes_por_estado.map((item) => (
              <div key={item.estado} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl hover:bg-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-slate-100 group">
                <div className="flex items-center gap-5">
                  <div className={`w-4 h-4 rounded-full ${
                    item.estado === 'COMPLETADO' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' :
                    item.estado === 'EN_PROGRESO' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 
                    'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  }`} />
                  <span className="font-black text-slate-700 uppercase tracking-wider text-xs">{item.estado?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900">{item.total}</span>
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <TrendingUp className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
            ))}
            {!data?.ordenes_por_estado?.length && (
              <div className="py-16 text-center text-slate-400 italic font-medium">
                No hay actividad reciente en las órdenes.
              </div>
            )}
          </div>
        </Card>

        <Card 
          header={<div className="px-10 pt-10 font-black text-2xl text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            Accesos Rápidos
          </div>} 
          className="rounded-[3rem] border-none shadow-3d bg-white/90 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 px-6 pb-6">
            <button 
              onClick={() => window.location.href='/taller'} 
              className="group flex items-center justify-between p-6 bg-gradient-3d text-white rounded-[2rem] hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 active:scale-95 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 translate-y-[-8] blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <span className="font-black text-lg tracking-tight relative z-10">Nueva Orden</span>
              <Plus className="w-6 h-6 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => window.location.href='/clientes'} 
              className="group flex items-center justify-between p-6 bg-slate-50/50 text-slate-700 rounded-[2rem] hover:bg-slate-100 border border-slate-100 hover:border-blue-200 transition-all duration-300 active:scale-95 shadow-sm"
            >
              <span className="font-black text-lg tracking-tight">Ver Clientes</span>
              <Users className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
