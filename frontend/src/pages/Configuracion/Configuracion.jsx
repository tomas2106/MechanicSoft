import { useEffect, useState } from "react";
import { Copy, Check, Camera, Save, UserPlus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { compressImage } from "../../utils/imageCompressor";
import api from "../../services/api";

export default function Configuracion() {
  const { user, taller, actualizarTaller } = useAuth();
  const [nombre, setNombre] = useState(taller?.nombre || "");
  const [ubicacion, setUbicacion] = useState(taller?.ubicacion || "");
  const [whatsapp, setWhatsapp] = useState(taller?.whatsapp || "");
  const [logoUrl, setLogoUrl] = useState(taller?.logoUrl || "");
  const [copiado, setCopiado] = useState(false);
  const [guardado, setGuardado] = useState(false);

  // Equipo de trabajo del taller
  const [equipo, setEquipo] = useState([]);
  const [nuevoMiembro, setNuevoMiembro] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "MECANICO",
  });

  const cargarEquipo = async () => {
    if (!taller?.id) return;
    try {
      const res = await api.get(`/talleres/${taller.id}/equipo`);
      setEquipo(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  useEffect(() => {
    cargarEquipo();
  }, [taller?.id]);

  const slug =
    nombre
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "mi-taller";

  const enlacePublico = `${window.location.origin}/t/${slug}`;

  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const comprimida = await compressImage(file, { maxWidth: 400, quality: 0.8 });
    const reader = new FileReader();
    reader.onloadend = () => setLogoUrl(reader.result);
    reader.readAsDataURL(comprimida);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (taller?.id) {
        await api.put(`/talleres/${taller.id}`, {
          nombre,
          slug,
          ubicacion,
          whatsapp,
          logoUrl,
        });
      }
      actualizarTaller({ nombre, slug, ubicacion, whatsapp, logoUrl });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } catch (err) {
      alert("Error al guardar perfil: " + err.message);
    }
  };

  const agregarTrabajador = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/talleres/${taller.id}/equipo`, {
        ...nuevoMiembro,
        esMecanico: true,
      });
      setNuevoMiembro({ nombre: "", email: "", password: "", rol: "MECANICO" });
      cargarEquipo();
    } catch (err) {
      alert(err.response?.data?.message || "No se pudo agregar al trabajador");
    }
  };

  const quitarTrabajador = async (id) => {
    await api.delete(`/talleres/equipo/${id}`);
    cargarEquipo();
  };

  const copiarEnlace = () => {
    navigator.clipboard.writeText(enlacePublico);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Configuración del Taller</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Identidad comercial, enlace para clientes y equipo de trabajo
        </p>
      </div>

      <div className="card">
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
          Enlace directo para tus clientes
        </label>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.45rem" }}>
          <input className="input-field" value={enlacePublico} readOnly />
          <button type="button" onClick={copiarEnlace} className="btn-secondary">
            {copiado ? <Check size={17} color="#166534" /> : <Copy size={17} />}
            {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      <form onSubmit={handleGuardar} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 className="section-title">Perfil Público</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover" }} />
          ) : (
            <div className="taller-logo-lg" style={{ backgroundColor: "var(--accent-brand)" }}>
              {(nombre || "M").charAt(0).toUpperCase()}
            </div>
          )}
          <label className="btn-secondary">
            <Camera size={16} /> Cambiar logo
            <input type="file" accept="image/*" onChange={handleLogo} hidden />
          </label>
        </div>

        <div className="form-group">
          <label>Nombre comercial del taller</label>
          <input className="input-field" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label>WhatsApp del taller (ej: 573001234567)</label>
            <input className="input-field" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Dirección o Google Maps</label>
            <input
              className="input-field"
              placeholder="Ej: Cra 10 # 25-30, Soacha"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary">
          <Save size={17} /> {guardado ? "¡Cambios guardados!" : "Guardar perfil del taller"}
        </button>
      </form>

      {/* Sección Equipo de Trabajo (Solo visible para el Dueño / Admin del Taller) */}
      {user?.rol !== "MECANICO" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <h3 className="section-title" style={{ marginBottom: "0.25rem" }}>
              Equipo y Mecánicos del Taller
            </h3>
            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
              Crea accesos para tus mecánicos o administradores. Tú ya tienes permisos para operar motos.
            </p>
          </div>

          <form onSubmit={agregarTrabajador} className="form-grid-2">
            <input
              className="input-field"
              placeholder="Nombre del trabajador *"
              value={nuevoMiembro.nombre}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, nombre: e.target.value })}
              required
            />
            <select
              className="input-field"
              value={nuevoMiembro.rol}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, rol: e.target.value })}
            >
              <option value="MECANICO">Mecánico (Operativo)</option>
              <option value="ADMIN_TALLER">Administrador (Total)</option>
            </select>
            <input
              type="email"
              className="input-field"
              placeholder="Correo de acceso *"
              value={nuevoMiembro.email}
              onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, email: e.target.value })}
              required
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                className="input-field"
                placeholder="Contraseña *"
                value={nuevoMiembro.password}
                onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, password: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary" title="Agregar trabajador">
                <UserPlus size={17} />
              </button>
            </div>
          </form>

          {equipo.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {equipo.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.6rem 0.75rem",
                    backgroundColor: "var(--bg-app)",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "0.9rem" }}>{m.nombre}</strong>
                    <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      {m.email} • {m.rol === "ADMIN_TALLER" ? "Dueño / Admin" : "Mecánico"}
                    </span>
                  </div>
                  {m.id !== user?.id && (
                    <button onClick={() => quitarTrabajador(m.id)} className="icon-btn" style={{ color: "var(--danger)" }}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}