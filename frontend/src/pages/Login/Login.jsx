import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, CheckCircle2, MessageCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const usuario = res.data?.usuario;
      const token = res.data?.token;
      const taller = res.data?.taller || null;

      if (!usuario || !usuario.rol) {
        setError("Respuesta inesperada del servidor al iniciar sesión. Verifica que el backend esté actualizado.");
        return;
      }

      iniciarSesion(usuario, token, taller);

      const rolNormalizado = String(usuario.rol).toUpperCase();
      if (rolNormalizado === "SUPER_ADMIN") {
        navigate("/superadmin", { replace: true });
      } else {
        navigate("/panel", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Credenciales incorrectas");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-split-page">
      {/* Columna Izquierda Visual Corporativa */}
      <div className="login-visual-side">
        <div>
          <div className="brand-wordmark" style={{ color: "#ffffff", fontSize: "1.35rem" }}>
            MECHANIC<span style={{ color: "#2dd4bf" }}>SOFT</span>
          </div>
          <span style={{ display: "block", fontSize: "0.78rem", color: "#ccfbf1", marginTop: "0.2rem" }}>
            Control Operativo de Talleres
          </span>
        </div>

        <div style={{ maxWidth: 440 }}>
          <h2 style={{ fontSize: "1.95rem", fontWeight: 850, lineHeight: 1.2, marginBottom: "1rem" }}>
            Gestiona tu patio, diagnósticos y clientes desde un solo lugar
          </h2>
          <p style={{ color: "#e4e4e7", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            Accede con las credenciales asignadas a tu taller para registrar ingresos, actualizar
            órdenes de servicio y mantener informados a tus clientes.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.88rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={17} color="#5eead4" />
              <span>Acceso aislado y seguro por taller</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={17} color="#5eead4" />
              <span>Perfiles diferenciados para administradores y mecánicos</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={17} color="#5eead4" />
              <span>Sincronización en tiempo real en celular y computador</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: "0.8rem", color: "#ccfbf1", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <ShieldCheck size={16} /> Plataforma protegida • Soporte WhatsApp +57 322 600 7190
        </div>
      </div>

      {/* Columna Derecha Formulario */}
      <div className="login-form-side">
        <div className="login-top-controls">
          <Link
            to="/"
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.86rem",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
        </div>

        <div className="login-box">
          <div style={{ marginBottom: "1.75rem" }}>
            <div className="brand-wordmark" style={{ marginBottom: "0.6rem" }}>
              MECHANIC<span>SOFT</span>
            </div>
            <h1 style={{ fontSize: "1.55rem", fontWeight: 800, letterSpacing: "-0.4px" }}>
              Ingreso a Talleres
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
              Ingresa tu correo y contraseña asignados para continuar
            </p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                className="input-field"
                placeholder="taller@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="btn-accent"
              style={{ width: "100%", padding: "0.85rem", marginTop: "0.5rem" }}
              disabled={cargando}
            >
              {cargando ? "Verificando acceso..." : "Iniciar sesión"}
            </button>
          </form>

          <div
            style={{
              marginTop: "1.75rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border-color)",
              textAlign: "center",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            ¿Aún no tienes cuenta para tu taller?{" "}
            <a
              href="https://wa.me/573226007190?text=Hola%2C%20quiero%20solicitar%20acceso%20para%20mi%20taller%20en%20MechanicSoft"
              target="_blank"
              rel="noreferrer"
              style={{
                color: "var(--accent-brand)",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <MessageCircle size={14} /> Solicitar activación
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}