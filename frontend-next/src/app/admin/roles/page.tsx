'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Users, Edit2, Trash2, UserPlus, AlertCircle, PlusCircle, Settings, LayoutDashboard, Wrench, Package2, ShieldCheck, Car } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getPermisos, createPermiso, updatePermiso, deletePermiso, assignUserToPermiso, removeUserFromPermiso } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

/* ── Static roles info ───────────────────────────────────────────────── */
const ROLES = [
  { name: 'ADMIN', description: 'Acceso total al sistema, configuración y usuarios.', color: 'bg-indigo-400' },
  { name: 'MECANICO', description: 'Acceso a tableros, órdenes de trabajo asignadas.', color: 'bg-orange-400' },
  { name: 'ASESOR', description: 'Atención a clientes, generación de presupuestos y gestión de taller.', color: 'bg-blue-400' },
  { name: 'ALMACEN', description: 'Gestión de inventario y refacciones.', color: 'bg-emerald-400' },
  { name: 'CLIENTE', description: 'Acceso a historial de vehículos y estado de sus órdenes.', color: 'bg-slate-400' },
];

/* ── Module/panel metadata for the icons and colours ─────────────────── */
const MODULE_META: Record<string, { icon: any; color: string; gradient: string }> = {
  'dashboard':  { icon: LayoutDashboard, color: 'text-blue-500',    gradient: 'from-blue-500/20 to-blue-600/5' },
  'clientes':   { icon: Users,           color: 'text-violet-500',  gradient: 'from-violet-500/20 to-violet-600/5' },
  'taller':     { icon: Wrench,          color: 'text-amber-500',   gradient: 'from-amber-500/20 to-amber-600/5' },
  'almacen':    { icon: Package2,        color: 'text-emerald-500', gradient: 'from-emerald-500/20 to-emerald-600/5' },
  'admin':      { icon: ShieldCheck,     color: 'text-red-500',     gradient: 'from-red-500/20 to-red-600/5' },
};

function getModuleMeta(nombre: string) {
  const key = nombre.toLowerCase().replace(/\s/g, '');
  return MODULE_META[key] || { icon: Lock, color: 'text-slate-500', gradient: 'from-slate-500/20 to-slate-600/5' };
}

