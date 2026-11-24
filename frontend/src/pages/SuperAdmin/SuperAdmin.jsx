import { useEffect, useState } from "react";
import {
  Store,
  Plus,
  LogOut,
  Eye,
  EyeOff,
  Users,
  Power,
  Package,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function SuperAdmin() {
  const { user, cerrarSesion } = useAuth();
  const [talleres, setTalleres] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tallerExpandidoId, setTallerExpandidoId] = useState(null);
  const [mostrarClaves, setMostrarClaves] = useState({});
  const [mensaje, setMensaje] = useState("");

  const [nuevoTaller, setNuevoTaller] = useState({
    nombreTaller: "",
    nombreAdmin: "",
    email: "",
    password: "",
    ubicacion: "",
    whatsapp: "",
    esMecanico: true,
    tieneInventario: true,
  });

  const cargarTalleres = () => {
    setCargando(true);
    api
      .get("/superadmin/talleres")
      .then((res) => setTalleres(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTalleres([]))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarTalleres();
  }, []);

  const crearTaller = async (e) => {
    e.preventDefault();
    try {
      await api.post("/superadmin/talleres", nuevoTaller);
      setNuevoTaller({
        nombreTaller: "",
        nombreAdmin: "",
        email: "",
        password: "",
        ubicacion: "",
        whatsapp: "",
        esMecanico: true,
        tieneInventario: true,
      });
      setMensaje("Taller y cuenta administradora creados correctamente.");
      cargarTalleres();
    } catch (err) {
      alert(err.response?.data?.message || "Error al crear taller.");
    }
  };

  const alternarEstado = async (id) => {
    await api.patch(`/superadmin/talleres/${id}/estado`);
    cargarTalleres();
  };

  const alternarInventario = async (id) => {
    await api.patch(`/superadmin/talleres/${id}/inventario`);
    cargarTalleres();
  };

  const toggleClave = (key) => {
    setMostrarClaves((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)" }}>
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-wordmark" style={{ fontSize: "1.05rem" }}>
            MECHANIC<span>SOFT</span>
          </div>
          <span style={{ color: "var(--border-color)" }}>|</span>
          <div>
            <h1 className="taller-title">Administración Central de Talleres</h1>
            <span className="user-role">{user?.nombre || "Operación Central"}</span>
          </div>
        </div>
        <button onClick={cerrarSesion} className="icon-btn" style={{ color: "var(--danger)" }} title="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </header>

      <main className="main-content" style={{ maxWidth: 1040, margin: "0 auto" }}>
        {mensaje && (
          <div
            style={{
              backgroundColor: "var(--primary-soft)",
              border: "1px solid var(--accent-brand)",
              color: "var(--accent-brand)",
              padding: "0.75rem 1rem",
              borderRadius: 8,
              marginBottom: "1rem",
              fontWeight: 600,
              fontSize: "0.88rem",
            }}
          >
            {mensaje}
          </div>
        )}

        {/* Formulario Registrar Nuevo Taller */}
        <form onSubmit={crearTaller} className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <Plus size={18} color="var(--accent-brand)" /> Registrar Nuevo Taller
          </h2>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Nombre del taller *</label>
              <input
                className="input-field"
                placeholder="Ej: Piston Race"
                value={nuevoTaller.nombreTaller}
                onChange={(e) => setNuevoTaller({ ...nuevoTaller, nombreTaller: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Nombre del administrador / dueño *</label>
              <input
                className="input-field"
                placeholder="Ej: Andrés Gómez"
                value={nuevoTaller.nombreAdmin}
                onChange={(e) => setNuevoTaller({ ...nuevoTaller, nombreAdmin: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Correo de acceso *</label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@taller.com"
                value={nuevoTaller.email}
                onChange={(e) => setNuevoTaller({ ...nuevoTaller, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña inicial *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Contraseña"
                value={nuevoTaller.password}
                onChange={(e) => setNuevoTaller({ ...nuevoTaller, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Ubicación / Ciudad</label>
              <input
                className="input-field"
                placeholder="Ej: Soacha"
                value={nuevoTaller.ubicacion}
                onChange={(e) => setNuevoTaller({ ...nuevoTaller, ubicacion: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>WhatsApp Colombia (sin +57)</label>
              <input
                className="input-field"
                placeholder="3001234567"
                value={nuevoTaller.whatsapp}
                onChange={(e) => setNuevoTaller({ ...nuevoTaller, whatsapp: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn-accent">
            <Store size={16} /> Crear taller y credenciales
          </button>
        </form>

        {/* Listado de Talleres con Contraseñas y Trabajadores */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <h2 style={{ fontSize: "1.12rem", fontWeight: 800 }}>
            Talleres Registrados ({talleres.length})
          </h2>

          {cargando ? (
            <div className="card">Cargando talleres...</div>
          ) : (
            talleres.map((t) => {
              const expandido = tallerExpandidoId === t.id;
              const equipo = Array.isArray(t.equipo) ? t.equipo : [];
              const claveVisible = Boolean(mostrarClaves[`t-${t.id}`]);

              return (
                <div key={t.id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <strong style={{ fontSize: "1.05rem" }}>{t.nombre}</strong>
                        <span className={`status-pill ${t.activo ? "status-LISTO_PARA_ENTREGA" : "status-CANCELADO"}`}>
                          {t.activo ? "Activo" : "Suspendido"}
                        </span>
                        <span style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                          • {equipo.length} usuario(s) en equipo
                        </span>
                      </div>

                      <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginTop: "0.3rem", display: "flex", flexWrap: "wrap", gap: "0.9rem" }}>
                        <span><MapPin size={13} style={{ verticalAlign: "middle" }} /> {t.ubicacion || "Sin ubicación"}</span>
                        <span><Mail size={13} style={{ verticalAlign: "middle" }} /> {t.email}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                          <KeyRound size={13} color="var(--accent-brand)" /> Contraseña Admin:{" "}
                          <strong style={{ color: "var(--text-primary)" }}>
                            {claveVisible ? t.password || "(sin clave)" : "••••••••"}
                          </strong>
                          <button
                            type="button"
                            onClick={() => toggleClave(`t-${t.id}`)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-brand)" }}
                            title={claveVisible ? "Ocultar contraseña" : "Ver contraseña"}
                          >
                            {claveVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => setTallerExpandidoId(expandido ? null : t.id)}
                        className="btn-secondary"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <Users size={15} /> {expandido ? "Ocultar equipo" : `Ver trabajadores (${equipo.length})`}
                        {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => alternarInventario(t.id)}
                        className="btn-secondary"
                        style={{ fontSize: "0.8rem" }}
                      >
                        <Package size={15} /> {t.tieneInventario ? "Inv: Sí" : "Inv: No"}
                      </button>

                      <button
                        type="button"
                        onClick={() => alternarEstado(t.id)}
                        className="btn-secondary"
                        style={{ fontSize: "0.8rem", color: t.activo ? "var(--danger)" : "var(--accent-brand)" }}
                      >
                        <Power size={15} /> {t.activo ? "Suspender" : "Activar"}
                      </button>
                    </div>
                  </div>

                  {/* Detalle de Trabajadores y sus contraseñas */}
                  {expandido && (
                    <div
                      style={{
                        marginTop: "0.9rem",
                        paddingTop: "0.85rem",
                        borderTop: "1px solid var(--border-color)",
                      }}
                    >
                      <strong style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.5rem" }}>
                        Integrantes y credenciales registradas en {t.nombre}:
                      </strong>
                      {equipo.length === 0 ? (
                        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                          Este taller aún no tiene trabajadores adicionales registrados.
                        </p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          {equipo.map((u) => {
                            const verClaveUser = Boolean(mostrarClaves[`u-${u.id}`]);
                            return (
                              <div
                                key={u.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                  gap: "0.5rem",
                                  padding: "0.55rem 0.75rem",
                                  backgroundColor: "var(--bg-app)",
                                  borderRadius: 8,
                                  border: "1px solid var(--border-color)",
                                  fontSize: "0.83rem",
                                }}
                              >
                                <div>
                                  <strong>{u.nombre}</strong>{" "}
                                  <span className="status-pill" style={{ fontSize: "0.7rem" }}>
                                    {u.rol === "ADMIN_TALLER" ? "Administrador" : "Trabajador / Mecánico"}
                                  </span>
                                  <span style={{ color: "var(--text-secondary)", marginLeft: "0.5rem" }}>
                                    {u.email}
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                  <span>Clave:</span>
                                  <strong>{verClaveUser ? u.password : "••••••"}</strong>
                                  <button
                                    type="button"
                                    onClick={() => toggleClave(`u-${u.id}`)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-brand)" }}
                                  >
                                    {verClaveUser ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}