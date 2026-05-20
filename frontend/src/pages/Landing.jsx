import { Link } from 'react-router-dom';
import { Wrench, Shield, Clock, PenTool } from 'lucide-react';

const Landing = () => {
  return (
    <div style={{ background: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-main)' }}>
      {/* Navbar */}
      <nav className="container flex justify-between items-center" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2" style={{ color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 'bold' }}>
          <Wrench />
          <span>AutoRepair Premium</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="btn btn-primary">Acceso Personal</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Expertos en el Cuidado de tu Vehículo
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Ofrecemos servicio de mantenimiento, diagnóstico computarizado y venta de refacciones originales con la más alta tecnología.
        </p>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Agendar Cita</button>
      </header>

      {/* Features */}
      <section className="container" style={{ padding: '4rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem' }}>Nuestros Servicios</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--primary-color)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Shield size={48} />
            </div>
            <h3>Garantía Extendida</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Todas nuestras refacciones y mano de obra están garantizadas por escrito.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--warning-color)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <Clock size={48} />
            </div>
            <h3>Servicio Rápido</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Optimización de tiempos para devolver tu vehículo lo antes posible.</p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--success-color)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <PenTool size={48} />
            </div>
            <h3>Diagnóstico Avanzado</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Contamos con escáneres de última generación para todas las marcas.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
        <p>© 2026 AutoRepair Premium. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Landing;
