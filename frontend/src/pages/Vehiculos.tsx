import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createVehiculo, getClientes, getVehiculoHistorial, getVehiculos } from "../api/client";
import { vehiculoSchema, type VehiculoForm } from "../schemas/vehiculo";

interface VehiculosProps {
  token: string;
}

export function Vehiculos({ token }: VehiculosProps) {
  const queryClient = useQueryClient();
  const [historialId, setHistorialId] = useState<number | null>(null);

  const { data: vehiculos } = useQuery({
    queryKey: ["vehiculos"],
    queryFn: () => getVehiculos(token),
  });
  const { data: clientes } = useQuery({
    queryKey: ["clientes-select"],
    queryFn: () => getClientes(token),
  });
  const { data: historial } = useQuery({
    queryKey: ["historial", historialId],
    queryFn: () => getVehiculoHistorial(historialId!, token),
    enabled: historialId !== null,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehiculoForm>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: { activo: true, kilometraje_actual: 0 },
  });

  const mutation = useMutation({
    mutationFn: (form: VehiculoForm) => createVehiculo(form, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
      reset();
    },
  });

  return (
    <section>
      <h2>Vehículos</h2>
      <form className="form-grid" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <label>
          Cliente *
          <select {...register("cliente")}>
            <option value="">— Seleccionar —</option>
            {clientes?.results.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {errors.cliente && <span className="error">{errors.cliente.message}</span>}
        </label>
        <label>
          Marca *
          <input {...register("marca")} />
        </label>
        <label>
          Modelo *
          <input {...register("modelo")} />
        </label>
        <label>
          Placas *
          <input {...register("placas")} />
        </label>
        <label>
          Año *
          <input type="number" {...register("anio")} />
        </label>
        <label>
          Kilometraje
          <input type="number" {...register("kilometraje_actual")} />
        </label>
        <button type="submit">Guardar vehículo</button>
      </form>

      <h3>Listado</h3>
      <table>
        <thead>
          <tr>
            <th>Placas</th>
            <th>Vehículo</th>
            <th>Cliente</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos?.results.map((v) => (
            <tr key={v.id}>
              <td>{v.placas}</td>
              <td>
                {v.marca} {v.modelo} ({v.anio})
              </td>
              <td>{v.cliente_nombre}</td>
              <td>
                <button type="button" onClick={() => setHistorialId(v.id)}>
                  Historial OT
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {historialId && (
        <aside className="historial-panel">
          <h3>Historial de órdenes</h3>
          <ul>
            {historial?.map((h) => (
              <li key={h.id}>
                <strong>{h.folio}</strong> — {h.estado} — {h.queja_cliente.slice(0, 60)}…
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setHistorialId(null)}>
            Cerrar
          </button>
        </aside>
      )}
    </section>
  );
}
