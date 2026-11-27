import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bike, Search, RefreshCw, Plus, Trash2, MessageCircle, User } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const obtenerTallerKeyInicial = (taller) => {
  if (taller?.id) return String(taller.id);
  const storedId = localStorage.getItem("ms_taller_id");
  if (storedId) return String(storedId);
  try {
    const parsed = JSON.parse(localStorage.getItem("ms_taller") || "null");
    if (parsed?.id) return String(parsed.id);
  } catch {
    // Ignorar
  }
  return "default";
};

export default function Vehiculos() {
  const { user, taller } = useAuth();
  const esAdminTaller = user?.rol === "ADMIN_TALLER";
  const tallerKey = obtenerTallerKeyInicial(taller);
  const cacheKeyMotos = `ms_motos_${tallerKey}`;

  const [motos, setMotos] = useState(() => {
    try {
      const guardadas = localStorage.getItem(cacheKeyMotos);
      return guardadas ? JSON.parse(guardadas) : [];
    } catch {
      return [];
    }
  });

  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(() => motos.length === 0);
  const [sincronizando, setSincronizando] = useState(false);
  const [error, setError] = useState("");

  const cargarMotos = async () => {
    if (motos.length === 0) setCargando(true);
    setSincronizando(true);
    setError("");

    try {
      // Solo 2 llamadas ligeras en paralelo (sin /ordenes-servicio pesado ni bucle N+1)
      const [resVehiculos, resResumen] = await Promise.allSettled([
        api.get("/vehiculos"),
        api.get("/ordenes-servicio/resumen"),
      ]);

      const mapaUnicoMotos = new Map();

      const registrarMoto = (moto) => {
        if (!moto || (!moto.id && !moto.placa)) return;
        const clave = moto.placa ? moto.placa.toUpperCase() : `ID_${moto.id}`;
        const existente = mapaUnicoMotos.get(clave);

        // Excluimos fotoVehiculo para no saturar memoria ni localStorage
        const { fotoVehiculo, ...motoSinFoto } = moto;
        const clienteNormalizado = moto.cliente || {
          id: moto.clienteId ?? null,
          nombre: moto.clienteNombre || moto.nombreCliente || "Sin asignar",
          telefono: moto.clienteTelefono || moto.telefono || "",
        };

        mapaUnicoMotos.set(clave, {
          ...(existente || {}),
          ...motoSinFoto,
          cliente: clienteNormalizado.nombre ? clienteNormalizado : existente?.cliente || clienteNormalizado,
        });
      };

      if (resVehiculos.status === "fulfilled" && Array.isArray(resVehiculos.value.data)) {
        resVehiculos.value.data.forEach((v) => registrarMoto(v));
      }

      if (resResumen.status === "fulfilled" && Array.isArray(resResumen.value.data)) {
        resResumen.value.data.forEach((o) => {
          if (o.vehiculo) {
            registrarMoto(o.vehiculo);
          } else if (o.placa) {
            registrarMoto({
              id: o.vehiculoId,
              placa: o.placa,
              marca: o.marca,
              modelo: o.modelo,
              cilindrajeCc: o.cilindrajeCc,
              kilometraje: o.kilometrajeIngreso,
              clienteId: o.clienteId,
              clienteNombre: o.clienteNombre || o.nombreCliente,
              clienteTelefono: o.clienteTelefono || o.telefono,
            });
          }
        });
      }

      const listaFinal = Array.from(mapaUnicoMotos.values());
      setMotos(listaFinal);
      try {
        localStorage.setItem(cacheKeyMotos, JSON.stringify(listaFinal));
      } catch {
        // Ignorar si localStorage está lleno
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setCargando(false);
      setSincronizando(false);
    }
  };

  useEffect(() => {
    cargarMotos();
  }, [tallerKey]);

  const eliminarMoto = async (moto) => {
    if (!moto.id) return alert("Esta moto no tiene un ID válido para eliminar.");
    if (
      !window.confirm(
        `¿Seguro que deseas eliminar la motocicleta ${moto.placa} (${moto.marca} ${moto.modelo})?`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/vehiculos/${moto.id}`);
      setMotos((prev) => {
        const filtradas = prev.filter((m) => m.id !== moto.id);
        localStorage.setItem(cacheKeyMotos, JSON.stringify(filtradas));
        return filtradas;
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "No se puede eliminar esta moto porque tiene órdenes de servicio registradas."
      );
    }
  };

  const abrirWhatsAppPropietario = (moto) => {
    const tel = (moto.cliente?.telefono || "").replace(/\D/g, "");
    if (!tel) return alert("El propietario no tiene WhatsApp registrado.");
    const prefijo = tel.startsWith("57") ? "" : "57";
    const msg = `Hola ${moto.cliente?.nombre || ""}, te escribimos del taller respecto a tu moto *${moto.marca} ${moto.modelo}* de placa *${moto.placa}*.`;
    window.open(`https://wa.me/${prefijo}${tel}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const motosFiltradas = motos.filter((m) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      (m.placa || "").toLowerCase().includes(q) ||
      (m.marca || "").toLowerCase().includes(q) ||
      (m.modelo || "").toLowerCase().includes(q) ||
      (m.cliente?.nombre || "").toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
              Motocicletas Registradas ({motos.length})
            </h2>
            {sincronizando && (
              <span style={{ fontSize: "0.76rem", color: "var(--accent-brand)", fontWeight: 600 }}>
                Actualizando...
              </span>
            )}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Historial de motocicletas atendidas y sus propietarios
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={cargarMotos} className="icon-btn" title="Actualizar listado">
            <RefreshCw size={16} />
          </button>
          <Link to="/panel/recepcion" className="btn-accent" style={{ textDecoration: "none" }}>
            <Plus size={17} /> Registrar moto
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: "0.85rem 1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Search size={18} color="var(--accent-brand)" />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por placa, marca, modelo o propietario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {cargando && motos.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)" }}>
          Cargando motocicletas del taller...
        </div>
      ) : motosFiltradas.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <Bike size={32} color="var(--text-muted)" style={{ margin: "0 auto 0.6rem" }} />
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.9rem" }}>
            No hay motos registradas con ese filtro.
          </p>
          <Link to="/panel/recepcion" className="btn-accent" style={{ textDecoration: "none" }}>
            Registrar primera motocicleta
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Motocicleta</th>
                <th>Cilindraje / Km</th>
                <th>Propietario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {motosFiltradas.map((m, idx) => (
                <tr key={m.id || m.placa || idx}>
                  <td>
                    <span className="placa-badge">{m.placa}</span>
                  </td>
                  <td>
                    <strong>
                      {m.marca} {m.modelo}
                    </strong>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {m.cilindrajeCc ? `${m.cilindrajeCc} cc` : "—"} •{" "}
                    {m.kilometraje ? `${Number(m.kilometraje).toLocaleString("es-CO")} km` : "0 km"}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <User size={14} color="var(--accent-brand)" />
                      <span>{m.cliente?.nombre || "Sin asignar"}</span>
                    </div>
                  </td>
                  <td style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => abrirWhatsAppPropietario(m)}
                      className="icon-btn"
                      title="WhatsApp al propietario"
                      style={{ color: "var(--accent-brand)" }}
                    >
                      <MessageCircle size={16} />
                    </button>

                    {esAdminTaller && (
                      <button
                        type="button"
                        onClick={() => eliminarMoto(m)}
                        className="icon-btn"
                        title="Eliminar motocicleta"
                        style={{ color: "var(--danger)" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}