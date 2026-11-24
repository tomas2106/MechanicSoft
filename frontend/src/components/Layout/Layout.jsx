import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Bike,
  Users,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

export default function Layout() {
  const { user, taller, cerrarSesion } = useAuth();
  const esAdminTaller = user?.rol === "ADMIN_TALLER";
  const tallerKey = taller?.id || "default";

  const empleadosEditanInventario =
    Boolean(taller?.empleadosEditanInventario) ||
    localStorage.getItem(`ms_perm_inv_${tallerKey}`) === "true";

  const mostrarModuloInventario =
    taller?.tieneInventario !== false && (esAdminTaller || empleadosEditanInventario);

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
              {user?.nombre} • {esAdminTaller ? "Administrador" : "Mecánico"}
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
        {mostrarModuloInventario && (
          <NavLink to="/panel/ventas" className="nav-item">
            {esAdminTaller ? <ShoppingCart size={17} /> : <Package size={17} />}
            {esAdminTaller ? " Ventas" : " Inventario"}
          </NavLink>
        )}
        {esAdminTaller && (
          <NavLink to="/panel/configuracion" className="nav-item">
            <Settings size={17} /> Taller
          </NavLink>
        )}
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
        {mostrarModuloInventario ? (
          <NavLink to="/panel/ventas" className="mobile-nav-item">
            {esAdminTaller ? <ShoppingCart size={20} /> : <Package size={20} />}
            <span>{esAdminTaller ? "Ventas" : "Inventario"}</span>
          </NavLink>
        ) : (
          <NavLink to="/panel/clientes" className="mobile-nav-item">
            <Users size={20} />
            <span>Clientes</span>
          </NavLink>
        )}
        {esAdminTaller && (
          <NavLink to="/panel/configuracion" className="mobile-nav-item">
            <Settings size={20} />
            <span>Taller</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
}