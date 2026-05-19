'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCliente, getClientes } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function ClientesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => getClientes(token!),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createCliente(token!, {
        nombre: String(form.get('nombre')),
        email: String(form.get('email') ?? ''),
        telefono: String(form.get('telefono') ?? ''),
        rfc: String(form.get('rfc') ?? ''),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });

  return (
    <section>
      <h2>Clientes</h2>
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(new FormData(e.currentTarget));
          e.currentTarget.reset();
        }}
      >
        <label>
          Nombre *
          <input name="nombre" required />
        </label>
        <label>
          Email
          <input name="email" type="email" />
        </label>
        <label>
          Teléfono
          <input name="telefono" />
        </label>
        <label>
          RFC
          <input name="rfc" />
        </label>
        <button type="submit">Agregar cliente</button>
      </form>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {data?.results.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.email}</td>
                <td>{c.telefono}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
