import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Car, User, Clock, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const VehiculoDetalle = () => {
  const { id } = useParams();
  const [vehiculo, setVehiculo] = useState(null);

  useEffect(() => {
    fetchHistorial();
  }, [id]);

  const fetchHistorial = async () => {
    try {
      const res = await axios.get(`${API_URL}/vehiculos/${id}/historial`);
      setVehiculo(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!vehiculo) return <div style={{ padding: '2rem' }}>Cargando detalles...</div>;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>Expediente del Vehículo</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="flex items-center gap-2" style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
            <Car size={24} /> Datos del Vehículo
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div><span className="text-muted">Placas:</span> <strong>{vehiculo.placas}</strong></div>
            <div><span className="text-muted">Marca:</span> <strong>{vehiculo.marca}</strong></div>
            <div><span className="text-muted">Modelo:</span> <strong>{vehiculo.modelo}</strong></div>
            <div><span className="text-muted">Año:</span> <strong>{vehiculo.anio}</strong></div>
            <div><span className="text-muted">Color:</span> <strong>{vehiculo.color || '-'}</strong></div>
            <div><span className="text-muted">Motor:</span> <strong>{vehiculo.motor || '-'}</strong></div>
            <div><span className="text-muted">Kilometraje:</span> <strong>{vehiculo.kilometraje ? `${vehiculo.kilometraje} km` : '-'}</strong></div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="flex items-center gap-2" style={{ marginBottom: '1rem', color: 'var(--success-color)' }}>
            <User size={24} /> Propietario
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div><span className="text-muted">Nombre:</span> <strong>{vehiculo.cliente.nombre}</strong></div>
            <div><span className="text-muted">Teléfono / WhatsApp:</span> <strong>{vehiculo.cliente.telefono}</strong></div>
            <div><span className="text-muted">Email:</span> <strong>{vehiculo.cliente.email || '-'}</strong></div>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '1.5rem' }} className="flex items-center gap-2">
        <Clock size={24} color="var(--warning-color)" /> Historial de Visitas y Reparaciones
      </h3>

      {vehiculo.ordenes.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Este vehículo no tiene visitas registradas.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {vehiculo.ordenes.map(orden => (
            <div key={orden.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
              <div style={{ minWidth: '150px', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Orden #{orden.id}</div>
                <div className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  {new Date(orden.createdAt).toLocaleDateString()}
                </div>
                <span className={`badge ${orden.estado === 'COMPLETADO' ? 'badge-success' : 'badge-warning'}`}>
                  {orden.estado}
                </span>
                <div style={{ marginTop: '1rem', fontSize: '1.25rem', color: 'var(--success-color)' }}>
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(orden.total)}
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}><AlertTriangle size={18} color="var(--danger-color)" /> Problemas Reportados</h4>
                <p style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
                  {orden.problemasReportados || 'No se especificaron problemas.'}
                </p>

                <h4 className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}><FileText size={18} color="var(--primary-color)" /> Diagnóstico y Trabajo</h4>
                <p style={{ marginBottom: '1rem' }}>{orden.descripcion}</p>

                {orden.refacciones.length > 0 && (
                  <div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Refacciones Utilizadas</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {orden.refacciones.map(r => (
                        <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', padding: '0.25rem 0' }}>
                          <span>{r.cantidad}x {r.refaccion.nombre}</span>
                          <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(r.cantidad * r.precioUnidad)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehiculoDetalle;
