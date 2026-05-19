/** Tipos alineados con los serializers del API Django */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  rfc: string;
  direccion: string;
  notas: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Vehiculo {
  id: number;
  cliente: number;
  cliente_nombre?: string;
  marca: string;
  modelo: string;
  serie_vin: string;
  anio: number;
  placas: string;
  color: string;
  kilometraje_actual: number;
  notas: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface OrdenTrabajo {
  id: number;
  folio: string;
  vehiculo: number;
  vehiculo_placas?: string;
  fecha_ingreso: string;
  fecha_estimada: string | null;
  fecha_cierre: string | null;
  estado: string;
  queja_cliente: string;
  diagnostico: string;
  mecanico: number | null;
  mecanico_nombre?: string | null;
  prioridad: string;
  creado_en: string;
  actualizado_en: string;
}

export interface LineaPresupuesto {
  id: number;
  presupuesto: number;
  tipo: "servicio" | "refaccion";
  descripcion: string;
  refaccion: number | null;
  cantidad: string;
  precio_unitario: string;
  descuento: string;
  importe_neto?: string;
}

export interface Presupuesto {
  id: number;
  orden: number;
  orden_folio?: string;
  version: number;
  estado: string;
  subtotal: string;
  iva: string;
  total: string;
  aprobado_en: string | null;
  lineas?: LineaPresupuesto[];
  creado_en: string;
  actualizado_en: string;
}

export interface Refaccion {
  id: number;
  sku: string;
  nombre: string;
  categoria: string;
  costo: string;
  precio_venta: string;
  stock: string;
  stock_minimo: string;
  ubicacion: string;
  activo: boolean;
  bajo_stock?: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface VehiculoHistorialItem {
  id: number;
  folio: string;
  estado: string;
  fecha_ingreso: string;
  fecha_cierre: string | null;
  queja_cliente: string;
  diagnostico: string;
  prioridad: string;
}

export interface DashboardResumen {
  ordenes_por_estado: { estado: string; total: number }[];
  refacciones_bajo_stock: number;
  ordenes_activas: number;
}