export default function AdminRolesPermissionsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPermiso, setSelectedPermiso] = useState<any>(null);

  // Dialog states
  const [showPermisoDialog, setShowPermisoDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [permisoForm, setPermisoForm] = useState({ id: 0, nombre: '', descripcion: '' });
  const [assignForm, setAssignForm] = useState({ usuarioId: 0 });

  /* ── Queries ────────────────────────────────────────────────────────── */
  const { data: permisos, isLoading: isLoadingPermisos } = useQuery({
    queryKey: ['permisos'],
    queryFn: () => getPermisos(token!),
    enabled: !!token,
  });

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(token!),
    enabled: !!token,
  });

  // Auto-select first on load
  useEffect(() => {
    if (permisos?.length > 0 && !selectedPermiso) {
      setSelectedPermiso(permisos[0]);
    }
  }, [permisos]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Mutations ──────────────────────────────────────────────────────── */
  const savePermisoMut = useMutation({
    mutationFn: (data: any) => data.id ? updatePermiso(token!, data.id, data) : createPermiso(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
      setShowPermisoDialog(false);
      setErrorMsg('');
    },
    onError: (err: any) => setErrorMsg(err.message || 'Error al guardar permiso')
  });

  const deletePermisoMut = useMutation({
    mutationFn: (id: number) => deletePermiso(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
      if (selectedPermiso?.id === deletePermisoMut.variables) setSelectedPermiso(null);
    },
  });

  const assignUserMut = useMutation({
    mutationFn: (data: { usuarioId: number }) => assignUserToPermiso(token!, selectedPermiso.id, data.usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permisos'] });
      setShowAssignDialog(false);
      setErrorMsg('');
    },
    onError: (err: any) => setErrorMsg(err.message || 'Error al asignar usuario')
  });

  const removeUserMut = useMutation({
    mutationFn: (usuarioId: number) => removeUserFromPermiso(token!, selectedPermiso.id, usuarioId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permisos'] }),
  });

  /* ── Handlers ───────────────────────────────────────────────────────── */
  const openCreatePermiso = () => {
    setPermisoForm({ id: 0, nombre: '', descripcion: '' });
    setErrorMsg('');
    setShowPermisoDialog(true);
  };

  const openEditPermiso = (p: any, e: any) => {
    e.stopPropagation();
    setPermisoForm({ id: p.id, nombre: p.nombre, descripcion: p.descripcion || '' });
    setErrorMsg('');
    setShowPermisoDialog(true);
  };

  const handleDeletePermiso = (id: number, e: any) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro de eliminar este permiso? Los usuarios vinculados perderán el acceso a este módulo.')) {
      deletePermisoMut.mutate(id);
    }
  };

  const handleSavePermiso = () => {
    if (!permisoForm.nombre) return setErrorMsg('El nombre del módulo es requerido');
    savePermisoMut.mutate(permisoForm);
  };

  const openAssignUser = () => {
    setAssignForm({ usuarioId: 0 });
    setErrorMsg('');
    setShowAssignDialog(true);
  };

  const handleAssignUser = () => {
    if (!assignForm.usuarioId) return setErrorMsg('Seleccione un usuario');
    assignUserMut.mutate({ usuarioId: assignForm.usuarioId });
  };

  const handleRemoveUser = (usuarioId: number) => {
    if (window.confirm('¿Seguro de quitar el acceso de este usuario a este módulo?')) {
      removeUserMut.mutate(usuarioId);
    }
  };

  /* ── Derived data ───────────────────────────────────────────────────── */
  const activePermisoFull = permisos?.find((p: any) => p.id === selectedPermiso?.id);
  const permisoUsers = activePermisoFull?.usuarios?.map((u: any) => u.usuario) || [];
  const unassignedUsers = allUsers?.filter((u: any) => !permisoUsers.some((pu: any) => pu.id === u.id)) || [];
  const userOptions = unassignedUsers.map((u: any) => ({ label: `${u.username} — ${u.email} (${u.rol})`, value: u.id }));

  /* ── Templates ──────────────────────────────────────────────────────── */
  const actionTemplate = (rowData: any) => (
    <button onClick={() => handleRemoveUser(rowData.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="Quitar acceso a este módulo">
      <Trash2 className="w-4 h-4" />
    </button>
  );

  const statusTemplate = (rowData: any) => rowData.activo ? (
    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">Activo</span>
  ) : (
    <span className="px-2 py-1 bg-slate-100 text-slate-500 font-bold text-xs rounded-full">Inactivo</span>
  );

  const roleTemplate = (rowData: any) => {
    const role = ROLES.find(r => r.name === rowData.rol);
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${role?.color || 'bg-slate-300'}`} />
        <span className="font-bold text-slate-700 text-sm">{rowData.rol}</span>
      </span>
    );
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
          {/* ── Tab 1: Roles del Sistema ─────────────────────────────── */}
          <TabPanel header="Roles del Sistema" leftIcon={<Shield className="w-4 h-4 mr-2" />}>
            <div className="pt-4">
              <p className="text-slate-500 mb-6 font-medium">
                Roles base predefinidos. Cada usuario tiene un rol que determina la navegación inicial del sistema.
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

          {/* ── Tab 2: Permisos por Módulo ───────────────────────────── */}
          <TabPanel header="Permisos por Módulo" leftIcon={<Settings className="w-4 h-4 mr-2" />}>
            <div className="pt-4">
              <p className="text-slate-500 mb-5 font-medium">
                Asigna acceso a los módulos del sistema para cada usuario de manera individual. Puedes crear módulos personalizados o usar los del sistema.
              </p>

              <div className="flex flex-col lg:flex-row gap-6">
                {/* ── Left: Module List ──────────────────────────────── */}
                <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-indigo-500" />
                      Módulos / Paneles
                    </h3>
                    <button onClick={openCreatePermiso} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors" title="Crear nuevo módulo">
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {isLoadingPermisos && (
                    <div className="py-8 text-center text-sm text-slate-400 animate-pulse">Cargando módulos…</div>
                  )}

                  {!permisos?.length && !isLoadingPermisos && (
                    <div className="py-8 text-center">
                      <Lock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 font-medium">No hay módulos creados aún.</p>
                      <p className="text-xs text-slate-400 mt-1">Presiona el botón + para crear los módulos del sistema.</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                    {permisos?.map((perm: any) => {
                      const meta = getModuleMeta(perm.nombre);
                      const ModIcon = meta.icon;
                      const isSelected = selectedPermiso?.id === perm.id;
                      return (
                        <div
                          key={perm.id}
                          onClick={() => setSelectedPermiso(perm)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                            isSelected
                              ? `bg-gradient-to-r ${meta.gradient} border-transparent shadow-md ring-2 ring-blue-500/20`
                              : 'bg-white border-slate-100 hover:bg-slate-50 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/80 shadow-sm' : 'bg-slate-50'}`}>
                              <ModIcon className={`w-5 h-5 ${meta.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {perm.nombre}
                                </h4>
                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                                  <button onClick={(e) => openEditPermiso(perm, e)} className="p-1 text-slate-400 hover:text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                                  <button onClick={(e) => handleDeletePermiso(perm.id, e)} className="p-1 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                              {perm.descripcion && (
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{perm.descripcion}</p>
                              )}
                              <div className="mt-1.5 flex items-center gap-1.5">
                                <Users className="w-3 h-3 text-slate-400" />
                                <span className="text-[11px] font-semibold text-slate-400">
                                  {perm.usuarios?.length || 0} usuario{(perm.usuarios?.length || 0) !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Right: Users assigned to selected module ──────── */}
                <div className="w-full flex-1">
                  <Card className="h-full rounded-2xl border border-slate-100 shadow-none bg-slate-50/50 p-4">
                    {selectedPermiso && activePermisoFull ? (() => {
                      const meta = getModuleMeta(activePermisoFull.nombre);
                      const ModIcon = meta.icon;
                      return (
                        <>
                          <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${meta.gradient}`}>
                                <ModIcon className={`w-6 h-6 ${meta.color}`} />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-slate-800">{activePermisoFull.nombre}</h3>
                                {activePermisoFull.descripcion && (
                                  <p className="text-xs text-slate-500">{activePermisoFull.descripcion}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={openAssignUser}
                              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm active:scale-95 whitespace-nowrap"
                            >
                              <UserPlus className="w-4 h-4" />
                              Asignar Usuario
                            </button>
                          </div>

                          <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                            <DataTable
                              value={permisoUsers}
                              emptyMessage="No hay usuarios asignados a este módulo."
                              className="p-datatable-sm"
                              paginator
                              rows={6}
                              paginatorClassName="border-t border-slate-100"
                            >
                              <Column field="username" header="Usuario" className="font-medium text-slate-900" sortable />
                              <Column field="email" header="Email" className="text-slate-500 text-sm" sortable />
                              <Column field="rol" header="Rol Base" body={roleTemplate} sortable />
                              <Column field="activo" header="Estado" body={statusTemplate} style={{ width: '100px' }} />
                              <Column body={actionTemplate} header="Quitar" style={{ width: '80px', textAlign: 'center' }} />
                            </DataTable>
                          </div>
                        </>
                      );
                    })() : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                        <div className="p-4 bg-slate-100 rounded-2xl mb-4">
                          <Lock className="w-10 h-10 opacity-30" />
                        </div>
                        <p className="font-medium">Selecciona un módulo para ver y gestionar sus usuarios.</p>
                        <p className="text-sm text-slate-300 mt-1">Los usuarios asignados tendrán acceso a ese panel.</p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </Card>

      {/* ── Dialog: Create/Edit Módulo ────────────────────────────────── */}
      <Dialog
        header={permisoForm.id ? 'Editar Módulo' : 'Nuevo Módulo'}
        visible={showPermisoDialog}
        onHide={() => { setShowPermisoDialog(false); setErrorMsg(''); }}
        className="w-[90vw] sm:w-[420px]"
        pt={{
          root: { className: 'rounded-[2rem] overflow-hidden border-none shadow-2xl' },
          header: { className: 'bg-slate-50 px-6 py-4 border-b border-slate-100' },
          content: { className: 'p-6 bg-white' },
        }}
      >
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Nombre del Módulo *</label>
            <InputText
              value={permisoForm.nombre}
              onChange={(e) => setPermisoForm({ ...permisoForm, nombre: e.target.value })}
              className="w-full rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
              placeholder="Ej. Dashboard, Taller, Almacen..."
            />
            <p className="text-xs text-slate-400 mt-0.5">Usa el nombre del panel al que se dará acceso.</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Descripción</label>
            <InputText
              value={permisoForm.descripcion}
              onChange={(e) => setPermisoForm({ ...permisoForm, descripcion: e.target.value })}
              className="w-full rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
              placeholder="Ej. Acceso al panel principal del sistema"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button label="Cancelar" onClick={() => { setShowPermisoDialog(false); setErrorMsg(''); }} text className="text-slate-500 font-bold" />
          <Button
            label={savePermisoMut.isPending ? 'Guardando…' : 'Guardar'}
            onClick={handleSavePermiso}
            disabled={savePermisoMut.isPending || !permisoForm.nombre}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-4 py-2 transition-colors border-none"
          />
        </div>
      </Dialog>

      {/* ── Dialog: Assign User ──────────────────────────────────────── */}
      <Dialog
        header={`Asignar Usuario → ${activePermisoFull?.nombre || ''}`}
        visible={showAssignDialog}
        onHide={() => { setShowAssignDialog(false); setErrorMsg(''); }}
        className="w-[90vw] sm:w-[440px]"
        pt={{
          root: { className: 'rounded-[2rem] overflow-hidden border-none shadow-2xl' },
          header: { className: 'bg-slate-50 px-6 py-4 border-b border-slate-100' },
          content: { className: 'p-6 bg-white' },
        }}
      >
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Seleccionar Usuario</label>
            <Dropdown
              value={assignForm.usuarioId}
              options={userOptions}
              onChange={(e) => setAssignForm({ usuarioId: e.value })}
              className="w-full rounded-xl bg-slate-50 border-slate-200"
              placeholder="Buscar usuario…"
              filter
              filterPlaceholder="Filtrar por nombre o email"
              emptyMessage="Todos los usuarios ya están asignados."
              pt={{ list: { className: 'bg-white shadow-lg rounded-xl border border-slate-100' } }}
            />
            <p className="text-xs text-slate-400 mt-0.5">Solo se muestran usuarios que aún no tienen acceso a este módulo.</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button label="Cancelar" onClick={() => { setShowAssignDialog(false); setErrorMsg(''); }} text className="text-slate-500 font-bold" />
          <Button
            label={assignUserMut.isPending ? 'Asignando…' : 'Asignar'}
            onClick={handleAssignUser}
            disabled={assignUserMut.isPending || !assignForm.usuarioId}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-2 transition-colors border-none"
          />
        </div>
      </Dialog>
    </div>
  );
}
