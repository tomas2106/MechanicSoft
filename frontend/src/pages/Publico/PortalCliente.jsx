import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Search, MapPin, MessageCircle, Sun, Moon, Lock, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { ordenService } from "../../services/ordenService";
import { tallerService } from "../../services/tallerService";
import "./PortalCliente.css";

const PASOS_FLUJO = [
  { id: "RECIBIDO", label: "Recibida" },
  { id: "DIAGNOSTICO", label: "Diagnóstico" },
  { id: "EN_REPARACION", label: "Reparación" },
  { id: "LISTO_PARA_ENTREGA", label: "Lista" },
  { id: "ENTREGADO", label: "Entregada" },
];

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

  const indicePasoActual = resultado
    ? PASOS_FLUJO.findIndex((p) => p.id === resultado.estado)
    : -1;

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
                Seguimiento en tiempo real con tu WhatsApp o placa
              </p>
            </div>
          </div>

          {!slugTaller && talleres.length > 0 && (
            <div className="form-group">
              <label>Selecciona tu taller</label>
              <select
                className="input-field"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) navigate(`/t/${e.target.value}`);
                }}
              >
                <option value="">Todos los talleres...</option>
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
                alignItems: "flex-start",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <span className="placa-badge">{resultado.placa}</span>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginTop: "0.4rem" }}>
                  {resultado.marca} {resultado.modelo}
                </h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Orden de servicio #{resultado.id}
                </span>
              </div>
              <span className={`status-pill status-${resultado.estado}`}>
                {resultado.estado.replace(/_/g, " ")}
              </span>
            </div>

            {/* Línea de Tiempo de Progreso */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1.35rem",
                padding: "0.85rem",
                backgroundColor: "var(--bg-app)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
              }}
            >
              {PASOS_FLUJO.map((paso, idx) => {
                const completado = idx <= indicePasoActual;
                return (
                  <div
                    key={paso.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.35rem",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: completado
                          ? "var(--accent-brand)"
                          : "var(--bg-subtle)",
                        color: completado ? "#fff" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      {completado ? <Check size={13} /> : idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: completado ? 700 : 500,
                        color: completado ? "var(--text-primary)" : "var(--text-muted)",
                        textAlign: "center",
                      }}
                    >
                      {paso.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {resultado.fotoVehiculo && (
              <img
                src={resultado.fotoVehiculo}
                alt={resultado.placa}
                style={{
                  width: "100%",
                  maxHeight: 220,
                  objectFit: "cover",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1rem",
                  border: "1px solid var(--border-color)",
                }}
              />
            )}

            <div
              style={{
                borderTop: "1px solid var(--border-color)",
                paddingTop: "0.9rem",
                fontSize: "0.92rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <p>
                <strong>Motivo de ingreso:</strong> {resultado.motivoIngreso}
              </p>

              {resultado.diagnostico && (
                <p>
                  <strong>Diagnóstico técnico:</strong> {resultado.diagnostico}
                </p>
              )}

              {resultado.trabajoRealizado && (
                <p>
                  <strong>Trabajo realizado:</strong> {resultado.trabajoRealizado}
                </p>
              )}

              {resultado.valorTotal > 0 && (
                <div
                  style={{
                    marginTop: "0.35rem",
                    padding: "0.75rem",
                    backgroundColor: "var(--bg-app)",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                    Total estimado
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                    ${Number(resultado.valorTotal).toLocaleString("es-CO")}
                  </span>
                </div>
              )}

              {tallerActual?.ubicacion && (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    marginTop: "0.35rem",
                  }}
                >
                  <MapPin size={16} /> {tallerActual.ubicacion}
                </p>
              )}
            </div>

            {tallerActual?.whatsapp && (
              <a
                href={`https://wa.me/${tallerActual.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{
                  width: "100%",
                  marginTop: "1.15rem",
                  textDecoration: "none",
                  backgroundColor: "#166534",
                  borderColor: "#166534",
                  color: "#ffffff",
                }}
              >
                <MessageCircle size={18} /> Contactar al taller por WhatsApp
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}