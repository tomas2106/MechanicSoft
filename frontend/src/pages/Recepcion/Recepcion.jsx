import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, CheckCircle2 } from "lucide-react";
import api from "../../services/api";
import { ordenService } from "../../services/ordenService";
import { compressImage } from "../../utils/imageCompressor";
import "./Recepcion.css";

export default function Recepcion() {
  const navigate = useNavigate();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [previewFoto, setPreviewFoto] = useState("");
  const [infoCompresion, setInfoCompresion] = useState("");

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
      // 1. Buscar cliente existente por teléfono o crear uno nuevo
      let clienteId;
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

      // 2. Buscar moto existente por placa o registrar una nueva
      let vehiculoId;
      const kmActual = Number(form.kilometraje) || 0;
      try {
        const resMotoExistente = await api.get(`/vehiculos/placa/${form.placa.trim()}`);
        vehiculoId = resMotoExistente.data.id;
      } catch {
        const resVehiculo = await api.post("/vehiculos", {
          clienteId,
          placa: form.placa.trim(),
          marca: form.marca.trim(),
          modelo: form.modelo.trim(),
          cilindrajeCc: Number(form.cilindrajeCc) || 150,
          kilometraje: kmActual,
          fotoVehiculo: form.fotoVehiculo || null,
          activo: true,
        });
        vehiculoId = resVehiculo.data.id;
      }

      // 3. Crear la orden de servicio vinculada al vehículo
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

  return (
    <form onSubmit={handleSubmit} className="recepcion-form">
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Recepción de Motocicleta</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Si el cliente o la placa ya existen, se vinculan automáticamente a la nueva orden
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

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
              required
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">2. Datos de la Motocicleta</h3>
        <div className="form-grid-2">
          <div className="form-group">
            <label>Placa *</label>
            <input
              name="placa"
              className="input-field"
              placeholder="ABC12D"
              value={form.placa}
              onChange={handleChange}
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
              required
            />
          </div>
          <div className="form-group">
            <label>Kilometraje actual *</label>
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
            <span style={{ fontSize: "0.78rem", color: "#166534" }}>{infoCompresion}</span>
          )}
          {previewFoto && <img src={previewFoto} alt="Vista previa" className="foto-preview" />}
        </div>
      </div>

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

      <button type="submit" className="btn-primary" disabled={guardando} style={{ padding: "0.85rem" }}>
        <CheckCircle2 size={18} />
        {guardando ? "Registrando ingreso..." : "Guardar ingreso y crear orden"}
      </button>
    </form>
  );
}