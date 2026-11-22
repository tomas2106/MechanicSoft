import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, MessageCircle, RefreshCw } from "lucide-react";
import { ordenService } from "../../services/ordenService";
import { useAuth } from "../../context/AuthContext";
import "./Tablero.css";

const ESTADOS = [
  { id: "TODOS", label: "Todas" },
  { id: "RECIBIDO", label: "Recibidas" },
  { id: "DIAGNOSTICO", label: "Diagnóstico" },
  { id: "EN_REPARACION", label: "En reparación" },
  { id: "LISTO_PARA_ENTREGA", label: "Listas" },
  { id: "ENTREGADO", label: "Entregadas" },
];

export default function Tablero() {
  const [ordenes, setOrdenes] = useState([]);
  const [filtro, setFiltro] = useState("TODOS");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const { taller } = useAuth();

  const cargarOrdenes = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await ordenService.obtenerTodas();
      setOrdenes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const cambiarEstado = async (ordenId, nuevoEstado) => {
    try {
      await ordenService.actualizarEstado(ordenId, nuevoEstado);
      setOrdenes((prev) =>
        prev.map((o) => (o.id === ordenId ? { ...o, estado: nuevoEstado } : o))
      );
    } catch (err) {
      alert("No se pudo actualizar el estado: " + err.message);
    }
  };

  const notificarWhatsApp = (orden) => {
    const telefono = (orden.clienteTelefono || orden.vehiculo?.cliente?.telefono || "").replace(/\D/g, "");
    if (!telefono) return alert("Este cliente no tiene teléfono registrado.");

    const linkConsulta = `${window.location.origin}/t/${taller?.slug || "mi-taller"}`;
    const mensaje = `Hola ${orden.clienteNombre || ""}, te escribimos de *${taller?.nombre || "MechanicSoft"}*. Tu moto (${orden.placa || orden.vehiculo?.placa || ""}) ahora está en estado: *${orden.estado.replace(/_/g, " ")}*. Puedes revisar el detalle aquí: ${linkConsulta}`;
    window.open(`https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const ordenesFiltradas =
    filtro === "TODOS" ? ordenes : ordenes.filter((o) => o.estado === filtro);

  return (
    <div>
      <div className="tablero-header">
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Órdenes en Taller</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Gestiona el avance de las motocicletas en tiempo real
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={cargarOrdenes} className="btn-secondary" title="Actualizar">
            <RefreshCw size={16} />
          </button>
          <Link to="/panel/recepcion" className="btn-primary" style={{ textDecoration: "none" }}>
            <Plus size={18} /> Nueva recepción
          </Link>
        </div>
      </div>

      <div className="filtros-bar">
        {ESTADOS.map((est) => (
          <button
            key={est.id}
            onClick={() => setFiltro(est.id)}
            className={`filtro-chip ${filtro === est.id ? "active" : ""}`}
          >
            {est.label}
          </button>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {cargando ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)" }}>
          Cargando órdenes del taller...
        </div>
      ) : ordenesFiltradas.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            No hay órdenes registradas en esta vista.
          </p>
          <Link to="/panel/recepcion" className="btn-primary" style={{ textDecoration: "none" }}>
            Registrar primer ingreso
          </Link>
        </div>
      ) : (
        <div className="ordenes-grid">
          {ordenesFiltradas.map((orden) => {
            const placa = orden.placa || orden.vehiculo?.placa || "SIN PLACA";
            const moto = `${orden.marca || orden.vehiculo?.marca || ""} ${orden.modelo || orden.vehiculo?.modelo || ""}`.trim();
            const cliente = orden.clienteNombre || orden.vehiculo?.cliente?.nombre || "Cliente";

            return (
              <div key={orden.id} className="card orden-card">
                <div>
                  <div className="orden-top">
                    <div>
                      <span className="placa-badge">{placa}</span>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginTop: "0.45rem" }}>
                        {moto || "Motocicleta"}
                      </h3>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        {cliente} • Orden #{orden.id}
                      </span>
                    </div>
                    <span className={`status-pill status-${orden.estado}`}>
                      {orden.estado.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.9rem", marginTop: "0.75rem", color: "var(--text-primary)" }}>
                    {orden.motivoIngreso || orden.descripcion || "Sin descripción"}
                  </p>

                  {orden.valorTotal > 0 && (
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, marginTop: "0.5rem", color: "var(--primary)" }}>
                      ${Number(orden.valorTotal).toLocaleString("es-CO")}
                    </p>
                  )}
                </div>

                <div className="orden-actions">
                  <select
                    className="select-estado"
                    value={orden.estado}
                    onChange={(e) => cambiarEstado(orden.id, e.target.value)}
                  >
                    {ESTADOS.filter((e) => e.id !== "TODOS").map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => notificarWhatsApp(orden)}
                    className="icon-btn"
                    title="Notificar avance por WhatsApp"
                    style={{ color: "#059669" }}
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}