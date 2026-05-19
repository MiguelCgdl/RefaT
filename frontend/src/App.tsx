import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { Clientes } from "./pages/Clientes";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Ordenes } from "./pages/Ordenes";
import { Refacciones } from "./pages/Refacciones";
import { Vehiculos } from "./pages/Vehiculos";

const queryClient = new QueryClient();

function AppRoutes() {
  const { token, login, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !token) {
    return <Login onLogin={login} />;
  }

  return (
    <Routes>
      <Route element={<Layout onLogout={logout} />}>
        <Route index element={<Dashboard token={token} />} />
        <Route path="clientes" element={<Clientes token={token} />} />
        <Route path="vehiculos" element={<Vehiculos token={token} />} />
        <Route path="ordenes" element={<Ordenes token={token} />} />
        <Route path="refacciones" element={<Refacciones token={token} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
