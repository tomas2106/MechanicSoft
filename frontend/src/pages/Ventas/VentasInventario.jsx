import { useEffect, useState } from "react";
import { Plus, ShoppingCart, MessageCircle, Printer, Package, Lock, Edit3, Check, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { normalizarTelefonoCO } from "../../utils/phoneCO";
import api from "../../services/api";

export default function VentasInventario() {
  const { user, taller } = useAuth();
  const esAdminTaller = user?.rol === "ADMIN_TALLER";
  const tallerKey = taller?.id || "default";

  const puedeEditarInventario =
    esAdminTaller ||
    Boolean(taller?.empleadosEditanInventario) ||
    localStorage.getItem(`ms_perm_inv_${tallerKey}`) === "true";

  const [productos, setProductos] = useState(() => {
    try {
      const saved = localStorage.getItem(`ms_inventario_${tallerKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [ventasRegistradas, setVentasRegistradas] = useState(() => {
    try {
      const saved = localStorage.getItem(`ms_ventas_${tallerKey}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [mensajeExito, setMensajeExito] = useState("");
  const [nuevoProd, setNuevoProd] = useState({ nombre: "", precio: "", stock: "" });
  const [editandoStockId, setEditandoStockId] = useState(null);
  const [nuevoStockValor, setNuevoStockValor] = useState(0);

  const [venta, setVenta] = useState({
    productoId: "",
    cantidad: 1,
    clienteNombre: "",
    clienteTelefono: "",
  });
  const [ultimaFactura, setUltimaFactura] = useState(null);

  useEffect(() => {
    api
      .get("/inventario")
      .then((res) => {
        if (Array.isArray(res.data)) {
          const normalizados = res.data.map((p) => ({
            ...p,
            precio: p.precioVenta ?? p.precio ?? 0,
          }));
          setProductos(normalizados);
          localStorage.setItem(`ms_inventario_${tallerKey}`, JSON.stringify(normalizados));
          if (normalizados.length > 0) {
            setVenta((prev) => ({
              ...prev,
              productoId: prev.productoId || String(normalizados[0].id),
            }));
          }
        }
      })
      .catch(() => {
        if (productos.length > 0 && !venta.productoId) {
          setVenta((prev) => ({ ...prev, productoId: String(productos[0].id) }));
        }
      });
  }, [tallerKey]);

  useEffect(() => {
    localStorage.setItem(`ms_inventario_${tallerKey}`, JSON.stringify(productos));
  }, [productos, tallerKey]);

  useEffect(() => {
    localStorage.setItem(`ms_ventas_${tallerKey}`, JSON.stringify(ventasRegistradas));
  }, [ventasRegistradas, tallerKey]);

  if (taller && taller.tieneInventario === false) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
        <Package size={32} color="var(--text-muted)" style={{ marginBottom: "0.6rem" }} />
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Módulo de Inventario y Ventas no incluido en tu plan</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
          Comunícate con soporte por WhatsApp (+57 322 600 7190) para habilitar este módulo en tu taller.
        </p>
      </div>
    );
  }

  if (!esAdminTaller && !puedeEditarInventario) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "2.5rem", maxWidth: 560 }}>
        <Lock size={32} color="var(--text-secondary)" style={{ margin: "0 auto 0.65rem" }} />
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Módulo restringido</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "0.35rem" }}>
          El administrador del taller no ha habilitado la edición de inventario para trabajadores.
        </p>
      </div>
    );
  }

  const mostrarAvisoExito = (texto) => {
    setMensajeExito(texto);
    setTimeout(() => setMensajeExito(""), 4000);
  };

  const agregarProducto = async (e) => {
    e.preventDefault();
    if (!nuevoProd.nombre.trim()) return;

    const payload = {
      nombre: nuevoProd.nombre.trim(),
      codigo: null,
      stock: Number(nuevoProd.stock) || 0,
      stockMinimo: 2,
      precioCompra: 0,
      precioVenta: Number(nuevoProd.precio) || 0,
    };

    try {
      const res = await api.post("/inventario", payload);
      const creado = {
        ...res.data,
        precio: res.data.precioVenta ?? payload.precioVenta,
      };
      setProductos((prev) => [creado, ...prev]);
      setVenta((prev) => ({ ...prev, productoId: String(creado.id) }));
      setNuevoProd({ nombre: "", precio: "", stock: "" });
      mostrarAvisoExito(`Producto "${creado.nombre}" guardado en el inventario.`);
    } catch {
      const creadoLocal = {
        id: Date.now(),
        nombre: payload.nombre,
        precio: payload.precioVenta,
        stock: payload.stock,
      };
      setProductos((prev) => [creadoLocal, ...prev]);
      setVenta((prev) => ({ ...prev, productoId: String(creadoLocal.id) }));
      setNuevoProd({ nombre: "", precio: "", stock: "" });
      mostrarAvisoExito(`Producto "${creadoLocal.nombre}" agregado correctamente al inventario.`);
    }
  };

  const guardarNuevoStock = async (prod) => {
    const stockFinal = Math.max(0, Number(nuevoStockValor) || 0);
    setProductos((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, stock: stockFinal } : p))
    );
    setEditandoStockId(null);

    try {
      await api.put(`/inventario/${prod.id}`, {
        nombre: prod.nombre,
        codigo: prod.codigo || null,
        stock: stockFinal,
        stockMinimo: prod.stockMinimo ?? 2,
        precioCompra: prod.precioCompra ?? 0,
        precioVenta: prod.precio ?? 0,
      });
    } catch {
      // Mantiene sincronización local si el ítem aún no existía en BD
    }
    mostrarAvisoExito("Cantidad en inventario actualizada correctamente.");
  };

  const eliminarProductoInventario = async (prod) => {
    if (!window.confirm(`¿Eliminar "${prod.nombre}" del inventario?`)) return;
    setProductos((prev) => prev.filter((p) => p.id !== prod.id));
    try {
      await api.delete(`/inventario/${prod.id}`);
    } catch {
      // Ignora si solo existía localmente
    }
    mostrarAvisoExito(`Producto "${prod.nombre}" eliminado.`);
  };

  const registrarVenta = async (e) => {
    e.preventDefault();
    const prod = productos.find((p) => String(p.id) === String(venta.productoId));
    if (!prod) return;
    const cant = Math.max(1, Number(venta.cantidad) || 1);
    if (prod.stock < cant) {
      return alert("Stock insuficiente para esta venta.");
    }

    const stockRestante = prod.stock - cant;
    setProductos((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, stock: stockRestante } : p))
    );

    try {
      await api.put(`/inventario/${prod.id}`, {
        nombre: prod.nombre,
        codigo: prod.codigo || null,
        stock: stockRestante,
        stockMinimo: prod.stockMinimo ?? 2,
        precioCompra: prod.precioCompra ?? 0,
        precioVenta: prod.precio ?? 0,
      });
    } catch {
      // Fallback local
    }

    const hoy = new Date();
    const fechaISO = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(hoy);

    const total = prod.precio * cant;
    const factura = {
      numero: Math.floor(1000 + Math.random() * 9000),
      tallerNombre: taller?.nombre || "Taller",
      registradoPor: user?.nombre || "Equipo",
      fecha: hoy.toLocaleDateString("es-CO"),
      fechaISO,
      clienteNombre: venta.clienteNombre || "Cliente mostrador",
      clienteTelefono: normalizarTelefonoCO(venta.clienteTelefono),
      producto: prod.nombre,
      cantidad: cant,
      precioUnitario: prod.precio,
      total,
    };

    setVentasRegistradas((prev) => [factura, ...prev]);
    setUltimaFactura(factura);
    setVenta({ ...venta, cantidad: 1, clienteNombre: "", clienteTelefono: "" });
    mostrarAvisoExito(`Venta #${factura.numero} registrada y sumada al balance del día.`);
  };

  const enviarFacturaWhatsApp = () => {
    if (!ultimaFactura) return;
    const msg = `*FACTURA DE VENTA #${ultimaFactura.numero}*\n*${ultimaFactura.tallerNombre.toUpperCase()}*\nFecha: ${ultimaFactura.fecha}\nCliente: ${ultimaFactura.clienteNombre}\n--------------------------------\n${ultimaFactura.cantidad} x ${ultimaFactura.producto} ($${ultimaFactura.precioUnitario.toLocaleString("es-CO")})\n--------------------------------\n*TOTAL PAGADO: $${ultimaFactura.total.toLocaleString("es-CO")} COP*`;
    const destino = ultimaFactura.clienteTelefono || "573226007190";
    window.open(`https://wa.me/${destino}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const totalVentasMostrador = ventasRegistradas.reduce((acc, v) => acc + (Number(v.total) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
            {esAdminTaller ? "Ventas e Inventario" : "Inventario de Repuestos"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            {esAdminTaller
              ? "Controla repuestos, registra ventas y revisa los movimientos realizados por tu equipo"
              : "Consulta y actualiza las existencias de repuestos del taller"}
          </p>
        </div>

        {esAdminTaller && (
          <div className="card" style={{ padding: "0.65rem 1rem", borderLeft: "4px solid var(--accent-brand)" }}>
            <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", display: "block" }}>
              Ventas de mostrador acumuladas
            </span>
            <strong style={{ fontSize: "1.1rem", color: "var(--accent-brand)" }}>
              ${totalVentasMostrador.toLocaleString("es-CO")} COP
            </strong>
          </div>
        )}
      </div>

      {mensajeExito && (
        <div
          style={{
            backgroundColor: "var(--primary-soft)",
            border: "1px solid var(--accent-brand)",
            color: "var(--accent-brand)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.88rem",
            fontWeight: 600,
          }}
        >
          {mensajeExito}
        </div>
      )}

      <div className={esAdminTaller ? "form-grid-2" : ""} style={{ alignItems: "start" }}>
        {esAdminTaller && (
          <form onSubmit={registrarVenta} className="card">
            <h3 className="section-title">Registrar Venta</h3>
            <div className="form-group">
              <label>Producto / Repuesto</label>
              <select
                className="input-field"
                value={venta.productoId}
                onChange={(e) => setVenta({ ...venta, productoId: e.target.value })}
              >
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — ${Number(p.precio || 0).toLocaleString("es-CO")} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Cantidad</label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={venta.cantidad}
                  onChange={(e) => setVenta({ ...venta, cantidad: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>WhatsApp Cliente (+57 auto)</label>
                <input
                  className="input-field"
                  placeholder="3001234567"
                  value={venta.clienteTelefono}
                  onChange={(e) => setVenta({ ...venta, clienteTelefono: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Nombre del cliente</label>
              <input
                className="input-field"
                placeholder="Ej: Juan Pérez"
                value={venta.clienteNombre}
                onChange={(e) => setVenta({ ...venta, clienteNombre: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-accent" style={{ width: "100%" }}>
              <ShoppingCart size={17} /> Generar venta y comprobante
            </button>
          </form>
        )}

        <form onSubmit={agregarProducto} className="card">
          <h3 className="section-title">Agregar Producto al Inventario</h3>
          <div className="form-group">
            <label>Nombre del producto *</label>
            <input
              className="input-field"
              placeholder="Ej: Bujía NGK Iridium"
              value={nuevoProd.nombre}
              onChange={(e) => setNuevoProd({ ...nuevoProd, nombre: e.target.value })}
              required
            />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Valor unitario ($ COP) *</label>
              <input
                type="number"
                className="input-field"
                placeholder="45000"
                value={nuevoProd.precio}
                onChange={(e) => setNuevoProd({ ...nuevoProd, precio: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock inicial *</label>
              <input
                type="number"
                className="input-field"
                placeholder="10"
                value={nuevoProd.stock}
                onChange={(e) => setNuevoProd({ ...nuevoProd, stock: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%" }}>
            <Plus size={17} /> Guardar en inventario
          </button>
        </form>
      </div>

      {ultimaFactura && esAdminTaller && (
        <div className="card" style={{ borderLeft: "4px solid var(--accent-brand)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <strong style={{ fontSize: "1rem" }}>
                Factura #{ultimaFactura.numero} • {ultimaFactura.tallerNombre}
              </strong>
              <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                Fecha: {ultimaFactura.fecha} • Cliente: {ultimaFactura.clienteNombre}
              </div>
              <div style={{ fontSize: "0.9rem", marginTop: "0.35rem" }}>
                {ultimaFactura.cantidad} x {ultimaFactura.producto} ={" "}
                <strong>${ultimaFactura.total.toLocaleString("es-CO")} COP</strong>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => window.print()} className="btn-secondary">
                <Printer size={16} /> Descargar / Imprimir PDF
              </button>
              <button onClick={enviarFacturaWhatsApp} className="btn-accent">
                <MessageCircle size={16} /> Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              {esAdminTaller && <th>Valor</th>}
              <th>Stock disponible</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.nombre}</strong></td>
                {esAdminTaller && <td>${Number(p.precio || 0).toLocaleString("es-CO")}</td>}
                <td>
                  {editandoStockId === p.id ? (
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      style={{ width: 90, minHeight: 32 }}
                      value={nuevoStockValor}
                      onChange={(e) => setNuevoStockValor(e.target.value)}
                    />
                  ) : (
                    `${p.stock} unidades`
                  )}
                </td>
                <td style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  {editandoStockId === p.id ? (
                    <button
                      type="button"
                      onClick={() => guardarNuevoStock(p)}
                      className="btn-accent"
                      style={{ padding: "0.3rem 0.65rem", fontSize: "0.78rem" }}
                    >
                      <Check size={14} /> Guardar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditandoStockId(p.id);
                        setNuevoStockValor(p.stock);
                      }}
                      className="icon-btn"
                      title="Modificar cantidad en stock"
                    >
                      <Edit3 size={15} />
                    </button>
                  )}

                  {esAdminTaller && (
                    <button
                      type="button"
                      onClick={() => eliminarProductoInventario(p)}
                      className="icon-btn"
                      title="Eliminar producto"
                      style={{ color: "var(--danger)" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {esAdminTaller && ventasRegistradas.length > 0 && (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <div style={{ padding: "0.95rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
            <strong>Historial de Ventas del Taller ({ventasRegistradas.length})</strong>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Factura</th>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cliente</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ventasRegistradas.map((v, idx) => (
                <tr key={idx}>
                  <td><strong>#{v.numero}</strong></td>
                  <td>{v.fecha}</td>
                  <td>{v.cantidad} x {v.producto}</td>
                  <td>{v.clienteNombre}</td>
                  <td><strong>${Number(v.total || 0).toLocaleString("es-CO")}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}