import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Search, MapPin, MessageCircle, Sun, Moon, ArrowLeft, Check, Wrench } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { ordenService } from "../../services/ordenService";
import { tallerService } from "../../services/tallerService";
import "./HomePage.css";
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
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  const [tallerActual, setTallerActual] = useState(null);
  const [busqueda, setBusqueda] = useState(searchParams.get("q") || "");
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slugTaller && slugTaller !== "general") {
      tallerService
        .obtenerPorSlug(slugTaller)
        .then((res) => setTallerActual(res.data))
        .catch(() => setTallerActual(null));
    }
  }, [slugTaller]);

  const ejecutarConsulta = async (valor) => {
    if (!valor.trim()) return;
    setCargando(true);
    setError("");
    setResultado(null);

    try {
      const res = await ordenService.consultarPublica(slugTaller || "general", valor.trim());
      setResultado(res.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "No encontramos una orden activa con esa placa o número de WhatsApp."
          : err.message
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const qInicial = searchParams.get("q");
    if (qInicial) {
      ejecutarConsulta(qInicial);
    }
  }, []);

  const consultarEstado = (e) => {
    e.preventDefault();
    ejecutarConsulta(busqueda);
  };

  const nombreMostrar =
    tallerActual?.nombre ||
    (slugTaller && slugTaller !== "general"
      ? slugTaller.replace(/-/g, " ").toUpperCase()
      : "Consulta General MechanicSoft");

  const indicePasoActual = resultado
    ? PASOS_FLUJO.findIndex((p) => p.id === resultado.estado)
    : -1;

  return (
    <div className="portal-container">
      <header className="portal-navbar">
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            color: "var(--text-primary)",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          <ArrowLeft size={17} /> Inicio
        </Link>

        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <button onClick={toggleTheme} className="icon-btn" title="Cambiar tema">
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <Link
            to="/login"
            className="btn-secondary"
            style={{ textDecoration: "none", fontSize: "0.85rem" }}
          >
            Acceso Taller
          </Link>
        </div>
      </header>

      {/* Banner Deportivo del Taller (Estilo CFMOTO) */}
      <div
        style={{
          background: "linear-gradient(135deg, #09090b 0%, #1c1917 65%, #7c2d12 100%)",
          color: "#ffffff",
          padding: "2.25rem 1.25rem 4rem",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", gap: "1.1rem" }}>
          {tallerActual?.logoUrl ? (
            <img
              src={tallerActual.logoUrl}
              alt={nombreMostrar}
              style={{
                width: 68,
                height: 68,
                borderRadius: 14,
                objectFit: "cover",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 14,
                backgroundColor: "#ea580c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                fontWeight: 900,
              }}
            >
              {nombreMostrar.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#fdba74", fontWeight: 700, letterSpacing: "0.8px" }}>
              Taller Autorizado
            </span>
            <h1 style={{ fontSize: "1.55rem", fontWeight: 900, letterSpacing: "-0.4px" }}>
              {nombreMostrar}
            </h1>
            {tallerActual?.ubicacion && (
              <p style={{ fontSize: "0.85rem", color: "#d4d4d8", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.2rem" }}>
                <MapPin size={14} /> {tallerActual.ubicacion}
              </p>
            )}
          </div>
        </div>
      </div>

      <main className="portal-main" style={{ marginTop: "-2.5rem" }}>
        <div className="card" style={{ marginBottom: "1.25rem", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}>
          <label style={{ display: "block", fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.6rem" }}>
            Digita la placa de tu motocicleta o tu número de WhatsApp
          </label>

          <form onSubmit={consultarEstado} style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <div className="placa-input-box" style={{ flex: 1, minWidth: 200 }}>
              <input
                type="text"
                placeholder="ABC 12D"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={cargando}
              style={{ padding: "0.75rem 1.35rem", backgroundColor: "#ea580c", borderColor: "#ea580c", color: "#fff" }}
            >
              <Search size={18} />
              {cargando ? "Buscando..." : "Consultar estado"}
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
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: "0.4rem" }}>
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
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        backgroundColor: completado ? "#ea580c" : "var(--bg-subtle)",
                        color: completado ? "#fff" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {completado ? <Check size={14} /> : idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
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
                  maxHeight: 230,
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
                    padding: "0.85rem",
                    backgroundColor: "var(--bg-app)",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                    Valor estimado del servicio
                  </span>
                  <span style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                    ${Number(resultado.valorTotal).toLocaleString("es-CO")}
                  </span>
                </div>
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
                <MessageCircle size={18} /> Escribir al taller por WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Tarjeta de Especialidades del Taller (Estilo CFMOTO) */}
        <div className="card" style={{ marginTop: "1.25rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 800, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Wrench size={16} color="#ea580c" /> Servicios Especializados
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem", fontSize: "0.8rem", textAlign: "center" }}>
            <div style={{ padding: "0.65rem", backgroundColor: "var(--bg-app)", borderRadius: "8px", fontWeight: 600 }}>
              Mantenimiento Preventivo
            </div>
            <div style={{ padding: "0.65rem", backgroundColor: "var(--bg-app)", borderRadius: "8px", fontWeight: 600 }}>
              Sincronización y Motor
            </div>
            <div style={{ padding: "0.65rem", backgroundColor: "var(--bg-app)", borderRadius: "8px", fontWeight: 600 }}>
              Frenos y Suspensión
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}