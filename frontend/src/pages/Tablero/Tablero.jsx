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
  FileSpreadsheet,
  Search,
  PackagePlus,
  Trash2,
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
  { id: "ENTREGADAS_GARANTIA", label: "Entregadas / Garantías" },
];

const hoyISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function Tablero() {
  const { user, taller, actualizarTaller } = useAuth();
  const esAdminTaller = user?.rol === "ADMIN_TALLER";
  const tallerKey = taller?.id || "default";

  const [ordenes, setOrdenes] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyISO());
  const [periodoBalance, setPeriodoBalance] = useState("DIA"); // DIA | MES | ANO
  const [tipoBalance, setTipoBalance] = useState("TODO"); // TODO | MANTENIMIENTOS | VENTAS
  const [filtroPeriodoEntregadas, setFiltroPeriodoEntregadas] = useState("TODAS"); // TODAS | DIA | MES | ANO
  const [filtro, setFiltro] = useState("TODOS");
  const [busquedaGarantia, setBusquedaGarantia] = useState("");
  const [cargando, setCargando] = useState(true);
  const [cambiandoJornada, setCambiandoJornada] = useState(false);
  const [error, setError] = useState("");

  const [ordenEditando, setOrdenEditando] = useState(null);
  const [ordenComprobante, setOrdenComprobante] = useState(null);
  const [modalCierreOrden, setModalCierreOrden] = useState(null);
  const [modalCierreCaja, setModalCierreCaja] = useState(false);
  const [guardandoDetalle, setGuardandoDetalle] = useState(false);

  // Inventario y ventas locales del taller para sumar repuestos en órdenes y en cierre de caja
  const [inventarioTaller, setInventarioTaller] = useState([]);
  const [ventasTaller, setVentasTaller] = useState([]);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState("");
  const [cantidadProductoUsado, setCantidadProductoUsado] = useState(1);

  const cargarInventarioYVentas = () => {
    try {
      const inv = JSON.parse(localStorage.getItem(`ms_inventario_${tallerKey}`) || "[]");
      setInventarioTaller(Array.isArray(inv) ? inv : []);
      if (Array.isArray(inv) && inv.length > 0 && !productoSeleccionadoId) {
        setProductoSeleccionadoId(String(inv[0].id));
      }
    } catch {
      setInventarioTaller([]);
    }
    try {
      const vts = JSON.parse(localStorage.getItem(`ms_ventas_${tallerKey}`) || "[]");
      setVentasTaller(Array.isArray(vts) ? vts : []);
    } catch {
      setVentasTaller([]);
    }
  };

  // Evitar que se mueva el fondo cuando cualquier modal está abierto
  const hayModalAbierto = Boolean(
    modalCierreOrden || ordenEditando || ordenComprobante || modalCierreCaja
  );
  useEffect(() => {
    if (hayModalAbierto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [hayModalAbierto]);

  const cargarOrdenes = async () => {
    setCargando(true);
    setError("");
    cargarInventarioYVentas();
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

  const abrirModalCierreConRepuestos = (orden) => {
    cargarInventarioYVentas();
    setModalCierreOrden({
      orden,
      manoObra: Number(orden.valorTotal) || 0,
      repuestosUsados: [],
      diagnostico: orden.diagnostico || "",
      trabajoRealizado: orden.trabajoRealizado || "",
    });
  };

  const manejarCambioEstado = async (orden, nuevoEstado) => {
    await marcarTallerAbierto();
    if (nuevoEstado === "ENTREGADO") {
      abrirModalCierreConRepuestos(orden);
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

  const agregarRepuestoAOrden = () => {
    if (!modalCierreOrden) return;
    const prod = inventarioTaller.find((p) => String(p.id) === String(productoSeleccionadoId));
    if (!prod) return;
    const cant = Math.max(1, Number(cantidadProductoUsado) || 1);
    if (prod.stock < cant) {
      return alert(`Stock insuficiente de ${prod.nombre} (disponibles: ${prod.stock}).`);
    }

    setModalCierreOrden((prev) => {
      const yaExiste = prev.repuestosUsados.find((r) => r.id === prod.id);
      let nuevosRepuestos;
      if (yaExiste) {
        nuevosRepuestos = prev.repuestosUsados.map((r) =>
          r.id === prod.id
            ? { ...r, cantidad: r.cantidad + cant, subtotal: (r.cantidad + cant) * r.precio }
            : r
        );
      } else {
        nuevosRepuestos = [
          ...prev.repuestosUsados,
          {
            id: prod.id,
            nombre: prod.nombre,
            precio: Number(prod.precio) || 0,
            cantidad: cant,
            subtotal: (Number(prod.precio) || 0) * cant,
          },
        ];
      }
      return { ...prev, repuestosUsados: nuevosRepuestos };
    });
    setCantidadProductoUsado(1);
  };

  const quitarRepuestoDeOrden = (repId) => {
    setModalCierreOrden((prev) => ({
      ...prev,
      repuestosUsados: prev.repuestosUsados.filter((r) => r.id !== repId),
    }));
  };

  const totalRepuestosModal = modalCierreOrden
    ? modalCierreOrden.repuestosUsados.reduce((acc, r) => acc + r.subtotal, 0)
    : 0;
  const totalGeneralModal = modalCierreOrden
    ? (Number(modalCierreOrden.manoObra) || 0) + totalRepuestosModal
    : 0;

  const confirmarEntregaYValor = async (e) => {
    e.preventDefault();
    if (!modalCierreOrden) return;
    const { orden, manoObra, repuestosUsados, diagnostico, trabajoRealizado } = modalCierreOrden;
    setGuardandoDetalle(true);

    // Construir descripción clara con mano de obra + repuestos usados para que el cliente lo vea
    const detalleRepuestosTexto =
      repuestosUsados.length > 0
        ? ` | Repuestos usados: ${repuestosUsados
            .map((r) => `${r.cantidad}x ${r.nombre} ($${r.subtotal.toLocaleString("es-CO")})`)
            .join(", ")} | Mano de obra: $${(Number(manoObra) || 0).toLocaleString("es-CO")}`
        : "";

    const trabajoFinalTexto = `${trabajoRealizado || orden.motivoIngreso || "Mantenimiento"}${detalleRepuestosTexto}`;

    try {
      const payload = {
        vehiculoId: orden.vehiculo?.id || orden.vehiculoId,
        kilometrajeIngreso: orden.kilometrajeIngreso || 0,
        motivoIngreso: orden.motivoIngreso,
        diagnostico,
        trabajoRealizado: trabajoFinalTexto,
        valorTotal: totalGeneralModal,
        diasGarantia: orden.diasGarantia || 30,
        proximoServicioDias: orden.proximoServicioDias || 45,
        estado: "ENTREGADO",
      };
      const res = await ordenService.actualizar(orden.id, payload);

      // Descontar del inventario los repuestos usados en esta reparación
      if (repuestosUsados.length > 0) {
        const invActualizado = inventarioTaller.map((item) => {
          const usado = repuestosUsados.find((r) => r.id === item.id);
          return usado ? { ...item, stock: Math.max(0, item.stock - usado.cantidad) } : item;
        });
        setInventarioTaller(invActualizado);
        localStorage.setItem(`ms_inventario_${tallerKey}`, JSON.stringify(invActualizado));
      }

      setOrdenes((prev) =>
        prev.map((o) =>
          o.id === orden.id
            ? { ...o, ...res.data, trabajoRealizado: trabajoFinalTexto, valorTotal: totalGeneralModal, estado: "ENTREGADO", fechaEntrega: new Date().toISOString() }
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

  const entregadas = ordenes.filter((o) => o.estado === "ENTREGADO");
  const [anioSel, mesSel] = fechaSeleccionada.split("-");

  // Filtro de entregadas por Día, Mes, Año o Todas + buscador
  const entregadasFiltradasGarantia = entregadas.filter((o) => {
    const fechaRef = (o.fechaEntrega || o.fechaIngreso || hoyISO()).slice(0, 10);
    if (filtroPeriodoEntregadas === "DIA" && fechaRef !== fechaSeleccionada) return false;
    if (filtroPeriodoEntregadas === "MES" && !fechaRef.startsWith(`${anioSel}-${mesSel}`)) return false;
    if (filtroPeriodoEntregadas === "ANO" && !fechaRef.startsWith(`${anioSel}`)) return false;

    const q = busquedaGarantia.trim().toLowerCase();
    if (!q) return true;
    const placa = (o.vehiculo?.placa || "").toLowerCase();
    const cliente = (o.vehiculo?.cliente?.nombre || "").toLowerCase();
    const trabajo = (o.trabajoRealizado || o.motivoIngreso || "").toLowerCase();
    return placa.includes(q) || cliente.includes(q) || trabajo.includes(q);
  });

  const ordenesVisibles =
    filtro === "ENTREGADAS_GARANTIA"
      ? entregadasFiltradasGarantia
      : filtro === "TODOS"
      ? ordenesActivasPantallaPrincipal
      : ordenesActivasPantallaPrincipal.filter((o) => o.estado === filtro);

  // Cálculos de Cierre de Caja y Balance (Mantenimientos + Ventas de Productos)
  const coincideFechaPeriodo = (fechaISO, periodo) => {
    const f = (fechaISO || hoyISO()).slice(0, 10);
    if (periodo === "DIA") return f === fechaSeleccionada;
    if (periodo === "MES") return f.startsWith(`${anioSel}-${mesSel}`);
    return f.startsWith(`${anioSel}`);
  };

  const ordenesEntregadasFechaSeleccionada = entregadas.filter((o) =>
    coincideFechaPeriodo(o.fechaEntrega || o.fechaIngreso, "DIA")
  );
  const ventasFechaSeleccionada = ventasTaller.filter((v) =>
    coincideFechaPeriodo(v.fechaISO, "DIA")
  );

  const totalMantenimientosHoy = ordenesEntregadasFechaSeleccionada.reduce(
    (acc, o) => acc + (Number(o.valorTotal) || 0),
    0
  );
  const totalVentasHoy = ventasFechaSeleccionada.reduce(
    (acc, v) => acc + (Number(v.total) || 0),
    0
  );
  const totalHoyGeneral = totalMantenimientosHoy + totalVentasHoy;

  // Balance según periodoBalance (DIA / MES / ANO) y tipoBalance (TODO / MANTENIMIENTOS / VENTAS)
  const ingresosMantenimientosPeriodo = entregadas
    .filter((o) => coincideFechaPeriodo(o.fechaEntrega || o.fechaIngreso, periodoBalance))
    .reduce((acc, o) => acc + (Number(o.valorTotal) || 0), 0);

  const ingresosVentasPeriodo = ventasTaller
    .filter((v) => coincideFechaPeriodo(v.fechaISO, periodoBalance))
    .reduce((acc, v) => acc + (Number(v.total) || 0), 0);

  const ingresosBalanceMostrado =
    tipoBalance === "MANTENIMIENTOS"
      ? ingresosMantenimientosPeriodo
      : tipoBalance === "VENTAS"
      ? ingresosVentasPeriodo
      : ingresosMantenimientosPeriodo + ingresosVentasPeriodo;

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

  // Exportar Cierre de Caja a Excel (.csv) incluyendo Servicios + Ventas de productos
  const descargarExcelCierreCaja = () => {
    const filas = [
      ["TALLER", taller?.nombre || "Taller"],
      ["UBICACION", taller?.ubicacion || ""],
      ["FECHA CIERRE", fechaSeleccionada],
      ["TOTAL MANTENIMIENTOS (COP)", totalMantenimientosHoy],
      ["TOTAL VENTAS PRODUCTOS (COP)", totalVentasHoy],
      ["TOTAL GENERAL DEL DIA (COP)", totalHoyGeneral],
      [],
      ["Tipo", "Referencia", "Detalle / Cliente", "Valor (COP)"],
    ];

    ordenesEntregadasFechaSeleccionada.forEach((o) => {
      const v = o.vehiculo || {};
      const c = v.cliente || {};
      filas.push([
        "MANTENIMIENTO",
        `Orden #${o.id} - ${v.placa || ""}`,
        `${c.nombre || ""} | ${(o.trabajoRealizado || o.motivoIngreso || "").replace(/[\r\n;]+/g, " ")}`,
        Number(o.valorTotal) || 0,
      ]);
    });

    ventasFechaSeleccionada.forEach((v) => {
      filas.push([
        "VENTA PRODUCTO",
        `Factura #${v.numero}`,
        `${v.cantidad}x ${v.producto} (${v.clienteNombre || "Mostrador"})`,
        Number(v.total) || 0,
      ]);
    });

    const csvContenido = "\uFEFF" + filas.map((fila) => fila.join(";")).join("\n");
    const blob = new Blob([csvContenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cierre_Caja_${(taller?.slug || "taller")}_${fechaSeleccionada}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Exportar PDF de Cierre de Caja
  const guardarPdfCierreCaja = () => {
    const ventana = window.open("", "_blank", "width=850,height=700");
    if (!ventana) return;

    const filasServicios = ordenesEntregadasFechaSeleccionada
      .map((o) => {
        const v = o.vehiculo || {};
        const c = v.cliente || {};
        return `<tr>
          <td style="padding:8px;border:1px solid #ddd;">Servicio #${o.id}</td>
          <td style="padding:8px;border:1px solid #ddd;"><strong>${v.placa || ""}</strong> • ${c.nombre || ""}</td>
          <td style="padding:8px;border:1px solid #ddd;">${o.trabajoRealizado || o.motivoIngreso || ""}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${Number(o.valorTotal || 0).toLocaleString("es-CO")}</td>
        </tr>`;
      })
      .join("");

    const filasVentas = ventasFechaSeleccionada
      .map(
        (v) => `<tr>
          <td style="padding:8px;border:1px solid #ddd;">Venta #${v.numero}</td>
          <td style="padding:8px;border:1px solid #ddd;">${v.clienteNombre || "Mostrador"}</td>
          <td style="padding:8px;border:1px solid #ddd;">${v.cantidad}x ${v.producto}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${Number(v.total || 0).toLocaleString("es-CO")}</td>
        </tr>`
      )
      .join("");

    const cuerpoTabla =
      filasServicios || filasVentas
        ? `${filasServicios}${filasVentas}`
        : `<tr><td colspan="4" style="text-align:center;padding:12px;">Sin movimientos en esta fecha.</td></tr>`;

    ventana.document.write(`
      <html>
        <head>
          <title>Cierre de Caja - ${taller?.nombre || "Taller"} - ${fechaSeleccionada}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin: 0 0 4px 0; font-size: 20px; }
            .meta { color: #555; font-size: 13px; margin-bottom: 18px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th { background: #0f766e; color: #fff; padding: 8px; text-align: left; border: 1px solid #0f766e; }
            .totales { margin-top: 18px; text-align: right; font-size: 14px; line-height: 1.7; }
          </style>
        </head>
        <body>
          <h1>Cierre de Caja Diario • ${taller?.nombre || "Taller"}</h1>
          <div class="meta">
            Ubicación: ${taller?.ubicacion || "No especificada"} | Fecha: <strong>${fechaSeleccionada}</strong>
          </div>
          <table>
            <thead>
              <tr>
                <th>Tipo / Ref</th>
                <th>Moto / Cliente</th>
                <th>Detalle</th>
                <th style="text-align:right;">Valor</th>
              </tr>
            </thead>
            <tbody>${cuerpoTabla}</tbody>
          </table>
          <div class="totales">
            <div>Mantenimientos: <strong>$${totalMantenimientosHoy.toLocaleString("es-CO")} COP</strong></div>
            <div>Ventas Productos: <strong>$${totalVentasHoy.toLocaleString("es-CO")} COP</strong></div>
            <div style="font-size:18px;margin-top:4px;">TOTAL DEL DÍA: <strong>$${totalHoyGeneral.toLocaleString("es-CO")} COP</strong></div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

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
    const texto = `*COMPROBANTE DE SERVICIO #${orden.id}*\n*${(taller?.nombre || "TALLER").toUpperCase()}*\nCliente: ${c.nombre || ""}\nMoto: ${v.marca || ""} ${v.modelo || ""} (${v.placa || ""})\nTrabajo: ${orden.trabajoRealizado || orden.motivoIngreso}\nGarantía: ${orden.diasGarantia || 30} días${esAdminTaller ? `\n*TOTAL: $${Number(orden.valorTotal || 0).toLocaleString("es-CO")} COP*` : ""}`;
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
            {esAdminTaller
              ? "Filtra por fecha para revisar el cierre diario, mensual o anual y las entregas"
              : `Panel técnico de ${user?.nombre || "Mecánico"} • Recepción, estados y consulta de garantías`}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="date"
            className="input-field"
            style={{ width: "auto", minHeight: 38 }}
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value || hoyISO())}
            title="Seleccionar fecha para ver jornada y cierre"
          />

          {tallerEstaAbierto ? (
            <button
              type="button"
              onClick={alternarEstadoTaller}
              disabled={cambiandoJornada}
              className="btn-secondary"
              style={{ borderColor: "var(--danger)", color: "var(--danger)", fontWeight: 700 }}
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
        {esAdminTaller && (
          <div className="kpi-card" style={{ borderLeft: "4px solid var(--accent-brand)" }}>
            <div className="kpi-top">
              <span style={{ fontWeight: 700, color: "var(--accent-brand)" }}>
                Total Hoy ({fechaSeleccionada})
              </span>
              <DollarSign size={16} color="var(--accent-brand)" />
            </div>
            <div className="kpi-value">${totalHoyGeneral.toLocaleString("es-CO")}</div>
            <span style={{ fontSize: "0.73rem", color: "var(--text-secondary)", display: "block", marginTop: "0.15rem" }}>
              Serv: ${totalMantenimientosHoy.toLocaleString("es-CO")} • Prod: ${totalVentasHoy.toLocaleString("es-CO")}
            </span>
            <button
              type="button"
              onClick={() => setModalCierreCaja(true)}
              className="btn-secondary"
              style={{ marginTop: "0.5rem", width: "100%", fontSize: "0.78rem", padding: "0.4rem 0.6rem" }}
            >
              <FileSpreadsheet size={14} /> Cierre de Caja (Excel / PDF)
            </button>
          </div>
        )}

        {esAdminTaller && (
          <div className="kpi-card">
            <div className="kpi-top" style={{ gap: "0.3rem", flexWrap: "wrap" }}>
              <span>Balance</span>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                <select
                  value={periodoBalance}
                  onChange={(e) => setPeriodoBalance(e.target.value)}
                  style={{ fontSize: "0.7rem", border: "1px solid var(--border-color)", borderRadius: 4, padding: "0.1rem 0.25rem" }}
                >
                  <option value="DIA">Día</option>
                  <option value="MES">Mes</option>
                  <option value="ANO">Año</option>
                </select>
                <select
                  value={tipoBalance}
                  onChange={(e) => setTipoBalance(e.target.value)}
                  style={{ fontSize: "0.7rem", border: "1px solid var(--border-color)", borderRadius: 4, padding: "0.1rem 0.25rem" }}
                >
                  <option value="TODO">Todo</option>
                  <option value="MANTENIMIENTOS">Solo Mant.</option>
                  <option value="VENTAS">Solo Ventas</option>
                </select>
              </div>
            </div>
            <div className="kpi-value">${ingresosBalanceMostrado.toLocaleString("es-CO")}</div>
            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
              {tipoBalance === "MANTENIMIENTOS"
                ? "Solo mantenimientos"
                : tipoBalance === "VENTAS"
                ? "Solo venta de productos"
                : "Mantenimientos + Ventas"}
            </span>
          </div>
        )}

        <div className="kpi-card">
          <div className="kpi-top">
            <span>Activas en Patio</span>
            <Bike size={16} />
          </div>
          <div className="kpi-value">{ordenesActivasPantallaPrincipal.length}</div>
        </div>

        <div
          className="kpi-card"
          style={{ cursor: "pointer" }}
          onClick={() => setFiltro("ENTREGADAS_GARANTIA")}
          title="Ver motos entregadas y garantías"
        >
          <div className="kpi-top">
            <span>Entregadas / Garantías</span>
            <ShieldCheck size={16} />
          </div>
          <div className="kpi-value">{entregadas.length}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span>Permanencia Prom.</span>
            <Clock size={16} />
          </div>
          <div className="kpi-value">{promedioHorasPermanencia}h</div>
        </div>
      </div>

      {/* Filtros de estados activos + pestaña de Garantías */}
      <div className="filtros-bar">
        {ESTADOS.map((est) => {
          const count =
            est.id === "ENTREGADAS_GARANTIA"
              ? entregadas.length
              : est.id === "TODOS"
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

      {/* Barra de filtro por Día / Mes / Año y buscador en Entregadas / Garantías */}
      {filtro === "ENTREGADAS_GARANTIA" && (
        <div className="card" style={{ marginBottom: "1rem", padding: "0.85rem 1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 220 }}>
              <Search size={17} color="var(--accent-brand)" />
              <input
                type="text"
                className="input-field"
                placeholder="Buscar por placa, cliente o trabajo..."
                value={busquedaGarantia}
                onChange={(e) => setBusquedaGarantia(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {[
                { id: "TODAS", label: "Todas" },
                { id: "DIA", label: `Día (${fechaSeleccionada})` },
                { id: "MES", label: `Mes (${anioSel}-${mesSel})` },
                { id: "ANO", label: `Año (${anioSel})` },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFiltroPeriodoEntregadas(p.id)}
                  className={`filtro-chip ${filtroPeriodoEntregadas === p.id ? "active" : ""}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {cargando ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)" }}>
          Cargando jornada del taller...
        </div>
      ) : ordenesVisibles.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.9rem" }}>
            {filtro === "ENTREGADAS_GARANTIA"
              ? "No hay motos entregadas en el periodo o búsqueda seleccionada."
              : "No hay motocicletas activas pendientes en este filtro para la fecha seleccionada."}
          </p>
          {filtro !== "ENTREGADAS_GARANTIA" && (
            <Link to="/panel/recepcion" className="btn-accent" style={{ textDecoration: "none" }}>
              Registrar ingreso de moto
            </Link>
          )}
        </div>
      ) : (
        <div className="ordenes-grid">
          {ordenesVisibles.map((orden, index) => {
            const v = orden.vehiculo || {};
            const c = v.cliente || {};
            const esEntregada = orden.estado === "ENTREGADO";
            const fechaOrdenCard = (orden.fechaEntrega || orden.fechaIngreso || "").slice(0, 10);

            return (
              <div key={orden.id} className="card orden-card">
                <div>
                  <div className="orden-top">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                        <span className="placa-badge">{v.placa || "SIN PLACA"}</span>
                        {!esEntregada && (
                          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--accent-brand)" }}>
                            Turno #{index + 1}
                          </span>
                        )}
                        {esEntregada && (
                          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--accent-brand)" }}>
                            Garantía: {orden.diasGarantia || 30} días
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginTop: "0.4rem" }}>
                        {v.marca} {v.modelo}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {c.nombre || "Cliente"} • Orden #{orden.id} •{" "}
                        <button
                          type="button"
                          onClick={() => {
                            if (fechaOrdenCard) {
                              setFechaSeleccionada(fechaOrdenCard);
                              setFiltroPeriodoEntregadas("DIA");
                            }
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            color: "var(--accent-brand)",
                            fontWeight: 700,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          title="Clic para filtrar las entregas de este día"
                        >
                          {fechaOrdenCard}
                        </button>
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
                    <strong>Motivo:</strong> {orden.motivoIngreso}
                  </p>
                  {orden.trabajoRealizado && (
                    <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                      <strong>Detalle:</strong> {orden.trabajoRealizado}
                    </p>
                  )}
                  {esAdminTaller && orden.valorTotal > 0 && (
                    <p style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--accent-brand)", marginTop: "0.3rem" }}>
                      Total: ${Number(orden.valorTotal).toLocaleString("es-CO")} COP
                    </p>
                  )}
                </div>

                <div className="orden-actions">
                  {!esEntregada && (
                    <>
                      <button onClick={() => reordenarPrioridad(orden.id, "UP")} className="icon-btn" title="Subir prioridad">
                        <ArrowUp size={15} />
                      </button>
                      <button onClick={() => reordenarPrioridad(orden.id, "DOWN")} className="icon-btn" title="Bajar prioridad">
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
                        <option value="ENTREGADO">Entregada (Facturar)</option>
                      </select>
                    </>
                  )}

                  <button onClick={() => setOrdenEditando({ ...orden })} className="icon-btn" title="Ficha técnica">
                    <FileText size={16} />
                  </button>
                  <button onClick={() => setOrdenComprobante(orden)} className="icon-btn" title="Comprobante y garantía">
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

      {/* Modal Cierre de Caja (Solo Admin Taller) */}
      {modalCierreCaja && esAdminTaller && (
        <div className="modal-backdrop" onClick={() => setModalCierreCaja(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
              <div>
                <h3 style={{ fontSize: "1.12rem", fontWeight: 800 }}>
                  Cierre de Caja • {taller?.nombre}
                </h3>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  Fecha: {fechaSeleccionada}
                </span>
              </div>
              <button onClick={() => setModalCierreCaja(false)} className="icon-btn">
                <X size={17} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: "var(--primary-soft)",
                border: "1px solid var(--accent-brand)",
                borderRadius: 10,
                padding: "0.9rem 1rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.86rem", marginBottom: "0.25rem" }}>
                <span>Mantenimientos ({ordenesEntregadasFechaSeleccionada.length}):</span>
                <strong>${totalMantenimientosHoy.toLocaleString("es-CO")} COP</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.86rem", marginBottom: "0.45rem" }}>
                <span>Ventas de productos ({ventasFechaSeleccionada.length}):</span>
                <strong>${totalVentasHoy.toLocaleString("es-CO")} COP</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--accent-brand)", paddingTop: "0.45rem" }}>
                <span style={{ fontWeight: 800 }}>TOTAL DEL DÍA:</span>
                <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--accent-brand)" }}>
                  ${totalHoyGeneral.toLocaleString("es-CO")} COP
                </span>
              </div>
            </div>

            <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              {ordenesEntregadasFechaSeleccionada.map((o) => (
                <div
                  key={`ord-${o.id}`}
                  style={{
                    padding: "0.65rem 0.8rem",
                    border: "1px solid var(--border-color)",
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.84rem",
                  }}
                >
                  <div>
                    <strong>Servicio #{o.id} • {o.vehiculo?.placa}</strong>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                      {o.trabajoRealizado || o.motivoIngreso}
                    </div>
                  </div>
                  <strong>${Number(o.valorTotal || 0).toLocaleString("es-CO")}</strong>
                </div>
              ))}

              {ventasFechaSeleccionada.map((v, idx) => (
                <div
                  key={`vta-${idx}`}
                  style={{
                    padding: "0.65rem 0.8rem",
                    border: "1px solid var(--border-color)",
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.84rem",
                  }}
                >
                  <div>
                    <strong>Venta #{v.numero} • {v.producto}</strong>
                    <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                      {v.cantidad} unidad(es) • {v.clienteNombre || "Mostrador"}
                    </div>
                  </div>
                  <strong>${Number(v.total || 0).toLocaleString("es-CO")}</strong>
                </div>
              ))}

              {ordenesEntregadasFechaSeleccionada.length === 0 && ventasFechaSeleccionada.length === 0 && (
                <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", textAlign: "center", padding: "1rem" }}>
                  No hay movimientos registrados en la fecha {fechaSeleccionada}.
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button type="button" onClick={descargarExcelCierreCaja} className="btn-secondary">
                <FileSpreadsheet size={16} /> Descargar Excel (.csv)
              </button>
              <button type="button" onClick={guardarPdfCierreCaja} className="btn-accent">
                <Printer size={16} /> Guardar PDF / Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal al Finalizar / Entregar Orden: Mano de Obra + Repuestos del Inventario */}
      {modalCierreOrden && (
        <div className="modal-backdrop" onClick={() => setModalCierreOrden(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
              <h3 style={{ fontSize: "1.08rem", fontWeight: 800 }}>
                Facturar y Entregar Orden #{modalCierreOrden.orden.id} ({modalCierreOrden.orden.vehiculo?.placa})
              </h3>
              <button onClick={() => setModalCierreOrden(null)} className="icon-btn">
                <X size={17} />
              </button>
            </div>

            <form onSubmit={confirmarEntregaYValor}>
              <div className="form-group">
                <label>Trabajo realizado / Descripción *</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Describe la reparación realizada..."
                  value={modalCierreOrden.trabajoRealizado}
                  onChange={(e) =>
                    setModalCierreOrden({ ...modalCierreOrden, trabajoRealizado: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor Mano de Obra ($ COP) *</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="Ej: 80000"
                  value={modalCierreOrden.manoObra}
                  onChange={(e) =>
                    setModalCierreOrden({ ...modalCierreOrden, manoObra: e.target.value })
                  }
                  required
                />
              </div>

              {/* Selector de Repuestos / Productos del Taller */}
              {inventarioTaller.length > 0 && (
                <div className="form-group" style={{ backgroundColor: "var(--bg-app)", padding: "0.8rem", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                  <label style={{ display: "block", marginBottom: "0.45rem" }}>
                    ¿Se usaron productos/repuestos del taller? (Opcional)
                  </label>
                  <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                    <select
                      className="input-field"
                      style={{ flex: 2, minWidth: 180 }}
                      value={productoSeleccionadoId}
                      onChange={(e) => setProductoSeleccionadoId(e.target.value)}
                    >
                      {inventarioTaller.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} — ${Number(p.precio || 0).toLocaleString("es-CO")} (Stock: {p.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      className="input-field"
                      style={{ width: 70 }}
                      value={cantidadProductoUsado}
                      onChange={(e) => setCantidadProductoUsado(e.target.value)}
                    />
                    <button type="button" onClick={agregarRepuestoAOrden} className="btn-secondary">
                      <PackagePlus size={15} /> Añadir
                    </button>
                  </div>

                  {modalCierreOrden.repuestosUsados.length > 0 && (
                    <div style={{ marginTop: "0.65rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      {modalCierreOrden.repuestosUsados.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "0.82rem",
                            padding: "0.35rem 0.55rem",
                            backgroundColor: "var(--bg-surface)",
                            borderRadius: 6,
                            border: "1px solid var(--border-color)",
                          }}
                        >
                          <span>
                            {r.cantidad}x <strong>{r.nombre}</strong>
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <strong>${r.subtotal.toLocaleString("es-CO")}</strong>
                            <button
                              type="button"
                              onClick={() => quitarRepuestoDeOrden(r.id)}
                              style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Resumen Total */}
              <div
                style={{
                  backgroundColor: "var(--primary-soft)",
                  border: "1px solid var(--accent-brand)",
                  borderRadius: 8,
                  padding: "0.75rem 0.9rem",
                  marginBottom: "0.9rem",
                  fontSize: "0.88rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Mano de obra:</span>
                  <strong>${(Number(modalCierreOrden.manoObra) || 0).toLocaleString("es-CO")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Repuestos usados:</span>
                  <strong>${totalRepuestosModal.toLocaleString("es-CO")}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 900, color: "var(--accent-brand)", marginTop: "0.3rem", paddingTop: "0.3rem", borderTop: "1px solid var(--accent-brand)" }}>
                  <span>TOTAL A COBRAR:</span>
                  <span>${totalGeneralModal.toLocaleString("es-CO")} COP</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setModalCierreOrden(null)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-accent" disabled={guardandoDetalle}>
                  <CheckCircle size={16} /> {guardandoDetalle ? "Guardando..." : "Confirmar entrega"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ficha Técnica */}
      {ordenEditando && (
        <div className="modal-backdrop" onClick={() => setOrdenEditando(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90vh", overflowY: "auto" }}>
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
                <label>Trabajo realizado y repuestos</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={ordenEditando.trabajoRealizado || ""}
                  onChange={(e) => setOrdenEditando({ ...ordenEditando, trabajoRealizado: e.target.value })}
                />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Valor total ($ COP)</label>
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
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
              <strong>Comprobante #{ordenComprobante.id}</strong>
              <button onClick={() => setOrdenComprobante(null)} className="icon-btn"><X size={17} /></button>
            </div>
            <div style={{ fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              <p><strong>Taller:</strong> {taller?.nombre}</p>
              <p><strong>Moto:</strong> {ordenComprobante.vehiculo?.marca} {ordenComprobante.vehiculo?.modelo} ({ordenComprobante.vehiculo?.placa})</p>
              <p><strong>Detalle del servicio:</strong> {ordenComprobante.trabajoRealizado || ordenComprobante.motivoIngreso}</p>
              <p style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--accent-brand)", fontWeight: 600 }}>
                <ShieldCheck size={15} /> Garantía: {ordenComprobante.diasGarantia || 30} días
              </p>
              {esAdminTaller && (
                <p style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                  Total: ${Number(ordenComprobante.valorTotal || 0).toLocaleString("es-CO")} COP
                </p>
              )}
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