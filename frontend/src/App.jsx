import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";

import PortalCliente from "./pages/Publico/PortalCliente";
import Login from "./pages/Login/Login";
import SuperAdmin from "./pages/SuperAdmin/SuperAdmin";
import Tablero from "./pages/Tablero/Tablero";
import Recepcion from "./pages/Recepcion/Recepcion";
import Vehiculos from "./pages/Vehiculos/Vehiculos";
import Clientes from "./pages/Clientes/Clientes";
import Configuracion from "./pages/Configuracion/Configuracion";

function RutaProtegida({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas para clientes */}
        <Route path="/" element={<PortalCliente />} />
        <Route path="/t/:slugTaller" element={<PortalCliente />} />
        <Route path="/login" element={<Login />} />

        {/* Consola Super Admin (Tú) */}
        <Route
          path="/superadmin"
          element={
            <RutaProtegida>
              <SuperAdmin />
            </RutaProtegida>
          }
        />

        {/* Panel Operativo de cada Taller */}
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
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}