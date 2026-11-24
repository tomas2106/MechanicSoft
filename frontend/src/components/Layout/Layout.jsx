import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Bike,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

export default function Layout() {
  const { user, taller, cerrarSesion } = useAuth();
  const mostrarVentas = taller?.tieneInventario !== false;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-wordmark" style={{ fontSize: "1.05rem" }}>
            MECHANIC<span>SOFT</span>
          </div>
          <span style={{ color: "var(--border-color)" }}>|</span>
          <div>
            <h1 className="taller-title">{taller?.nombre || "Taller"}</h1>
            <span className="user-role">
              {user?.nombre} • {user?.rol === "MECANICO" ? "Mecánico" : "Administrador"}
            </span>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            onClick={cerrarSesion}
            className="icon-btn"
            title="Cerrar sesión"
            style={{ color: "var(--danger)" }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <nav className="desktop-nav">
        <NavLink to="/panel" end className="nav-item">
          <LayoutDashboard size={17} /> Tablero
        </NavLink>
        <NavLink to="/panel/recepcion" className="nav-item">
          <PlusCircle size={17} /> Recepción
        </NavLink>
        <NavLink to="/panel/vehiculos" className="nav-item">
          <Bike size={17} /> Motos
        </NavLink>
        <NavLink to="/panel/clientes" className="nav-item">
          <Users size={17} /> Clientes
        </NavLink>
        {mostrarVentas && (
          <NavLink to="/panel/ventas" className="nav-item">
            <ShoppingCart size={17} /> Ventas
          </NavLink>
        )}
        <NavLink to="/panel/configuracion" className="nav-item">
          <Settings size={17} /> Taller
        </NavLink>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="mobile-bottom-nav">
        <NavLink to="/panel" end className="mobile-nav-item">
          <LayoutDashboard size={20} />
          <span>Tablero</span>
        </NavLink>
        <NavLink to="/panel/recepcion" className="mobile-nav-item">
          <PlusCircle size={20} />
          <span>Ingreso</span>
        </NavLink>
        <NavLink to="/panel/vehiculos" className="mobile-nav-item">
          <Bike size={20} />
          <span>Motos</span>
        </NavLink>
        {mostrarVentas ? (
          <NavLink to="/panel/ventas" className="mobile-nav-item">
            <ShoppingCart size={20} />
            <span>Ventas</span>
          </NavLink>
        ) : (
          <NavLink to="/panel/clientes" className="mobile-nav-item">
            <Users size={20} />
            <span>Clientes</span>
          </NavLink>
        )}
        <NavLink to="/panel/configuracion" className="mobile-nav-item">
          <Settings size={20} />
          <span>Taller</span>
        </NavLink>
      </nav>
    </div>
  );
}