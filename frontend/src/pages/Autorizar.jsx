import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const Autorizar = () => {
  const { id } = useParams();
  const [orden, setOrden] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, ready, success, error

  useEffect(() => {
    // En una app real, traeríamos los detalles de la orden
    setOrden({ id, total: 4500 });
    setStatus('ready');
  }, [id]);

  const handleAutorizar = async () => {
    try {
      setStatus('loading');
      await axios.post(`${API_URL}/ordenes/${id}/autorizar`);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  if (status === 'loading') return <div style={{ color: 'white', padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  if (status === 'success') return (
    <div className="flex justify-center items-center" style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--success-color)' }}>¡Gracias!</h2>
        <p style={{ color: 'var(--text-muted)' }}>El presupuesto ha sido autorizado. El taller ha sido notificado y comenzará con la reparación de inmediato.</p>
      </div>
    </div>
  );

  return (
    <div className="flex justify-center items-center" style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Autorizar Presupuesto</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          ¿Aceptas el presupuesto para la reparación de tu vehículo por el total de {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(orden?.total || 0)}?
        </p>
        <div className="flex gap-4 justify-center">
          <button className="btn btn-primary" onClick={handleAutorizar}>Aceptar Trabajo</button>
          <button className="btn" style={{ background: 'var(--danger-color)' }}>Rechazar</button>
        </div>
      </div>
    </div>
  );
};

export default Autorizar;
