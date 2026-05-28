'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardResumen } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Activity, AlertTriangle, LayoutDashboard, TrendingUp, Users, Plus, Car, Wrench } from 'lucide-react';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import Link from 'next/link';

// ── Colour helpers ────────────────────────────────────────────────────────────
const STATE_META: Record<string, { label: string; color: string; glow: string; bg: string }> = {
  recibido:          { label: 'Recibido',          color: '#f59e0b', glow: 'rgba(245,158,11,0.4)',  bg: '#fef3c7' },
  diagnostico:       { label: 'Diagnóstico',       color: '#f59e0b', glow: 'rgba(245,158,11,0.4)',  bg: '#fef3c7' },
  espera_aprobacion: { label: 'Espera Aprobación', color: '#a78bfa', glow: 'rgba(167,139,250,0.4)', bg: '#ede9fe' },
  en_proceso:        { label: 'En Proceso',        color: '#3b82f6', glow: 'rgba(59,130,246,0.4)',  bg: '#dbeafe' },
  listo:             { label: 'Listo',             color: '#10b981', glow: 'rgba(16,185,129,0.4)',  bg: '#d1fae5' },
  entregado:         { label: 'Entregado',         color: '#6b7280', glow: 'rgba(107,114,128,0.3)', bg: '#f3f4f6' },
  cancelado:         { label: 'Cancelado',         color: '#ef4444', glow: 'rgba(239,68,68,0.4)',   bg: '#fee2e2' },
};

