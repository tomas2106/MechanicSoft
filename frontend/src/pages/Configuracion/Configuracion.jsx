import { useEffect, useState } from "react";
import { Save, ExternalLink, Copy, Check, ImagePlus, Trash2 } from "lucide-react";
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
  const { taller, actualizarTaller } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    slug: "",
    ubicacion: "",
    whatsapp: "",
    logoUrl: "",
    citasHabilitadas: true,
    cuposDiarios: 8,
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (taller) {
      setForm({
        nombre: taller.nombre || "",
        slug: taller.slug || "",
        ubicacion: taller.ubicacion || "",
        whatsapp: taller.whatsapp || "",
        logoUrl: taller.logoUrl || "",
        citasHabilitadas: taller.citasHabilitadas !== false,
        cuposDiarios: taller.cuposDiarios ?? 8,
      });
    }
  }, [taller]);

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
      const payload = {
        ...form,
        whatsapp: whatsappNormalizado,
        cuposDiarios: Number(form.cuposDiarios) || 8,
      };
      const res = await api.put(`/talleres/${taller.id}`, payload);
      actualizarTaller(res.data || payload);
      setForm((prev) => ({ ...prev, whatsapp: whatsappNormalizado }));
      setMensaje("Perfil y foto del taller guardados correctamente.");
    } catch (err) {
      setMensaje(err.response?.data?.message || err.message || "Error al guardar configuración.");
    } finally {
      setGuardando(false);
    }
  };

  const urlPortal = `${window.location.origin}/t/${form.slug || "general"}`;

  const copiarEnlace = () => {
    navigator.clipboard.writeText(urlPortal);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: 760 }}>
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Configuración del Taller</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Administra la foto del taller, los datos públicos, el WhatsApp (+57) y la agenda de citas
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

      {/* Foto o Logo del Taller */}
      <div className="card">
        <h3 className="section-title">Foto o Logotipo del Taller</h3>
        <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: "0.9rem" }}>
          Esta imagen aparecerá en el portal público cuando tus clientes consulten su moto o agenden cita.
        </p>

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
                backgroundColor: "var(--bg-app)",
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
            <label
              className="btn-secondary"
              style={{ cursor: "pointer", width: "fit-content" }}
            >
              <ImagePlus size={16} /> Subir foto desde dispositivo
              <input
                type="file"
                accept="image/*"
                onChange={handleSeleccionarFoto}
                style={{ display: "none" }}
              />
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

      {/* Datos Generales */}
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

      {/* Citas y Disponibilidad */}
      <div className="card">
        <h3 className="section-title">Citas y Disponibilidad de Clientes</h3>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "0.9rem",
          }}
        >
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

      {/* Enlace Público */}
      <div className="card">
        <h3 className="section-title">Enlace Público del Taller</h3>
        <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
          Comparte este enlace con tus clientes para que vean la información de tu taller, consulten su placa o agenden cita.
        </p>
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
  );
}