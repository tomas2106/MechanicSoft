import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Search,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Check,
  Wrench,
  History,
  Gauge,
} from "lucide-react";
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
      const res = await ordenService.consultarPublica(
        slugTaller || "general",
        valor.trim()
      );
      setResultado(res.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "No encontramos una orden registrada con esa placa o número de WhatsApp."
          : err.response?.data?.message ||
              "No se pudo completar la consulta en este momento. Intenta de nuevo."
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
      : "Portal de Seguimiento MechanicSoft");

  const indicePasoActual = resultado
    ? PASOS_FLUJO.findIndex((p) => p.id === resultado.estado)
    : -1;

  const historialMantenimientos = Array.isArray(resultado?.historial)
    ? resultado.historial
    : [];

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

        <Link
          to="/login"
          className="btn-accent"
          style={{ textDecoration: "none", fontSize: "0.84rem", padding: "0.5rem 0.95rem" }}
        >
          <Wrench size={15} /> Ingreso Talleres
        </Link>
      </header>

      {/* Banner Corporativo Esmeralda del Taller */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #09090b 0%, #121215 60%, #0f766e 100%)",
          color: "#ffffff",
          padding: "2.4rem 1.25rem 4.2rem",
        }}
      >
        <div
          style={{
            maxWidth: 740,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "1.15rem",
          }}
        >
          {tallerActual?.logoUrl ? (
            <img
              src={tallerActual.logoUrl}
              alt={nombreMostrar}
              style={{
                width: 66,
                height: 66,
                borderRadius: 12,
                objectFit: "cover",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: 12,
                backgroundColor: "var(--accent-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.55rem",
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              {nombreMostrar.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <span
              style={{
                fontSize: "0.74rem",
                textTransform: "uppercase",
                color: "#5eead4",
                fontWeight: 700,
                letterSpacing: "0.8px",
              }}
            >
              Seguimiento de Motocicletas
            </span>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 850, letterSpacing: "-0.4px" }}>
              {nombreMostrar}
            </h1>
            {tallerActual?.ubicacion && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#d4d4d8",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  marginTop: "0.2rem",
                }}
              >
                <MapPin size={14} /> {tallerActual.ubicacion}
              </p>
            )}
          </div>
        </div>
      </div>

      <main className="portal-main" style={{ maxWidth: 740, marginTop: "-2.5rem" }}>
        {/* Buscador por Placa o WhatsApp */}
        <div className="card" style={{ marginBottom: "1.25rem", boxShadow: "var(--shadow-md)" }}>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              fontSize: "0.94rem",
              marginBottom: "0.6rem",
            }}
          >
            Digita la placa de tu motocicleta o tu número de WhatsApp
          </label>

          <form onSubmit={consultarEstado} style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
            <div className="placa-input-box" style={{ flex: 1, minWidth: 210 }}>
              <input
                type="text"
                placeholder="EJ: OWC28D"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-accent"
              disabled={cargando}
              style={{ padding: "0.75rem 1.4rem" }}
            >
              <Search size={18} />
              {cargando ? "Consultando..." : "Consultar estado"}
            </button>
          </form>

          {error && (
            <p style={{ color: "var(--danger)", fontSize: "0.88rem", marginTop: "0.85rem", fontWeight: 500 }}>
              {error}
            </p>
          )}
        </div>

        {/* Resultado de la Orden Actual */}
        {resultado && (
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "0.75rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <span className="placa-badge">{resultado.placa}</span>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: "0.4rem" }}>
                  {resultado.marca} {resultado.modelo}
                </h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Última orden #{resultado.id} •{" "}
                  {Number(resultado.kilometrajeIngreso || 0).toLocaleString("es-CO")} km
                </span>
              </div>
              <span className={`status-pill status-${resultado.estado}`}>
                {resultado.estado.replace(/_/g, " ")}
              </span>
            </div>

            {/* Línea de Tiempo */}
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
                        backgroundColor: completado ? "var(--accent-brand)" : "var(--bg-subtle)",
                        color: completado ? "#ffffff" : "var(--text-muted)",
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
                  maxHeight: 240,
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
                gap: "0.55rem",
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
                    Valor del servicio
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
                className="btn-accent"
                style={{ width: "100%", marginTop: "1.15rem", textDecoration: "none" }}
              >
                <MessageCircle size={18} /> Escribir al taller por WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Historial Completo de Mantenimientos de la Moto */}
        {historialMantenimientos.length > 0 && (
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.9rem" }}>
              <History size={18} color="var(--accent-brand)" />
              <h3 style={{ fontSize: "1.02rem", fontWeight: 800 }}>
                Historial de Mantenimientos de {resultado?.placa} ({historialMantenimientos.length})
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {historialMantenimientos.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "var(--bg-app)",
                    border: "1px solid var(--border-color)",
                    borderLeft: "4px solid var(--accent-brand)",
                    borderRadius: "8px",
                    padding: "0.9rem 1rem",
                    fontSize: "0.88rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.35rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                      Orden #{item.id} • <Gauge size={14} color="var(--accent-brand)" />{" "}
                      {Number(item.kilometrajeIngreso || 0).toLocaleString("es-CO")} km
                    </strong>
                    <span className={`status-pill status-${item.estado}`}>
                      {item.estado.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {item.motivoIngreso}
                  </p>

                  {item.diagnostico && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", marginTop: "0.25rem" }}>
                      <strong>Diagnóstico:</strong> {item.diagnostico}
                    </p>
                  )}

                  {item.trabajoRealizado && (
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.84rem", marginTop: "0.2rem" }}>
                      <strong>Trabajo realizado:</strong> {item.trabajoRealizado}
                    </p>
                  )}

                  {item.valorTotal > 0 && (
                    <p style={{ fontWeight: 700, marginTop: "0.4rem", fontSize: "0.9rem" }}>
                      Valor: ${Number(item.valorTotal).toLocaleString("es-CO")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tarjeta Informativa cuando aún no se ha realizado búsqueda */}
        {!resultado && !error && (
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.45rem" }}>
              ¿Qué podrás consultar aquí?
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "0.85rem" }}>
              Al ingresar la placa de tu motocicleta verás en tiempo real la etapa actual del
              servicio, el diagnóstico técnico y el historial completo de mantenimientos realizados.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.65rem",
                fontSize: "0.82rem",
                textAlign: "center",
              }}
            >
              <div style={{ padding: "0.7rem", backgroundColor: "var(--bg-app)", borderRadius: "8px", fontWeight: 600 }}>
                Estado en Vivo
              </div>
              <div style={{ padding: "0.7rem", backgroundColor: "var(--bg-app)", borderRadius: "8px", fontWeight: 600 }}>
                Historial por Placa
              </div>
              <div style={{ padding: "0.7rem", backgroundColor: "var(--bg-app)", borderRadius: "8px", fontWeight: 600 }}>
                Diagnóstico y Costos
              </div>
            </div>
          </div>
        )}

        {/* Especialidades del Taller */}
        <div className="card">
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: 800,
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Wrench size={16} color="var(--accent-brand)" /> Servicios Especializados
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.65rem",
              fontSize: "0.82rem",
              textAlign: "center",
            }}
          >
            <div style={{ padding: "0.7rem", backgroundColor: "var(--bg-app)", borderRadius: "8px", fontWeight: 600 }}>
              Mantenimiento Preventivo
            </div>
            <div style={{ padding: "0.7rem", backgroundColor: "var(--bg-app)", borderRadius: "8px", fontWeight: 600 }}>
              Sincronización y Motor
            </div>
            <div style={{ padding: "0.7rem", backgroundColor: "var(--bg-app)", borderRadius: "8px", fontWeight: 600 }}>
              Frenos y Suspensión
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}