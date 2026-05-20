import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, Wrench, Package, Users, LogOut } from 'lucide-react';
import axios from 'axios';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Inventario from './pages/Inventario';
import Ordenes from './pages/Ordenes';
import Autorizar from './pages/Autorizar';
import VehiculoDetalle from './pages/VehiculoDetalle';

// Configurar el token en Axios
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Sidebar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/admin/clientes', label: 'Clientes', icon: <Users size={20} /> },
    { path: '/admin/inventario', label: 'Inventario', icon: <Package size={20} /> },
    { path: '/admin/ordenes', label: 'Órdenes', icon: <Wrench size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Wrench color="var(--primary-color)" />
        <span>RefaERP</span>
      </div>
      <nav className="nav-menu" style={{ flex: 1 }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ marginTop: 'auto' }}>
        <button className="nav-link" onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <LogOut size={20} /> Salir
        </button>
      </div>
    </div>
  );
};

const MainLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/autorizar/:id" element={<Autorizar />} />
        
        {/* Rutas Protegidas del Panel */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="clientes" element={<Clientes />} />
                <Route path="inventario" element={<Inventario />} />
                <Route path="ordenes" element={<Ordenes />} />
                <Route path="vehiculo/:id" element={<VehiculoDetalle />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
