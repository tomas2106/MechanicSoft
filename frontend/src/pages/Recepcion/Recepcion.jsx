import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle2, UserCheck, Bike, Plus } from "lucide-react";
import api from "../../services/api";
import { ordenService } from "../../services/ordenService";
import { compressImage } from "../../utils/imageCompressor";
import "../Publico/HomePage.css";
import "./Recepcion.css";

export default function Recepcion() {
  const navigate = useNavigate();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [previewFoto, setPreviewFoto] = useState("");
  const [infoCompresion, setInfoCompresion] = useState("");

  // Clientes y motos existentes
  const [clientesExistentes, setClientesExistentes] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [motosDelCliente, setMotosDelCliente] = useState([]);
  const [vehiculoSeleccionadoId, setVehiculoSeleccionadoId] = useState(null);

  const [form, setForm] = useState({
    clienteNombre: "",
    clienteTelefono: "",
    clienteCorreo: "",
    placa: "",
    marca: "",
    modelo: "",
    cilindrajeCc: "150",
    kilometraje: "0",
    motivoIngreso: "",
    valorTotal: "",
    fotoVehiculo: "",
  });

  useEffect(() => {
    api
      .get("/clientes")
      .then((res) => setClientesExistentes(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const seleccionarClienteExistente = async (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente("");
    setVehiculoSeleccionadoId(null);
    setForm((prev) => ({
      ...prev,
      clienteNombre: cliente.nombre || "",
      clienteTelefono: cliente.telefono || "",
      clienteCorreo: cliente.correo || "",
      placa: "",
      marca: "",
      modelo: "",
      cilindrajeCc: "150",
      kilometraje: "0",
    }));

    try {
      const resMotos = await api.get(`/vehiculos/cliente/${cliente.id}`);
      const listaMotos = Array.isArray(resMotos.data) ? resMotos.data : [];
      setMotosDelCliente(listaMotos);
      if (listaMotos.length === 1) {
        seleccionarMotoExistente(listaMotos[0]);
      }
    } catch {
      setMotosDelCliente([]);
    }
  };

  const seleccionarMotoExistente = (moto) => {
    setVehiculoSeleccionadoId(moto.id);
    setForm((prev) => ({
      ...prev,
      placa: moto.placa || "",
      marca: moto.marca || "",
      modelo: moto.modelo || "",
      cilindrajeCc: String(moto.cilindrajeCc || 150),
      kilometraje: String(moto.kilometraje || 0),
    }));
  };

  const limpiarSeleccionCliente = () => {
    setClienteSeleccionado(null);
    setMotosDelCliente([]);
    setVehiculoSeleccionadoId(null);
    setForm((prev) => ({
      ...prev,
      clienteNombre: "",
      clienteTelefono: "",
      clienteCorreo: "",
      placa: "",
      marca: "",
      modelo: "",
      cilindrajeCc: "150",
      kilometraje: "0",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "placa" ? value.toUpperCase() : value,
    }));
  };

  const handleFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const originalKB = Math.round(file.size / 1024);
      const comprimida = await compressImage(file, { maxWidth: 1024, quality: 0.78 });
      const finalKB = Math.round(comprimida.size / 1024);
      setInfoCompresion(`Optimizada: ${originalKB} KB → ${finalKB} KB`);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFoto(reader.result);
        setForm((prev) => ({ ...prev, fotoVehiculo: reader.result }));
      };
      reader.readAsDataURL(comprimida);
    } catch (err) {
      setError("No se pudo procesar la foto: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    try {
      // 1. Obtener o crear cliente
      let clienteId = clienteSeleccionado?.id;
      if (!clienteId) {
        try {
          const resExistente = await api.get(`/clientes/telefono/${form.clienteTelefono.trim()}`);
          clienteId = resExistente.data.id;
        } catch {
          const resCliente = await api.post("/clientes", {
            nombre: form.clienteNombre.trim(),
            telefono: form.clienteTelefono.trim(),
            correo: form.clienteCorreo.trim() || null,
            activo: true,
          });
          clienteId = resCliente.data.id;
        }
      }

      // 2. Obtener o crear vehículo
      let vehiculoId = vehiculoSeleccionadoId;
      const kmActual = Number(form.kilometraje) || 0;
      const placaLimpia = form.placa.replace(/\s+/g, "").toUpperCase();

      if (!vehiculoId) {
        try {
          const resMotoExistente = await api.get(`/vehiculos/placa/${placaLimpia}`);
          vehiculoId = resMotoExistente.data.id;
        } catch {
          const resVehiculo = await api.post("/vehiculos", {
            clienteId,
            placa: placaLimpia,
            marca: form.marca.trim(),
            modelo: form.modelo.trim(),
            cilindrajeCc: Number(form.cilindrajeCc) || 150,
            kilometraje: kmActual,
            fotoVehiculo: form.fotoVehiculo || null,
            activo: true,
          });
          vehiculoId = resVehiculo.data.id;
        }
      }

      // 3. Crear orden de servicio
      await ordenService.crear({
        vehiculoId,
        kilometrajeIngreso: kmActual,
        motivoIngreso: form.motivoIngreso.trim(),
        valorTotal: form.valorTotal ? Number(form.valorTotal) : 0,
        estado: "RECIBIDO",
      });

      navigate("/panel");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setGuardando(false);
    }
  };

  const clientesFiltrados = busquedaCliente.trim()
    ? clientesExistentes.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
          c.telefono?.includes(busquedaCliente.trim())
      )
    : [];

  return (
    <form onSubmit={handleSubmit} className="recepcion-form">
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Recepción de Motocicleta</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Busca un cliente frecuente para cargar sus motos o registra un ingreso nuevo
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Selector Rápido de Cliente Existente */}
      <div className="card" style={{ borderLeft: "4px solid var(--accent-brand)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent-brand)" }}>
            Cliente Frecuente (Opcional)
          </label>
          {clienteSeleccionado && (
            <button type="button" onClick={limpiarSeleccionCliente} className="btn-secondary" style={{ padding: "0.3rem 0.65rem", fontSize: "0.78rem" }}>
              Nuevo cliente
            </button>
          )}
        </div>

        {!clienteSeleccionado ? (
          <div>
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por nombre o WhatsApp del cliente..."
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
            />
            {clientesFiltrados.length > 0 && (
              <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: 150, overflowY: "auto" }}>
                {clientesFiltrados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => seleccionarClienteExistente(c)}
                    className="btn-secondary"
                    style={{ justifyContent: "space-between", width: "100%", textAlign: "left" }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <UserCheck size={16} color="var(--accent-brand)" />
                      <strong>{c.nombre}</strong>
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{c.telefono}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
            Cliente seleccionado: <strong style={{ color: "var(--text-primary)" }}>{clienteSeleccionado.nombre}</strong> ({clienteSeleccionado.telefono})
          </div>
        )}
      </div>

      {/* 1. Datos del Cliente */}
      <div className="card">
        <h3 className="section-title">1. Datos del Cliente</h3>
        <div className="form-grid-2">
          <div className="form-group">
            <label>Nombre completo *</label>
            <input
              name="clienteNombre"
              className="input-field"
              placeholder="Ej: Carlos Pérez"
              value={form.clienteNombre}
              onChange={handleChange}
              disabled={Boolean(clienteSeleccionado)}
              required
            />
          </div>
          <div className="form-group">
            <label>WhatsApp / Teléfono *</label>
            <input
              name="clienteTelefono"
              type="tel"
              className="input-field"
              placeholder="Ej: 3001234567"
              value={form.clienteTelefono}
              onChange={handleChange}
              disabled={Boolean(clienteSeleccionado)}
              required
            />
          </div>
        </div>
      </div>

      {/* 2. Datos de la Motocicleta */}
      <div className="card">
        <h3 className="section-title">2. Datos de la Motocicleta</h3>

        {/* Si el cliente tiene motos guardadas, mostrar selector rápido */}
        {motosDelCliente.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.45rem" }}>
              Motos registradas de este cliente:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {motosDelCliente.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => seleccionarMotoExistente(m)}
                  className={vehiculoSeleccionadoId === m.id ? "btn-accent" : "btn-secondary"}
                  style={{ fontSize: "0.84rem" }}
                >
                  <Bike size={15} /> {m.placa} • {m.marca} {m.modelo}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setVehiculoSeleccionadoId(null);
                  setForm((prev) => ({ ...prev, placa: "", marca: "", modelo: "", cilindrajeCc: "150", kilometraje: "0" }));
                }}
                className={!vehiculoSeleccionadoId ? "btn-primary" : "btn-secondary"}
                style={{ fontSize: "0.84rem" }}
              >
                <Plus size={15} /> Otra moto
              </button>
            </div>
          </div>
        )}

        <div className="form-grid-2">
          <div className="form-group">
            <label>Placa *</label>
            <input
              name="placa"
              className="input-field"
              style={{ fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" }}
              placeholder="ABC12D"
              maxLength={10}
              value={form.placa}
              onChange={handleChange}
              disabled={Boolean(vehiculoSeleccionadoId)}
              required
            />
          </div>

          <div className="form-group">
            <label>Marca *</label>
            <input
              name="marca"
              className="input-field"
              placeholder="Ej: Bajaj, Yamaha, Honda"
              value={form.marca}
              onChange={handleChange}
              disabled={Boolean(vehiculoSeleccionadoId)}
              required
            />
          </div>

          <div className="form-group">
            <label>Línea / Modelo *</label>
            <input
              name="modelo"
              className="input-field"
              placeholder="Ej: Pulsar NS 200"
              value={form.modelo}
              onChange={handleChange}
              disabled={Boolean(vehiculoSeleccionadoId)}
              required
            />
          </div>

          <div className="form-group">
            <label>Cilindraje (cc) *</label>
            <input
              name="cilindrajeCc"
              type="number"
              min="50"
              className="input-field"
              placeholder="Ej: 200"
              value={form.cilindrajeCc}
              onChange={handleChange}
              disabled={Boolean(vehiculoSeleccionadoId)}
              required
            />
          </div>

          <div className="form-group">
            <label>Kilometraje de ingreso *</label>
            <input
              name="kilometraje"
              type="number"
              min="0"
              className="input-field"
              placeholder="Ej: 18500"
              value={form.kilometraje}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: "0.5rem" }}>
          <label>Foto de ingreso (se comprime automáticamente)</label>
          <label className="btn-secondary" style={{ width: "fit-content" }}>
            <Camera size={17} /> Tomar o subir foto
            <input type="file" accept="image/*" onChange={handleFoto} hidden />
          </label>
          {infoCompresion && (
            <span style={{ fontSize: "0.78rem", color: "var(--accent-brand)", fontWeight: 600 }}>
              {infoCompresion}
            </span>
          )}
          {previewFoto && <img src={previewFoto} alt="Vista previa" className="foto-preview" />}
        </div>
      </div>

      {/* 3. Orden de Servicio */}
      <div className="card">
        <h3 className="section-title">3. Orden de Servicio</h3>
        <div className="form-group">
          <label>¿Qué trabajo se realizará? (Motivo de ingreso) *</label>
          <textarea
            name="motivoIngreso"
            className="input-field"
            rows={3}
            placeholder="Ej: Cambio de aceite, sincronización y revisión de frenos..."
            value={form.motivoIngreso}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Precio estimado / Cotización ($ COP)</label>
          <input
            name="valorTotal"
            type="number"
            className="input-field"
            placeholder="Ej: 120000"
            value={form.valorTotal}
            onChange={handleChange}
          />
        </div>
      </div>

      <button type="submit" className="btn-accent" disabled={guardando} style={{ padding: "0.85rem" }}>
        <CheckCircle2 size={18} />
        {guardando ? "Registrando ingreso..." : "Guardar ingreso y crear orden"}
      </button>
    </form>
  );
}