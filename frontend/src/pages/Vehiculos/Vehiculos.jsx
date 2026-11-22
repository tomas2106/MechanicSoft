import { useEffect, useState } from "react";
import { Search, History, X } from "lucide-react";
import api from "../../services/api";
import { ordenService } from "../../services/ordenService";

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [motoHistorial, setMotoHistorial] = useState(null);

  useEffect(() => {
    api
      .get("/vehiculos")
      .then((res) => setVehiculos(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});

    ordenService
      .obtenerTodas()
      .then((res) => setOrdenes(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const filtrados = vehiculos.filter(
    (v) =>
      v.placa?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.marca?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.modelo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.cliente?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const historialMotoSeleccionada = motoHistorial
    ? ordenes
        .filter((o) => o.vehiculo?.id === motoHistorial.id)
        .sort((a, b) => b.id - a.id)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Motocicletas Registradas</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Consulta el historial técnico de mantenimientos de cada vehículo
          </p>
        </div>

        <div style={{ position: "relative", minWidth: 260 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 14, color: "var(--text-muted)" }} />
          <input
            className="input-field"
            style={{ paddingLeft: "2.2rem" }}
            placeholder="Buscar placa, moto o dueño..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Motocicleta</th>
              <th>Propietario</th>
              <th>Kilometraje</th>
              <th>Historial</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  No hay motocicletas registradas.
                </td>
              </tr>
            ) : (
              filtrados.map((v) => {
                const totalServicios = ordenes.filter((o) => o.vehiculo?.id === v.id).length;
                return (
                  <tr key={v.id}>
                    <td>
                      <span className="placa-badge">{v.placa}</span>
                    </td>
                    <td>
                      <strong>{v.marca} {v.modelo}</strong>
                      <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        {v.cilindrajeCc} cc
                      </span>
                    </td>
                    <td>
                      <div>{v.cliente?.nombre || "—"}</div>
                      <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        {v.cliente?.telefono}
                      </span>
                    </td>
                    <td>{Number(v.kilometraje || 0).toLocaleString("es-CO")} km</td>
                    <td>
                      <button
                        onClick={() => setMotoHistorial(v)}
                        className="btn-secondary"
                        style={{ fontSize: "0.82rem", padding: "0.45rem 0.75rem" }}
                      >
                        <History size={15} /> Ver ({totalServicios})
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Hoja de Vida de la Moto */}
      {motoHistorial && (
        <div className="modal-backdrop" onClick={() => setMotoHistorial(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                  Hoja de Vida • {motoHistorial.placa}
                </h3>
                <span style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
                  {motoHistorial.marca} {motoHistorial.modelo} • Propietario: {motoHistorial.cliente?.nombre}
                </span>
              </div>
              <button onClick={() => setMotoHistorial(null)} className="icon-btn">
                <X size={18} />
              </button>
            </div>

            {historialMotoSeleccionada.length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Esta moto aún no tiene órdenes de servicio registradas.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {historialMotoSeleccionada.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      backgroundColor: "var(--bg-app)",
                      border: "1px solid var(--border-color)",
                      borderLeft: "4px solid var(--accent-brand)",
                      borderRadius: "8px",
                      padding: "0.85rem",
                      fontSize: "0.86rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                      <strong>Orden #{ord.id} • {Number(ord.kilometrajeIngreso || 0).toLocaleString("es-CO")} km</strong>
                      <span className={`status-pill status-${ord.estado}`}>
                        {ord.estado.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p>{ord.motivoIngreso}</p>
                    {ord.diagnostico && (
                      <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                        <strong>Diagnóstico:</strong> {ord.diagnostico}
                      </p>
                    )}
                    {ord.trabajoRealizado && (
                      <p style={{ color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                        <strong>Trabajo:</strong> {ord.trabajoRealizado}
                      </p>
                    )}
                    {ord.valorTotal > 0 && (
                      <p style={{ fontWeight: 700, marginTop: "0.35rem" }}>
                        Total: ${Number(ord.valorTotal).toLocaleString("es-CO")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}