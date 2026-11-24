import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  ArrowRight,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Store,
  MapPin,
  Calendar,
  CheckCircle2,
  Video,
  Users,
  UserCheck,
  Activity,
  X,
} from "lucide-react";
import { tallerService } from "../../services/tallerService";
import { normalizarTelefonoCO, formatoVisibleCO } from "../../utils/phoneCO";
import api from "../../services/api";
import "./HomePage.css";

const PREGUNTAS_FRECUENTES = [
  {
    pregunta: "¿Cómo consulto el estado de mi motocicleta y el taller?",
    respuesta:
      "Busca tu taller por nombre o ubicación (por ejemplo, Soacha) para verificar si está trabajando ahora mismo y conocer el técnico asignado, o digita tu placa en mayúsculas.",
  },
  {
    pregunta: "¿Cómo agendo una cita en el taller de mi preferencia?",
    respuesta:
      "Pulsa en Agendar cita en un taller, selecciona el taller al que deseas llevar tu moto y elige el servicio, fecha y hora disponibles.",
  },
  {
    pregunta: "¿Cómo funcionan los planes mensuales y anualidades?",
    respuesta:
      "Puedes seleccionar cualquiera de nuestros planes comerciales y pulsar en Cotizar este plan. Completa los datos de tu taller y nuestra área operativa recibirá tu solicitud por WhatsApp.",
  },
];

const limpiarPlacaMayusculas = (val) =>
  String(val || "").toUpperCase().replace(/[^A-Z0-9\s-]/g, "");

