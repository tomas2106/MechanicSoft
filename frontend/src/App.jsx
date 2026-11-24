import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/Publico/HomePage";
import PortalCliente from "./pages/Publico/PortalCliente";
import Login from "./pages/Login/Login";
import SuperAdmin from "./pages/SuperAdmin/SuperAdmin";
import Tablero from "./pages/Tablero/Tablero";
import Recepcion from "./pages/Recepcion/Recepcion";
import Vehiculos from "./pages/Vehiculos/Vehiculos";
import Clientes from "./pages/Clientes/Clientes";
import VentasInventario from "./pages/Ventas/VentasInventario";
import Configuracion from "./pages/Configuracion/Configuracion";

function RutaProtegida({ children, soloSuperAdmin = false }) {
  const { estaAutenticado, user } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (soloSuperAdmin && user?.rol !== "SUPER_ADMIN") {
    return <Navigate to="/panel" replace />;
  }

  if (!soloSuperAdmin && user?.rol === "SUPER_ADMIN") {
    return <Navigate to="/superadmin" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/t/:slugTaller" element={<PortalCliente />} />
            <Route path="/login" element={<Login />} />

            {/* Super Admin / Área Operativa Central */}
            <Route
              path="/superadmin"
              element={
                <RutaProtegida soloSuperAdmin>
                  <SuperAdmin />
                </RutaProtegida>
              }
            />

            {/* Panel Operativo del Taller */}
            <Route
              path="/panel"
              element={
                <RutaProtegida>
                  <Layout />
                </RutaProtegida>
              }
            >
              <Route index element={<Tablero />} />
              <Route path="recepcion" element={<Recepcion />} />
              <Route path="vehiculos" element={<Vehiculos />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="ventas" element={<VentasInventario />} />
              <Route path="configuracion" element={<Configuracion />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}