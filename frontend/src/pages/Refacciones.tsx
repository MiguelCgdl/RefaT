import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { createRefaccion, getRefacciones } from "../api/client";
import type { Refaccion } from "../types";

interface RefaccionesProps {
  token: string;
}

export function Refacciones({ token }: RefaccionesProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["refacciones"],
    queryFn: () => getRefacciones(token),
  });

  const { register, handleSubmit, reset } = useForm<Partial<Refaccion>>();

  const mutation = useMutation({
    mutationFn: (form: Partial<Refaccion>) => createRefaccion(form, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refacciones"] });
      reset();
    },
  });

  return (
    <section>
      <h2>Refacciones</h2>
      <form className="form-grid" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <label>
          SKU *
          <input {...register("sku", { required: true })} />
        </label>
        <label>
          Nombre *
          <input {...register("nombre", { required: true })} />
        </label>
        <label>
          Categoría
          <input {...register("categoria")} />
        </label>
        <label>
          Precio venta *
          <input type="number" step="0.01" {...register("precio_venta", { required: true })} />
        </label>
        <label>
          Stock
          <input type="number" step="0.01" {...register("stock")} defaultValue={0} />
        </label>
        <label>
          Stock mínimo
          <input type="number" step="0.01" {...register("stock_minimo")} defaultValue={0} />
        </label>
        <label>
          Ubicación
          <input {...register("ubicacion")} />
        </label>
        <button type="submit">Guardar refacción</button>
      </form>

      <h3>Inventario</h3>
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
              <th>Alerta</th>
            </tr>
          </thead>
          <tbody>
            {data?.results.map((r) => (
              <tr key={r.id} className={r.bajo_stock ? "row-warning" : ""}>
                <td>{r.sku}</td>
                <td>{r.nombre}</td>
                <td>{r.stock}</td>
                <td>${r.precio_venta}</td>
                <td>{r.bajo_stock ? "Bajo stock" : "OK"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
