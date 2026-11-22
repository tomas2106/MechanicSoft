import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { vehiculoService } from "../../services/vehiculoService";
import "./Vehiculos.css";

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    vehiculoService
      .obtenerTodos()
      .then((res) => setVehiculos(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const filtrados = vehiculos.filter(
    (v) =>
      v.placa?.toLowerCase().includes(filtro.toLowerCase()) ||
      v.marca?.toLowerCase().includes(filtro.toLowerCase()) ||
      v.modelo?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div>
      <div className="lista-toolbar">
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Motocicletas Registradas</h2>
        <div style={{ position: "relative", minWidth: 260 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }}
          />
          <input
            className="input-field"
            style={{ paddingLeft: "2.2rem" }}
            placeholder="Buscar por placa o modelo..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      <div className="card tabla-responsive" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Moto</th>
              <th>Kilometraje</th>
              <th>Propietario</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                  Cargando vehículos...
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  No se encontraron motocicletas.
                </td>
              </tr>
            ) : (
              filtrados.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span className="placa-badge">{v.placa}</span>
                  </td>
                  <td>
                    <strong>{v.marca}</strong> {v.modelo}
                  </td>
                  <td>{v.kilometraje ? `${Number(v.kilometraje).toLocaleString()} km` : "—"}</td>
                  <td>{v.cliente?.nombre || "Asociado"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}