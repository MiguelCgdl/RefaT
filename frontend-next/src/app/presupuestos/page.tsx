'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPresupuesto, getPresupuestos, getOrdenes, exportPdfPresupuesto } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Plus, FileText, Calculator, Download, AlertCircle, FileSpreadsheet } from 'lucide-react';

export default function PresupuestosPage() {
  const { token } = useAuth();
  const qc = useQueryClient();
  
  const { data: presupuestos, isLoading } = useQuery({
    queryKey: ['presupuestos'],
    queryFn: () => getPresupuestos(token!),
    enabled: Boolean(token),
  });

  const { data: ordenes } = useQuery({
    queryKey: ['ordenes-select'],
    queryFn: () => getOrdenes(token!),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: (form: FormData) =>
      createPresupuesto(token!, {
        ordenId: Number(form.get('ordenId')),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['presupuestos'] }),
  });

  const downloadPdf = async (id: number, folio: string) => {
    try {
      const blob = await exportPdfPresupuesto(token!, id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Presupuesto_${folio}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar PDF', err);
      alert('Hubo un error al generar el PDF del presupuesto.');
    }
  };

  const getStatusColor = (estado: string) => {
    switch(estado) {
      case 'APROBADO': return 'bg-green-100 text-green-700';
      case 'RECHAZADO': return 'bg-red-100 text-red-700';
      case 'ENVIADO': return 'bg-blue-100 text-blue-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Presupuestos y Cotizaciones</h2>
        <p className="text-slate-500 mt-2">Genera cálculos automáticos (mano de obra + partes) y expórtalos a PDF/Excel.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-500" /> Nuevo Presupuesto
        </h3>
        
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(new FormData(e.currentTarget));
            e.currentTarget.reset();
          }}
        >
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Orden de Trabajo *
            </label>
            <select
              name="ordenId"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            >
              <option value="">Seleccionar orden activa…</option>
              {ordenes?.results?.map((o) => (
                <option key={o.id} value={o.id}>
                  Folio: {o.folio} — Placas: {o.vehiculo_placas}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending ? 'Guardando...' : 'Crear Presupuesto Inicial'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Orden</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Versión</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Estado</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Total</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {presupuestos?.results?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-900 font-medium">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {p.orden_folio}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      v{p.version}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(p.estado)}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900 font-medium">
                      ${Number(p.total).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button
                        onClick={() => downloadPdf(p.id, p.orden_folio)}
                        className="p-2 bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!presupuestos?.results?.length && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No hay presupuestos generados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
