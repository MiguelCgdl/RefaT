'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-300">
      <h2 className="text-6xl font-bold text-blue-500 font-mono tracking-widest mb-4">404</h2>
      <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Página no encontrada</h3>
      <p className="text-slate-400 mb-6 max-w-md">La página que estás buscando no existe o ha sido movida.</p>
      <Link href="/dashboard" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-brand">
        Volver al Dashboard
      </Link>
    </div>
  );
}
