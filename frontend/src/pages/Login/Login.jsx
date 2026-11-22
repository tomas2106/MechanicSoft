import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wrench, ArrowLeft } from "lucide-react";
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
      const res = await api.post("/auth/login", { email, password });
      iniciarSesion(res.data.usuario, res.data.token, res.data.taller);
      navigate("/panel");
    } catch (err) {
      // Fallback temporal mientras conectamos el endpoint /auth/login en el backend
      if (err.response?.status === 404) {
        iniciarSesion(
          { nombre: "Administrador", email },
          "session-local-dev",
          {
            id: 1,
            nombre: "Taller Principal",
            slug: "taller-principal",
            ubicacion: "Dirección pendiente de configurar",
            whatsapp: "",
          }
        );
        navigate("/panel");
        return;
      }
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <div className="login-header">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--primary-soft)",
              color: "var(--primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "0.75rem",
            }}
          >
            <Wrench size={22} />
          </div>
          <h1>MechanicSoft</h1>
          <p>Ingresa con las credenciales de tu taller</p>
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

          <button type="submit" className="btn-primary" style={{ width: "100%" }} disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
          <Link
            to="/"
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <ArrowLeft size={15} /> Volver al portal de clientes
          </Link>
        </div>
      </div>
    </div>
  );
}