import { z } from "zod";

export const ordenSchema = z.object({
  vehiculo: z.coerce.number().min(1, "Seleccione un vehículo"),
  queja_cliente: z.string().min(5, "Describa la queja del cliente"),
  diagnostico: z.string().optional(),
  prioridad: z.enum(["baja", "normal", "alta", "urgente"]).default("normal"),
  fecha_estimada: z.string().optional(),
});

export type OrdenForm = z.infer<typeof ordenSchema>;
