import { Link, Outlet } from "react-router-dom";

interface LayoutProps {
  onLogout: () => void;
}

export function Layout({ onLogout }: LayoutProps) {
  return (
    <div className="layout">
      <header className="header">
        <h1>Refa</h1>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/clientes">Clientes</Link>
          <Link to="/vehiculos">Vehículos</Link>
          <Link to="/ordenes">Órdenes</Link>
          <Link to="/refacciones">Refacciones</Link>
        </nav>
        <button type="button" onClick={onLogout}>
          Salir
        </button>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
