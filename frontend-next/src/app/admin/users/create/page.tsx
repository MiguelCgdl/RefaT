'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { useMutation } from '@tanstack/react-query';
import { createUser } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Save, UserPlus, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const userSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico no válido').or(z.literal('')).optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rol: z.enum(['ADMIN', 'MECANICO', 'ASESOR', 'ALMACEN', 'CLIENTE']),
  activo: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

const roles = [
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Mecánico', value: 'MECANICO' },
  { label: 'Asesor', value: 'ASESOR' },
  { label: 'Almacén', value: 'ALMACEN' },
  { label: 'Cliente', value: 'CLIENTE' },
];

export default function CreateUserPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      rol: 'MECANICO',
      activo: true,
    },
  });

  const rolValue = watch('rol');
  const activoValue = watch('activo');

  const mutation = useMutation({
    mutationFn: (data: UserFormData) => createUser(token!, data),
    onSuccess: () => {
      router.push('/admin/users');
    },
    onError: (error: any) => {
      setErrorMsg(error.message || 'Error al crear el usuario');
    },
  });

  const onSubmit = (data: UserFormData) => {
    setErrorMsg('');
    const payload = { ...data };
    if (!payload.email) {
      delete payload.email;
    }
    mutation.mutate(payload);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a Usuarios
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-gradient-3d rounded-2xl shadow-3d shadow-blue-600/30">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Crear Usuario
          </h1>
        </div>
      </div>

      <Card className="rounded-[2.5rem] bg-white/80 backdrop-blur-xl border-none shadow-3d overflow-hidden">
        {errorMsg && (
          <div className="mx-6 mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium text-sm">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nombre de Usuario *</label>
              <input
                type="text"
                {...register('username')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="Ej. juanperez"
              />
              {errors.username && <p className="text-xs text-red-500 font-bold">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Correo Electrónico (Opcional)</label>
              <input
                type="email"
                {...register('email')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="Ej. juan@taller.com"
              />
              {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Contraseña *</label>
              <input
                type="password"
                {...register('password')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && <p className="text-xs text-red-500 font-bold">{errors.password.message}</p>}
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Rol del Usuario *</label>
              <Dropdown
                value={rolValue}
                options={roles}
                onChange={(e) => setValue('rol', e.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl shadow-none"
                pt={{
                  root: { className: 'rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/50 hover:border-blue-500 transition-all' },
                  input: { className: 'px-4 py-3 text-sm font-medium text-slate-900' },
                }}
              />
              {errors.rol && <p className="text-xs text-red-500 font-bold">{errors.rol.message}</p>}
            </div>

            {/* Activo */}
            <div className="space-y-2 md:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="activo"
                checked={activoValue}
                onChange={(e) => setValue('activo', e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <label htmlFor="activo" className="text-sm font-bold text-slate-700 cursor-pointer">
                Usuario Activo
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="px-6 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Guardando...' : 'Guardar Usuario'}
              <Save className="w-4 h-4" />
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
