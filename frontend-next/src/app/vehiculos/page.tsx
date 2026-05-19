'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createVehiculo, getClientes, getVehiculos } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function VehiculosPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data: vehiculos, isLoading } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: () => getVehiculos(token!),
    enabled: Boolean(token),
  });
  const { data: clientes } = useQuery({
    queryKey: ['clientes-select'],
    queryFn: () => getClientes(token!),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createVehiculo(token!, {
        clienteId: Number(form.get('clienteId')),
        marca: String(form.get('marca')),
        modelo: String(form.get('modelo')),
        anio: Number(form.get('anio')),
        placas: String(form.get('placas')),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehiculos'] }),
  });

  return (
    <section>
      <h2>Vehículos</h2>
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(new FormData(e.currentTarget));
          e.currentTarget.reset();
        }}
      >
        <label>
          Cliente
          <select name="clienteId" required>
            <option value="">Seleccionar…</option>
            {clientes?.results.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Marca
          <input name="marca" required />
        </label>
        <label>
          Modelo
          <input name="modelo" required />
        </label>
        <label>
          Año
          <input name="anio" type="number" required />
        </label>
        <label>
          Placas
          <input name="placas" required />
        </label>
        <button type="submit">Agregar vehículo</button>
      </form>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Placas</th>
              <th>Marca / Modelo</th>
              <th>Cliente</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos?.results.map((v) => (
              <tr key={v.id}>
                <td>{v.placas}</td>
                <td>
                  {v.marca} {v.modelo}
                </td>
                <td>{v.cliente_nombre}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
