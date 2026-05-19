import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  aprobarPresupuesto,
  createLineaPresupuesto,
  createOrden,
  createPresupuesto,
  getOrdenes,
  getPresupuestos,
  getVehiculos,
} from "../api/client";
import { lineaPresupuestoSchema, type LineaPresupuestoForm } from "../schemas/lineaPresupuesto";
import { ordenSchema, type OrdenForm } from "../schemas/orden";

interface OrdenesProps {
  token: string;
}

export function Ordenes({ token }: OrdenesProps) {
  const queryClient = useQueryClient();
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState<number | null>(null);

  const { data: ordenes } = useQuery({
    queryKey: ["ordenes"],
    queryFn: () => getOrdenes(token),
  });
  const { data: vehiculos } = useQuery({
    queryKey: ["vehiculos-select"],
    queryFn: () => getVehiculos(token),
  });
  const { data: presupuestos } = useQuery({
    queryKey: ["presupuestos"],
    queryFn: () => getPresupuestos(token),
  });

  const ordenForm = useForm<OrdenForm>({
    resolver: zodResolver(ordenSchema),
    defaultValues: { prioridad: "normal" },
  });

  const lineaForm = useForm<LineaPresupuestoForm>({
    resolver: zodResolver(lineaPresupuestoSchema),
    defaultValues: { tipo: "servicio", cantidad: 1, descuento: 0 },
  });

  const crearOrden = useMutation({
    mutationFn: (form: OrdenForm) => createOrden(form, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ordenes"] }),
  });

  const crearPresupuesto = useMutation({
    mutationFn: (ordenId: number) =>
      createPresupuesto({ orden: ordenId, version: 1, estado: "borrador" }, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["presupuestos"] }),
  });

  const agregarLinea = useMutation({
    mutationFn: (form: LineaPresupuestoForm) => createLineaPresupuesto(form, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presupuestos"] });
      lineaForm.reset({ presupuesto: presupuestoSeleccionado ?? undefined });
    },
  });

  const aprobar = useMutation({
    mutationFn: (id: number) => aprobarPresupuesto(id, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["presupuestos", "refacciones"] }),
  });

  return (
    <section>
      <h2>Órdenes de trabajo</h2>

      <form
        className="form-grid"
        onSubmit={ordenForm.handleSubmit((d) => crearOrden.mutate(d))}
      >
        <label>
          Vehículo *
          <select {...ordenForm.register("vehiculo")}>
            <option value="">— Seleccionar —</option>
            {vehiculos?.results.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placas} — {v.marca} {v.modelo}
              </option>
            ))}
          </select>
        </label>
        <label className="full">
          Queja del cliente *
          <textarea {...ordenForm.register("queja_cliente")} rows={3} />
        </label>
        <label>
          Prioridad
          <select {...ordenForm.register("prioridad")}>
            <option value="baja">Baja</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </label>
        <button type="submit">Crear orden</button>
      </form>

      <h3>Órdenes registradas</h3>
      <table>
        <thead>
          <tr>
            <th>Folio</th>
            <th>Placas</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ordenes?.results.map((o) => (
            <tr key={o.id}>
              <td>{o.folio}</td>
              <td>{o.vehiculo_placas}</td>
              <td>{o.estado}</td>
              <td>{o.prioridad}</td>
              <td>
                <button type="button" onClick={() => crearPresupuesto.mutate(o.id)}>
                  + Presupuesto
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Presupuestos y líneas</h3>
      <ul>
        {presupuestos?.results.map((p) => (
          <li key={p.id}>
            {p.orden_folio} v{p.version} — {p.estado} — Total: ${p.total}
            <button type="button" onClick={() => setPresupuestoSeleccionado(p.id)}>
              Agregar línea
            </button>
            {p.estado !== "aprobado" && (
              <button type="button" onClick={() => aprobar.mutate(p.id)}>
                Aprobar
              </button>
            )}
          </li>
        ))}
      </ul>

      {presupuestoSeleccionado && (
        <form
          className="form-grid"
          onSubmit={lineaForm.handleSubmit((d) =>
            agregarLinea.mutate({ ...d, presupuesto: presupuestoSeleccionado })
          )}
        >
          <input type="hidden" {...lineaForm.register("presupuesto")} value={presupuestoSeleccionado} />
          <label>
            Tipo
            <select {...lineaForm.register("tipo")}>
              <option value="servicio">Servicio</option>
              <option value="refaccion">Refacción</option>
            </select>
          </label>
          <label className="full">
            Descripción
            <input {...lineaForm.register("descripcion")} />
          </label>
          <label>
            Cantidad
            <input type="number" step="0.01" {...lineaForm.register("cantidad")} />
          </label>
          <label>
            Precio unitario
            <input type="number" step="0.01" {...lineaForm.register("precio_unitario")} />
          </label>
          <button type="submit">Agregar línea</button>
        </form>
      )}
    </section>
  );
}
