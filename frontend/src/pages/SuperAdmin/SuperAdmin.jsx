import { useEffect, useState } from "react";
import { Plus, Copy, Check, Power, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

export default function SuperAdmin() {
  const { user, cerrarSesion } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [talleres, setTalleres] = useState([]);
  const [copiadoId, setCopiadoId] = useState(null);
  const [creando, setCreando] = useState(false);

  const [form, setForm] = useState({
    nombreTaller: "",
    nombreAdmin: "",
    email: "",
    password: "",
    ubicacion: "",
    whatsapp: "",
    esMecanico: true,
  });

  const cargarTalleres = async () => {
    const res = await api.get("/superadmin/talleres");
    setTalleres(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    cargarTalleres();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      await api.post("/superadmin/talleres", form);
      setForm({
        nombreTaller: "",
        nombreAdmin: "",
        email: "",
        password: "",
        ubicacion: "",
        whatsapp: "",
        esMecanico: true,
      });
      await cargarTalleres();
    } catch (err) {
      alert(err.response?.data?.message || "Error al crear taller");
    } finally {
      setCreando(false);
    }
  };

  const toggleActivo = async (id) => {
    await api.patch(`/superadmin/talleres/${id}/estado`);
    cargarTalleres();
  };

  const copiarCredenciales = (t) => {
    const texto = `Bienvenido a *MechanicSoft*\nTaller: ${t.nombre}\nEnlace de acceso: ${window.location.origin}/login\nUsuario: ${t.email}\nContraseña: ${t.password}\nEnlace público para tus clientes: ${window.location.origin}/t/${t.slug}`;
    navigator.clipboard.writeText(texto);
    setCopiadoId(t.id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)" }}>
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <span className="brand-monogram" style={{ width: 34, height: 34, fontSize: "0.85rem" }}>
            MS
          </span>
          <div>
            <strong style={{ fontSize: "1rem" }}>MechanicSoft Central</strong>
            <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Super Admin • {user?.nombre}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={toggleTheme} className="icon-btn">
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button onClick={cerrarSesion} className="btn-secondary" style={{ color: "var(--danger)" }}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <form onSubmit={handleCrear} className="card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Habilitar Nuevo Taller
          </h2>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Nombre del Taller *</label>
              <input
                className="input-field"
                placeholder="Ej: MotoServicio El Rayo"
                value={form.nombreTaller}
                onChange={(e) => setForm({ ...form, nombreTaller: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Nombre del Dueño / Responsable *</label>
              <input
                className="input-field"
                placeholder="Ej: Andrés Gómez"
                value={form.nombreAdmin}
                onChange={(e) => setForm({ ...form, nombreAdmin: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Correo de acceso *</label>
              <input
                type="email"
                className="input-field"
                placeholder="taller@correo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña asignada *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ej: Rayo2026*"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>WhatsApp del taller</label>
              <input
                className="input-field"
                placeholder="573001234567"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Ubicación</label>
              <input
                className="input-field"
                placeholder="Ciudad / Dirección"
                value={form.ubicacion}
                onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
              />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.88rem", margin: "0.5rem 0 1rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.esMecanico}
              onChange={(e) => setForm({ ...form, esMecanico: e.target.checked })}
            />
            El dueño también opera como mecánico en este taller
          </label>

          <button type="submit" className="btn-primary" disabled={creando}>
            <Plus size={17} /> {creando ? "Creando taller..." : "Crear taller y generar credenciales"}
          </button>
        </form>

        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Taller</th>
                <th>Credenciales</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {talleres.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.nombre}</strong>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      /t/{t.slug}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>{t.email}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      Clave: {t.password}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${t.activo ? "status-LISTO_PARA_ENTREGA" : "status-RECIBIDO"}`}>
                      {t.activo ? "Activo" : "Suspendido"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      onClick={() => copiarCredenciales(t)}
                      className="btn-secondary"
                      title="Copiar credenciales para enviar"
                    >
                      {copiadoId === t.id ? <Check size={15} color="#166534" /> : <Copy size={15} />}
                      {copiadoId === t.id ? "Copiado" : "Invitar"}
                    </button>
                    <button
                      onClick={() => toggleActivo(t.id)}
                      className="icon-btn"
                      title={t.activo ? "Suspender acceso" : "Activar acceso"}
                    >
                      <Power size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}