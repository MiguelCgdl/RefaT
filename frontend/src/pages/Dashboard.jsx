import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Wrench, Users, DollarSign } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ clientes: 0, refacciones: 0, ordenes: 0 });

  useEffect(() => {
    // Simulando fetch de estadísticas desde los endpoints
    const fetchStats = async () => {
      try {
        const [cRes, rRes, oRes] = await Promise.all([
          axios.get(`${API_URL}/clientes`),
          axios.get(`${API_URL}/refacciones`),
          axios.get(`${API_URL}/ordenes`)
        ]);
        setStats({
          clientes: cRes.data.length,
          refacciones: rRes.data.length,
          ordenes: oRes.data.length
        });
      } catch (err) {
        console.error("Error al cargar stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginBottom: '1.5rem' }}>Panel de Control</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Total Clientes</p>
            <h3 style={{ fontSize: '1.5rem' }}>{stats.clientes}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--success-color)' }}>
            <Package size={24} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Refacciones en Stock</p>
            <h3 style={{ fontSize: '1.5rem' }}>{stats.refacciones}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--warning-color)' }}>
            <Wrench size={24} />
          </div>
          <div>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Órdenes Pendientes</p>
            <h3 style={{ fontSize: '1.5rem' }}>{stats.ordenes}</h3>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
