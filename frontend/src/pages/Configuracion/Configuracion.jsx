import { useEffect, useState } from "react";
import { Save, ExternalLink, Copy, Check, ImagePlus, Trash2, Lock, UserPlus, Users, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { normalizarTelefonoCO, formatoVisibleCO } from "../../utils/phoneCO";
import api from "../../services/api";

const comprimirLogoTaller = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 480;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function Configuracion() {
  const { user, taller, actualizarTaller } = useAuth();
  const esAdminTaller = user?.rol === "ADMIN_TALLER";

  const [form, setForm] = useState({
    nombre: "",
    slug: "",
    ubicacion: "",
    whatsapp: "",
    logoUrl: "",
    citasHabilitadas: true,
    cuposDiarios: 8,
    empleadosEditanInventario: false,
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [copiado, setCopiado] = useState(false);

  // Gestión de trabajadores del taller
  const [equipo, setEquipo] = useState([]);
  const [nuevoTrabajador, setNuevoTrabajador] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [guardandoTrabajador, setGuardandoTrabajador] = useState(false);

  // Cambio de contraseña del administrador
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const cargarEquipo = () => {
    if (!taller?.id) return;
    api
      .get(`/talleres/${taller.id}/equipo`)
      .then((res) => setEquipo(Array.isArray(res.data) ? res.data : []))
      .catch(() => setEquipo([]));
  };

  useEffect(() => {
    if (taller) {
      const permInvLocal = localStorage.getItem(`ms_perm_inv_${taller.id}`) === "true";
      setForm({
        nombre: taller.nombre || "",
        slug: taller.slug || "",
        ubicacion: taller.ubicacion || "",
        whatsapp: taller.whatsapp || "",
        logoUrl: taller.logoUrl || "",
        citasHabilitadas: taller.citasHabilitadas !== false,
        cuposDiarios: taller.cuposDiarios ?? 8,
        empleadosEditanInventario: Boolean(taller.empleadosEditanInventario ?? permInvLocal),
      });
      cargarEquipo();
    }
  }, [taller]);

  if (!esAdminTaller) {
    return (
      <div className="card" style={{ maxWidth: 560, textAlign: "center", padding: "2rem" }}>
        <Lock size={34} color="var(--text-secondary)" style={{ margin: "0 auto 0.75rem" }} />
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "0.4rem" }}>
          Acceso restringido al Administrador del Taller
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Solo el administrador puede modificar el logotipo, datos del taller o agregar trabajadores.
        </p>
      </div>
    );
  }

  const handleSeleccionarFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await comprimirLogoTaller(file);
      setForm((prev) => ({ ...prev, logoUrl: dataUrl }));
    } catch {
      alert("No se pudo procesar la imagen seleccionada.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje("");

    try {
      const whatsappNormalizado = normalizarTelefonoCO(form.whatsapp);
      localStorage.setItem(`ms_perm_inv_${taller.id}`, String(form.empleadosEditanInventario));

      const payload = {
        ...form,
        whatsapp: whatsappNormalizado,
        cuposDiarios: Number(form.cuposDiarios) || 8,
      };
      const res = await api.put(`/talleres/${taller.id}`, payload);
      actualizarTaller({
        ...(res.data || payload),
        empleadosEditanInventario: form.empleadosEditanInventario,
      });
      setForm((prev) => ({ ...prev, whatsapp: whatsappNormalizado }));
      setMensaje("Configuración, permisos y foto del taller guardados correctamente.");
    } catch (err) {
      setMensaje(err.response?.data?.message || err.message || "Error al guardar configuración.");
    } finally {
      setGuardando(false);
    }
  };

  const agregarTrabajador = async (e) => {
    e.preventDefault();
    if (!nuevoTrabajador.nombre.trim() || !nuevoTrabajador.email.trim() || !nuevoTrabajador.password.trim()) {
      return;
    }
    setGuardandoTrabajador(true);
    try {
      await api.post(`/talleres/${taller.id}/equipo`, {
        nombre: nuevoTrabajador.nombre.trim(),
        email: nuevoTrabajador.email.trim().toLowerCase(),
        password: nuevoTrabajador.password.trim(),
        rol: "MECANICO",
        esMecanico: true,
      });
      setNuevoTrabajador({ nombre: "", email: "", password: "" });
      setMensaje("Trabajador registrado correctamente. Ya puede iniciar sesión con su correo y contraseña.");
      cargarEquipo();
    } catch (err) {
      alert(err.response?.data?.message || "No se pudo registrar el trabajador.");
    } finally {
      setGuardandoTrabajador(false);
    }
  };

  const desactivarTrabajador = async (usuarioId) => {
    if (!window.confirm("¿Deseas desactivar el acceso de este trabajador?")) return;
    try {
      await api.delete(`/talleres/equipo/${usuarioId}`);
      setMensaje("Acceso del trabajador desactivado.");
      cargarEquipo();
    } catch {
      alert("No se pudo desactivar el trabajador.");
    }
  };

  const cambiarPasswordAdmin = async (e) => {
    e.preventDefault();
    if (nuevaPassword.trim().length < 4) {
      return alert("La nueva contraseña debe tener al menos 4 caracteres.");
    }
    setGuardandoPassword(true);
    try {
      await api.patch(`/talleres/${taller.id}/password`, { password: nuevaPassword.trim() });
      setNuevaPassword("");
      setMensaje("Contraseña de acceso actualizada correctamente.");
    } catch (err) {
      alert(err.response?.data?.message || "Error al cambiar contraseña.");
    } finally {
      setGuardandoPassword(false);
    }
  };

  const urlPortal = `${window.location.origin}/t/${form.slug || "general"}`;

  const copiarEnlace = () => {
    navigator.clipboard.writeText(urlPortal);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const trabajadoresActivos = equipo.filter((u) => u.rol === "MECANICO");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: 820 }}>
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Configuración del Taller y Equipo</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Administra los datos públicos, añade tus trabajadores y gestiona la seguridad de tu cuenta
        </p>
      </div>

      {mensaje && (
        <div
          style={{
            backgroundColor: "var(--primary-soft)",
            border: "1px solid var(--accent-brand)",
            color: "var(--accent-brand)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.88rem",
            fontWeight: 600,
          }}
        >
          {mensaje}
        </div>
      )}

      {/* Gestión de Trabajadores del Taller */}
      <div className="card">
        <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <Users size={18} color="var(--accent-brand)" /> Trabajadores / Mecánicos del Taller ({trabajadoresActivos.length})
        </h3>
        <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: "0.9rem" }}>
          Los trabajadores ingresan con su propio correo y contraseña: ven las motos activas, garantías y registran recepciones, sin ver cierres de caja ni ventas.
        </p>

        <form onSubmit={agregarTrabajador} className="form-grid-2" style={{ marginBottom: "1rem", alignItems: "end" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Nombre del trabajador *</label>
            <input
              className="input-field"
              placeholder="Ej: Carlos Rodríguez"
              value={nuevoTrabajador.nombre}
              onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, nombre: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Correo de ingreso *</label>
            <input
              type="email"
              className="input-field"
              placeholder="carlos@mitaller.com"
              value={nuevoTrabajador.email}
              onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Contraseña asignada *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Clave de acceso"
              value={nuevoTrabajador.password}
              onChange={(e) => setNuevoTrabajador({ ...nuevoTrabajador, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-accent" disabled={guardandoTrabajador}>
            <UserPlus size={16} /> {guardandoTrabajador ? "Registrando..." : "Añadir trabajador"}
          </button>
        </form>

        {trabajadoresActivos.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {trabajadoresActivos.map((trab) => (
              <div
                key={trab.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  padding: "0.65rem 0.85rem",
                  backgroundColor: "var(--bg-app)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  fontSize: "0.86rem",
                }}
              >
                <div>
                  <strong>{trab.nombre}</strong> • <span style={{ color: "var(--text-secondary)" }}>{trab.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => desactivarTrabajador(trab.id)}
                  className="btn-secondary"
                  style={{ color: "var(--danger)", fontSize: "0.78rem", padding: "0.3rem 0.65rem" }}
                >
                  <Trash2 size={14} /> Quitar acceso
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario Perfil y Permisos */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="card">
          <h3 className="section-title">Foto o Logotipo del Taller</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "1.1rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt={form.nombre || "Logo del taller"}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 14,
                  objectFit: "cover",
                  border: "2px solid var(--accent-brand)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 14,
                  backgroundColor: "var(--accent-brand)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 900,
                }}
              >
                {(form.nombre || "T").charAt(0).toUpperCase()}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label className="btn-secondary" style={{ cursor: "pointer", width: "fit-content" }}>
                <ImagePlus size={16} /> Subir foto desde dispositivo
                <input type="file" accept="image/*" onChange={handleSeleccionarFoto} style={{ display: "none" }} />
              </label>

              {form.logoUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoUrl: "" })}
                  className="btn-secondary"
                  style={{ color: "var(--danger)", width: "fit-content", fontSize: "0.8rem" }}
                >
                  <Trash2 size={14} /> Quitar foto
                </button>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>O pega una URL de imagen (opcional)</label>
            <input
              className="input-field"
              placeholder="https://..."
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Datos Generales y Contacto</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Nombre del taller *</label>
              <input
                className="input-field"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Identificador de enlace (slug) *</label>
              <input
                className="input-field"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Ciudad / Ubicación</label>
              <input
                className="input-field"
                placeholder="Ej: Soacha, Cundinamarca"
                value={form.ubicacion}
                onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>WhatsApp Colombia (se guarda con +57)</label>
              <input
                className="input-field"
                placeholder="Ej: 3001234567"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
              {form.whatsapp && (
                <span style={{ fontSize: "0.76rem", color: "var(--accent-brand)", fontWeight: 600 }}>
                  Número registrado: {formatoVisibleCO(form.whatsapp)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Permisos de Trabajadores y Citas</h3>
          <label style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", marginBottom: "0.85rem" }}>
            <input
              type="checkbox"
              checked={form.empleadosEditanInventario}
              onChange={(e) => setForm({ ...form, empleadosEditanInventario: e.target.checked })}
            />
            Permitir que los trabajadores / mecánicos editen el inventario del taller
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", marginBottom: "0.9rem" }}>
            <input
              type="checkbox"
              checked={form.citasHabilitadas}
              onChange={(e) => setForm({ ...form, citasHabilitadas: e.target.checked })}
            />
            Habilitar que los clientes saquen cita y consulten disponibilidad
          </label>

          <div className="form-group" style={{ maxWidth: 260, marginBottom: 0 }}>
            <label>Cupos diarios disponibles por defecto</label>
            <input
              type="number"
              min="1"
              max="100"
              className="input-field"
              value={form.cuposDiarios}
              onChange={(e) => setForm({ ...form, cuposDiarios: e.target.value })}
            />
          </div>
        </div>

        <div className="card">
          <h3 className="section-title">Enlace Público del Taller</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <input className="input-field" style={{ flex: 1, minWidth: 220 }} value={urlPortal} readOnly />
            <button type="button" onClick={copiarEnlace} className="btn-secondary">
              {copiado ? <Check size={16} /> : <Copy size={16} />}
              {copiado ? "Copiado" : "Copiar"}
            </button>
            <a href={urlPortal} target="_blank" rel="noreferrer" className="btn-secondary" style={{ textDecoration: "none" }}>
              <ExternalLink size={16} /> Ver vista cliente
            </a>
          </div>
        </div>

        <button type="submit" className="btn-accent" disabled={guardando} style={{ width: "fit-content" }}>
          <Save size={17} /> {guardando ? "Guardando..." : "Guardar configuración"}
        </button>
      </form>

      {/* Cambiar contraseña del Administrador del Taller */}
      <form onSubmit={cambiarPasswordAdmin} className="card">
        <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
          <KeyRound size={17} color="var(--accent-brand)" /> Cambiar Contraseña de Administrador
        </h3>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            className="input-field"
            style={{ maxWidth: 280 }}
            placeholder="Nueva contraseña (mín. 4 caracteres)"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-secondary" disabled={guardandoPassword}>
            {guardandoPassword ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </div>
      </form>
    </div>
  );
}