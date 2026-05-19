'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAuthenticated, pathname, router]);

  if (pathname === '/login') return <>{children}</>;
  if (!isAuthenticated) return null;

  return (
    <div className="layout">
      <header className="header">
        <h1>Refa</h1>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/clientes">Clientes</Link>
          <Link href="/vehiculos">Vehículos</Link>
          <Link href="/ordenes">Órdenes</Link>
          <Link href="/refacciones">Refacciones</Link>
        </nav>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push('/login');
          }}
        >
          Salir
        </button>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
