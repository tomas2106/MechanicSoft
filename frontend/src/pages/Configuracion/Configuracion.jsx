import { useState } from "react";
import { Copy, Check, Camera, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { compressImage } from "../../utils/imageCompressor";

export default function Configuracion() {
  const { taller, actualizarTaller } = useAuth();
  const [nombre, setNombre] = useState(taller?.nombre || "");
  const [ubicacion, setUbicacion] = useState(taller?.ubicacion || "");
  const [whatsapp, setWhatsapp] = useState(taller?.whatsapp || "");
  const [logoUrl, setLogoUrl] = useState(taller?.logoUrl || "");
  const [copiado, setCopiado] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const slug = nombre
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

  const handleGuardar = (e) => {
    e.preventDefault();
    actualizarTaller({ nombre, slug, ubicacion, whatsapp, logoUrl });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  };

  const copiarEnlace = () => {
    navigator.clipboard.writeText(enlacePublico);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Perfil del Taller</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Personaliza la identidad de tu taller y comparte el enlace directo con tus clientes
        </p>
      </div>

      <div className="card">
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
          Enlace directo para tus clientes
        </label>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.45rem" }}>
          <input className="input-field" value={enlacePublico} readOnly />
          <button type="button" onClick={copiarEnlace} className="btn-secondary">
            {copiado ? <Check size={17} color="#059669" /> : <Copy size={17} />}
            {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      <form onSubmit={handleGuardar} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover" }} />
          ) : (
            <div className="taller-logo-lg">{(nombre || "M").charAt(0).toUpperCase()}</div>
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

        <div className="form-group">
          <label>WhatsApp del taller (con indicativo, ej: 573001234567)</label>
          <input className="input-field" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Dirección o enlace de Google Maps</label>
          <input
            className="input-field"
            placeholder="Ej: Cra 10 # 25-30, Soacha"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary">
          <Save size={17} /> {guardado ? "¡Cambios guardados!" : "Guardar perfil del taller"}
        </button>
      </form>
    </div>
  );
}