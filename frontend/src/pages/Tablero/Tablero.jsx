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
  Receipt,
  BellRing,
  Printer,
  ShieldCheck,
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
  const [ordenComprobante, setOrdenComprobante] = useState(null);
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
        diasGarantia: Number(ordenEditando.diasGarantia) || 30,
        proximoServicioDias: Number(ordenEditando.proximoServicioDias) || 45,
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

    const linkConsulta = `${window.location.origin}/t/${taller?.slug || "general"}`;
    const valorTexto =
      orden.valorTotal > 0
        ? `\nValor estimado: $${Number(orden.valorTotal).toLocaleString("es-CO")}`
        : "";
    const mensaje = `Hola ${orden.vehiculo?.cliente?.nombre || ""}, te escribimos de *${
      taller?.nombre || "MechanicSoft"
    }*.\nTu moto *${orden.vehiculo?.marca || ""} ${orden.vehiculo?.modelo || ""}* (${
      orden.vehiculo?.placa || ""
    }) está en estado: *${orden.estado.replace(/_/g, " ")}*.${valorTexto}\nConsulta el historial y detalle aquí: ${linkConsulta}`;

    const prefijo = telefono.startsWith("57") ? "" : "57";
    window.open(`https://wa.me/${prefijo}${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  // Envío de Comprobante Digital Formal por WhatsApp
  const enviarComprobanteWhatsApp = (orden) => {
    const telefono = (orden.vehiculo?.cliente?.telefono || "").replace(/\D/g, "");
    if (!telefono) return alert("Este cliente no tiene teléfono registrado.");

    const v = orden.vehiculo || {};
    const c = v.cliente || {};
    const garantia = orden.diasGarantia || 30;
    const proxKm = (Number(orden.kilometrajeIngreso) || 0) + 2500;
    const linkPortal = `${window.location.origin}/t/${taller?.slug || "general"}?q=${v.placa}`;

    const comprobante = `*COMPROBANTE DE SERVICIO #${orden.id}*
*${(taller?.nombre || "TALLER AUTORIZADO").toUpperCase()}*
${taller?.ubicacion ? `Ubicación: ${taller.ubicacion}\n` : ""}--------------------------------
*Cliente:* ${c.nombre || "Propietario"}
*Moto:* ${v.marca || ""} ${v.modelo || ""} (${v.placa || ""})
*Kilometraje:* ${Number(orden.kilometrajeIngreso || 0).toLocaleString("es-CO")} km
--------------------------------
*Servicio solicitado:* ${orden.motivoIngreso}
${orden.diagnostico ? `*Diagnóstico:* ${orden.diagnostico}\n` : ""}${
      orden.trabajoRealizado ? `*Trabajo realizado:* ${orden.trabajoRealizado}\n` : ""
    }--------------------------------
*TOTAL:* $${Number(orden.valorTotal || 0).toLocaleString("es-CO")} COP
*Garantía del servicio:* ${garantia} días
*Próximo cambio sugerido:* ${proxKm.toLocaleString("es-CO")} km
--------------------------------
Consulta tu historial completo aquí:
${linkPortal}`;

    const prefijo = telefono.startsWith("57") ? "" : "57";
    window.open(
      `https://wa.me/${prefijo}${telefono}?text=${encodeURIComponent(comprobante)}`,
      "_blank"
    );
  };

  // Envío de Recordatorio de Mantenimiento por WhatsApp
  const enviarRecordatorioWhatsApp = (orden) => {
    const telefono = (orden.vehiculo?.cliente?.telefono || "").replace(/\D/g, "");
    if (!telefono) return alert("Este cliente no tiene teléfono registrado.");

    const v = orden.vehiculo || {};
    const c = v.cliente || {};
    const proxKm = (Number(orden.kilometrajeIngreso) || 0) + 2500;

    const mensaje = `Hola *${c.nombre || ""}*, te saludamos de *${
      taller?.nombre || "tu taller de confianza"
    }*.\n\nRecordamos que tu *${v.marca || ""} ${v.modelo || ""}* (placa *${
      v.placa || ""
    }*) estuvo con nosotros hace un tiempo (${Number(
      orden.kilometrajeIngreso || 0
    ).toLocaleString("es-CO")} km) y ya está próxima a su revisión preventiva o cambio de aceite (meta sugerida: *${proxKm.toLocaleString(
      "es-CO"
    )} km*).\n\n¿Deseas agendar un turno esta semana para mantenerla al 100%?`;

    const prefijo = telefono.startsWith("57") ? "" : "57";
    window.open(`https://wa.me/${prefijo}${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  // Cálculo de KPIs
  const activas = ordenes.filter((o) => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO");
  const enProceso = ordenes.filter(
    (o) => o.estado === "DIAGNOSTICO" || o.estado === "EN_REPARACION"
  );
  const listasEntrega = ordenes.filter((o) => o.estado === "LISTO_PARA_ENTREGA");
  const totalFacturacionActiva = activas.reduce(
    (acc, o) => acc + (Number(o.valorTotal) || 0),
    0
  );

  // Motor de Recordatorios: última orden ENTREGADA por placa única
  const recordatoriosPendientes = Object.values(
    ordenes
      .filter((o) => o.estado === "ENTREGADO" && o.vehiculo?.placa)
      .reduce((acc, ord) => {
        const placa = ord.vehiculo.placa;
        if (!acc[placa] || ord.id > acc[placa].id) {
          acc[placa] = ord;
        }
        return acc;
      }, {})
  ).slice(0, 4);

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
            Control de patio, diagnósticos, comprobantes y retención de clientes
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={cargarOrdenes} className="btn-secondary" title="Actualizar tablero">
            <RefreshCw size={16} />
          </button>
          <Link to="/panel/recepcion" className="btn-accent" style={{ textDecoration: "none" }}>
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

      {/* Motor de Retención: Recordatorios de Próximo Mantenimiento */}
      {recordatoriosPendientes.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: "1.5rem",
            borderLeft: "4px solid var(--accent-brand)",
            padding: "1rem 1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BellRing size={17} color="var(--accent-brand)" />
              <strong style={{ fontSize: "0.92rem" }}>
                Recordatorios de Próximo Cambio de Aceite / Servicio
              </strong>
            </div>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Invita a tus clientes frecuentes a regresar al taller
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "0.65rem",
            }}
          >
            {recordatoriosPendientes.map((ord) => {
              const proxKm = (Number(ord.kilometrajeIngreso) || 0) + 2500;
              return (
                <div
                  key={ord.id}
                  style={{
                    backgroundColor: "var(--bg-app)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "0.7rem 0.85rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 700 }}>
                      {ord.vehiculo?.placa} • {ord.vehiculo?.cliente?.nombre}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Meta: {proxKm.toLocaleString("es-CO")} km
                    </div>
                  </div>
                  <button
                    onClick={() => enviarRecordatorioWhatsApp(ord)}
                    className="btn-secondary"
                    style={{ padding: "0.4rem 0.65rem", fontSize: "0.78rem", color: "var(--accent-brand)" }}
                    title="Enviar recordatorio por WhatsApp"
                  >
                    <MessageCircle size={14} /> Recordar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtros por estado */}
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
          <Link to="/panel/recepcion" className="btn-accent" style={{ textDecoration: "none" }}>
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
                    <FileText size={16} />
                  </button>

                  <button
                    onClick={() => setOrdenComprobante(orden)}
                    className="icon-btn"
                    title="Ver y enviar Comprobante Digital"
                  >
                    <Receipt size={16} />
                  </button>

                  <button
                    onClick={() => notificarWhatsApp(orden)}
                    className="icon-btn"
                    title="Notificar estado por WhatsApp"
                    style={{ color: "var(--accent-brand)" }}
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Ficha Técnica */}
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
                <label>Diagnóstico técnico (Visible para el cliente)</label>
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

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Valor total ($ COP)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={ordenEditando.valorTotal || 0}
                    onChange={(e) =>
                      setOrdenEditando({ ...ordenEditando, valorTotal: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Días de garantía</label>
                  <input
                    type="number"
                    className="input-field"
                    value={ordenEditando.diasGarantia ?? 30}
                    onChange={(e) =>
                      setOrdenEditando({ ...ordenEditando, diasGarantia: e.target.value })
                    }
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setOrdenEditando(null)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-accent" disabled={guardandoDetalle}>
                  {guardandoDetalle ? "Guardando..." : "Guardar ficha técnica"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Comprobante Digital de Entrega */}
      {ordenComprobante && (
        <div className="modal-backdrop" onClick={() => setOrdenComprobante(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent-brand)" }}>
                Comprobante Digital de Servicio
              </span>
              <button onClick={() => setOrdenComprobante(null)} className="icon-btn">
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div style={{ borderBottom: "1px dashed var(--border-color)", paddingBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "1.05rem" }}>{taller?.nombre || "Taller"}</strong>
                  <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    {taller?.ubicacion || "Orden de Servicio Oficial"}
                  </span>
                </div>
                <span className="placa-badge">#{ordenComprobante.id}</span>
              </div>

              <div style={{ fontSize: "0.86rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                <div>
                  <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>Cliente</span>
                  <strong>{ordenComprobante.vehiculo?.cliente?.nombre}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary)", display: "block", fontSize: "0.75rem" }}>Motocicleta</span>
                  <strong>
                    {ordenComprobante.vehiculo?.marca} {ordenComprobante.vehiculo?.modelo} ({ordenComprobante.vehiculo?.placa})
                  </strong>
                </div>
              </div>

              <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "0.65rem", fontSize: "0.86rem" }}>
                <p><strong>Motivo:</strong> {ordenComprobante.motivoIngreso}</p>
                {ordenComprobante.diagnostico && (
                  <p style={{ marginTop: "0.3rem" }}><strong>Diagnóstico:</strong> {ordenComprobante.diagnostico}</p>
                )}
                {ordenComprobante.trabajoRealizado && (
                  <p style={{ marginTop: "0.3rem" }}><strong>Trabajo realizado:</strong> {ordenComprobante.trabajoRealizado}</p>
                )}
              </div>

              <div
                style={{
                  borderTop: "1px dashed var(--border-color)",
                  paddingTop: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--accent-brand)", fontWeight: 600 }}>
                  <ShieldCheck size={16} /> Garantía: {ordenComprobante.diasGarantia || 30} días
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", display: "block" }}>Total Servicio</span>
                  <strong style={{ fontSize: "1.2rem" }}>
                    ${Number(ordenComprobante.valorTotal || 0).toLocaleString("es-CO")}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.1rem" }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                <Printer size={16} /> Imprimir / PDF
              </button>
              <button
                type="button"
                onClick={() => enviarComprobanteWhatsApp(ordenComprobante)}
                className="btn-accent"
                style={{ flex: 2 }}
              >
                <MessageCircle size={17} /> Enviar Comprobante por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}