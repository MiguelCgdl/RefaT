'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardResumen } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { token } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardResumen(token!),
    enabled: Boolean(token),
  });

  if (isLoading) return <p>Cargando resumen…</p>;
  if (error) return <p className="error">No se pudo cargar el dashboard.</p>;

  return (
    <section>
      <h2>Dashboard</h2>
      <div className="cards">
        <article className="card">
          <h3>Órdenes activas</h3>
          <p className="metric">{data?.ordenes_activas ?? 0}</p>
        </article>
        <article className="card">
          <h3>Refacciones bajo stock</h3>
          <p className="metric">{data?.refacciones_bajo_stock ?? 0}</p>
        </article>
      </div>
      <h3>Órdenes por estado</h3>
      <ul>
        {data?.ordenes_por_estado.map((item) => (
          <li key={item.estado}>
            {item.estado}: <strong>{item.total}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
