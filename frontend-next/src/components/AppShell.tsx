'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Users, Wrench, LogOut, Package2 } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, pathname, router]);

  // Prevent hydration mismatch: don't render auth-dependent UI until client is ready
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#040816]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-b-blue-500" />
      </div>
    );
  }

  if (pathname === '/login') return <>{children}</>;
  if (!isAuthenticated) return null;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes y Vehículos', href: '/clientes', icon: Users },
    { name: 'Taller', href: '/taller', icon: Wrench },
    { name: 'Almacén', href: '/almacen', icon: Package2 },
  ];

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#040816]">
      <div className="relative z-20 flex w-80 flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.96)_0%,rgba(10,16,32,0.96)_100%)] text-slate-300 shadow-[24px_0_80px_-30px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.24),_transparent_70%)] pointer-events-none" />
        <div className="flex h-28 items-center border-b border-white/10 px-8">
          <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
            <div className="rounded-[1.4rem] bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-3 shadow-[0_20px_45px_-18px_rgba(37,99,235,0.85)] ring-1 ring-white/10">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl tracking-tight">REFA<span className="text-blue-400 font-extrabold"> PRO</span></span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Panel Operativo</span>
            </div>
          </h1>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto px-4 py-8 custom-scrollbar">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-600">Menu Principal</p>
          </div>
          {navigation.map((item) => {
            const isActive =
              item.href === '/taller'
                ? pathname.startsWith('/taller') || pathname.startsWith('/ordenes') || pathname.startsWith('/presupuestos')
                : item.href === '/almacen'
                  ? pathname.startsWith('/almacen') || pathname.startsWith('/refacciones')
                  : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-4 rounded-[1.4rem] px-5 py-4 transition-all duration-300 ${
                  isActive
                    ? 'translate-x-2 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white shadow-[0_24px_44px_-24px_rgba(37,99,235,0.95)]'
                    : 'hover:translate-x-1 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                <span className="font-bold tracking-tight">{item.name}</span>
                {isActive && (
                  <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 bg-black/10 p-6 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="group flex w-full items-center gap-4 rounded-[1.4rem] px-5 py-4 font-bold text-slate-500 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
          >
            <div className="rounded-xl p-2 transition-colors group-hover:bg-red-500/20">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="tracking-tight">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <main className="relative flex-1 overflow-auto bg-[#040816]">
        <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[30%] w-[30%] rounded-full bg-cyan-400/6 blur-[110px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
