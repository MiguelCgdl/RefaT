import { z } from "zod";

export const lineaPresupuestoSchema = z.object({
  presupuesto: z.coerce.number().min(1),
  tipo: z.enum(["servicio", "refaccion"]),
  descripcion: z.string().min(2),
  refaccion: z.coerce.number().optional().nullable(),
  cantidad: z.coerce.number().min(0.01),
  precio_unitario: z.coerce.number().min(0),
  descuento: z.coerce.number().min(0).default(0),
});

export type LineaPresupuestoForm = z.infer<typeof lineaPresupuestoSchema>;
