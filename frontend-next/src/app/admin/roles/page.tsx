// src/app/admin/roles/page.tsx
'use client';
import Link from 'next/link';
import { Card } from 'primereact/card';
import { ShieldCheck } from 'lucide-react';

export default function RolesPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl font-extrabold text-center text-slate-800 tracking-wider">
        Gestión de Roles
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placeholder for role list */}
        <Card className="rounded-[2rem] bg-white/80 backdrop-blur-md shadow-3d hover:shadow-3d-hover transition-all duration-500 p-6">
          <div className="flex items-center gap-4 mb-4">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-700">Roles Existentes</h2>
          </div>
          <p className="text-slate-500">Aquí se mostrará una tabla de roles con sus permisos asociados.</p>
        </Card>
        <Card className="rounded-[2rem] bg-white/80 backdrop-blur-md shadow-3d hover:shadow-3d-hover transition-all duration-500 p-6">
          <div className="flex items-center gap-4 mb-4">
            <ShieldCheck className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-slate-700">Crear Nuevo Rol</h2>
          </div>
          <p className="text-slate-500">Formulario para crear un nuevo rol y asignar permisos.</p>
        </Card>
      </div>
    </div>
  );
}
