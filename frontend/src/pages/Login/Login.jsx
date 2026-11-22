import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const { iniciarSesion } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      iniciarSesion(res.data.usuario, res.data.token, res.data.taller);

      if (res.data.usuario.rol === "SUPER_ADMIN") {
        navigate("/superadmin");
      } else {
        navigate("/panel");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Credenciales incorrectas");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div style={{ position: "fixed", top: "1rem", right: "1rem" }}>
        <button
          onClick={toggleTheme}
          className="icon-btn"
          title={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="card login-card">
        <div className="login-header">
          <div className="brand-monogram" style={{ marginBottom: "0.75rem" }}>
            MS
          </div>
          <h1>MechanicSoft</h1>
          <p>Ingresa con tus credenciales asignadas</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              className="input-field"
              placeholder="usuario@correo.com"
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
            className="btn-primary"
            style={{ width: "100%" }}
            disabled={cargando}
          >
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