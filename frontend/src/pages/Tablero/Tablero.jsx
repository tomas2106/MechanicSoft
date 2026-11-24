import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  MessageCircle,
  RefreshCw,
  FileText,
  X,
  Bike,
  CheckCircle,
  DollarSign,
  Receipt,
  ArrowUp,
  ArrowDown,
  Clock,
  Play,
  Square,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { ordenService } from "../../services/ordenService";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./Tablero.css";

const ESTADOS = [
  { id: "TODOS", label: "Activas del día" },
  { id: "RECIBIDO", label: "Recibidas" },
  { id: "DIAGNOSTICO", label: "Diagnóstico" },
  { id: "EN_REPARACION", label: "En reparación" },
  { id: "LISTO_PARA_ENTREGA", label: "Listas" },
];

const hoyISO = () => new Date().toISOString().slice(0, 10);

export default function Tablero() {
  const { taller, actualizarTaller } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyISO());
  const [periodoBalance, setPeriodoBalance] = useState("DIA"); // DIA | MES | ANO
  const [filtro, setFiltro] = useState("TODOS");
  const [cargando, setCargando] = useState(true);
  const [cambiandoJornada, setCambiandoJornada] = useState(false);
  const [error, setError] = useState("");

  const [ordenEditando, setOrdenEditando] = useState(null);
  const [ordenComprobante, setOrdenComprobante] = useState(null);
  const [modalCierreOrden, setModalCierreOrden] = useState(null); // { orden, valorFinal, trabajoRealizado, diagnostico }
  const [guardandoDetalle, setGuardandoDetalle] = useState(false);

  const cargarOrdenes = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await ordenService.obtenerTodas();
      const lista = Array.isArray(res.data) ? res.data : [];
      lista.sort(
        (a, b) =>
          (a.prioridadOrden ?? a.id) - (b.prioridadOrden ?? b.id) || b.id - a.id
      );
      setOrdenes(lista);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    setFechaSeleccionada(hoyISO());
    cargarOrdenes();

    if (taller?.slug) {
      api
        .get(`/public/talleres/${taller.slug}`)
        .then((res) => {
          if (res.data && typeof res.data.abiertoHoy === "boolean") {
            actualizarTaller({
              abiertoHoy: res.data.abiertoHoy,
              logoUrl: res.data.logoUrl ?? taller.logoUrl,
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const marcarTallerAbierto = async () => {
    if (!taller?.id || taller?.abiertoHoy) return;
    try {
      await api.patch(`/talleres/${taller.id}/abrir-dia`);
      actualizarTaller({ abiertoHoy: true });
    } catch {
      actualizarTaller({ abiertoHoy: true });
    }
  };

  const alternarEstadoTaller = async () => {
    if (!taller?.id || cambiandoJornada) return;
    setCambiandoJornada(true);
    const estaAbierto = Boolean(taller.abiertoHoy);
    const endpoint = estaAbierto
      ? `/talleres/${taller.id}/cerrar-dia`
      : `/talleres/${taller.id}/abrir-dia`;

    try {
      await api.patch(endpoint);
      actualizarTaller({ abiertoHoy: !estaAbierto });
    } catch {
      actualizarTaller({ abiertoHoy: !estaAbierto });
    } finally {
      setCambiandoJornada(false);
    }
  };

  const reordenarPrioridad = async (ordenId, direccion) => {
    await marcarTallerAbierto();
    const idx = ordenes.findIndex((o) => o.id === ordenId);
    const targetIdx = direccion === "UP" ? idx - 1 : idx + 1;
    if (idx < 0 || targetIdx < 0 || targetIdx >= ordenes.length) return;

    const copia = [...ordenes];
    const temp = copia[idx];
    copia[idx] = copia[targetIdx];
    copia[targetIdx] = temp;

    const normalizada = copia.map((item, i) => ({ ...item, prioridadOrden: i + 1 }));
    setOrdenes(normalizada);
  };

  const manejarCambioEstado = async (orden, nuevoEstado) => {
    await marcarTallerAbierto();
    if (nuevoEstado === "ENTREGADO") {
      setModalCierreOrden({
        orden,
        valorFinal: orden.valorTotal || "",
        diagnostico: orden.diagnostico || "",
        trabajoRealizado: orden.trabajoRealizado || "",
      });
      return;
    }

    try {
      await ordenService.actualizarEstado(orden.id, nuevoEstado);
      setOrdenes((prev) =>
        prev.map((o) => (o.id === orden.id ? { ...o, estado: nuevoEstado } : o))
      );
    } catch (err) {
      alert("No se pudo actualizar el estado: " + err.message);
    }
  };

  const confirmarEntregaYValor = async (e) => {
    e.preventDefault();
    if (!modalCierreOrden) return;
    const { orden, valorFinal, diagnostico, trabajoRealizado } = modalCierreOrden;
    setGuardandoDetalle(true);
    try {
      const payload = {
        vehiculoId: orden.vehiculo?.id || orden.vehiculoId,
        kilometrajeIngreso: orden.kilometrajeIngreso || 0,
        motivoIngreso: orden.motivoIngreso,
        diagnostico,
        trabajoRealizado,
        valorTotal: Number(valorFinal) || 0,
        diasGarantia: orden.diasGarantia || 30,
        proximoServicioDias: orden.proximoServicioDias || 45,
        estado: "ENTREGADO",
      };
      const res = await ordenService.actualizar(orden.id, payload);
      setOrdenes((prev) =>
        prev.map((o) =>
          o.id === orden.id
            ? { ...o, ...res.data, estado: "ENTREGADO", fechaEntrega: new Date().toISOString() }
            : o
        )
      );
      setModalCierreOrden(null);
    } catch (err) {
      alert("Error al registrar entrega: " + (err.response?.data?.message || err.message));
    } finally {
      setGuardandoDetalle(false);
    }
  };

  const guardarDetalleTecnico = async (e) => {
    e.preventDefault();
    if (!ordenEditando) return;
    await marcarTallerAbierto();
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
      alert("Error al guardar ficha: " + (err.response?.data?.message || err.message));
    } finally {
      setGuardandoDetalle(false);
    }
  };

  const ordenesDelDia = ordenes.filter((o) => {
    const fechaOrd = (o.fechaIngreso || hoyISO()).slice(0, 10);
    if (o.estado === "ENTREGADO") {
      return fechaOrd === fechaSeleccionada;
    }
    return fechaOrd <= fechaSeleccionada;
  });

  const ordenesActivasPantallaPrincipal = ordenesDelDia.filter(
    (o) => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO"
  );

  const ordenesVisibles =
    filtro === "TODOS"
      ? ordenesActivasPantallaPrincipal
      : ordenesActivasPantallaPrincipal.filter((o) => o.estado === filtro);

  const entregadas = ordenes.filter((o) => o.estado === "ENTREGADO");
  const [anioSel, mesSel] = fechaSeleccionada.split("-");

  const ingresosPeriodo = entregadas
    .filter((o) => {
      const refFecha = (o.fechaEntrega || o.fechaIngreso || hoyISO()).slice(0, 10);
      if (periodoBalance === "DIA") return refFecha === fechaSeleccionada;
      if (periodoBalance === "MES") return refFecha.startsWith(`${anioSel}-${mesSel}`);
      return refFecha.startsWith(`${anioSel}`);
    })
    .reduce((acc, o) => acc + (Number(o.valorTotal) || 0), 0);

  const cierreCajaDia = entregadas
    .filter((o) => (o.fechaEntrega || o.fechaIngreso || hoyISO()).slice(0, 10) === fechaSeleccionada)
    .reduce((acc, o) => acc + (Number(o.valorTotal) || 0), 0);

  const ordenesConDuracion = entregadas.filter((o) => o.fechaIngreso && o.fechaEntrega);
  const promedioHorasPermanencia =
    ordenesConDuracion.length > 0
      ? Math.round(
          ordenesConDuracion.reduce((acc, o) => {
            const diffMs = new Date(o.fechaEntrega) - new Date(o.fechaIngreso);
            return acc + Math.max(1, diffMs / (1000 * 60 * 60));
          }, 0) / ordenesConDuracion.length
        )
      : 24;

  const enviarWhatsAppOrden = (orden) => {
    const tel = (orden.vehiculo?.cliente?.telefono || "").replace(/\D/g, "");
    if (!tel) return alert("Cliente sin WhatsApp registrado.");
    const prefijo = tel.startsWith("57") ? "" : "57";
    const msg = `Hola ${orden.vehiculo?.cliente?.nombre || ""}, de *${taller?.nombre || "MechanicSoft"}*. Tu moto *${orden.vehiculo?.placa || ""}* está en estado: *${orden.estado.replace(/_/g, " ")}*. Consulta aquí: ${window.location.origin}/t/${taller?.slug || "general"}?q=${orden.vehiculo?.placa || ""}`;
    window.open(`https://wa.me/${prefijo}${tel}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const enviarComprobanteWhatsApp = (orden) => {
    const tel = (orden.vehiculo?.cliente?.telefono || "").replace(/\D/g, "");
    if (!tel) return alert("Cliente sin WhatsApp registrado.");
    const prefijo = tel.startsWith("57") ? "" : "57";
    const v = orden.vehiculo || {};
    const c = v.cliente || {};
    const texto = `*COMPROBANTE DE SERVICIO #${orden.id}*\n*${(taller?.nombre || "TALLER").toUpperCase()}*\nCliente: ${c.nombre || ""}\nMoto: ${v.marca || ""} ${v.modelo || ""} (${v.placa || ""})\nTrabajo: ${orden.trabajoRealizado || orden.motivoIngreso}\nGarantía: ${orden.diasGarantia || 30} días\n*TOTAL: $${Number(orden.valorTotal || 0).toLocaleString("es-CO")} COP*`;
    window.open(`https://wa.me/${prefijo}${tel}?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const tallerEstaAbierto = Boolean(taller?.abiertoHoy);

  return (
    <div>
      {/* Cabecera de Jornada Diaria */}
      <div className="tablero-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.4px" }}>
              Jornada del Día
            </h2>
            <span
              className="status-pill"
              style={{
                backgroundColor: tallerEstaAbierto ? "#dcfce7" : "#fee2e2",
                color: tallerEstaAbierto ? "#166534" : "#991b1b",
                fontWeight: 700,
              }}
            >
              {tallerEstaAbierto ? "Taller Abierto • Trabajando ahora" : "Taller Cerrado"}
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.86rem" }}>
            Las motos pendientes continúan al día siguiente • Las entregadas salen de la vista activa
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="date"
            className="input-field"
            style={{ width: "auto", minHeight: 38 }}
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value || hoyISO())}
          />

          {/* Control mutuamente excluyente: si está abierto solo permite Cerrar taller; si está cerrado solo permite Abrir taller */}
          {tallerEstaAbierto ? (
            <button
              type="button"
              onClick={alternarEstadoTaller}
              disabled={cambiandoJornada}
              className="btn-secondary"
              style={{ borderColor: "var(--danger)", color: "var(--danger)", fontWeight: 700 }}
              title="Cerrar jornada del taller por hoy"
            >
              <Square size={14} /> {cambiandoJornada ? "Cerrando..." : "Cerrar taller"}
            </button>
          ) : (
            <button
              type="button"
              onClick={alternarEstadoTaller}
              disabled={cambiandoJornada}
              className="btn-secondary"
              style={{ borderColor: "var(--accent-brand)", color: "var(--accent-brand)", fontWeight: 700 }}
              title="Iniciar jornada y marcar taller abierto"
            >
              <Play size={14} /> {cambiandoJornada ? "Abriendo..." : "Abrir taller (Iniciar día)"}
            </button>
          )}

          <button onClick={cargarOrdenes} className="icon-btn" title="Actualizar">
            <RefreshCw size={16} />
          </button>
          <Link to="/panel/recepcion" className="btn-accent" style={{ textDecoration: "none" }}>
            <Plus size={17} /> Nueva recepción
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span>Activas en Patio</span>
            <Bike size={16} />
          </div>
          <div className="kpi-value">{ordenesActivasPantallaPrincipal.length}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span>Cierre Caja Día</span>
            <DollarSign size={16} />
          </div>
          <div className="kpi-value">${cierreCajaDia.toLocaleString("es-CO")}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span>Balance ({periodoBalance})</span>
            <select
              value={periodoBalance}
              onChange={(e) => setPeriodoBalance(e.target.value)}
              style={{ fontSize: "0.72rem", border: "1px solid var(--border-color)", borderRadius: 4, padding: "0.1rem 0.3rem" }}
            >
              <option value="DIA">Día</option>
              <option value="MES">Mes</option>
              <option value="ANO">Año</option>
            </select>
          </div>
          <div className="kpi-value">${ingresosPeriodo.toLocaleString("es-CO")}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span>Permanencia Prom.</span>
            <Clock size={16} />
          </div>
          <div className="kpi-value">{promedioHorasPermanencia}h</div>
        </div>
      </div>

      {/* Filtros de estados activos */}
      <div className="filtros-bar">
        {ESTADOS.map((est) => {
          const count =
            est.id === "TODOS"
              ? ordenesActivasPantallaPrincipal.length
              : ordenesActivasPantallaPrincipal.filter((o) => o.estado === est.id).length;

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
        <div className="card" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)" }}>
          Cargando jornada del taller...
        </div>
      ) : ordenesVisibles.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.9rem" }}>
            No hay motocicletas activas pendientes en este filtro para la fecha seleccionada.
          </p>
          <Link to="/panel/recepcion" className="btn-accent" style={{ textDecoration: "none" }}>
            Registrar ingreso de moto
          </Link>
        </div>
      ) : (
        <div className="ordenes-grid">
          {ordenesVisibles.map((orden, index) => {
            const v = orden.vehiculo || {};
            const c = v.cliente || {};

            return (
              <div key={orden.id} className="card orden-card">
                <div>
                  <div className="orden-top">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span className="placa-badge">{v.placa || "SIN PLACA"}</span>
                        <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--accent-brand)" }}>
                          Turno #{index + 1}
                        </span>
                      </div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginTop: "0.4rem" }}>
                        {v.marca} {v.modelo}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
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

                  <p style={{ fontSize: "0.88rem", marginTop: "0.7rem" }}>
                    {orden.motivoIngreso}
                  </p>
                </div>

                <div className="orden-actions">
                  <button
                    onClick={() => reordenarPrioridad(orden.id, "UP")}
                    className="icon-btn"
                    title="Subir prioridad de trabajo"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    onClick={() => reordenarPrioridad(orden.id, "DOWN")}
                    className="icon-btn"
                    title="Bajar prioridad de trabajo"
                  >
                    <ArrowDown size={15} />
                  </button>

                  <select
                    className="select-estado"
                    value={orden.estado}
                    onChange={(e) => manejarCambioEstado(orden, e.target.value)}
                  >
                    <option value="RECIBIDO">Recibida</option>
                    <option value="DIAGNOSTICO">Diagnóstico</option>
                    <option value="EN_REPARACION">En reparación</option>
                    <option value="LISTO_PARA_ENTREGA">Lista</option>
                    <option value="ENTREGADO">Entregada (Cerrar)</option>
                  </select>

                  <button onClick={() => setOrdenEditando({ ...orden })} className="icon-btn" title="Ficha técnica">
                    <FileText size={16} />
                  </button>
                  <button onClick={() => setOrdenComprobante(orden)} className="icon-btn" title="Comprobante">
                    <Receipt size={16} />
                  </button>
                  <button onClick={() => enviarWhatsAppOrden(orden)} className="icon-btn" title="WhatsApp" style={{ color: "var(--accent-brand)" }}>
                    <MessageCircle size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal al Finalizar / Entregar Orden */}
      {modalCierreOrden && (
        <div className="modal-backdrop" onClick={() => setModalCierreOrden(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
              <h3 style={{ fontSize: "1.08rem", fontWeight: 800 }}>
                Finalizar Orden #{modalCierreOrden.orden.id}
              </h3>
              <button onClick={() => setModalCierreOrden(null)} className="icon-btn">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={confirmarEntregaYValor}>
              <div className="form-group">
                <label>Valor total cobrado ($ COP) *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Ej: 150000"
                  value={modalCierreOrden.valorFinal}
                  onChange={(e) =>
                    setModalCierreOrden({ ...modalCierreOrden, valorFinal: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Trabajo realizado</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={modalCierreOrden.trabajoRealizado}
                  onChange={(e) =>
                    setModalCierreOrden({ ...modalCierreOrden, trabajoRealizado: e.target.value })
                  }
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                <button type="button" onClick={() => setModalCierreOrden(null)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-accent" disabled={guardandoDetalle}>
                  <CheckCircle size={16} /> {guardandoDetalle ? "Guardando..." : "Registrar entrega y caja"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ficha Técnica */}
      {ordenEditando && (
        <div className="modal-backdrop" onClick={() => setOrdenEditando(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.08rem", fontWeight: 800 }}>
                Ficha Técnica • Orden #{ordenEditando.id}
              </h3>
              <button onClick={() => setOrdenEditando(null)} className="icon-btn">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={guardarDetalleTecnico}>
              <div className="form-group">
                <label>Motivo de ingreso</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={ordenEditando.motivoIngreso || ""}
                  onChange={(e) => setOrdenEditando({ ...ordenEditando, motivoIngreso: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Diagnóstico</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={ordenEditando.diagnostico || ""}
                  onChange={(e) => setOrdenEditando({ ...ordenEditando, diagnostico: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Trabajo realizado</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={ordenEditando.trabajoRealizado || ""}
                  onChange={(e) => setOrdenEditando({ ...ordenEditando, trabajoRealizado: e.target.value })}
                />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Valor ($ COP)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={ordenEditando.valorTotal || 0}
                    onChange={(e) => setOrdenEditando({ ...ordenEditando, valorTotal: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Garantía (días)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={ordenEditando.diasGarantia ?? 30}
                    onChange={(e) => setOrdenEditando({ ...ordenEditando, diasGarantia: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setOrdenEditando(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-accent" disabled={guardandoDetalle}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Comprobante */}
      {ordenComprobante && (
        <div className="modal-backdrop" onClick={() => setOrdenComprobante(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
              <strong>Comprobante #{ordenComprobante.id}</strong>
              <button onClick={() => setOrdenComprobante(null)} className="icon-btn"><X size={17} /></button>
            </div>
            <div style={{ fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              <p><strong>Taller:</strong> {taller?.nombre}</p>
              <p><strong>Moto:</strong> {ordenComprobante.vehiculo?.marca} {ordenComprobante.vehiculo?.modelo} ({ordenComprobante.vehiculo?.placa})</p>
              <p><strong>Servicio:</strong> {ordenComprobante.trabajoRealizado || ordenComprobante.motivoIngreso}</p>
              <p style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--accent-brand)", fontWeight: 600 }}>
                <ShieldCheck size={15} /> Garantía: {ordenComprobante.diasGarantia || 30} días
              </p>
              <p style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                Total: ${Number(ordenComprobante.valorTotal || 0).toLocaleString("es-CO")}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button onClick={() => window.print()} className="btn-secondary" style={{ flex: 1 }}>
                <Printer size={15} /> PDF / Imprimir
              </button>
              <button onClick={() => enviarComprobanteWhatsApp(ordenComprobante)} className="btn-accent" style={{ flex: 2 }}>
                <MessageCircle size={16} /> Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}