export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
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
}

export interface OrdenTrabajo {
  id: number;
  folio: string;
  vehiculo: number;
  vehiculo_placas?: string;
  estado: string;
  queja_cliente: string;
  diagnostico?: string;
  prioridad: string;
  mecanico?: string;
  fecha_ingreso?: string;
}

export interface Refaccion {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  stock: string;
  costo: string;
  precio_venta: string;
  bajo_stock?: boolean;
}

export interface DashboardResumen {
  ordenes_por_estado: { estado: string; total: number }[];
  refacciones_bajo_stock: number;
  ordenes_activas: number;
}
