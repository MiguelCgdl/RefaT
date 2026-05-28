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
  ciudad?: string; // nuevo campo
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
  // Campos de inventario y extras
  tipo_motor?: string; // cilindraje
  unidad_luces?: boolean;
  cuarto_luces?: boolean;
  antena?: boolean;
  espejo_lateral?: boolean;
  cristales?: boolean;
  emblema?: boolean;
  rines?: number; // número de rines (4 típico)
  tapon_gasolina?: boolean;
  carroceria_sin_golpes?: boolean;
  gato?: boolean;
  bocina_claxon?: boolean;
  limpiaparabrisas?: boolean;
  llave_rueda?: boolean;
  llanta_repuesto?: boolean;
  gasolina_aprox?: number; // nivel de gasolina aproximado
  observaciones?: string;
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
  stock: number;
  costo: number;
  precio_venta: number;
  categoria?: string;
  stock_minimo?: number;
  ubicacion?: string;
  bajo_stock?: boolean;
}

export interface DashboardResumen {
  ordenes_por_estado: { estado: string; total: number }[];
  refacciones_bajo_stock: number;
  ordenes_activas: number;
  vehiculos_en_taller: number;
}

