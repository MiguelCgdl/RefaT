import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { createCliente, getClientes } from "../api/client";
import { clienteSchema, type ClienteForm } from "../schemas/cliente";

interface ClientesProps {
  token: string;
}

export function Clientes({ token }: ClientesProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => getClientes(token),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { activo: true },
  });

  const mutation = useMutation({
    mutationFn: (form: ClienteForm) => createCliente(form, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      reset();
    },
  });

  return (
    <section>
      <h2>Clientes</h2>
      <form className="form-grid" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        <label>
          Nombre *
          <input {...register("nombre")} />
          {errors.nombre && <span className="error">{errors.nombre.message}</span>}
        </label>
        <label>
          Email
          <input {...register("email")} />
        </label>
        <label>
          Teléfono
          <input {...register("telefono")} />
        </label>
        <label>
          RFC
          <input {...register("rfc")} />
        </label>
        <label className="full">
          Dirección
          <textarea {...register("direccion")} rows={2} />
        </label>
        <button type="submit" disabled={mutation.isPending}>
          Guardar cliente
        </button>
      </form>

      <h3>Listado</h3>
      {isLoading ? (
        <p>Cargando…</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Activo</th>
            </tr>
          </thead>
          <tbody>
            {data?.results.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.telefono}</td>
                <td>{c.email}</td>
                <td>{c.activo ? "Sí" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
