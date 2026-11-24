import { useState } from "react";
import { Plus, ShoppingCart, MessageCircle, Printer, Package } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { normalizarTelefonoCO } from "../../utils/phoneCO";

export default function VentasInventario() {
  const { taller } = useAuth();
  const [productos, setProductos] = useState([
    { id: 1, nombre: "Aceite Motul 5100 10W-40", precio: 58000, stock: 12 },
    { id: 2, nombre: "Kit de Arrastre Reforzado", precio: 165000, stock: 5 },
  ]);
  const [nuevoProd, setNuevoProd] = useState({ nombre: "", precio: "", stock: "" });
  const [venta, setVenta] = useState({
    productoId: "1",
    cantidad: 1,
    clienteNombre: "",
    clienteTelefono: "",
  });
  const [ultimaFactura, setUltimaFactura] = useState(null);

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

  const agregarProducto = (e) => {
    e.preventDefault();
    if (!nuevoProd.nombre.trim()) return;
    const creado = {
      id: Date.now(),
      nombre: nuevoProd.nombre.trim(),
      precio: Number(nuevoProd.precio) || 0,
      stock: Number(nuevoProd.stock) || 0,
    };
    setProductos((prev) => [creado, ...prev]);
    setVenta((prev) => ({ ...prev, productoId: String(creado.id) }));
    setNuevoProd({ nombre: "", precio: "", stock: "" });
  };

  const registrarVenta = (e) => {
    e.preventDefault();
    const prod = productos.find((p) => String(p.id) === String(venta.productoId));
    if (!prod) return;
    const cant = Math.max(1, Number(venta.cantidad) || 1);
    if (prod.stock < cant) {
      return alert("Stock insuficiente para esta venta.");
    }

    setProductos((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, stock: p.stock - cant } : p))
    );

    const total = prod.precio * cant;
    const factura = {
      numero: Math.floor(1000 + Math.random() * 9000),
      tallerNombre: taller?.nombre || "Taller",
      fecha: new Date().toLocaleDateString("es-CO"),
      clienteNombre: venta.clienteNombre || "Cliente mostrador",
      clienteTelefono: normalizarTelefonoCO(venta.clienteTelefono),
      producto: prod.nombre,
      cantidad: cant,
      precioUnitario: prod.precio,
      total,
    };
    setUltimaFactura(factura);
  };

  const enviarFacturaWhatsApp = () => {
    if (!ultimaFactura) return;
    const msg = `*FACTURA DE VENTA #${ultimaFactura.numero}*\n*${ultimaFactura.tallerNombre.toUpperCase()}*\nFecha: ${ultimaFactura.fecha}\nCliente: ${ultimaFactura.clienteNombre}\n--------------------------------\n${ultimaFactura.cantidad} x ${ultimaFactura.producto} ($${ultimaFactura.precioUnitario.toLocaleString("es-CO")})\n--------------------------------\n*TOTAL PAGADO: $${ultimaFactura.total.toLocaleString("es-CO")} COP*`;
    const destino = ultimaFactura.clienteTelefono || "573226007190";
    window.open(`https://wa.me/${destino}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Ventas e Inventario</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Controla repuestos, registra ventas y envía comprobantes por WhatsApp o PDF
        </p>
      </div>

      <div className="form-grid-2" style={{ alignItems: "start" }}>
        {/* Registrar Venta */}
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
                  {p.nombre} — ${p.precio.toLocaleString("es-CO")} (Stock: {p.stock})
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

        {/* Agregar Producto al Inventario */}
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

      {/* Comprobante / Factura Generada */}
      {ultimaFactura && (
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

      {/* Tabla de Inventario */}
      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Valor</th>
              <th>Stock disponible</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.nombre}</strong></td>
                <td>${p.precio.toLocaleString("es-CO")}</td>
                <td>{p.stock} unidades</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}