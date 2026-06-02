'use client';

import { Card } from 'primereact/card';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

export default function AdminPermissionsPage() {
  return (
    <div className="p-4 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a Administración
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <Lock className="w-6 h-6" />
            </div>
            Permisos Granulares
          </h1>
        </div>
      </div>

      <Card className="rounded-[2.5rem] bg-white/80 backdrop-blur-xl border-none shadow-3d overflow-hidden p-6 text-center">
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Acceso Basado en Roles</h2>
          <p className="text-slate-500 max-w-md mt-2 font-medium">
            Actualmente la aplicación utiliza controles de seguridad integrados directamente con el esquema Prisma usando enumeraciones (Enums). Los permisos están implícitamente asignados a los Roles definidos en la sección "Roles y Permisos".
          </p>
        </div>
      </Card>
    </div>
  );
}
