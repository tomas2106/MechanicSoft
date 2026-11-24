import { useEffect, useState } from "react";
import { Plus, Copy, Check, Power, LogOut, Package, CreditCard, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { normalizarTelefonoCO, formatoVisibleCO } from "../../utils/phoneCO";
import api from "../../services/api";

export default function SuperAdmin() {
  const { user, cerrarSesion } = useAuth();
  const [talleres, setTalleres] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [copiadoId, setCopiadoId] = useState(null);
  const [creando, setCreando] = useState(false);
  const [guardandoPlanes, setGuardandoPlanes] = useState(false);
  const [avisoPlanes, setAvisoPlanes] = useState("");

  const [form, setForm] = useState({
    nombreTaller: "",
    nombreAdmin: "",
    email: "",
    password: "",
    ubicacion: "",
    whatsapp: "",
    esMecanico: true,
    tieneInventario: true,
  });

  const cargarDatos = async () => {
    try {
      const [resTalleres, resPlanes] = await Promise.all([
        api.get("/superadmin/talleres"),
        api.get("/public/planes"),
      ]);
      setTalleres(Array.isArray(resTalleres.data) ? resTalleres.data : []);
      setPlanes(Array.isArray(resPlanes.data) ? resPlanes.data : []);
    } catch {}
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      await api.post("/superadmin/talleres", {
        ...form,
        whatsapp: normalizarTelefonoCO(form.whatsapp),
      });
      setForm({
        nombreTaller: "",
        nombreAdmin: "",
        email: "",
        password: "",
        ubicacion: "",
        whatsapp: "",
        esMecanico: true,
        tieneInventario: true,
      });
      await cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || "Error al crear taller");
    } finally {
      setCreando(false);
    }
  };

  const actualizarCampoPlan = (idx, campo, valor) => {
    setPlanes((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [campo]: valor } : p))
    );
  };

  const guardarPlanesEnBackend = async (e) => {
    e.preventDefault();
    setGuardandoPlanes(true);
    setAvisoPlanes("");
    try {
      const res = await api.put("/superadmin/planes", planes);
      if (Array.isArray(res.data)) setPlanes(res.data);
      setAvisoPlanes("Información de planes mensuales y anuales actualizada.");
    } catch {
      setAvisoPlanes("No se pudo guardar la configuración de planes.");
    } finally {
      setGuardandoPlanes(false);
    }
  };

  const toggleActivo = async (id) => {
    await api.patch(`/superadmin/talleres/${id}/estado`);
    cargarDatos();
  };

  const toggleInventario = async (id) => {
    await api.patch(`/superadmin/talleres/${id}/inventario`);
    cargarDatos();
  };

  const copiarCredenciales = (t) => {
    const texto = `Bienvenido a *MechanicSoft*\nTaller: ${t.nombre}\nUbicación: ${t.ubicacion || ""}\nWhatsApp: +${t.whatsapp || ""}\nPlan Inventario/Ventas: ${t.tieneInventario ? "Habilitado" : "No incluido"}\nAcceso: ${window.location.origin}/login\nCorreo: ${t.email}\nPortal clientes: ${window.location.origin}/t/${t.slug}`;
    navigator.clipboard.writeText(texto);
    setCopiadoId(t.id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-app)" }}>
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-wordmark">
            MECHANIC<span>SOFT</span>
          </div>
          <span style={{ color: "var(--border-color)" }}>|</span>
          <div>
            <strong style={{ fontSize: "0.95rem" }}>Consola Super Admin</strong>
            <span className="user-role">{user?.nombre} • Control Central</span>
          </div>
        </div>

        <button onClick={cerrarSesion} className="btn-secondary" style={{ color: "var(--danger)" }}>
          <LogOut size={16} /> Salir
        </button>
      </header>

      <main style={{ maxWidth: 1020, margin: "0 auto", padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Crear Taller */}
        <form onSubmit={handleCrear} className="card">
          <h2 style={{ fontSize: "1.12rem", fontWeight: 800, marginBottom: "1rem" }}>
            Registrar y Habilitar Taller
          </h2>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Nombre del Taller *</label>
              <input className="input-field" placeholder="Ej: MotoServicio El Rayo" value={form.nombreTaller} onChange={(e) => setForm({ ...form, nombreTaller: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Nombre del Dueño / Admin *</label>
              <input className="input-field" placeholder="Ej: Andrés Gómez" value={form.nombreAdmin} onChange={(e) => setForm({ ...form, nombreAdmin: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Correo de acceso *</label>
              <input type="email" className="input-field" placeholder="taller@correo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Contraseña asignada *</label>
              <input type="password" className="input-field" placeholder="Contraseña segura" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>WhatsApp Colombia (se guarda con +57)</label>
              <input className="input-field" placeholder="3001234567" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              {form.whatsapp && (
                <span style={{ fontSize: "0.75rem", color: "var(--accent-brand)", fontWeight: 600 }}>
                  Se guardará como: {formatoVisibleCO(form.whatsapp)}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Ubicación (Ciudad / Sector)</label>
              <input className="input-field" placeholder="Ej: Soacha, Cundinamarca" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", margin: "0.4rem 0 1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.88rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.esMecanico} onChange={(e) => setForm({ ...form, esMecanico: e.target.checked })} />
              Dueño también opera como mecánico
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.88rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.tieneInventario} onChange={(e) => setForm({ ...form, tieneInventario: e.target.checked })} />
              Habilitar módulo de Inventario y Ventas
            </label>
          </div>

          <button type="submit" className="btn-accent" disabled={creando}>
            <Plus size={17} /> {creando ? "Creando..." : "Crear taller"}
          </button>
        </form>

        {/* Configuración de Planes Mensuales y Anuales */}
        <form onSubmit={guardarPlanesEnBackend} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CreditCard size={18} color="var(--accent-brand)" />
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                Planes Mensuales y Anualidades (Visible en Página Pública)
              </h2>
            </div>
            {avisoPlanes && (
              <span style={{ fontSize: "0.82rem", color: "var(--accent-brand)", fontWeight: 600 }}>
                {avisoPlanes}
              </span>
            )}
          </div>

          <div className="form-grid-2">
            {planes.map((plan, idx) => (
              <div
                key={plan.codigo || idx}
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: 10,
                  padding: "1rem",
                  backgroundColor: "var(--bg-app)",
                }}
              >
                <div className="form-group">
                  <label>Nombre del plan ({plan.periodicidad || "Plan"})</label>
                  <input className="input-field" value={plan.nombre || ""} onChange={(e) => actualizarCampoPlan(idx, "nombre", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Valor / Periodicidad</label>
                  <input className="input-field" value={plan.precioTexto || ""} onChange={(e) => actualizarCampoPlan(idx, "precioTexto", e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Descripción del plan</label>
                  <textarea className="input-field" rows={2} value={plan.descripcion || ""} onChange={(e) => actualizarCampoPlan(idx, "descripcion", e.target.value)} />
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary" disabled={guardandoPlanes} style={{ marginTop: "1rem" }}>
            <Save size={16} /> {guardandoPlanes ? "Guardando planes..." : "Guardar información de planes"}
          </button>
        </form>

        {/* Listado Claro y Diferenciado de Talleres */}
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Taller y Ubicación</th>
                <th>Técnico y Jornada</th>
                <th>Cuenta y Plan</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {talleres.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong style={{ fontSize: "0.95rem" }}>{t.nombre}</strong>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      Ubicación: {t.ubicacion || "No definida"} • Ruta: /t/{t.slug}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.84rem", fontWeight: 600 }}>
                      Técnico: {t.tecnicoNombre || "Asignado"}
                    </div>
                    <span
                      className="status-pill"
                      style={{
                        marginTop: "0.25rem",
                        display: "inline-block",
                        backgroundColor: t.abiertoHoy ? "#dcfce7" : "#e4e4e7",
                        color: t.abiertoHoy ? "#166534" : "#3f3f46",
                      }}
                    >
                      {t.abiertoHoy ? "Trabajando ahora mismo" : "Jornada no iniciada"}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.82rem" }}>
                      <strong>Correo:</strong> {t.email}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      WhatsApp: {t.whatsapp ? formatoVisibleCO(t.whatsapp) : "Sin número"} •{" "}
                      <strong style={{ color: "var(--accent-brand)" }}>
                        {t.tieneInventario ? "Con Inventario/Ventas" : "Plan Base"}
                      </strong>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                      <span className={`status-pill ${t.activo ? "status-LISTO_PARA_ENTREGA" : "status-RECIBIDO"}`}>
                        {t.activo ? "Activo" : "Suspendido"}
                      </span>
                      <button onClick={() => copiarCredenciales(t)} className="btn-secondary" style={{ fontSize: "0.8rem" }}>
                        {copiadoId === t.id ? <Check size={14} /> : <Copy size={14} />}
                        {copiadoId === t.id ? "Copiado" : "Enlace"}
                      </button>
                      <button
                        onClick={() => toggleInventario(t.id)}
                        className="icon-btn"
                        title="Habilitar/deshabilitar inventario"
                        style={{ color: t.tieneInventario ? "var(--accent-brand)" : "var(--text-muted)" }}
                      >
                        <Package size={15} />
                      </button>
                      <button onClick={() => toggleActivo(t.id)} className="icon-btn" title="Activar/suspender cuenta">
                        <Power size={15} />
                      </button>
                    </div>
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