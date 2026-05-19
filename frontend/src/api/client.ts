import type {
  Cliente,
  DashboardResumen,
  LineaPresupuesto,
  OrdenTrabajo,
  PaginatedResponse,
  Presupuesto,
  Refaccion,
  Vehiculo,
  VehiculoHistorialItem,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

type RequestOptions = RequestInit & { token?: string };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detalle ?? error.detail ?? `Error HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// —— Clientes ——
export const getClientes = (token?: string) =>
  request<PaginatedResponse<Cliente>>("/clientes/", { token });

export const createCliente = (data: Partial<Cliente>, token?: string) =>
  request<Cliente>("/clientes/", { method: "POST", body: JSON.stringify(data), token });

export const updateCliente = (id: number, data: Partial<Cliente>, token?: string) =>
  request<Cliente>(`/clientes/${id}/`, { method: "PATCH", body: JSON.stringify(data), token });

// —— Vehículos ——
export const getVehiculos = (token?: string) =>
  request<PaginatedResponse<Vehiculo>>("/vehiculos/", { token });

export const createVehiculo = (data: Partial<Vehiculo>, token?: string) =>
  request<Vehiculo>("/vehiculos/", { method: "POST", body: JSON.stringify(data), token });

export const getVehiculoHistorial = (id: number, token?: string) =>
  request<VehiculoHistorialItem[]>(`/vehiculos/${id}/historial/`, { token });

// —— Órdenes de trabajo ——
export const getOrdenes = (token?: string) =>
  request<PaginatedResponse<OrdenTrabajo>>("/ordenes/", { token });

export const createOrden = (data: Partial<OrdenTrabajo>, token?: string) =>
  request<OrdenTrabajo>("/ordenes/", { method: "POST", body: JSON.stringify(data), token });

// —— Presupuestos ——
export const getPresupuestos = (token?: string) =>
  request<PaginatedResponse<Presupuesto>>("/presupuestos/", { token });

export const createPresupuesto = (data: Partial<Presupuesto>, token?: string) =>
  request<Presupuesto>("/presupuestos/", { method: "POST", body: JSON.stringify(data), token });

export const aprobarPresupuesto = (id: number, token?: string) =>
  request<Presupuesto>(`/presupuestos/${id}/aprobar/`, { method: "POST", token });

export const createLineaPresupuesto = (data: Partial<LineaPresupuesto>, token?: string) =>
  request<LineaPresupuesto>("/lineas-presupuesto/", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });

// —— Refacciones ——
export const getRefacciones = (token?: string) =>
  request<PaginatedResponse<Refaccion>>("/refacciones/", { token });

export const createRefaccion = (data: Partial<Refaccion>, token?: string) =>
  request<Refaccion>("/refacciones/", { method: "POST", body: JSON.stringify(data), token });

// —— Reportes ——
export const getDashboardResumen = (token?: string) =>
  request<DashboardResumen>("/reportes/resumen/", { token });

// —— Auth ——
export const obtenerToken = (username: string, password: string) =>
  request<{ token: string }>("/auth/token/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
