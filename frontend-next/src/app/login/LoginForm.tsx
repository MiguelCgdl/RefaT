// This component runs on the client
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Lock, User } from 'lucide-react';

export default function LoginForm() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    router.replace('/dashboard');
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      await login(String(fd.get('username')), String(fd.get('password')));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form onSubmit={onSubmit} className="space-y-5 w-full max-w-md p-6 bg-gray-800/50 rounded-xl backdrop-blur-lg shadow-lg">
        <div className="space-y-2.5">
          <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-300">
            <User className="h-4 w-4 text-slate-400" />
            Usuario
          </label>
          <InputText
            name="username"
            required
            autoComplete="username"
            defaultValue="admin"
            className="w-full rounded-[1.9rem] border border-white/10 bg-black/20 px-5 py-[0.9rem] text-base font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-18px_rgba(0,0,0,0.8)] outline-none transition-all placeholder:text-slate-500 hover:border-white/15 focus:border-blue-500 focus:bg-slate-950/70 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Tu usuario"
          />
        </div>
        <div className="space-y-2.5">
          <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-300">
            <Lock className="h-4 w-4 text-slate-400" />
            Contraseña
          </label>
          <Password
            name="password"
            required
            autoComplete="current-password"
            toggleMask
            feedback={false}
            className="w-full [&& .p-icon-field]:w-full [&& .p-input-icon]:right-4 [&& .p-input-icon]:text-slate-400 [&& .p-input-icon]:transition-colors [&& .p-inputtext]:w-full [&& .p-inputtext]:rounded-[1.9rem] [&& .p-inputtext]:border [&& .p-inputtext]:border-white/10 [&& .p-inputtext]:bg-black/20 [&& .p-inputtext]:px-5 [&& .p-inputtext]:py-[0.9rem] [&& .p-inputtext]:text-base [&& .p-inputtext]:font-medium [&& .p-inputtext]:text-white [&& .p-inputtext]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-18px_rgba(0,0,0,0.8)] [&& .p-inputtext]:outline-none [&& .p-inputtext]:transition-all [&& .p-inputtext]:placeholder:text-slate-500 [&& .p-inputtext:hover]:border-white/15 [&& .p-inputtext:enabled:focus]:border-blue-500 [&& .p-inputtext:enabled:focus]:bg-slate-950/70 [&& .p-inputtext:enabled:focus]:ring-4 [&& .p-inputtext:enabled:focus]:ring-blue-500/10 [&& .p-password-input]:pr-12"
            inputClassName="w-full"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <Message severity="error" text={error} className="w-full justify-start rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-300" />
        )}
        <Button
          type="submit"
          label={loading ? 'Autenticando...' : 'Iniciar Sesión'}
          loading={loading}
          className="mt-3 w-full rounded-full border-none bg-blue-600 py-4 text-lg font-bold text-white shadow-[0_20px_45px_-18px_rgba(37,99,235,0.9)] transition-all hover:scale-[1.01] hover:bg-blue-500 hover:shadow-[0_28px_56px_-18px_rgba(37,99,235,0.95)] active:scale-[0.99]"
        />
      </form>
    </div>
  );
}
