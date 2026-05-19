'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRefaccion, getRefacciones } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function RefaccionesPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['refacciones'],
    queryFn: () => getRefacciones(token!),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createRefaccion(token!, {
        sku: String(form.get('sku')),
        nombre: String(form.get('nombre')),
        precioVenta: Number(form.get('precioVenta')),
        stock: Number(form.get('stock') ?? 0),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['refacciones'] }),
  });

  return (
    <section>
      <h2>Refacciones</h2>
      <form
        className="form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(new FormData(e.currentTarget));
          e.currentTarget.reset();
        }}
      >
        <label>
          SKU
          <input name="sku" required />
        </label>
        <label>
          Nombre
          <input name="nombre" required />
        </label>
        <label>
          Precio venta
          <input name="precioVenta" type="number" step="0.01" required />
        </label>
        <label>
          Stock inicial
          <input name="stock" type="number" step="0.01" defaultValue={0} />
        </label>
        <button type="submit">Agregar refacción</button>
      </form>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Stock</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {data?.results.map((r) => (
              <tr key={r.id}>
                <td>{r.sku}</td>
                <td>
                  {r.nombre}
                  {r.bajo_stock && ' ⚠'}
                </td>
                <td>{r.stock}</td>
                <td>{r.precio_venta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
