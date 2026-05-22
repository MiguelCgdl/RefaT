import type { Cliente, DashboardResumen, OrdenTrabajo, PaginatedResponse, Refaccion, Vehiculo } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

type Options = RequestInit & { token?: string };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const msg = (error as { detalle?: string; message?: string }).detalle ?? (error as { message?: string }).message;
    throw new Error(msg ?? `Error HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const login = (username: string, password: string) =>
  request<{ accessToken: string; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const getClientes = (token: string) => request<PaginatedResponse<Cliente>>('/clientes/', { token });
export const createCliente = (token: string, data: Partial<Cliente>) =>
  request<Cliente>('/clientes/', { method: 'POST', body: JSON.stringify(data), token });
export const updateCliente = (token: string, id: number, data: Partial<Cliente>) =>
  request<Cliente>(`/clientes/${id}`, { method: 'PATCH', body: JSON.stringify(data), token });
export const deleteCliente = (token: string, id: number) =>
  request<void>(`/clientes/${id}`, { method: 'DELETE', token });

export const getVehiculos = (token: string) => request<PaginatedResponse<Vehiculo>>('/vehiculos/', { token });
export const createVehiculo = (token: string, data: Record<string, unknown>) =>
  request<Vehiculo>('/vehiculos/', { method: 'POST', body: JSON.stringify(data), token });
export const updateVehiculo = (token: string, id: number, data: Record<string, unknown>) =>
  request<Vehiculo>(`/vehiculos/${id}`, { method: 'PATCH', body: JSON.stringify(data), token });
export const deleteVehiculo = (token: string, id: number) =>
  request<void>(`/vehiculos/${id}`, { method: 'DELETE', token });
export const getVehiculoHistorial = (token: string, id: number) =>
  request<any[]>(`/vehiculos/${id}/historial`, { token });

export const getOrdenes = (token: string) => request<PaginatedResponse<OrdenTrabajo>>('/ordenes/', { token });
export const createOrden = (token: string, data: Record<string, unknown>) =>
  request<OrdenTrabajo>('/ordenes/', { method: 'POST', body: JSON.stringify(data), token });
export const updateOrden = (token: string, id: number, data: Record<string, unknown>) =>
  request<OrdenTrabajo>(`/ordenes/${id}`, { method: 'PATCH', body: JSON.stringify(data), token });
export const deleteOrden = (token: string, id: number) =>
  request<void>(`/ordenes/${id}`, { method: 'DELETE', token });

export const getRefacciones = (token: string) => request<PaginatedResponse<Refaccion>>('/refacciones/', { token });
export const createRefaccion = (token: string, data: Record<string, unknown>) =>
  request<Refaccion>('/refacciones/', { method: 'POST', body: JSON.stringify(data), token });
export const updateRefaccion = (token: string, id: number, data: Record<string, unknown>) =>
  request<Refaccion>(`/refacciones/${id}`, { method: 'PATCH', body: JSON.stringify(data), token });
export const deleteRefaccion = (token: string, id: number) =>
  request<void>(`/refacciones/${id}`, { method: 'DELETE', token });

export const getDashboardResumen = (token: string) =>
  request<DashboardResumen>('/reportes/resumen/', { token });

export const getPresupuestos = (token: string) => request<PaginatedResponse<any>>('/presupuestos', { token });
export const getPresupuesto = (token: string, id: number) => request<any>(`/presupuestos/${id}`, { token });
export const createPresupuesto = (token: string, data: Record<string, unknown>) =>
  request<any>('/presupuestos', { method: 'POST', body: JSON.stringify(data), token });
export const updatePresupuesto = (token: string, id: number, data: Record<string, unknown>) =>
  request<any>(`/presupuestos/${id}`, { method: 'PATCH', body: JSON.stringify(data), token });
export const deletePresupuesto = (token: string, id: number) =>
  request<void>(`/presupuestos/${id}`, { method: 'DELETE', token });

export const addLineaPresupuesto = (token: string, data: Record<string, unknown>) =>
  request<any>('/lineas-presupuesto', { method: 'POST', body: JSON.stringify(data), token });
export const deleteLineaPresupuesto = (token: string, id: number) =>
  request<any>(`/lineas-presupuesto/${id}`, { method: 'DELETE', token });

export const enviarPresupuesto = (token: string, id: number, method: 'email' | 'whatsapp') =>
  request<any>(`/presupuestos/${id}/enviar`, { method: 'POST', body: JSON.stringify({ method }), token });

export const exportPdfPresupuesto = (token: string, id: number) =>
  request<Blob>(`/reportes/presupuestos/${id}/pdf`, { token });
export const exportRefaccionesExcel = (token: string) =>
  request<Blob>('/reportes/refacciones/excel', { token });

