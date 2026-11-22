import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  MessageCircle,
  RefreshCw,
  FileText,
  X,
  Bike,
  Wrench,
  CheckCircle,
  DollarSign,
} from "lucide-react";
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
  const [ordenEditando, setOrdenEditando] = useState(null);
  const [guardandoDetalle, setGuardandoDetalle] = useState(false);
  const { taller } = useAuth();

  const cargarOrdenes = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await ordenService.obtenerTodas();
      const lista = Array.isArray(res.data) ? res.data : [];
      setOrdenes(lista.sort((a, b) => b.id - a.id));
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

  const guardarDetalleTecnico = async (e) => {
    e.preventDefault();
    if (!ordenEditando) return;
    setGuardandoDetalle(true);

    try {
      const payload = {
        vehiculoId: ordenEditando.vehiculo?.id || ordenEditando.vehiculoId,
        kilometrajeIngreso: ordenEditando.kilometrajeIngreso || 0,
        motivoIngreso: ordenEditando.motivoIngreso,
        diagnostico: ordenEditando.diagnostico || "",
        trabajoRealizado: ordenEditando.trabajoRealizado || "",
        valorTotal: Number(ordenEditando.valorTotal) || 0,
        estado: ordenEditando.estado,
      };
      const res = await ordenService.actualizar(ordenEditando.id, payload);
      setOrdenes((prev) =>
        prev.map((o) => (o.id === ordenEditando.id ? { ...o, ...res.data } : o))
      );
      setOrdenEditando(null);
    } catch (err) {
      alert("Error al guardar ficha técnica: " + (err.response?.data?.message || err.message));
    } finally {
      setGuardandoDetalle(false);
    }
  };

  const notificarWhatsApp = (orden) => {
    const telefono = (orden.vehiculo?.cliente?.telefono || "").replace(/\D/g, "");
    if (!telefono) return alert("Este cliente no tiene teléfono registrado.");

    const linkConsulta = `${window.location.origin}/t/${taller?.slug || "mi-taller"}`;
    const valorTexto =
      orden.valorTotal > 0
        ? `\nValor estimado: $${Number(orden.valorTotal).toLocaleString("es-CO")}`
        : "";
    const mensaje = `Hola ${orden.vehiculo?.cliente?.nombre || ""}, te escribimos de *${
      taller?.nombre || "MechanicSoft"
    }*.\nTu moto *${orden.vehiculo?.marca || ""} ${orden.vehiculo?.modelo || ""}* (${
      orden.vehiculo?.placa || ""
    }) está en estado: *${orden.estado.replace(/_/g, " ")}*.${valorTexto}\nConsulta el detalle aquí: ${linkConsulta}`;

    const prefijo = telefono.startsWith("57") ? "" : "57";
    window.open(`https://wa.me/${prefijo}${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  // Cálculo de KPIs operativos
  const activas = ordenes.filter((o) => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO");
  const enProceso = ordenes.filter(
    (o) => o.estado === "DIAGNOSTICO" || o.estado === "EN_REPARACION"
  );
  const listasEntrega = ordenes.filter((o) => o.estado === "LISTO_PARA_ENTREGA");
  const totalFacturacionActiva = activas.reduce(
    (acc, o) => acc + (Number(o.valorTotal) || 0),
    0
  );

  const ordenesFiltradas =
    filtro === "TODOS" ? ordenes : ordenes.filter((o) => o.estado === filtro);

  return (
    <div>
      <div className="tablero-header">
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.4px" }}>
            Panel Operativo
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Control de patio, diagnósticos y entregas en tiempo real
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={cargarOrdenes} className="btn-secondary" title="Actualizar tablero">
            <RefreshCw size={16} />
          </button>
          <Link to="/panel/recepcion" className="btn-primary" style={{ textDecoration: "none" }}>
            <Plus size={18} /> Nueva recepción
          </Link>
        </div>
      </div>

      {/* KPIs Comerciales */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span>En Taller</span>
            <Bike size={16} />
          </div>
          <div className="kpi-value">{activas.length}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span>En Proceso</span>
            <Wrench size={16} />
          </div>
          <div className="kpi-value">{enProceso.length}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span>Listas Entrega</span>
            <CheckCircle size={16} />
          </div>
          <div className="kpi-value">{listasEntrega.length}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span>Cotizado Activo</span>
            <DollarSign size={16} />
          </div>
          <div className="kpi-value">
            ${totalFacturacionActiva.toLocaleString("es-CO")}
          </div>
        </div>
      </div>

      {/* Filtros por estado con contador */}
      <div className="filtros-bar">
        {ESTADOS.map((est) => {
          const count =
            est.id === "TODOS"
              ? ordenes.length
              : ordenes.filter((o) => o.estado === est.id).length;

          return (
            <button
              key={est.id}
              onClick={() => setFiltro(est.id)}
              className={`filtro-chip ${filtro === est.id ? "active" : ""}`}
            >
              <span>{est.label}</span>
              <span className="chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {cargando ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Sincronizando órdenes del taller...
        </div>
      ) : ordenesFiltradas.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            No hay órdenes en esta categoría.
          </p>
          <Link to="/panel/recepcion" className="btn-primary" style={{ textDecoration: "none" }}>
            Registrar ingreso de moto
          </Link>
        </div>
      ) : (
        <div className="ordenes-grid">
          {ordenesFiltradas.map((orden) => {
            const v = orden.vehiculo || {};
            const c = v.cliente || {};

            return (
              <div key={orden.id} className="card orden-card">
                <div>
                  <div className="orden-top">
                    <div>
                      <span className="placa-badge">{v.placa || "SIN PLACA"}</span>
                      <h3 style={{ fontSize: "1.02rem", fontWeight: 700, marginTop: "0.45rem" }}>
                        {v.marca} {v.modelo}
                      </h3>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        {c.nombre || "Cliente"} • Orden #{orden.id}
                      </span>
                    </div>
                    <span className={`status-pill status-${orden.estado}`}>
                      {orden.estado.replace(/_/g, " ")}
                    </span>
                  </div>

                  {v.fotoVehiculo && (
                    <img src={v.fotoVehiculo} alt={v.placa} className="orden-thumb" />
                  )}

                  <p style={{ fontSize: "0.9rem", marginTop: "0.75rem", color: "var(--text-primary)" }}>
                    {orden.motivoIngreso}
                  </p>

                  {orden.diagnostico && (
                    <p
                      style={{
                        fontSize: "0.82rem",
                        marginTop: "0.45rem",
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--bg-app)",
                        padding: "0.45rem 0.65rem",
                        borderRadius: "6px",
                      }}
                    >
                      <strong>Diagnóstico:</strong> {orden.diagnostico}
                    </p>
                  )}

                  {orden.valorTotal > 0 && (
                    <p style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "0.6rem" }}>
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
                    onClick={() => setOrdenEditando({ ...orden })}
                    className="icon-btn"
                    title="Ficha técnica / Diagnóstico / Precio"
                  >
                    <FileText size={17} />
                  </button>

                  <button
                    onClick={() => notificarWhatsApp(orden)}
                    className="icon-btn"
                    title="Enviar actualización por WhatsApp"
                    style={{ color: "#166534" }}
                  >
                    <MessageCircle size={17} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Ficha Técnica de la Orden */}
      {ordenEditando && (
        <div className="modal-backdrop" onClick={() => setOrdenEditando(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Orden #{ordenEditando.id} • {ordenEditando.vehiculo?.placa}
                </h3>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  {ordenEditando.vehiculo?.marca} {ordenEditando.vehiculo?.modelo}
                </span>
              </div>
              <button onClick={() => setOrdenEditando(null)} className="icon-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardarDetalleTecnico}>
              <div className="form-group">
                <label>Motivo de ingreso</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={ordenEditando.motivoIngreso || ""}
                  onChange={(e) =>
                    setOrdenEditando({ ...ordenEditando, motivoIngreso: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Diagnóstico del mecánico (Visible para el cliente)</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Ej: Kit de arrastre desgastado y fuga en retenedor de barra..."
                  value={ordenEditando.diagnostico || ""}
                  onChange={(e) =>
                    setOrdenEditando({ ...ordenEditando, diagnostico: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Trabajo realizado / Repuestos instalados</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Ej: Cambio de aceite Motul 5100, ajuste de válvulas..."
                  value={ordenEditando.trabajoRealizado || ""}
                  onChange={(e) =>
                    setOrdenEditando({ ...ordenEditando, trabajoRealizado: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Valor total del servicio ($ COP)</label>
                <input
                  type="number"
                  className="input-field"
                  value={ordenEditando.valorTotal || 0}
                  onChange={(e) =>
                    setOrdenEditando({ ...ordenEditando, valorTotal: e.target.value })
                  }
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setOrdenEditando(null)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={guardandoDetalle}>
                  {guardandoDetalle ? "Guardando..." : "Guardar ficha técnica"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}