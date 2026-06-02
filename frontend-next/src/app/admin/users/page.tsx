// src/app/admin/users/page.tsx
'use client';
import { Card } from 'primereact/card';
import Link from 'next/link';

export default function AdminUsersPage() {
  return (
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-3xl font-extrabold text-center text-slate-800 tracking-wider mb-4">
        Gestión de Usuarios
      </h1>
      <Card className="rounded-[2rem] bg-white/80 backdrop-blur-md shadow-3d hover:shadow-3d-hover transition-all duration-500 p-6">
        {/* Placeholder table/list - replace with actual data fetching */}
        <p className="text-slate-600">Aquí podrás crear, editar y eliminar usuarios del sistema.</p>
        <Link href="/admin/users/create" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-[1rem] hover:bg-blue-700 transition-colors">
          Crear Usuario
        </Link>
      </Card>
    </div>
  );
}