function getMeta(estado: string) {
  return STATE_META[estado.toLowerCase()] ?? { label: estado.replace(/_/g, ' '), color: '#94a3b8', glow: 'rgba(148,163,184,0.3)', bg: '#f8fafc' };
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ items }: { items: { estado: string; total: number }[] }) {
  const total = items.reduce((s, i) => s + i.total, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-slate-300 text-sm font-medium italic">
        Sin vehículos en taller
      </div>
    );
  }

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const stroke = 22;

  // Build arcs
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const arcs = items.map((item) => {
    const pct = item.total / total;
    const dash = pct * circumference;
    const meta = getMeta(item.estado);
    const arc = { ...item, pct, dash, offset: circumference - offset, color: meta.color };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG donut */}
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          ))}
        </svg>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-900">{total}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">vehículos</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {arcs.map((arc, i) => {
          const meta = getMeta(arc.estado);
          return (
            <div key={i} className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: meta.color, boxShadow: `0 0 8px ${meta.glow}` }}
                />
                <span className="text-xs font-bold text-slate-600 truncate">{meta.label}</span>
              </div>
              <span className="text-xs font-black text-slate-900 flex-shrink-0">
                {arc.total} <span className="font-medium text-slate-400">({Math.round(arc.pct * 100)}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
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
        <AlertTriangle className="w-8 h-8 flex-shrink-0" />
        <div>
          <h3 className="font-bold">Error de conexión</h3>
          <p className="text-sm">No se pudo cargar la información del dashboard. Por favor, intenta de nuevo.</p>
        </div>
      </div>
    );
  }

  // Filter out delivered/cancelled for the chart
  const activeStates = (data?.ordenes_por_estado ?? []).filter(
    (o) => !['entregado', 'cancelado'].includes(o.estado.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-gradient-3d rounded-2xl shadow-3d shadow-blue-600/30 ring-4 ring-white/10">
            <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          Panel de Control
        </h2>
        <p className="text-slate-500 font-medium text-sm sm:text-base ml-1">Estado operativo y métricas críticas del taller.</p>
      </div>

      {/* ── KPI Cards — 1 col mobile / 2 col sm / 3 col lg ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

        {/* Órdenes Activas */}
        <Link href="/ordenes" className="block">
          <Card className="rounded-[2rem] border-none shadow-3d bg-white/80 backdrop-blur-xl hover:shadow-3d-hover transition-all duration-500 group cursor-pointer h-full">
            <div className="flex items-center gap-4 p-1">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner ring-1 ring-blue-500/10 flex-shrink-0">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Órdenes Activas</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{data?.ordenes_activas ?? 0}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Taller</p>
              </div>
            </div>
          </Card>
        </Link>

        {/* Vehículos en Taller */}
        <Link href="/clientes" className="block">
          <Card className="rounded-[2rem] border-none shadow-3d bg-white/80 backdrop-blur-xl hover:shadow-3d-hover transition-all duration-500 group cursor-pointer h-full">
            <div className="flex items-center gap-4 p-1">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner ring-1 ring-emerald-500/10 flex-shrink-0">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Vehículos en Taller</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{data?.vehiculos_en_taller ?? 0}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Taller</p>
              </div>
            </div>
          </Card>
        </Link>

        {/* Bajo Stock */}
        <Link href="/refacciones" className="block sm:col-span-2 lg:col-span-1">
          <Card className="rounded-[2rem] border-none shadow-3d bg-white/80 backdrop-blur-xl hover:shadow-3d-hover transition-all duration-500 group cursor-pointer h-full">
            <div className="flex items-center gap-4 p-1">
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all duration-500 shadow-inner ring-1 ring-red-500/10 flex-shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Bajo Stock</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{data?.refacciones_bajo_stock ?? 0}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Almacén</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* ── Bottom row: Estado Órdenes + Gráfico + Accesos Rápidos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">

        {/* Estado de Órdenes list */}
        <Card
          header={
            <div className="px-8 pt-8 pb-2 font-black text-xl text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-2 h-7 bg-blue-600 rounded-full" />
              Estado de Órdenes
            </div>
          }
          className="rounded-[2.5rem] border-none shadow-3d bg-white/90 backdrop-blur-xl overflow-hidden"
        >
          <div className="space-y-3 px-4 pb-6">
            {data?.ordenes_por_estado.map((item) => {
              const meta = getMeta(item.estado);
              return (
                <div
                  key={item.estado}
                  className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-slate-100 group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: meta.color, boxShadow: `0 0 10px ${meta.glow}` }}
                    />
                    <span className="font-black text-slate-700 uppercase tracking-wider text-xs">{meta.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900">{item.total}</span>
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <TrendingUp className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </div>
                  </div>
                </div>
              );
            })}
            {!data?.ordenes_por_estado?.length && (
              <div className="py-12 text-center text-slate-400 italic font-medium text-sm">
                No hay actividad reciente en las órdenes.
              </div>
            )}
          </div>
        </Card>

        {/* Vehículos en Taller chart */}
        <Card
          header={
            <div className="px-8 pt-8 pb-2 font-black text-xl text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-2 h-7 bg-emerald-500 rounded-full" />
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-500" />
                Vehículos en Taller
              </div>
            </div>
          }
          className="rounded-[2.5rem] border-none shadow-3d bg-white/90 backdrop-blur-xl overflow-hidden"
        >
          <div className="px-6 pb-8 pt-2">
            <DonutChart items={activeStates} />

            {/* Summary row */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-2xl font-black text-slate-900">{data?.vehiculos_en_taller ?? 0}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Únicos</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-center flex-1">
                <p className="text-2xl font-black text-slate-900">{data?.ordenes_activas ?? 0}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Órdenes</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Accesos Rápidos */}
        <Card
          header={
            <div className="px-8 pt-8 pb-2 font-black text-xl text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-2 h-7 bg-blue-600 rounded-full" />
              Accesos Rápidos
            </div>
          }
          className="rounded-[2.5rem] border-none shadow-3d bg-white/90 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-3 px-4 pb-6">
            <button
              onClick={() => window.location.href = '/taller'}
              className="group flex items-center justify-between p-5 bg-gradient-3d text-white rounded-[1.5rem] hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 active:scale-95 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-8 -translate-y-2 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <span className="font-black text-base tracking-tight relative z-10">Nueva Orden</span>
              <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <button
              onClick={() => window.location.href = '/clientes'}
              className="group flex items-center justify-between p-5 bg-slate-50/50 text-slate-700 rounded-[1.5rem] hover:bg-slate-100 border border-slate-100 hover:border-blue-200 transition-all duration-300 active:scale-95 shadow-sm"
            >
              <span className="font-black text-base tracking-tight">Ver Clientes</span>
              <Users className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </button>

            <button
              onClick={() => window.location.href = '/taller'}
              className="group flex items-center justify-between p-5 bg-slate-50/50 text-slate-700 rounded-[1.5rem] hover:bg-slate-100 border border-slate-100 hover:border-amber-200 transition-all duration-300 active:scale-95 shadow-sm"
            >
              <span className="font-black text-base tracking-tight">Taller y Reparaciones</span>
              <Wrench className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
            </button>

            <button
              onClick={() => window.location.href = '/refacciones'}
              className="group flex items-center justify-between p-5 bg-slate-50/50 text-slate-700 rounded-[1.5rem] hover:bg-slate-100 border border-slate-100 hover:border-emerald-200 transition-all duration-300 active:scale-95 shadow-sm"
            >
              <span className="font-black text-base tracking-tight">Almacén</span>
              <Car className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
