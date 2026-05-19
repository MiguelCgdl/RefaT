import { z } from "zod";

export const clienteSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido").or(z.literal("")),
  telefono: z.string().optional(),
  rfc: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
  activo: z.boolean().default(true),
});

export type ClienteForm = z.infer<typeof clienteSchema>;
