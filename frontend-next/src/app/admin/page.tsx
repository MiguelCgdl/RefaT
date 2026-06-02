/* src/app/admin/page.tsx */
'use client';
import Link from 'next/link';
import { Card } from 'primereact/card';

export default function AdminHome() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl font-extrabold text-center text-slate-800 tracking-wider">
        Panel de Administración
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users" className="block">
          <Card className="rounded-[2rem] bg-white/80 backdrop-blur-md shadow-3d hover:shadow-3d-hover transition-all duration-500 text-center p-6">
            <h2 className="text-2xl font-bold text-slate-700">Gestión de Usuarios</h2>
            <p className="text-slate-500 mt-2">Crear, editar y asignar roles a los usuarios.</p>
          </Card>
        </Link>
        <Link href="/admin/roles" className="block">
          <Card className="rounded-[2rem] bg-white/80 backdrop-blur-md shadow-3d hover:shadow-3d-hover transition-all duration-500 text-center p-6">
            <h2 className="text-2xl font-bold text-slate-700">Roles y Permisos</h2>
            <p className="text-slate-500 mt-2">Definir roles y asignar permisos del sistema.</p>
          </Card>
        </Link>
        <Link href="/admin/permissions" className="block">
          <Card className="rounded-[2rem] bg-white/80 backdrop-blur-md shadow-3d hover:shadow-3d-hover transition-all duration-500 text-center p-6">
            <h2 className="text-2xl font-bold text-slate-700">Permisos</h2>
            <p className="text-slate-500 mt-2">CRUD de permisos a nivel granular.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
