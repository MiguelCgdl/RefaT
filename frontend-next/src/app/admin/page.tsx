/* src/app/admin/page.tsx */
'use client';
import Link from 'next/link';
import { Card } from 'primereact/card';
import { ArrowLeft, Users, Shield } from 'lucide-react';

export default function AdminHome() {
  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Regresar al Dashboard
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Panel de Administración
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gestiona los usuarios, roles y permisos del sistema.
          </p>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/users" className="block h-full">
          <Card className="h-full rounded-[2rem] bg-white/80 backdrop-blur-md border-none shadow-3d hover:shadow-3d-hover transition-all duration-500 text-center p-6 flex flex-col items-center justify-center cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Gestión de Usuarios</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">Crear, editar y eliminar usuarios del sistema.</p>
          </Card>
        </Link>

        <Link href="/admin/roles" className="block h-full">
          <Card className="h-full rounded-[2rem] bg-white/80 backdrop-blur-md border-none shadow-3d hover:shadow-3d-hover transition-all duration-500 text-center p-6 flex flex-col items-center justify-center cursor-pointer group">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-800">Roles y Permisos</h2>
            <p className="text-slate-500 mt-2 text-sm font-medium">Visualizar roles, permisos y usuarios asociados.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
