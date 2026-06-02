'use client';

import { Card } from 'primereact/card';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

const ROLES = [
  { name: 'ADMIN', description: 'Acceso total al sistema, configuración y usuarios.' },
  { name: 'MECANICO', description: 'Acceso a tableros, órdenes de trabajo asignadas.' },
  { name: 'ASESOR', description: 'Atención a clientes, generación de presupuestos y gestión de taller.' },
  { name: 'ALMACEN', description: 'Gestión de inventario y refacciones.' },
  { name: 'CLIENTE', description: 'Acceso a historial de vehículos y estado de sus órdenes.' },
];

export default function AdminRolesPage() {
  return (
    <div className="p-4 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a Administración
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <Shield className="w-6 h-6" />
            </div>
            Roles del Sistema
          </h1>
        </div>
      </div>

      <Card className="rounded-[2.5rem] bg-white/80 backdrop-blur-xl border-none shadow-3d overflow-hidden p-6">
        <p className="text-slate-500 mb-6 font-medium">
          Estos son los roles predefinidos en el sistema. Su lógica de acceso está incrustada a nivel de código y base de datos (Enum).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROLES.map(role => (
            <div key={role.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
              <div className="mt-1 w-3 h-3 rounded-full bg-indigo-400 shrink-0" />
              <div>
                <h3 className="font-black text-slate-800 tracking-wider text-sm">{role.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
