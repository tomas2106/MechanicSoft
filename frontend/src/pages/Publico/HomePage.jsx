import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Wrench,
  ArrowRight,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Store,
  CheckCircle2,
  Video,
  Users,
  MapPin,
} from "lucide-react";
import { tallerService } from "../../services/tallerService";
import "./HomePage.css";

const PREGUNTAS_FRECUENTES = [
  {
    pregunta: "¿Cómo consulto el estado de mi motocicleta?",
    respuesta:
      "Solo digita el número de placa de tu moto (o tu número de WhatsApp registrado) en el buscador superior, o selecciona el nombre de tu taller aliado para ver en tiempo real si tu moto está recibida, en diagnóstico, en reparación o lista para entregar.",
  },
  {
    pregunta: "¿Cómo puedo afiliar mi taller a MechanicSoft?",
    respuesta:
      "Completa el formulario de contacto en esta página o escríbenos al +57 322 600 7190. Te enviaremos la información de planes, formas de pago en Colombia y habilitaremos tu cuenta de administrador con enlace propio.",
  },
  {
    pregunta: "¿Qué pasa si yo mismo soy el dueño y también trabajo como mecánico?",
    respuesta:
      "Nuestro sistema está diseñado tanto para talleres independientes de un solo mecánico como para centros de servicio con varios técnicos. Como administrador puedes operar motos directamente y crear cuentas para tu equipo cuando lo necesites.",
  },
  {
    pregunta: "¿Necesito instalar algún programa especial?",
    respuesta:
      "No. Funciona directamente desde el navegador de cualquier celular, tablet o computador y permite instalarse como aplicación web en la pantalla de inicio.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [talleres, setTalleres] = useState([]);
  const [buscarTaller, setBuscarTaller] = useState("");
  const [placaInput, setPlacaInput] = useState("");
  const [faqAbierta, setFaqAbierta] = useState(0);

  const [contacto, setContacto] = useState({
    nombrePersona: "",
    nombreTaller: "",
    ciudadUbicacion: "",
    trabajadores: "1 a 2 (Dueño / Mecánico)",
    interes: "Información de planes y formas de pago",
    reunionVirtual: true,
  });

  const WHATSAPP_COMERCIAL = "573226007190";

  useEffect(() => {
    tallerService
      .listarPublicos()
      .then((res) => setTalleres(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const talleresFiltrados = talleres.filter((t) =>
    t.nombre.toLowerCase().includes(buscarTaller.toLowerCase())
  );

  const handleBuscarPlaca = (e) => {
    e.preventDefault();
    if (!placaInput.trim()) return;
    navigate(`/t/general?q=${encodeURIComponent(placaInput.trim().toUpperCase())}`);
  };

  const enviarSolicitudWhatsApp = (e) => {
    e.preventDefault();
    const reunionTexto = contacto.reunionVirtual
      ? "Sí, me gustaría agendar una reunión virtual corta para verlo."
      : "Por ahora prefiero información por chat.";

    const mensaje = `Hola, vengo desde *MechanicSoft* y quiero información comercial:
• *Nombre:* ${contacto.nombrePersona}
• *Taller:* ${contacto.nombreTaller}
• *Ubicación:* ${contacto.ciudadUbicacion}
• *Equipo de trabajo:* ${contacto.trabajadores}
• *Consulta:* ${contacto.interes}
• *Reunión virtual:* ${reunionTexto}`;

    window.open(
      `https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  return (
    <div className="home-wrapper">
      {/* Barra Superior Corporativa */}
      <header className="home-navbar">
        <Link to="/" className="home-brand">
          <div>
            <div className="brand-wordmark">
              MECHANIC<span>SOFT</span>
            </div>
            <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Gestión Operativa de Talleres
            </span>
          </div>
        </Link>

        <nav className="nav-links">
          <a href="#proposito">Propósito</a>
          <a href="#como-trabajamos">Cómo trabajamos</a>
          <a href="#contacto-servicios">Planes y Contacto</a>
          <a href="#preguntas-frecuentes">Preguntas frecuentes</a>
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="btn-accent" style={{ textDecoration: "none", fontSize: "0.86rem" }}>
            <Wrench size={15} /> Ingreso Talleres
          </Link>
        </div>
      </header>

      {/* Hero con Imagen Fotográfica de Taller */}
      <section className="hero-banner">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">Plataforma B2B para Talleres de Motos</div>
            <h1 className="hero-title">
              Ordena tu taller y ofrece <span>seguimiento en vivo</span> a cada cliente
            </h1>
            <p className="hero-subtitle">
              Digitaliza la recepción de motocicletas, diagnósticos técnicos con fotografía y
              notificaciones por WhatsApp. Sin papeles, desde cualquier celular o computador.
            </p>

            {/* Buscador de Taller por Nombre */}
            <div
              style={{
                maxWidth: 460,
                backgroundColor: "rgba(18, 18, 21, 0.85)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "10px",
                padding: "1rem",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#5eead4",
                  marginBottom: "0.45rem",
                }}
              >
                Buscar tu taller por nombre
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Escribe el nombre del taller..."
                style={{
                  backgroundColor: "#09090b",
                  borderColor: "#27272a",
                  color: "#f4f4f5",
                  fontSize: "0.88rem",
                }}
                value={buscarTaller}
                onChange={(e) => setBuscarTaller(e.target.value)}
              />

              {talleresFiltrados.length > 0 && (
                <div
                  style={{
                    marginTop: "0.55rem",
                    maxHeight: 135,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                  }}
                >
                  {talleresFiltrados.map((t) => (
                    <Link
                      key={t.id}
                      to={`/t/${t.slug}`}
                      style={{
                        padding: "0.5rem 0.7rem",
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "6px",
                        fontSize: "0.84rem",
                        textDecoration: "none",
                        color: "#f4f4f5",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <Store size={14} color="#2dd4bf" /> {t.nombre}
                      </span>
                      <ArrowRight size={14} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Consola Derecha: Rastreo por Placa */}
          <div className="console-panel">
            <h2 style={{ fontSize: "1.18rem", fontWeight: 700, marginBottom: "0.35rem" }}>
              Consulta el estado de tu moto
            </h2>
            <p style={{ color: "#a1a1aa", fontSize: "0.85rem", marginBottom: "1.15rem" }}>
              Digita la placa o el número de WhatsApp registrado en el taller.
            </p>

            <form onSubmit={handleBuscarPlaca}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#a1a1aa" }}>
                Placa o WhatsApp
              </label>
              <div className="placa-input-group">
                <input
                  type="text"
                  placeholder="ABC 12D"
                  maxLength={12}
                  value={placaInput}
                  onChange={(e) => setPlacaInput(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-accent" style={{ width: "100%", padding: "0.78rem" }}>
                <Search size={17} /> Consultar orden de servicio
              </button>
            </form>

            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.12)",
                marginTop: "1.35rem",
                paddingTop: "1.1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>
                ¿Eres dueño o mecánico?
              </span>
              <Link
                to="/login"
                style={{
                  color: "#5eead4",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                Ingresar al taller <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Propósito y Qué Hacemos */}
      <section id="proposito" className="section-container">
        <div className="about-grid">
          <div>
            <span className="section-tag">Nuestro Propósito</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.4px", marginBottom: "0.85rem" }}>
              Profesionalizar la operación diaria de cada taller de motocicletas
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.65, marginBottom: "1rem" }}>
              Nuestro propósito es brindar a los dueños de talleres y mecánicos una herramienta
              confiable, rápida y sin complicaciones técnicas para controlar cada vehículo que
              ingresa a sus instalaciones.
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>
              Reemplazamos las libretas de papel y la incertidumbre del cliente por un flujo
              transparente: el taller mantiene el historial técnico organizado y el motociclista
              confía al ver el progreso real de su reparación.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={17} color="var(--accent-brand)" />
                <span>Cero pérdidas de información de clientes, motos o cotizaciones</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={17} color="var(--accent-brand)" />
                <span>Respaldo fotográfico del estado en que se recibe cada moto</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={17} color="var(--accent-brand)" />
                <span>Ahorro de tiempo al evitar llamadas repetitivas de estado</span>
              </div>
            </div>
          </div>

          <div className="service-list">
            <span className="section-tag">Módulos Incluidos</span>
            <div className="service-row">
              <strong style={{ fontSize: "0.98rem" }}>Recepción Ágil en Patio</strong>
              <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Registro unificado de propietario, motocicleta, kilometraje y fotografía comprimida
                en segundos.
              </p>
            </div>

            <div className="service-row">
              <strong style={{ fontSize: "0.98rem" }}>Tablero Operativo y Ficha Técnica</strong>
              <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Control visual de motos en patio, diagnóstico técnico, detalle de repuestos y
                liquidación del servicio.
              </p>
            </div>

            <div className="service-row">
              <strong style={{ fontSize: "0.98rem" }}>Portal Exclusivo por Taller</strong>
              <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                Cada taller recibe su propio enlace personalizado con su logotipo, ubicación y
                botón directo a su WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Cómo Trabajamos */}
        <div id="como-trabajamos" style={{ marginTop: "3.75rem" }}>
          <span className="section-tag">Cómo trabajamos</span>
          <h3 style={{ fontSize: "1.45rem", fontWeight: 800 }}>
            Implementación rápida en 4 pasos
          </h3>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">1</span>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Diagnóstico y Plan
              </h4>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                Nos escribes por WhatsApp, revisamos el tamaño de tu taller y definimos el plan
                ideal para tu operación.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">2</span>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Activación del Taller
              </h4>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                Configuramos tu espacio privado, enlace web para clientes y te entregamos tus
                credenciales de acceso.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">3</span>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Equipo y Roles
              </h4>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                Decides si tú mismo operas como mecánico o creas cuentas individuales para tus
                trabajadores.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">4</span>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.3rem" }}>
                Operación en Vivo
              </h4>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                Empiezas a recibir motos, enviar estados por WhatsApp y construir el historial de
                tu negocio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario Comercial de Contacto hacia WhatsApp */}
      <section id="contacto-servicios" className="contact-band">
        <div className="contact-grid">
          <div>
            <span className="section-tag">Información de Servicios y Pagos</span>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.4px", marginBottom: "0.75rem" }}>
              Solicita información o agenda una demostración para tu taller
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              Completa estos datos breves y se abrirá nuestro chat directo de WhatsApp (
              <strong>+57 322 600 7190</strong>) con tu solicitud lista para atenderte de
              inmediato con precios, medios de pago y activación.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Users size={18} color="var(--accent-brand)" />
                <span>Planes adaptados desde 1 mecánico hasta talleres multi-bahía</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <MapPin size={18} color="var(--accent-brand)" />
                <span>Soporte y activación remota para talleres en toda Colombia</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <Video size={18} color="var(--accent-brand)" />
                <span>Opción de reunión virtual de 15 minutos para mostrar el sistema</span>
              </div>
            </div>
          </div>

          <form onSubmit={enviarSolicitudWhatsApp} className="contact-form-card">
            <h3 style={{ fontSize: "1.08rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              Enviar consulta a WhatsApp Comercial
            </h3>

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
                  placeholder="Ej: MotoServicio Central"
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
                  placeholder="Ej: Bogotá, Soacha, Medellín..."
                  value={contacto.ciudadUbicacion}
                  onChange={(e) => setContacto({ ...contacto, ciudadUbicacion: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Número de trabajadores</label>
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
            </div>

            <div className="form-group">
              <label>¿Qué información deseas consultar?</label>
              <select
                className="input-field"
                value={contacto.interes}
                onChange={(e) => setContacto({ ...contacto, interes: e.target.value })}
              >
                <option value="Información de planes y formas de pago">
                  Información de planes y formas de pago
                </option>
                <option value="Activar cuenta para mi taller">
                  Activar cuenta para mi taller
                </option>
                <option value="Soporte o dudas generales">Soporte o dudas generales</option>
              </select>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.88rem",
                cursor: "pointer",
                margin: "0.25rem 0 0.5rem",
              }}
            >
              <input
                type="checkbox"
                style={{ width: 17, height: 17, accentColor: "var(--accent-brand)" }}
                checked={contacto.reunionVirtual}
                onChange={(e) => setContacto({ ...contacto, reunionVirtual: e.target.checked })}
              />
              Me gustaría agendar una reunión virtual corta para ver cómo funciona
            </label>

            <button type="submit" className="btn-accent" style={{ width: "100%", padding: "0.85rem" }}>
              <MessageCircle size={18} /> Enviar solicitud por WhatsApp
            </button>
          </form>
        </div>
      </section>

      {/* Sección Preguntas Frecuentes */}
      <section id="preguntas-frecuentes" className="section-container">
        <div className="section-header">
          <span className="section-tag">Centro de Ayuda</span>
          <h2>Preguntas Frecuentes</h2>
          <p>Respuestas rápidas sobre el uso de la plataforma para talleres y motociclistas.</p>
        </div>

        <div className="faq-list">
          {PREGUNTAS_FRECUENTES.map((item, idx) => {
            const abierta = faqAbierta === idx;
            return (
              <div key={idx} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setFaqAbierta(abierta ? -1 : idx)}
                >
                  <span>{item.pregunta}</span>
                  {abierta ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {abierta && <div className="faq-answer">{item.respuesta}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
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
        MechanicSoft • Gestión Operativa de Talleres • WhatsApp Comercial:{" "}
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