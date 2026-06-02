// src/app/admin/permissions/page.tsx
'use client';
import { Card } from 'primereact/card';
import Link from 'next/link';

export default function AdminPermissionsPage() {
  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-extrabold text-center text-slate-800 tracking-wider mb-4">
        Gestión de Permisos
      </h1>
      <Card className="rounded-[2rem] bg-white/80 backdrop-blur-md shadow-3d hover:shadow-3d-hover transition-all duration-500 p-6">
        {/* Placeholder for permissions list */}
        <p className="text-slate-600">Aquí podrás crear, editar y eliminar permisos del sistema.</p>
        <Link href="/admin/permissions/create" className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-[1rem] hover:bg-green-700 transition-colors">
          Crear Permiso
        </Link>
      </Card>
    </div>
  );
}
