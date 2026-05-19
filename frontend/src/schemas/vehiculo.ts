import { z } from "zod";

export const vehiculoSchema = z.object({
  cliente: z.coerce.number().min(1, "Seleccione un cliente"),
  marca: z.string().min(1, "Marca requerida"),
  modelo: z.string().min(1, "Modelo requerido"),
  serie_vin: z.string().optional(),
  anio: z.coerce.number().min(1980).max(2100),
  placas: z.string().min(5, "Placas requeridas"),
  color: z.string().optional(),
  kilometraje_actual: z.coerce.number().min(0).default(0),
  notas: z.string().optional(),
  activo: z.boolean().default(true),
});

export type VehiculoForm = z.infer<typeof vehiculoSchema>;
