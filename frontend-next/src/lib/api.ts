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

export const getVehiculos = (token: string) => request<PaginatedResponse<Vehiculo>>('/vehiculos/', { token });
export const createVehiculo = (token: string, data: Record<string, unknown>) =>
  request<Vehiculo>('/vehiculos/', { method: 'POST', body: JSON.stringify(data), token });

export const getOrdenes = (token: string) => request<PaginatedResponse<OrdenTrabajo>>('/ordenes/', { token });
export const createOrden = (token: string, data: Record<string, unknown>) =>
  request<OrdenTrabajo>('/ordenes/', { method: 'POST', body: JSON.stringify(data), token });

export const getRefacciones = (token: string) => request<PaginatedResponse<Refaccion>>('/refacciones/', { token });
export const createRefaccion = (token: string, data: Record<string, unknown>) =>
  request<Refaccion>('/refacciones/', { method: 'POST', body: JSON.stringify(data), token });

export const getDashboardResumen = (token: string) =>
  request<DashboardResumen>('/reportes/resumen/', { token });
