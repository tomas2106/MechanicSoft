import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Bike,
  Users,
  Settings,
  Sun,
  Moon,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import "./Layout.css";

const navItems = [
  { to: "/panel", label: "Tablero", icon: LayoutDashboard, end: true },
  { to: "/panel/recepcion", label: "Recepción", icon: PlusCircle },
  { to: "/panel/vehiculos", label: "Motos", icon: Bike },
  { to: "/panel/clientes", label: "Clientes", icon: Users },
  { to: "/panel/configuracion", label: "Taller", icon: Settings },
];

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { taller, cerrarSesion } = useAuth();
  const location = useLocation();

  const currentItem = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  return (
    <div className="layout-wrapper">
      {/* Sidebar Escritorio */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          {taller?.logoUrl ? (
            <img src={taller.logoUrl} alt={taller.nombre} className="taller-avatar" />
          ) : (
            <div className="taller-avatar">
              {(taller?.nombre || "M").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="taller-info">
            <h2>{taller?.nombre || "MechanicSoft"}</h2>
            <span>Panel Operativo</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to={`/t/${taller?.slug || "mi-taller"}`}
            target="_blank"
            className="nav-item"
          >
            <ExternalLink size={18} />
            <span>Vista Cliente</span>
          </NavLink>
          <button onClick={cerrarSesion} className="nav-item" style={{ color: "var(--danger)" }}>
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Área Principal */}
      <div className="main-area">
        <header className="topbar">
          <h1 className="topbar-title">{currentItem?.label || "MechanicSoft"}</h1>
          <div className="topbar-actions">
            <button
              onClick={toggleTheme}
              className="icon-btn"
              title={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Navegación Inferior Móvil */}
      <nav className="mobile-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}