export default function HomePage() {
  const navigate = useNavigate();
  const [talleres, setTalleres] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [buscarTaller, setBuscarTaller] = useState("");
  const [buscarUbicacion, setBuscarUbicacion] = useState("");
  const [tallerSeleccionado, setTallerSeleccionado] = useState(null);
  const [placaInput, setPlacaInput] = useState("");
  const [faqAbierta, setFaqAbierta] = useState(0);

  // Selector de taller previo a agendar cita
  const [mostrarSelectorCitas, setMostrarSelectorCitas] = useState(false);
  const [filtroTallerCita, setFiltroTallerCita] = useState("");

  const [contacto, setContacto] = useState({
    nombrePersona: "",
    nombreTaller: "",
    ciudadUbicacion: "",
    whatsappContacto: "",
    trabajadores: "1 a 2 (Dueño / Mecánico)",
    interes: "Plan Mensual Operativo",
    reunionVirtual: true,
  });

  const WHATSAPP_COMERCIAL = "573226007190";

  useEffect(() => {
    tallerService
      .listarPublicos()
      .then((res) => setTalleres(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});

    api
      .get("/public/planes")
      .then((res) => setPlanes(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const talleresFiltrados = talleres.filter((t) => {
    const matchNombre =
      !buscarTaller.trim() ||
      t.nombre?.toLowerCase().includes(buscarTaller.toLowerCase());
    const matchUbicacion =
      !buscarUbicacion.trim() ||
      t.ubicacion?.toLowerCase().includes(buscarUbicacion.toLowerCase());
    return matchNombre && matchUbicacion;
  });

  const talleresParaCita = talleres.filter((t) => {
    const q = filtroTallerCita.trim().toLowerCase();
    if (!q) return true;
    return (
      t.nombre?.toLowerCase().includes(q) ||
      t.ubicacion?.toLowerCase().includes(q)
    );
  });

  const handleBuscarPlaca = (e) => {
    e.preventDefault();
    const placaUpper = limpiarPlacaMayusculas(placaInput).trim();
    if (!placaUpper) return;
    navigate(`/t/general?q=${encodeURIComponent(placaUpper)}`);
  };

  const seleccionarPlanParaCotizar = (plan) => {
    const etiquetaPlan = `${plan.nombre}${plan.precioTexto ? ` (${plan.precioTexto})` : ""}`;
    setContacto((prev) => ({ ...prev, interes: etiquetaPlan }));
    const seccion = document.getElementById("contacto-servicios");
    if (seccion) {
      seccion.scrollIntoView({ behavior: "smooth" });
    }
  };

  const enviarSolicitudWhatsApp = (e) => {
    e.preventDefault();
    const waCliente = normalizarTelefonoCO(contacto.whatsappContacto);
    const reunionTexto = contacto.reunionVirtual
      ? "Sí, me gustaría una reunión virtual con el área operativa."
      : "Por ahora información por chat.";

    const mensaje = `Hola equipo de *MechanicSoft*, estoy interesado en cotizar un plan:
• *Plan seleccionado:* ${contacto.interes}
• *Nombre:* ${contacto.nombrePersona}
• *Taller:* ${contacto.nombreTaller}
• *Ubicación:* ${contacto.ciudadUbicacion}
• *WhatsApp:* ${waCliente ? `+${waCliente}` : "No indicado"}
• *Equipo de trabajo:* ${contacto.trabajadores}
• *Reunión virtual:* ${reunionTexto}`;

    window.open(
      `https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  return (
    <div className="home-wrapper">
      <header className="home-navbar">
        <Link to="/" className="home-brand">
          <div>
            <div className="brand-wordmark">
              MECHANIC<span>SOFT</span>
            </div>
            <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Gestión para Talleres de Motocicletas
            </span>
          </div>
        </Link>

        <nav className="nav-links">
          <a href="#proposito">Nuestra Compañía</a>
          <a href="#planes">Planes</a>
          <a href="#contacto-servicios">Cotizar</a>
          <a href="#preguntas-frecuentes">Preguntas frecuentes</a>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="btn-accent" style={{ textDecoration: "none", fontSize: "0.86rem" }}>
            Ingreso Talleres
          </Link>
        </div>
      </header>

      <section className="hero-banner">
        <div className="hero-inner">
          <div>
            <p
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#a1a1aa",
                letterSpacing: "0.02em",
                marginBottom: "0.55rem",
              }}
            >
              Sistema operativo para talleres de motocicletas en Colombia
            </p>
            <h1 className="hero-title">
              Operación diaria, caja, citas y <span>seguimiento en vivo</span>
            </h1>
            <p className="hero-subtitle">
              Busca tu taller por nombre o ubicación para ver si está trabajando ahora mismo,
              conocer su técnico asignado o consultar el historial de tu motocicleta.
            </p>

            {/* Buscador por Nombre y Ubicación */}
            <div
              style={{
                maxWidth: 520,
                backgroundColor: "rgba(18, 18, 21, 0.9)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "10px",
                padding: "1rem",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#5eead4",
                  marginBottom: "0.5rem",
                }}
              >
                Buscar taller por nombre o ubicación (Ej: Soacha)
              </label>

              <div className="form-grid-2" style={{ gap: "0.55rem", marginBottom: "0.4rem" }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nombre del taller..."
                  style={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#f4f4f5", minHeight: 38 }}
                  value={buscarTaller}
                  onChange={(e) => setBuscarTaller(e.target.value)}
                />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ubicación (ej: Soacha)..."
                  style={{ backgroundColor: "#09090b", borderColor: "#27272a", color: "#f4f4f5", minHeight: 38 }}
                  value={buscarUbicacion}
                  onChange={(e) => setBuscarUbicacion(e.target.value)}
                />
              </div>

              {(buscarTaller || buscarUbicacion) && (
                <div
                  style={{
                    marginTop: "0.55rem",
                    maxHeight: 200,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  {talleresFiltrados.length === 0 ? (
                    <span style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>
                      No se encontraron talleres con ese criterio.
                    </span>
                  ) : (
                    talleresFiltrados.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          padding: "0.65rem 0.75rem",
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          borderRadius: "8px",
                          fontSize: "0.83rem",
                          color: "#f4f4f5",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "0.6rem",
                        }}
                      >
                        <div
                          onClick={() => setTallerSeleccionado(t)}
                          style={{ cursor: "pointer", flex: 1, display: "flex", alignItems: "center", gap: "0.65rem" }}
                        >
                          {t.logoUrl ? (
                            <img
                              src={t.logoUrl}
                              alt={t.nombre}
                              style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 8,
                                backgroundColor: "#0f766e",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                flexShrink: 0,
                              }}
                            >
                              {t.nombre?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontWeight: 700, flexWrap: "wrap" }}>
                              <span>{t.nombre}</span>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  padding: "0.12rem 0.5rem",
                                  borderRadius: 999,
                                  backgroundColor: t.trabajandoAhora ? "rgba(20,184,166,0.22)" : "rgba(161,161,170,0.18)",
                                  color: t.trabajandoAhora ? "#5eead4" : "#d4d4d8",
                                }}
                              >
                                {t.trabajandoAhora ? "Abierto • Trabajando ahora" : "Cerrado"}
                              </span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#a1a1aa", marginTop: "0.2rem" }}>
                              {t.ubicacion || "Sin ubicación"} • Técnico: <strong style={{ color: "#e4e4e7" }}>{t.tecnicoNombre || "Asignado"}</strong>
                            </div>
                          </div>
                        </div>

                        <Link
                          to={`/t/${t.slug}`}
                          style={{
                            color: "#5eead4",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.2rem",
                          }}
                        >
                          Ver taller <ArrowRight size={13} />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tallerSeleccionado && (
                <div
                  style={{
                    marginTop: "0.65rem",
                    padding: "0.75rem",
                    backgroundColor: "#09090b",
                    border: "1px solid #0f766e",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    color: "#f4f4f5",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{tallerSeleccionado.nombre}</strong>
                    <span style={{ color: tallerSeleccionado.trabajandoAhora ? "#5eead4" : "#a1a1aa", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <Activity size={13} /> {tallerSeleccionado.trabajandoAhora ? "Abierto ahora mismo" : "Taller cerrado"}
                    </span>
                  </div>
                  <div style={{ color: "#d4d4d8", marginTop: "0.25rem" }}>
                    Ubicación: {tallerSeleccionado.ubicacion || "No especificada"}
                  </div>
                  <div style={{ color: "#d4d4d8", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <UserCheck size={14} color="#5eead4" /> Técnico: <strong>{tallerSeleccionado.tecnicoNombre || "Técnico asignado"}</strong>
                  </div>
                  {tallerSeleccionado.whatsapp && (
                    <div style={{ color: "#a1a1aa", marginTop: "0.15rem" }}>
                      WhatsApp: {formatoVisibleCO(tallerSeleccionado.whatsapp)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Consola Derecha: Rastreo por Placa y Buscador de Taller para Citas */}
          <div className="console-panel">
            <h2 style={{ fontSize: "1.18rem", fontWeight: 700, marginBottom: "0.35rem" }}>
              Consulta el estado de tu moto
            </h2>
            <p style={{ color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "1.15rem" }}>
              Ingresa la placa en mayúsculas para ver el taller, técnico, estado e historial.
            </p>

            <form onSubmit={handleBuscarPlaca}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#a1a1aa" }}>
                Placa (solo mayúsculas)
              </label>
              <div className="placa-input-group">
                <input
                  type="text"
                  placeholder="ABC 12D"
                  maxLength={10}
                  value={placaInput}
                  onChange={(e) => setPlacaInput(limpiarPlacaMayusculas(e.target.value))}
                  required
                />
              </div>

              <button type="submit" className="btn-accent" style={{ width: "100%", padding: "0.78rem" }}>
                <Search size={17} /> Consultar orden de servicio
              </button>
            </form>

            {/* Sección de Citas: Buscar primero el taller */}
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.12)",
                marginTop: "1.35rem",
                paddingTop: "1.1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
                  ¿Necesitas agendar mantenimiento?
                </span>
                <button
                  type="button"
                  onClick={() => setMostrarSelectorCitas((prev) => !prev)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "#5eead4",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <Calendar size={15} /> {mostrarSelectorCitas ? "Cerrar buscador" : "Agendar cita en un taller"}
                </button>
              </div>

              {mostrarSelectorCitas && (
                <div
                  style={{
                    marginTop: "0.85rem",
                    padding: "0.85rem",
                    backgroundColor: "#09090b",
                    border: "1px solid #27272a",
                    borderRadius: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e4e4e7" }}>
                      1. Elige el taller al que llevarás tu moto:
                    </span>
                    <button
                      type="button"
                      onClick={() => setMostrarSelectorCitas(false)}
                      style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <input
                    type="text"
                    className="input-field"
                    placeholder="Filtrar taller por nombre o sector..."
                    style={{ backgroundColor: "#18181b", borderColor: "#27272a", color: "#f4f4f5", minHeight: 36, marginBottom: "0.55rem", fontSize: "0.83rem" }}
                    value={filtroTallerCita}
                    onChange={(e) => setFiltroTallerCita(e.target.value)}
                  />

                  <div style={{ maxHeight: 170, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {talleresParaCita.length === 0 ? (
                      <span style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>No hay talleres disponibles con ese nombre.</span>
                    ) : (
                      talleresParaCita.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => navigate(`/t/${t.slug}#agendar-cita`)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "0.55rem 0.7rem",
                            backgroundColor: "#18181b",
                            border: "1px solid #27272a",
                            borderRadius: "8px",
                            color: "#f4f4f5",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: "0.84rem", fontWeight: 700 }}>{t.nombre}</div>
                            <div style={{ fontSize: "0.73rem", color: "#a1a1aa" }}>
                              {t.ubicacion || "Ubicación disponible"} • {t.trabajandoAhora ? "Abierto hoy" : "Agenda disponible"}
                            </div>
                          </div>
                          <span style={{ color: "#5eead4", fontSize: "0.76rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                            Agendar <ArrowRight size={13} />
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Nuestra Compañía y Planes Cotizables */}
      <section id="proposito" className="section-container">
        <div className="about-grid">
          <div>
            <span className="section-tag">Nuestra Compañía</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.4px", marginBottom: "0.85rem" }}>
              Tecnología diseñada para la operación real de talleres de motocicletas
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.65, marginBottom: "1rem" }}>
              En MechanicSoft acompañamos a talleres y centros de servicio técnico en Colombia con
              herramientas de control diario, balances financieros, inventario y trazabilidad en
              tiempo real para sus clientes.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={17} color="var(--accent-brand)" />
                <span>Cierre de caja diario y balances consolidados por día, mes y año</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={17} color="var(--accent-brand)" />
                <span>Indicador en vivo de apertura/cierre de jornada y técnico responsable</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={17} color="var(--accent-brand)" />
                <span>Soporte directo desde nuestra área operativa en Colombia</span>
              </div>
            </div>
          </div>

          <div id="planes" className="service-list">
            <span className="section-tag">Planes Mensuales y Anualidades</span>
            {planes.map((plan, idx) => (
              <div key={plan.codigo || idx} className="service-row">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "1rem" }}>{plan.nombre}</strong>
                  <span style={{ fontWeight: 800, color: "var(--accent-brand)", fontSize: "0.92rem" }}>
                    {plan.precioTexto}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.3rem", marginBottom: "0.75rem" }}>
                  {plan.descripcion}
                </p>
                <button
                  type="button"
                  onClick={() => seleccionarPlanParaCotizar(plan)}
                  className="btn-accent"
                  style={{ fontSize: "0.82rem", padding: "0.48rem 0.9rem" }}
                >
                  <MessageCircle size={15} /> Cotizar este plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario de Cotización Directa a WhatsApp */}
      <section id="contacto-servicios" className="contact-band">
        <div className="contact-grid">
          <div>
            <span className="section-tag">Área Operativa y Comercial</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.4px", marginBottom: "0.75rem" }}>
              Cotiza tu plan y activa tu taller
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              Completa los datos de tu taller y al enviar se abrirá nuestro canal oficial de WhatsApp{" "}
              <strong>+57 322 600 7190</strong> con la cotización del plan elegido.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Users size={18} color="var(--accent-brand)" />
                <span>Acompañamiento personalizado por nuestra área operativa</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <MapPin size={18} color="var(--accent-brand)" />
                <span>Números registrados en formato Colombia (+57 automático)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Video size={18} color="var(--accent-brand)" />
                <span>Demostración virtual disponible para tu equipo de trabajo</span>
              </div>
            </div>
          </div>

          <form onSubmit={enviarSolicitudWhatsApp} className="contact-form-card">
            <h3 style={{ fontSize: "1.08rem", fontWeight: 700 }}>
              Completar datos para cotizar por WhatsApp
            </h3>

            <div className="form-group">
              <label>Plan a cotizar *</label>
              <select
                className="input-field"
                value={contacto.interes}
                onChange={(e) => setContacto({ ...contacto, interes: e.target.value })}
              >
                {planes.length > 0 ? (
                  planes.map((p, i) => {
                    const label = `${p.nombre}${p.precioTexto ? ` (${p.precioTexto})` : ""}`;
                    return (
                      <option key={i} value={label}>
                        {label}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="Plan Mensual Operativo ($65.000 COP / mes)">
                      Plan Mensual Operativo ($65.000 COP / mes)
                    </option>
                    <option value="Plan Anual Taller Pro ($620.000 COP / año)">
                      Plan Anual Taller Pro ($620.000 COP / año)
                    </option>
                  </>
                )}
              </select>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Tu nombre *</label>
                <input
                  className="input-field"
                  placeholder="Ej: Andrés Gómez"
                  value={contacto.nombrePersona}
                  onChange={(e) => setContacto({ ...contacto, nombrePersona: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre de tu taller *</label>
                <input
                  className="input-field"
                  placeholder="Ej: Piston Race"
                  value={contacto.nombreTaller}
                  onChange={(e) => setContacto({ ...contacto, nombreTaller: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Ciudad / Ubicación del taller *</label>
                <input
                  className="input-field"
                  placeholder="Ej: Soacha"
                  value={contacto.ciudadUbicacion}
                  onChange={(e) => setContacto({ ...contacto, ciudadUbicacion: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tu WhatsApp Colombia (sin +57) *</label>
                <input
                  className="input-field"
                  placeholder="Ej: 3226007190"
                  value={contacto.whatsappContacto}
                  onChange={(e) => setContacto({ ...contacto, whatsappContacto: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tamaño del equipo de trabajo</label>
              <select
                className="input-field"
                value={contacto.trabajadores}
                onChange={(e) => setContacto({ ...contacto, trabajadores: e.target.value })}
              >
                <option value="1 a 2 (Dueño / Mecánico)">1 a 2 (Dueño / Mecánico)</option>
                <option value="3 a 5 trabajadores">3 a 5 trabajadores</option>
                <option value="Más de 5 trabajadores">Más de 5 trabajadores</option>
              </select>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "0.55rem", fontSize: "0.88rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                style={{ width: 17, height: 17, accentColor: "var(--accent-brand)" }}
                checked={contacto.reunionVirtual}
                onChange={(e) => setContacto({ ...contacto, reunionVirtual: e.target.checked })}
              />
              Solicitar reunión virtual con nuestra área operativa
            </label>

            <button type="submit" className="btn-accent" style={{ width: "100%", padding: "0.82rem" }}>
              <MessageCircle size={18} /> Enviar cotización por WhatsApp
            </button>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section id="preguntas-frecuentes" className="section-container">
        <div className="section-header">
          <span className="section-tag">Centro de Ayuda</span>
          <h2>Preguntas Frecuentes</h2>
          <p>Respuestas claras sobre nuestros planes y la operación del sistema.</p>
        </div>

        <div className="faq-list">
          {PREGUNTAS_FRECUENTES.map((item, idx) => {
            const abierta = faqAbierta === idx;
            return (
              <div key={idx} className="faq-item">
                <button type="button" className="faq-question" onClick={() => setFaqAbierta(abierta ? -1 : idx)}>
                  <span>{item.pregunta}</span>
                  {abierta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {abierta && <div className="faq-answer">{item.respuesta}</div>}
              </div>
            );
          })}
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid var(--border-color)",
          padding: "1.5rem",
          textAlign: "center",
          fontSize: "0.84rem",
          color: "var(--text-secondary)",
          backgroundColor: "var(--bg-surface)",
        }}
      >
        MechanicSoft • Área Operativa y Comercial:{" "}
        <a
          href={`https://wa.me/${WHATSAPP_COMERCIAL}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--accent-brand)", fontWeight: 700, textDecoration: "none" }}
        >
          +57 322 600 7190
        </a>
      </footer>
    </div>
  );
}