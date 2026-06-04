'use client';

import { useState } from 'react';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const ROLES = [
  { name: 'ADMIN', description: 'Acceso total al sistema, configuración y usuarios.', color: 'bg-indigo-400' },
  { name: 'MECANICO', description: 'Acceso a tableros, órdenes de trabajo asignadas.', color: 'bg-orange-400' },
  { name: 'ASESOR', description: 'Atención a clientes, generación de presupuestos y gestión de taller.', color: 'bg-blue-400' },
  { name: 'ALMACEN', description: 'Gestión de inventario y refacciones.', color: 'bg-emerald-400' },
  { name: 'CLIENTE', description: 'Acceso a historial de vehículos y estado de sus órdenes.', color: 'bg-slate-400' },
];

const LOGICAL_PERMISSIONS = [
  { id: 'manage_users', name: 'Gestión de Usuarios', description: 'Crear, editar y eliminar usuarios del sistema.', roles: ['ADMIN'] },
  { id: 'manage_inventory', name: 'Gestión de Inventario', description: 'Crear y editar refacciones, realizar ajustes de stock.', roles: ['ADMIN', 'ALMACEN'] },
  { id: 'manage_work_orders', name: 'Gestión de Órdenes', description: 'Crear, editar y asignar órdenes de trabajo.', roles: ['ADMIN', 'ASESOR'] },
  { id: 'manage_budgets', name: 'Gestión de Presupuestos', description: 'Generar presupuestos y agregar líneas de servicio/refacción.', roles: ['ADMIN', 'ASESOR'] },
  { id: 'execute_work_orders', name: 'Ejecución de Órdenes', description: 'Cambiar el estado de órdenes a En Proceso o Listo.', roles: ['MECANICO'] },
  { id: 'view_history', name: 'Visualización de Historial', description: 'Ver historial de vehículos y estado de órdenes.', roles: ['CLIENTE', 'ADMIN', 'ASESOR', 'MECANICO'] },
];

export default function AdminRolesPermissionsPage() {
  const { token } = useAuth();
  const [selectedPermission, setSelectedPermission] = useState(LOGICAL_PERMISSIONS[0]);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(token!),
    enabled: !!token,
  });

  // Filter users based on selected permission's roles
  const filteredUsers = users?.filter((user: any) => 
    selectedPermission.roles.includes(user.rol)
  ) || [];

  const statusTemplate = (rowData: any) => {
    return rowData.activo ? (
      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">Activo</span>
    ) : (
      <span className="px-2 py-1 bg-slate-100 text-slate-500 font-bold text-xs rounded-full">Inactivo</span>
    );
  };

  const roleTemplate = (rowData: any) => {
    return <span className="font-bold text-slate-700">{rowData.rol}</span>;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
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
            Roles y Permisos
          </h1>
        </div>
      </div>

      <Card className="rounded-[2.5rem] bg-white/80 backdrop-blur-xl border-none shadow-3d overflow-hidden p-2 sm:p-6">
        <TabView className="p-tabview-custom">
          <TabPanel header="Roles del Sistema" leftIcon={<Shield className="w-4 h-4 mr-2" />}>
            <div className="pt-4">
              <p className="text-slate-500 mb-6 font-medium">
                Estos son los roles predefinidos en el sistema. La seguridad y acceso general están vinculados a estos roles.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROLES.map(role => (
                  <div key={role.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className={`mt-1 w-3 h-3 rounded-full ${role.color} shrink-0`} />
                    <div>
                      <h3 className="font-black text-slate-800 tracking-wider text-sm">{role.name}</h3>
                      <p className="text-slate-500 text-sm mt-1">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>
          
          <TabPanel header="Permisos y Usuarios" leftIcon={<Lock className="w-4 h-4 mr-2" />}>
            <div className="pt-4 flex flex-col lg:flex-row gap-6">
              {/* Left Column: Permissions List */}
              <div className="w-full lg:w-1/3 flex flex-col gap-3">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-500" />
                  Permisos Lógicos
                </h3>
                {LOGICAL_PERMISSIONS.map(perm => (
                  <button
                    key={perm.id}
                    onClick={() => setSelectedPermission(perm)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      selectedPermission.id === perm.id 
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-2 ring-indigo-500/20' 
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <h4 className={`font-bold ${selectedPermission.id === perm.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {perm.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{perm.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {perm.roles.map(r => (
                        <span key={r} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full text-slate-600 border border-slate-200">
                          {r}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Column: Users List */}
              <div className="w-full lg:w-2/3">
                <Card className="h-full rounded-2xl border border-slate-100 shadow-none bg-slate-50/50">
                  <div className="mb-4">
                    <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Usuarios con permiso: <span className="text-indigo-600">{selectedPermission.name}</span>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Estos usuarios tienen acceso porque poseen alguno de los roles vinculados a este permiso.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                    <DataTable 
                      value={filteredUsers} 
                      loading={isLoading}
                      emptyMessage="No hay usuarios con este permiso."
                      className="p-datatable-sm"
                      paginator
                      rows={5}
                    >
                      <Column field="username" header="Usuario" className="font-medium text-slate-900" />
                      <Column field="email" header="Email" className="text-slate-500 text-sm" />
                      <Column field="rol" header="Rol" body={roleTemplate} />
                      <Column field="activo" header="Estado" body={statusTemplate} />
                    </DataTable>
                  </div>
                </Card>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
}
