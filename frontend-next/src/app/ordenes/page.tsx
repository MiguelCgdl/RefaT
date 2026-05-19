'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrden, getOrdenes, getVehiculos } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function OrdenesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data: ordenes, isLoading } = useQuery({
    queryKey: ['ordenes'],
    queryFn: () => getOrdenes(token!),
    enabled: Boolean(token),
  });
  const { data: vehiculos } = useQuery({
    queryKey: ['vehiculos-select'],
    queryFn: () => getVehiculos(token!),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createOrden(token!, {
        vehiculoId: Number(form.get('vehiculoId')),
        quejaCliente: String(form.get('quejaCliente')),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes'] }),
  });

  return (
    <section>
      <h2>Órdenes de trabajo</h2>
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(new FormData(e.currentTarget));
          e.currentTarget.reset();
        }}
      >
        <label>
          Vehículo
          <select name="vehiculoId" required>
            <option value="">Seleccionar…</option>
            {vehiculos?.results.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placas} — {v.marca} {v.modelo}
              </option>
            ))}
          </select>
        </label>
        <label className="full">
          Queja del cliente
          <textarea name="quejaCliente" rows={3} required />
        </label>
        <button type="submit">Crear orden</button>
      </form>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Placas</th>
              <th>Estado</th>
              <th>Prioridad</th>
            </tr>
          </thead>
          <tbody>
            {ordenes?.results.map((o) => (
              <tr key={o.id}>
                <td>{o.folio}</td>
                <td>{o.vehiculo_placas}</td>
                <td>{o.estado}</td>
                <td>{o.prioridad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
