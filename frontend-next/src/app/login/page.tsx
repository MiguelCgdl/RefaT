'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Lock, ShieldCheck, User, Wrench } from 'lucide-react';

export default function LoginPage() {
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.22)_0%,_rgba(2,6,23,1)_28%,_rgba(2,6,23,1)_100%)] px-6 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_35%,rgba(59,130,246,0.06)_100%)]" />
        <div className="absolute left-1/2 top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[-4rem] h-56 w-56 rounded-full bg-indigo-500/12 blur-3xl" />
        <div className="absolute right-[-4rem] top-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[31rem] animate-in space-y-7 fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-300 shadow-lg shadow-black/20 backdrop-blur-xl">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            Acceso Seguro
          </div>
          <div className="inline-flex rounded-[2rem] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-4 shadow-[0_20px_60px_-20px_rgba(37,99,235,0.7)] ring-1 ring-white/20">
            <Wrench className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Refa Taller</h1>
            <p className="mx-auto max-w-md text-sm font-medium leading-6 text-slate-400 sm:text-base">
              Sistema de gestion con una interfaz sobria, moderna y enfocada en operacion.
            </p>
          </div>
        </div>

        <div className="relative rounded-[3rem] border border-white/10 bg-white/[0.04] px-8 py-9 shadow-[0_35px_100px_-35px_rgba(0,0,0,0.85)] ring-1 ring-white/5 backdrop-blur-2xl sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute inset-x-8 bottom-[-1.4rem] h-10 rounded-full bg-white/55 blur-2xl opacity-90" />
          <div className="mb-9 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Bienvenido</p>
              <h2 className="mt-2 text-[1.75rem] font-black tracking-tight text-white">Inicia sesion</h2>
            </div>
            <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300 shadow-inner shadow-blue-950/30">
              Premium
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
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
                className="w-full [&_.p-icon-field]:w-full [&_.p-input-icon]:right-4 [&_.p-input-icon]:text-slate-400 [&_.p-input-icon]:transition-colors [&_.p-inputtext]:w-full [&_.p-inputtext]:rounded-[1.9rem] [&_.p-inputtext]:border [&_.p-inputtext]:border-white/10 [&_.p-inputtext]:bg-black/20 [&_.p-inputtext]:px-5 [&_.p-inputtext]:py-[0.9rem] [&_.p-inputtext]:text-base [&_.p-inputtext]:font-medium [&_.p-inputtext]:text-white [&_.p-inputtext]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_30px_-18px_rgba(0,0,0,0.8)] [&_.p-inputtext]:outline-none [&_.p-inputtext]:transition-all [&_.p-inputtext]:placeholder:text-slate-500 [&_.p-inputtext:hover]:border-white/15 [&_.p-inputtext:enabled:focus]:border-blue-500 [&_.p-inputtext:enabled:focus]:bg-slate-950/70 [&_.p-inputtext:enabled:focus]:ring-4 [&_.p-inputtext:enabled:focus]:ring-blue-500/10 [&_.p-password-input]:pr-12"
                inputClassName="w-full"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <Message 
                severity="error" 
                text={error} 
                className="w-full justify-start rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-bold text-red-300" 
              />
            )}

            <Button 
              type="submit" 
              label={loading ? 'Autenticando...' : 'Iniciar Sesión'} 
              loading={loading}
              className="mt-3 w-full rounded-full border-none bg-blue-600 py-4 text-lg font-bold text-white shadow-[0_20px_45px_-18px_rgba(37,99,235,0.9)] transition-all hover:scale-[1.01] hover:bg-blue-500 hover:shadow-[0_28px_56px_-18px_rgba(37,99,235,0.95)] active:scale-[0.99]"
            />

            <p className="text-center text-xs font-medium leading-5 text-slate-500">
              Acceso restringido a personal autorizado del taller.
            </p>
          </form>
        </div>

        <p className="text-center text-xs font-medium text-slate-600">
          &copy; {new Date().getFullYear()} Refa Taller. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
