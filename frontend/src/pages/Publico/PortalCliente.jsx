import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  Search,
  MapPin,
  MessageCircle,
  ArrowLeft,
  Check,
  History,
  Calendar,
  UserCheck,
  Activity,
  Clock,
  Wrench,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { ordenService } from "../../services/ordenService";
import { tallerService } from "../../services/tallerService";
import { normalizarTelefonoCO, formatoVisibleCO } from "../../utils/phoneCO";
import api from "../../services/api";
import "./HomePage.css";
import "./PortalCliente.css";

const PASOS_FLUJO = [
  { id: "RECIBIDO", label: "Recibida" },
  { id: "DIAGNOSTICO", label: "Diagnóstico" },
  { id: "EN_REPARACION", label: "Reparación" },
  { id: "LISTO_PARA_ENTREGA", label: "Lista" },
  { id: "ENTREGADO", label: "Entregada" },
];

const SERVICIOS_RAPIDOS_CITA = [
  "Cambio de aceite y filtro",
  "Revisión general / Mantenimiento preventivo",
  "Frenos y kit de arrastre",
  "Diagnóstico eléctrico / Encendido",
  "Sincronización e inyección",
];

const FRANJAS_HORARIAS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
];

const limpiarPlacaMayusculas = (val) =>
  String(val || "").toUpperCase().replace(/[^A-Z0-9\s-]/g, "");

