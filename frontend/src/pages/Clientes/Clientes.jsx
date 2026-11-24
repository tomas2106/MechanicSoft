import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { clienteService } from "../../services/clienteService";
import "../Vehiculos/Vehiculos.css";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    clienteService
      .obtenerTodos()
      .then((res) => setClientes(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const filtrados = clientes.filter(
    (c) =>
      c.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
      c.telefono?.includes(filtro)
  );

  return (
    <div>
      <div className="lista-toolbar">
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Directorio de Clientes</h2>
        <div style={{ position: "relative", minWidth: 260 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 12, top: 12, color: "var(--text-muted)" }}
          />
          <input
            className="input-field"
            style={{ paddingLeft: "2.2rem" }}
            placeholder="Buscar por nombre o WhatsApp..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      <div className="card tabla-responsive" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>WhatsApp / Teléfono</th>
              <th>Correo</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "2rem" }}>
                  Cargando clientes...
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              filtrados.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.nombre}</strong></td>
                  <td>{c.telefono}</td>
                  <td>{c.email || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}