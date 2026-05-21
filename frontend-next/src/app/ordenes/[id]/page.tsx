'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getRefacciones, createPresupuesto, getPresupuestos, addLineaPresupuesto } from '@/lib/api';
import Link from 'next/link';
import {
  ArrowLeft, ClipboardList, Package, Wrench, Plus, DollarSign,
  CheckCircle, Clock, AlertCircle, FileText
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

async function request<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).detalle ?? (err as any).message ?? `Error ${res.status}`);
  }
  return res.json();
}

export default function OrdenDetallePage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const qc = useQueryClient();
  const ordenId = parseInt(params.id, 10);

  const { data: orden, isLoading: loadingOrden } = useQuery({
    queryKey: ['orden', ordenId],
    queryFn: () => request<any>(`/ordenes/${ordenId}`, token!),
    enabled: Boolean(token),
  });

  const { data: refacciones } = useQuery({
    queryKey: ['refacciones'],
    queryFn: () => getRefacciones(token!),
    enabled: Boolean(token),
  });

  const { data: presupuestosData } = useQuery({
    queryKey: ['presupuestos-orden', ordenId],
    queryFn: () => getPresupuestos(token!),
    enabled: Boolean(token),
    select: (data: any) => data?.results?.filter((p: any) => p.orden === ordenId) ?? [],
  });

  const presupuestos: any[] = presupuestosData ?? [];
  const presupuestoActivo = presupuestos[0];

  const [tipoLinea, setTipoLinea] = useState<'SERVICIO' | 'REFACCION'>('REFACCION');
  const [diagnostico, setDiagnostico] = useState('');
  const [savingDiag, setSavingDiag] = useState(false);

  const crearPresupuestoMutation = useMutation({
    mutationFn: () => createPresupuesto(token!, { ordenId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presupuestos-orden', ordenId] }),
  });

  const addLineaMutation = useMutation({
    mutationFn: (form: FormData) => {
      const data: any = {
        presupuestoId: presupuestoActivo.id,
        tipo: tipoLinea,
        descripcion: String(form.get('descripcion') ?? ''),
        cantidad: Number(form.get('cantidad')),
        descuento: Number(form.get('descuento') || 0),
      };
      if (tipoLinea === 'REFACCION') {
        data.refaccionId = Number(form.get('refaccionId'));
      } else {
        data.descripcion = String(form.get('descripcion'));
        data.precioUnitario = Number(form.get('precioUnitario'));
      }
      return addLineaPresupuesto(token!, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuestos-orden', ordenId] });
    },
    onError: (err: any) => alert(err.message),
  });

  const saveDiagnostico = async () => {
    setSavingDiag(true);
    try {
      await request(`/ordenes/${ordenId}`, token!, {
        method: 'PATCH',
        body: JSON.stringify({ diagnostico }),
      });
      qc.invalidateQueries({ queryKey: ['orden', ordenId] });
      alert('Diagnóstico guardado');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingDiag(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'bg-green-100 text-green-700 border-green-200';
      case 'en_proceso': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'diagnostico': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  if (loadingOrden || !orden) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ordenes" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {orden.folio}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">Vehículo: {orden.vehiculo_placas}</p>
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getEstadoColor(orden.estado)}`}>
          {orden.estado.toUpperCase().replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: info + diagnóstico */}
        <div className="space-y-6">
          {/* Queja del cliente */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Queja del Cliente
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">{orden.queja_cliente || '—'}</p>
          </div>

          {/* Hoja de Diagnóstico */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-blue-500" /> Hoja de Diagnóstico
            </h3>
            <textarea
              rows={5}
              defaultValue={orden.diagnostico ?? ''}
              onChange={(e) => setDiagnostico(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 resize-none"
              placeholder="Detalle el diagnóstico técnico del vehículo..."
            />
            <button
              onClick={saveDiagnostico}
              disabled={savingDiag}
              className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {savingDiag ? 'Guardando...' : 'Guardar Diagnóstico'}
            </button>
          </div>

          {/* Acción: Crear presupuesto */}
          {!presupuestoActivo && (
            <div className="bg-white p-5 rounded-2xl border border-dashed border-slate-200 shadow-sm text-center">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-4">Aún no hay presupuesto para esta orden.</p>
              <button
                onClick={() => crearPresupuestoMutation.mutate()}
                disabled={crearPresupuestoMutation.isPending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                {crearPresupuestoMutation.isPending ? 'Creando...' : 'Crear Presupuesto'}
              </button>
            </div>
          )}

          {presupuestoActivo && (
            <Link
              href={`/presupuestos/${presupuestoActivo.id}`}
              className="block bg-green-50 border border-green-200 p-4 rounded-2xl hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Presupuesto v{presupuestoActivo.version}</span>
                </div>
                <span className="text-lg font-bold text-green-700">${Number(presupuestoActivo.total).toFixed(2)}</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Click para ver/editar y enviar al cliente →</p>
            </Link>
          )}
        </div>

        {/* Columna derecha: carga de refacciones y mano de obra */}
        {presupuestoActivo && (
          <div className="lg:col-span-2 space-y-6">
            {/* Form agregar concepto */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-5">
                <Plus className="w-4 h-4 text-blue-500" /> Agregar Refacción o Mano de Obra
              </h3>

              <div className="flex gap-2 mb-5 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTipoLinea('REFACCION')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex justify-center items-center gap-2 ${tipoLinea === 'REFACCION' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Package className="w-4 h-4" /> Refacción del Inventario
                </button>
                <button
                  type="button"
                  onClick={() => setTipoLinea('SERVICIO')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex justify-center items-center gap-2 ${tipoLinea === 'SERVICIO' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Wrench className="w-4 h-4" /> Mano de Obra
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  addLineaMutation.mutate(new FormData(e.currentTarget));
                  (e.currentTarget as HTMLFormElement).reset();
                }}
              >
                {tipoLinea === 'REFACCION' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Pieza del Inventario *</label>
                    <select name="refaccionId" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 bg-white">
                      <option value="">Seleccionar pieza…</option>
                      {refacciones?.results?.map((r) => (
                        <option key={r.id} value={r.id}>
                          [{r.sku}] {r.nombre} — Stock: {r.stock} | Costo: ${Number(r.costo).toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-1">El costo se tomará automáticamente del inventario.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700">Descripción del Servicio *</label>
                      <input name="descripcion" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="Ej. Alineación y balanceo" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Costo de Mano de Obra *</label>
                      <input name="precioUnitario" type="number" step="0.01" min="0" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="350.00" />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Cantidad *</label>
                    <input name="cantidad" type="number" min="1" step="0.01" defaultValue="1" required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Descuento ($)</label>
                    <input name="descuento" type="number" min="0" step="0.01" defaultValue="0" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addLineaMutation.isPending}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {addLineaMutation.isPending ? 'Agregando...' : 'Agregar al Presupuesto'}
                </button>
              </form>
            </div>

            {/* Tabla de conceptos */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Conceptos en Presupuesto</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-4 h-4" />
                  v{presupuestoActivo.version} — {presupuestoActivo.estado?.toUpperCase()}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Tipo</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Concepto</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Cant.</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">P. Unit.</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {presupuestoActivo.lineas?.map((l: any) => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${l.tipo === 'refaccion' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                            {l.tipo === 'refaccion' ? <Package className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                            {l.tipo === 'refaccion' ? 'Refacción' : 'Mano de Obra'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-700">{l.descripcion || '—'}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 text-center">{Number(l.cantidad)}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 text-right">${Number(l.precio_unitario).toFixed(2)}</td>
                        <td className="px-5 py-3 text-sm font-semibold text-slate-900 text-right">${Number(l.importe_neto).toFixed(2)}</td>
                      </tr>
                    ))}
                    {!presupuestoActivo.lineas?.length && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">
                          Sin conceptos aún. Agrega refacciones o mano de obra.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Totales */}
              <div className="bg-slate-50 p-5 border-t border-slate-100">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal (sin IVA)</span>
                    <span className="font-medium">${Number(presupuestoActivo.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>IVA 16%</span>
                    <span className="font-medium">${Number(presupuestoActivo.iva).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total a Cobrar</span>
                    <span className="text-blue-600">${Number(presupuestoActivo.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!presupuestoActivo && (
          <div className="lg:col-span-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium mb-2">Crea el presupuesto para agregar piezas y mano de obra</p>
            <p className="text-slate-400 text-sm">Una vez creado el presupuesto podrás cargar refacciones del inventario y los servicios realizados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
