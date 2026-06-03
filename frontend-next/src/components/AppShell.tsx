'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth, type UserRole } from '@/hooks/useAuth';
import { LayoutDashboard, Users, Wrench, LogOut, Package2, ShieldCheck } from 'lucide-react';

// ── Route permissions ─────────────────────────────────────────────────────────
// Each nav item also carries which roles can access it and the paths it "owns"
const ALL_NAV = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'ASESOR', 'MECANICO'] as UserRole[],
    owns: ['/dashboard'],
  },
  {
    name: 'Clientes y Vehículos',
    href: '/clientes',
    icon: Users,
    roles: ['ADMIN', 'ASESOR'] as UserRole[],
    owns: ['/clientes', '/vehiculos'],
  },
  {
    name: 'Taller',
    href: '/taller',
    icon: Wrench,
    roles: ['ADMIN', 'ASESOR', 'MECANICO'] as UserRole[],
    owns: ['/taller', '/ordenes', '/presupuestos'],
  },
  {
    name: 'Almacén',
    href: '/almacen',
    icon: Package2,
    roles: ['ADMIN', 'ALMACEN'] as UserRole[],
    owns: ['/almacen', '/refacciones'],
  },
  {
    name: 'Administración',
    href: '/admin',
    icon: ShieldCheck,
    roles: ['ADMIN'] as UserRole[],
    owns: ['/admin'],
  },
];

function getNavForRole(rol: UserRole) {
  return ALL_NAV.filter((item) => item.roles.includes(rol));
}

function getDefaultRoute(rol: UserRole): string {
  switch (rol) {
    case 'ALMACEN':
      return '/almacen';
    case 'MECANICO':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

function canAccessPath(pathname: string, rol: UserRole): boolean {
  for (const item of ALL_NAV) {
    const owns = item.owns.some((prefix) => pathname.startsWith(prefix));
    if (owns) return item.roles.includes(rol);
  }
  return true; // login, 404, etc.
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { logout, isAuthenticated, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, pathname, router]);

  // Redirect to allowed route if accessing a forbidden path
  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    if (pathname === '/login') return;
    if (!canAccessPath(pathname, user.rol)) {
      router.replace(getDefaultRoute(user.rol));
    }
  }, [mounted, isAuthenticated, user, pathname, router]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#040816]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-b-blue-500" />
      </div>
    );
  }

  if (pathname === '/login') return <>{children}</>;
  if (!isAuthenticated) return null;

  const navigation = user ? getNavForRole(user.rol) : [];

  const isActive = (item: (typeof ALL_NAV)[0]) =>
    item.owns.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#040816] lg:flex-row">
      {/* ── Sidebar (desktop) ── */}
      <div className="relative z-20 flex w-full flex-col border-b border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.96)_0%,rgba(10,16,32,0.96)_100%)] text-slate-300 shadow-[24px_0_80px_-30px_rgba(0,0,0,0.9)] lg:h-full lg:w-72 lg:flex-shrink-0 lg:border-b-0 lg:border-r hidden lg:flex">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.24),_transparent_70%)] pointer-events-none" />
        {/* Logo */}
        <div className="flex min-h-[5.5rem] items-center border-b border-white/10 px-4 py-4 sm:px-6 lg:h-28 lg:px-8">
          <h1 className="flex items-center gap-3 text-xl font-black tracking-tighter text-white">
            <img src="/logo.png" alt="NorthLub Logo" className="h-8 mr-2" />
            <div className="flex flex-col leading-none">
              <span className="text-2xl tracking-tight">
                North<span className="text-blue-400 font-extrabold"> Lub</span>
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                Panel Operativo
              </span>
            </div>
          </h1>
        </div>

        {/* User badge */}
        {user && (
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/8">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm flex-shrink-0">
                {user.username[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white truncate">{user.username}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">{user.rol}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-x-auto px-3 py-4 custom-scrollbar sm:px-4 lg:overflow-y-auto lg:py-6">
          <div className="mb-3 hidden px-4 lg:block">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-600">Menu Principal</p>
          </div>
          <div className="flex min-w-max gap-3 pb-1 lg:min-w-0 lg:flex-col lg:gap-2 lg:pb-0">
            {navigation.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex shrink-0 items-center gap-3 rounded-[1.25rem] px-4 py-3 transition-all duration-300 sm:px-5 sm:py-4 lg:gap-4 lg:rounded-[1.4rem] ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 text-white shadow-[0_24px_44px_-24px_rgba(37,99,235,0.95)] lg:translate-x-2'
                      : 'hover:bg-white/5 hover:text-white lg:hover:translate-x-1'
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}
                  />
                  <span className="whitespace-nowrap font-bold tracking-tight">{item.name}</span>
                  {active && (
                    <div className="absolute right-4 hidden h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_white] lg:block" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 bg-black/10 p-4 backdrop-blur-sm sm:p-5 lg:p-6">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="group flex w-full items-center justify-center gap-3 rounded-[1.25rem] px-4 py-3 font-bold text-slate-500 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 sm:justify-start sm:px-5 sm:py-4 lg:gap-4 lg:rounded-[1.4rem]"
          >
            <div className="rounded-xl p-2 transition-colors group-hover:bg-red-500/20">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="tracking-tight">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="relative flex-1 overflow-y-auto bg-[#040816] pb-24 lg:pb-0">
        <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[30%] w-[30%] rounded-full bg-cyan-400/6 blur-[110px]" />

        {/* Header mobile */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 lg:hidden bg-[#0a1020]">
          <h1 className="flex items-center gap-2 text-xl font-black text-white">
            <img src="/logo.png" alt="NorthLub" className="h-6" />
            <span>
              North<span className="text-blue-400">Lub</span>
            </span>
          </h1>
          {user && (
            <span className="text-xs font-black uppercase tracking-wider text-blue-400 mr-2">
              {user.rol}
            </span>
          )}
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto p-4 sm:p-5 lg:p-8 lg:mx-0">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-[#0a1020]/90 px-2 py-3 backdrop-blur-xl lg:hidden pb-safe">
        {navigation.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 transition-all ${
                active ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <item.icon className={`h-5 w-5 ${active ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
