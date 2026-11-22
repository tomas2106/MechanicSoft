import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Search, MapPin, MessageCircle, Sun, Moon, Lock } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { ordenService } from "../../services/ordenService";
import { tallerService } from "../../services/tallerService";
import "./PortalCliente.css";

const ETIQUETAS_ESTADO = {
  RECIBIDO: "Recibida en taller",
  DIAGNOSTICO: "En diagnóstico",
  EN_REPARACION: "En reparación",
  LISTO_PARA_ENTREGA: "Lista para entregar",
  ENTREGADO: "Entregada",
};

export default function PortalCliente() {
  const { slugTaller } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [talleres, setTalleres] = useState([]);
  const [tallerActual, setTallerActual] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    tallerService
      .listarPublicos()
      .then((res) => setTalleres(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slugTaller) {
      tallerService
        .obtenerPorSlug(slugTaller)
        .then((res) => setTallerActual(res.data))
        .catch(() => setTallerActual(null));
    } else {
      setTallerActual(null);
    }
  }, [slugTaller]);

  const consultarEstado = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;
    setCargando(true);
    setError("");
    setResultado(null);

    try {
      const res = await ordenService.consultarPublica(
        slugTaller || "general",
        busqueda.trim()
      );
      setResultado(res.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "No encontramos una moto activa con ese número de WhatsApp o placa."
          : err.message
      );
    } finally {
      setCargando(false);
    }
  };

  const nombreMostrar =
    tallerActual?.nombre ||
    (slugTaller ? slugTaller.replace(/-/g, " ").toUpperCase() : "MechanicSoft");

  return (
    <div className="portal-container">
      <header className="portal-navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span
            className="brand-monogram"
            style={{ width: 32, height: 32, fontSize: "0.82rem", borderRadius: 8 }}
          >
            MS
          </span>
          <span style={{ fontWeight: 700, fontSize: "1.02rem" }}>MechanicSoft</span>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <button onClick={toggleTheme} className="icon-btn" title="Cambiar tema">
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <Link
            to="/login"
            className="btn-secondary"
            style={{ textDecoration: "none", fontSize: "0.85rem" }}
          >
            <Lock size={15} /> Acceso Taller
          </Link>
        </div>
      </header>

      <main className="portal-main">
        <div className="card" style={{ marginBottom: "1.25rem" }}>
          <div className="taller-banner">
            {tallerActual?.logoUrl ? (
              <img
                src={tallerActual.logoUrl}
                alt={nombreMostrar}
                className="taller-logo-lg"
              />
            ) : (
              <div
                className="taller-logo-lg"
                style={{ backgroundColor: "var(--accent-brand)" }}
              >
                {nombreMostrar.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 style={{ fontSize: "1.18rem", fontWeight: 700 }}>{nombreMostrar}</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                Consulta el estado de tu moto con tu WhatsApp o placa
              </p>
            </div>
          </div>

          {/* Selector rápido si entra desde la raíz y hay varios talleres */}
          {!slugTaller && talleres.length > 0 && (
            <div className="form-group">
              <label>Selecciona tu taller (opcional)</label>
              <select
                className="input-field"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) navigate(`/t/${e.target.value}`);
                }}
              >
                <option value="">Buscar en todos los talleres...</option>
                {talleres.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={consultarEstado} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: 3001234567 o ABC12D"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={cargando}>
              <Search size={18} />
              {cargando ? "Buscando..." : "Consultar"}
            </button>
          </form>

          {error && (
            <p style={{ color: "var(--danger)", fontSize: "0.88rem", marginTop: "0.85rem" }}>
              {error}
            </p>
          )}
        </div>

        {resultado && (
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  {resultado.marca} {resultado.modelo} • {resultado.placa}
                </h2>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  Orden #{resultado.id}
                </span>
              </div>
              <span className={`status-pill status-${resultado.estado}`}>
                {ETIQUETAS_ESTADO[resultado.estado] || resultado.estado}
              </span>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border-color)",
                paddingTop: "0.85rem",
                fontSize: "0.92rem",
              }}
            >
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>Trabajo a realizar:</strong>{" "}
                {resultado.motivoIngreso || resultado.descripcion}
              </p>
              {resultado.valorTotal > 0 && (
                <p style={{ marginBottom: "0.5rem" }}>
                  <strong>Valor estimado:</strong> $
                  {Number(resultado.valorTotal).toLocaleString("es-CO")}
                </p>
              )}
              {(resultado.ubicacionTaller || tallerActual?.ubicacion) && (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    marginTop: "0.75rem",
                  }}
                >
                  <MapPin size={16} />{" "}
                  {resultado.ubicacionTaller || tallerActual?.ubicacion}
                </p>
              )}
            </div>

            {(resultado.whatsappTaller || tallerActual?.whatsapp) && (
              <a
                href={`https://wa.me/${(
                  resultado.whatsappTaller || tallerActual?.whatsapp
                ).replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  textDecoration: "none",
                  backgroundColor: "#166534",
                  borderColor: "#166534",
                  color: "#ffffff",
                }}
              >
                <MessageCircle size={18} /> Escribir al taller por WhatsApp
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}