export default function PortalCliente() {
  const { slugTaller } = useParams();
  const [searchParams] = useSearchParams();

  const [tallerActual, setTallerActual] = useState(null);
  const [busqueda, setBusqueda] = useState(limpiarPlacaMayusculas(searchParams.get("q") || ""));
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [citas, setCitas] = useState([]);
  const [citaForm, setCitaForm] = useState({
    clienteNombre: "",
    telefono: "",
    placa: "",
    fecha: new Date().toISOString().slice(0, 10),
    franjaHoraria: FRANJAS_HORARIAS[0],
    motivo: SERVICIOS_RAPIDOS_CITA[0],
  });
  const [mensajeCita, setMensajeCita] = useState("");

  useEffect(() => {
    if (slugTaller && slugTaller !== "general") {
      tallerService
        .obtenerPorSlug(slugTaller)
        .then((res) => setTallerActual(res.data))
        .catch(() => setTallerActual(null));

      api
        .get(`/public/talleres/${slugTaller}/citas`)
        .then((res) => setCitas(Array.isArray(res.data) ? res.data : []))
        .catch(() => {});
    }

    if (window.location.hash === "#agendar-cita") {
      setTimeout(() => {
        const el = document.getElementById("agendar-cita");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 250);
    }
  }, [slugTaller]);

  const ejecutarConsulta = async (valor) => {
    const limpio = String(valor || "").trim().toUpperCase();
    if (!limpio) return;
    setCargando(true);
    setError("");
    setResultado(null);
    try {
      const res = await ordenService.consultarPublica(slugTaller || "general", limpio);
      setResultado(res.data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? "No encontramos una orden registrada con esa placa o número de WhatsApp."
          : err.response?.data?.message || "Error al consultar."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const qInicial = searchParams.get("q");
    if (qInicial) ejecutarConsulta(qInicial);
  }, []);

  const agendarCita = async (e) => {
    e.preventDefault();
    const wa = normalizarTelefonoCO(citaForm.telefono);
    try {
      await api.post(`/public/talleres/${slugTaller || "general"}/citas`, {
        ...citaForm,
        placa: limpiarPlacaMayusculas(citaForm.placa),
        telefono: wa,
        motivo: `${citaForm.motivo} (${citaForm.franjaHoraria})`,
      });
      setMensajeCita(`Cita agendada para el ${citaForm.fecha} en la franja ${citaForm.franjaHoraria}.`);
      setCitaForm({
        ...citaForm,
        clienteNombre: "",
        telefono: "",
        placa: "",
      });
      if (slugTaller && slugTaller !== "general") {
        const resCitas = await api.get(`/public/talleres/${slugTaller}/citas`);
        setCitas(Array.isArray(resCitas.data) ? resCitas.data : []);
      }
    } catch {
      setMensajeCita("Solicitud de cita registrada.");
    }
  };

  const nombreTallerRegistro =
    resultado?.tallerNombre ||
    tallerActual?.nombre ||
    (slugTaller && slugTaller !== "general" ? slugTaller.replace(/-/g, " ").toUpperCase() : "Taller Asociado");

  const logoTaller = tallerActual?.logoUrl || resultado?.tallerLogoUrl || "";

  const trabajandoAhora = Boolean(
    resultado?.trabajandoAhora ?? tallerActual?.trabajandoAhora ?? tallerActual?.abiertoHoy
  );

  const tecnicoAsignado =
    resultado?.tecnicoNombre || tallerActual?.tecnicoNombre || "Técnico del taller";

  const cuposMaximos = tallerActual?.cuposDiarios || 8;
  const citasDelDia = citas.filter((c) => c.fecha === citaForm.fecha).length;
  const cuposDisponibles = Math.max(0, cuposMaximos - citasDelDia);

  const indicePaso = resultado ? PASOS_FLUJO.findIndex((p) => p.id === resultado.estado) : -1;
  const historial = Array.isArray(resultado?.historial) ? resultado.historial : [];

  return (
    <div className="portal-container">
      <header className="portal-navbar">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.45rem", textDecoration: "none", color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
          <ArrowLeft size={17} /> Inicio
        </Link>
        <Link to="/login" className="btn-accent" style={{ textDecoration: "none", fontSize: "0.84rem", padding: "0.5rem 0.95rem" }}>
          Ingreso Talleres
        </Link>
      </header>

      {/* Cabecera Enriquecida del Taller */}
      <div style={{ background: "linear-gradient(135deg, #09090b 0%, #121215 60%, #0f766e 100%)", color: "#ffffff", padding: "2.2rem 1.25rem 4.2rem" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.25rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {logoTaller ? (
              <img
                src={logoTaller}
                alt={nombreTallerRegistro}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 14,
                  objectFit: "cover",
                  border: "2px solid rgba(94, 234, 212, 0.55)",
                  backgroundColor: "#18181b",
                }}
              />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 14, backgroundColor: "var(--accent-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", fontWeight: 900 }}>
                {nombreTallerRegistro.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", color: "#5eead4", fontWeight: 700 }}>
                Taller Autorizado • Seguimiento y Citas
              </span>
              <h1 style={{ fontSize: "1.55rem", fontWeight: 850, marginTop: "0.1rem" }}>{nombreTallerRegistro}</h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", marginTop: "0.3rem", fontSize: "0.84rem", color: "#d4d4d8" }}>
                {tallerActual?.ubicacion && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <MapPin size={14} color="#5eead4" /> {tallerActual.ubicacion}
                  </span>
                )}
                {tallerActual?.whatsapp && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Phone size={14} color="#5eead4" /> {formatoVisibleCO(tallerActual.whatsapp)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", fontSize: "0.82rem" }}>
            <span
              className="status-pill"
              style={{
                backgroundColor: trabajandoAhora ? "#dcfce7" : "#e4e4e7",
                color: trabajandoAhora ? "#166534" : "#3f3f46",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontWeight: 700,
              }}
            >
              <Activity size={14} /> {trabajandoAhora ? "Abierto • Trabajando ahora mismo" : "Taller cerrado en este momento"}
            </span>
            <span style={{ color: "#e4e4e7", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
              <UserCheck size={14} color="#5eead4" /> Técnico: <strong>{tecnicoAsignado}</strong>
            </span>
          </div>
        </div>
      </div>

      <main className="portal-main" style={{ maxWidth: 780, marginTop: "-2.6rem" }}>
        {/* Barra de Búsqueda Centrada e Intuitiva */}
        <div
          className="card"
          style={{
            marginBottom: "1.35rem",
            boxShadow: "var(--shadow-md)",
            textAlign: "center",
            padding: "1.6rem 1.35rem",
          }}
        >
          <h2 style={{ fontSize: "1.12rem", fontWeight: 800, marginBottom: "0.3rem" }}>
            Consulta el estado e historial de tu motocicleta
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.1rem" }}>
            Escribe la <strong>placa en mayúsculas</strong> (ej: OWC28D) o tu <strong>número de WhatsApp</strong>
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ejecutarConsulta(busqueda);
            }}
            style={{
              maxWidth: 540,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "2px solid var(--border-color)",
                borderRadius: 12,
                padding: "0.35rem 0.6rem",
                backgroundColor: "var(--bg-app)",
              }}
            >
              <Search size={19} color="var(--accent-brand)" style={{ marginLeft: "0.4rem", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="EJ: OWC28D O 3001234567"
                value={busqueda}
                onChange={(e) => setBusqueda(limpiarPlacaMayusculas(e.target.value))}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  textAlign: "center",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  padding: "0.55rem 0.75rem",
                  color: "var(--text-primary)",
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-accent"
              disabled={cargando}
              style={{ width: "100%", padding: "0.82rem", fontSize: "0.95rem", borderRadius: 10 }}
            >
              <Search size={18} /> {cargando ? "Buscando información..." : "Consultar estado ahora"}
            </button>
          </form>

          {error && (
            <p style={{ color: "var(--danger)", fontSize: "0.88rem", marginTop: "0.85rem", fontWeight: 600 }}>
              {error}
            </p>
          )}
        </div>

        {/* Ficha Informativa del Taller cuando el cliente entra por enlace directo */}
        {tallerActual && !resultado && (
          <div className="card" style={{ marginBottom: "1.35rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.85rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <Wrench size={17} color="var(--accent-brand)" /> Información del Taller
              </h3>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <ShieldCheck size={15} color="var(--accent-brand)" /> Garantía digital en cada servicio
              </span>
            </div>

            <div className="form-grid-2" style={{ gap: "0.75rem", fontSize: "0.86rem" }}>
              <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-app)", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>Ubicación</span>
                <strong>{tallerActual.ubicacion || "Consultar por WhatsApp"}</strong>
              </div>
              <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-app)", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>Técnico Responsable</span>
                <strong>{tecnicoAsignado}</strong>
              </div>
              <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-app)", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>Estado de Atención</span>
                <strong style={{ color: trabajandoAhora ? "#166534" : "var(--text-primary)" }}>
                  {trabajandoAhora ? "Abierto y atendiendo hoy" : "Cerrado en este momento"}
                </strong>
              </div>
              <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-app)", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>Capacidad Diaria de Citas</span>
                <strong>{cuposDisponibles} cupos disponibles para hoy</strong>
              </div>
            </div>

            {tallerActual.whatsapp && (
              <a
                href={`https://wa.me/${normalizarTelefonoCO(tallerActual.whatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ width: "100%", marginTop: "0.9rem", textDecoration: "none", justifyContent: "center" }}
              >
                <MessageCircle size={16} color="var(--accent-brand)" /> Escribir directamente a {nombreTallerRegistro}
              </a>
            )}
          </div>
        )}

        {/* Resultado de Orden Actual */}
        {resultado && (
          <div className="card" style={{ marginBottom: "1.35rem" }}>
            <div style={{ backgroundColor: "var(--primary-soft)", border: "1px solid var(--accent-brand)", borderRadius: 8, padding: "0.75rem 0.95rem", marginBottom: "1rem", fontSize: "0.84rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <strong>Taller:</strong> {nombreTallerRegistro}
                {resultado.tallerUbicacion ? ` • ${resultado.tallerUbicacion}` : ""}
              </div>
              <div>
                <strong>Técnico:</strong> {tecnicoAsignado} •{" "}
                <span style={{ color: trabajandoAhora ? "#166534" : "var(--text-secondary)", fontWeight: 700 }}>
                  {trabajandoAhora ? "Abierto ahora mismo" : "Taller cerrado"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span className="placa-badge">{String(resultado.placa || "").toUpperCase()}</span>
                <h2 style={{ fontSize: "1.18rem", fontWeight: 800, marginTop: "0.35rem" }}>
                  {resultado.marca} {resultado.modelo}
                </h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Orden #{resultado.id} • {Number(resultado.kilometrajeIngreso || 0).toLocaleString("es-CO")} km
                </span>
              </div>
              <span className={`status-pill status-${resultado.estado}`}>
                {resultado.estado.replace(/_/g, " ")}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.2rem", padding: "0.8rem", backgroundColor: "var(--bg-app)", borderRadius: 8 }}>
              {PASOS_FLUJO.map((paso, idx) => {
                const done = idx <= indicePaso;
                return (
                  <div key={paso.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", flex: 1 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: done ? "var(--accent-brand)" : "var(--bg-subtle)", color: done ? "#fff" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700 }}>
                      {done ? <Check size={13} /> : idx + 1}
                    </div>
                    <span style={{ fontSize: "0.68rem", fontWeight: done ? 700 : 500, textAlign: "center" }}>{paso.label}</span>
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize: "0.9rem" }}><strong>Motivo:</strong> {resultado.motivoIngreso}</p>
            {resultado.diagnostico && <p style={{ fontSize: "0.88rem", marginTop: "0.3rem" }}><strong>Diagnóstico:</strong> {resultado.diagnostico}</p>}
            {resultado.trabajoRealizado && <p style={{ fontSize: "0.88rem", marginTop: "0.3rem" }}><strong>Trabajo realizado:</strong> {resultado.trabajoRealizado}</p>}
            {resultado.valorTotal > 0 && (
              <p style={{ fontSize: "1.05rem", fontWeight: 800, marginTop: "0.6rem" }}>
                Total: ${Number(resultado.valorTotal).toLocaleString("es-CO")}
              </p>
            )}

            {tallerActual?.whatsapp && (
              <a
                href={`https://wa.me/${normalizarTelefonoCO(tallerActual.whatsapp)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-accent"
                style={{ width: "100%", marginTop: "1rem", textDecoration: "none" }}
              >
                <MessageCircle size={17} /> Contactar a {nombreTallerRegistro} por WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Historial de Mantenimientos */}
        {historial.length > 0 && (
          <div className="card" style={{ marginBottom: "1.35rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <History size={17} color="var(--accent-brand)" /> Historial de Mantenimientos ({historial.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {historial.map((h) => (
                <div key={h.id} style={{ backgroundColor: "var(--bg-app)", border: "1px solid var(--border-color)", borderLeft: "4px solid var(--accent-brand)", borderRadius: 8, padding: "0.85rem", fontSize: "0.86rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <strong>Orden #{h.id} • {Number(h.kilometrajeIngreso || 0).toLocaleString("es-CO")} km</strong>
                    <span className={`status-pill status-${h.estado}`}>{h.estado.replace(/_/g, " ")}</span>
                  </div>
                  <p>{h.motivoIngreso}</p>
                  {h.trabajoRealizado && <p style={{ color: "var(--text-secondary)", marginTop: "0.2rem" }}><strong>Trabajo:</strong> {h.trabajoRealizado}</p>}
                  {h.valorTotal > 0 && <p style={{ fontWeight: 700, marginTop: "0.3rem" }}>Valor: ${Number(h.valorTotal).toLocaleString("es-CO")}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menú Intuitivo para Agendar Citas */}
        {tallerActual?.citasHabilitadas && (
          <div id="agendar-cita" className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.9rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <Calendar size={18} color="var(--accent-brand)" /> Agendar Cita en {nombreTallerRegistro}
              </h3>
              <span className="status-pill status-LISTO_PARA_ENTREGA">
                {cuposDisponibles} cupos disponibles
              </span>
            </div>

            {mensajeCita && (
              <div style={{ backgroundColor: "var(--primary-soft)", color: "var(--accent-brand)", padding: "0.7rem 0.9rem", borderRadius: 8, fontSize: "0.86rem", fontWeight: 600, marginBottom: "0.9rem" }}>
                {mensajeCita}
              </div>
            )}

            <form onSubmit={agendarCita}>
              {/* Paso 1: Selección rápida de servicio */}
              <div className="form-group">
                <label>1. Selecciona el tipo de servicio *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "0.55rem" }}>
                  {SERVICIOS_RAPIDOS_CITA.map((srv) => {
                    const activo = citaForm.motivo === srv;
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => setCitaForm({ ...citaForm, motivo: srv })}
                        style={{
                          padding: "0.42rem 0.75rem",
                          borderRadius: 999,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: activo ? "1.5px solid var(--accent-brand)" : "1px solid var(--border-color)",
                          backgroundColor: activo ? "var(--primary-soft)" : "var(--bg-app)",
                          color: activo ? "var(--accent-brand)" : "var(--text-primary)",
                        }}
                      >
                        {srv}
                      </button>
                    );
                  })}
                </div>
                <input
                  className="input-field"
                  placeholder="O describe otro servicio requerido..."
                  value={citaForm.motivo}
                  onChange={(e) => setCitaForm({ ...citaForm, motivo: e.target.value })}
                  required
                />
              </div>

              {/* Paso 2: Fecha y Franja Horaria */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>2. Fecha de ingreso *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={citaForm.fecha}
                    onChange={(e) => setCitaForm({ ...citaForm, fecha: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><Clock size={13} style={{ verticalAlign: "middle" }} /> Franja horaria *</label>
                  <select
                    className="input-field"
                    value={citaForm.franjaHoraria}
                    onChange={(e) => setCitaForm({ ...citaForm, franjaHoraria: e.target.value })}
                  >
                    {FRANJAS_HORARIAS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Paso 3: Datos del propietario y placa */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>3. Tu nombre *</label>
                  <input
                    className="input-field"
                    placeholder="Nombre completo"
                    value={citaForm.clienteNombre}
                    onChange={(e) => setCitaForm({ ...citaForm, clienteNombre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp Colombia (sin +57) *</label>
                  <input
                    className="input-field"
                    placeholder="3001234567"
                    value={citaForm.telefono}
                    onChange={(e) => setCitaForm({ ...citaForm, telefono: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Placa de tu motocicleta (solo mayúsculas) *</label>
                <input
                  className="input-field"
                  placeholder="EJ: OWC28D"
                  value={citaForm.placa}
                  onChange={(e) => setCitaForm({ ...citaForm, placa: limpiarPlacaMayusculas(e.target.value) })}
                  style={{ fontWeight: 700, letterSpacing: "0.06em" }}
                  required
                />
              </div>

              <button type="submit" className="btn-accent" style={{ width: "100%", padding: "0.85rem" }}>
                <Calendar size={17} /> Confirmar cita en {nombreTallerRegistro}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}