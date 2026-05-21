'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPresupuesto, addLineaPresupuesto, getRefacciones, enviarPresupuesto } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Plus, Send, Mail, MessageCircle, Package, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function PresupuestoDetallePage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const qc = useQueryClient();
  const id = parseInt(params.id, 10);

  const { data: presupuesto, isLoading } = useQuery({
    queryKey: ['presupuesto', id],
    queryFn: () => getPresupuesto(token!, id),
    enabled: Boolean(token),
  });

  const { data: refacciones } = useQuery({
    queryKey: ['refacciones'],
    queryFn: () => getRefacciones(token!),
    enabled: Boolean(token),
  });

  const [tipoLinea, setTipoLinea] = useState<'SERVICIO' | 'REFACCION'>('REFACCION');

  const addLineaMutation = useMutation({
    mutationFn: (form: FormData) => {
      const data: any = {
        presupuestoId: id,
        tipo: tipoLinea,
        descripcion: String(form.get('descripcion') ?? ''),
        cantidad: Number(form.get('cantidad')),
        descuento: Number(form.get('descuento') || 0),
      };
      
      if (tipoLinea === 'REFACCION') {
        data.refaccionId = Number(form.get('refaccionId'));
        // El backend toma automáticamente el costo de la refacción si no enviamos precioUnitario
      } else {
        data.precioUnitario = Number(form.get('precioUnitario'));
      }
      return addLineaPresupuesto(token!, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presupuesto', id] }),
  });

  const enviarMutation = useMutation({
    mutationFn: (method: 'email' | 'whatsapp') => enviarPresupuesto(token!, id, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuesto', id] });
      alert('Presupuesto enviado exitosamente');
    },
    onError: (err: any) => alert(err.message),
  });

  if (isLoading || !presupuesto) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/presupuestos" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Presupuesto v{presupuesto.version} (Orden: {presupuesto.orden_folio})
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-medium text-slate-500">Estado: {presupuesto.estado.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de agregar líneas */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" /> Agregar Concepto
            </h3>
            
            <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setTipoLinea('REFACCION')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex justify-center items-center gap-2 ${tipoLinea === 'REFACCION' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Package className="w-4 h-4" /> Refacción
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
                e.currentTarget.reset();
              }}
            >
              {tipoLinea === 'REFACCION' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Refacción del Inventario *</label>
                    <select name="refaccionId" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 bg-white">
                      <option value="">Seleccionar pieza...</option>
                      {refacciones?.results?.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre} - Stock: {r.stock} (Costo: ${r.costo})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Descripción del Servicio *</label>
                    <input name="descripcion" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="Ej. Cambio de balatas" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Costo de Mano de Obra ($) *</label>
                    <input name="precioUnitario" type="number" step="0.01" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20" placeholder="500.00" />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Cantidad *</label>
                  <input name="cantidad" type="number" min="1" step="0.01" defaultValue="1" required className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Descuento ($)</label>
                  <input name="descuento" type="number" min="0" step="0.01" defaultValue="0" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>

              <button
                type="submit"
                disabled={addLineaMutation.isPending}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {addLineaMutation.isPending ? 'Agregando...' : 'Agregar Concepto'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-500" /> Enviar Presupuesto
            </h3>
            <p className="text-sm text-slate-500">Envía el presupuesto al cliente utilizando sus datos de contacto registrados.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => enviarMutation.mutate('email')}
                disabled={enviarMutation.isPending}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Mail className="w-4 h-4" /> Enviar por Correo
              </button>
              <button
                onClick={() => enviarMutation.mutate('whatsapp')}
                disabled={enviarMutation.isPending}
                className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4" /> Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Conceptos y Totales */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Conceptos (Piezas y Mano de Obra)</h3>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Concepto</th>
                  <th className="px-6 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">Cant</th>
                  <th className="px-6 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider text-right">Precio U.</th>
                  <th className="px-6 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {presupuesto.lineas?.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        {l.tipo === 'refaccion' ? <Package className="w-3.5 h-3.5 text-blue-500" /> : <Wrench className="w-3.5 h-3.5 text-amber-500" />}
                        {l.descripcion || 'Pieza del inventario'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {Number(l.cantidad)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 text-right">
                      ${Number(l.precio_unitario).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 text-right">
                      ${Number(l.importe_neto).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {!presupuesto.lineas?.length && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                      Aún no hay piezas o mano de obra en este presupuesto.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-6 border-t border-slate-100">
            <div className="max-w-xs ml-auto space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal (Piezas + Mano de Obra)</span>
                <span className="font-medium text-slate-900">${Number(presupuesto.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>IVA (16%)</span>
                <span className="font-medium text-slate-900">${Number(presupuesto.iva).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-3 border-t border-slate-200">
                <span>Total</span>
                <span>${Number(presupuesto.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
