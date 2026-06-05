'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUser, deleteUser } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import Link from 'next/link';
import { ArrowLeft, Edit2, Trash2, UserPlus, AlertCircle } from 'lucide-react';

const ROLES = [
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Mecánico', value: 'MECANICO' },
  { label: 'Asesor', value: 'ASESOR' },
  { label: 'Almacén', value: 'ALMACEN' },
  { label: 'Cliente', value: 'CLIENTE' },
];

export default function AdminUsersPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for edit
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    rol: '',
    activo: true,
    password: '',
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(token!),
    enabled: !!token,
  });

  const updateMut = useMutation({
    mutationFn: (data: any) => updateUser(token!, selectedUser.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowEditDialog(false);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Error al actualizar usuario');
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteUser(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      rol: user.rol,
      activo: user.activo,
      password: '', // Blank unless they want to change it
    });
    setErrorMsg('');
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    const payload: any = {
      username: editForm.username,
      rol: editForm.rol,
      activo: editForm.activo,
    };
    if (editForm.email) {
      payload.email = editForm.email;
    } else {
      payload.email = null;
    }
    if (editForm.password) {
      payload.password = editForm.password;
    }
    updateMut.mutate(payload);
  };

  const confirmDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      deleteMut.mutate(id);
    }
  };

  const actionTemplate = (rowData: any) => {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openEdit(rowData)}
          className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => confirmDelete(rowData.id)}
          className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const statusTemplate = (rowData: any) => {
    return rowData.activo ? (
      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">Activo</span>
    ) : (
      <span className="px-2 py-1 bg-slate-100 text-slate-500 font-bold text-xs rounded-full">Inactivo</span>
    );
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a Administración
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Gestión de Usuarios
          </h1>
        </div>
        <Link href="/admin/users/create" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-600/30 active:scale-95">
          <UserPlus className="w-5 h-5" />
          Nuevo Usuario
        </Link>
      </div>

      <Card className="rounded-[2.5rem] bg-white/80 backdrop-blur-xl border-none shadow-3d overflow-hidden">
        <DataTable
          value={users}
          loading={isLoading}
          paginator
          rows={10}
          emptyMessage="No se encontraron usuarios."
          className="p-datatable-custom"
        >
          <Column field="id" header="ID" sortable className="font-bold text-slate-500" />
          <Column field="username" header="Usuario" sortable className="font-medium text-slate-900" />
          <Column field="email" header="Email" sortable className="text-slate-600" />
          <Column field="rol" header="Rol" sortable className="font-bold text-slate-700" />
          <Column field="activo" header="Estado" body={statusTemplate} sortable />
          <Column body={actionTemplate} header="Acciones" style={{ width: '10%' }} />
        </DataTable>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        header="Editar Usuario"
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        className="w-[90vw] sm:w-[500px]"
        pt={{
          root: { className: 'rounded-[2rem] overflow-hidden border-none shadow-2xl' },
          header: { className: 'bg-slate-50 px-6 py-4 border-b border-slate-100' },
          content: { className: 'p-6 bg-white' },
        }}
      >
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            {errorMsg}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Nombre de Usuario</label>
            <InputText
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              className="w-full rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Email (Opcional)</label>
            <InputText
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Nueva Contraseña (Opcional)</label>
            <InputText
              type="password"
              placeholder="Dejar en blanco para no cambiar"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              className="w-full rounded-xl bg-slate-50 border-slate-200 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-700">Rol</label>
            <Dropdown
              value={editForm.rol}
              options={ROLES}
              onChange={(e) => setEditForm({ ...editForm, rol: e.value })}
              className="w-full rounded-xl bg-slate-50 border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              inputId="activo"
              checked={editForm.activo}
              onChange={(e) => setEditForm({ ...editForm, activo: e.checked ?? false })}
            />
            <label htmlFor="activo" className="font-bold text-sm text-slate-700 cursor-pointer">
              Usuario Activo
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button label="Cancelar" onClick={() => setShowEditDialog(false)} text className="text-slate-500 font-bold" />
          <Button
            label={updateMut.isPending ? 'Guardando...' : 'Guardar Cambios'}
            onClick={handleUpdate}
            disabled={updateMut.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-2 transition-colors border-none"
          />
        </div>
      </Dialog>
    </div>
  );
}
