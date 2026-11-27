import { useEffect, useState } from "react";
import { Search, Trash2, Bike, Phone, MessageCircle, RefreshCw, User } from "lucide-react";
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

const normalizarTel = (tel) => String(tel || "").replace(/\D/g, "").slice(-10);

export default function Clientes() {
  const { user, taller } = useAuth();
  const esAdminTaller = user?.rol === "ADMIN_TALLER";
  const tallerKey = obtenerTallerKeyInicial(taller);
  const cacheKeyClientes = `ms_clientes_${tallerKey}`;
  const cacheKeyMapaMotos = `ms_clientes_motos_${tallerKey}`;

  const [clientes, setClientes] = useState(() => {
    try {
      const guardados = localStorage.getItem(cacheKeyClientes);
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  });

  const [motosPorCliente, setMotosPorCliente] = useState(() => {
    try {
      const guardadas = localStorage.getItem(cacheKeyMapaMotos);
      return guardadas ? JSON.parse(guardadas) : {};
    } catch {
      return {};
    }
  });

  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(() => clientes.length === 0);
  const [sincronizando, setSincronizando] = useState(false);
  const [error, setError] = useState("");

  const cargarDirectorio = async () => {
    if (clientes.length === 0) setCargando(true);
    setSincronizando(true);
    setError("");

    const timerDesbloqueo = setTimeout(() => {
      setCargando(false);
    }, 3500);

    try {
      const [resClientes, resVehiculos, resResumen] = await Promise.allSettled([
        api.get("/clientes"),
        api.get("/vehiculos"),
        api.get("/ordenes-servicio/resumen"),
      ]);

      const listaClientes =
        resClientes.status === "fulfilled" && Array.isArray(resClientes.value.data)
          ? resClientes.value.data
          : [];

      // Índice auxiliar de clientes por teléfono para cruzar motos aunque tuvieran ID duplicado
      const clientePorTelefono = {};
      listaClientes.forEach((c) => {
        const telNorm = normalizarTel(c.telefono);
        if (telNorm) clientePorTelefono[telNorm] = c.id;
      });

      const mapaMotos = {};
      const agregarMotoAlMapa = (clienteId, clienteTel, moto) => {
        if (!moto || (!moto.id && !moto.placa)) return;
        const idResuelto = clienteId || clientePorTelefono[normalizarTel(clienteTel)];
        if (!idResuelto) return;

        const key = String(idResuelto);
        if (!mapaMotos[key]) mapaMotos[key] = [];

        const yaExiste = mapaMotos[key].some(
          (m) =>
            (m.id && moto.id && m.id === moto.id) ||
            (m.placa && moto.placa && m.placa.toUpperCase() === moto.placa.toUpperCase())
        );

        if (!yaExiste) {
          mapaMotos[key].push({
            id: moto.id ?? null,
            placa: moto.placa || "",
            marca: moto.marca || "",
            modelo: moto.modelo || "",
            cilindrajeCc: moto.cilindrajeCc ?? null,
          });
        }
      };

      // 1. Desde /vehiculos
      if (resVehiculos.status === "fulfilled" && Array.isArray(resVehiculos.value.data)) {
        resVehiculos.value.data.forEach((v) => {
          const cId = v.cliente?.id || v.clienteId;
          const cTel = v.cliente?.telefono || v.clienteTelefono;
          agregarMotoAlMapa(cId, cTel, v);
        });
      }

      // 2. Si el cliente trae vehiculos anidados
      listaClientes.forEach((c) => {
        if (Array.isArray(c.vehiculos)) {
          c.vehiculos.forEach((v) => agregarMotoAlMapa(c.id, c.telefono, v));
        }
      });

      // 3. Desde /ordenes-servicio/resumen
      if (resResumen.status === "fulfilled" && Array.isArray(resResumen.value.data)) {
        resResumen.value.data.forEach((o) => {
          if (o.vehiculo) {
            const cId = o.vehiculo.cliente?.id || o.vehiculo.clienteId || o.clienteId;
            const cTel = o.vehiculo.cliente?.telefono || o.clienteTelefono;
            agregarMotoAlMapa(cId, cTel, o.vehiculo);
          } else if (o.placa && (o.clienteId || o.clienteTelefono)) {
            agregarMotoAlMapa(o.clienteId, o.clienteTelefono, {
              id: o.vehiculoId,
              placa: o.placa,
              marca: o.marca,
              modelo: o.modelo,
              cilindrajeCc: o.cilindrajeCc,
            });
          }
        });
      }

      setClientes(listaClientes);
      setMotosPorCliente(mapaMotos);

      try {
        const clientesLigeros = listaClientes.map(
          ({ vehiculos, ordenes, taller: _t, ...rest }) => rest
        );
        localStorage.setItem(cacheKeyClientes, JSON.stringify(clientesLigeros));
        localStorage.setItem(cacheKeyMapaMotos, JSON.stringify(mapaMotos));
      } catch {
        // Ignorar
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      clearTimeout(timerDesbloqueo);
      setCargando(false);
      setSincronizando(false);
    }
  };

  useEffect(() => {
    cargarDirectorio();
  }, [tallerKey]);

  const eliminarCliente = async (cliente) => {
    const motos = motosPorCliente[String(cliente.id)] || [];
    const avisoMotos =
      motos.length > 0
        ? `\nTiene ${motos.length} moto(s) asociada(s): ${motos.map((m) => m.placa).join(", ")}.`
        : "";

    if (
      !window.confirm(
        `¿Seguro que deseas eliminar al cliente "${cliente.nombre}"?${avisoMotos}\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/clientes/${cliente.id}`);
      setClientes((prev) => {
        const filtrados = prev.filter((c) => c.id !== cliente.id);
        localStorage.setItem(cacheKeyClientes, JSON.stringify(filtrados));
        return filtrados;
      });
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "No se puede eliminar este cliente porque tiene órdenes de servicio activas o históricas asociadas."
      );
    }
  };

  const abrirWhatsApp = (telefono, nombre) => {
    const tel = (telefono || "").replace(/\D/g, "");
    if (!tel) return alert("Este cliente no tiene teléfono registrado.");
    const prefijo = tel.startsWith("57") ? "" : "57";
    const msg = `Hola ${nombre || ""}, te saludamos desde el taller.`;
    window.open(`https://wa.me/${prefijo}${tel}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    const nombre = (c.nombre || "").toLowerCase();
    const tel = (c.telefono || "").toLowerCase();
    const motos = motosPorCliente[String(c.id)] || [];
    const coincidePlaca = motos.some(
      (m) =>
        (m.placa || "").toLowerCase().includes(q) ||
        (m.marca || "").toLowerCase().includes(q) ||
        (m.modelo || "").toLowerCase().includes(q)
    );
    return nombre.includes(q) || tel.includes(q) || coincidePlaca;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
              Directorio de Clientes ({clientes.length})
            </h2>
            {sincronizando && (
              <span style={{ fontSize: "0.76rem", color: "var(--accent-brand)", fontWeight: 600 }}>
                Actualizando...
              </span>
            )}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
            Consulta los propietarios, las motocicletas a su nombre y gestiona el directorio
          </p>
        </div>

        <button onClick={cargarDirectorio} className="icon-btn" title="Actualizar directorio">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="card" style={{ padding: "0.85rem 1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Search size={18} color="var(--accent-brand)" />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar cliente por nombre, teléfono o placa de moto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {cargando && clientes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)" }}>
          Cargando directorio de clientes...
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-secondary)" }}>
          No se encontraron clientes registrados con ese criterio.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: "1rem" }}>
          {clientesFiltrados.map((cliente) => {
            const motos = motosPorCliente[String(cliente.id)] || [];

            return (
              <div
                key={cliente.id}
                className="card"
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "0.85rem" }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: "var(--primary-soft)",
                          color: "var(--accent-brand)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <User size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{cliente.nombre}</h3>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Phone size={13} /> {cliente.telefono || "Sin teléfono"}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <button
                        type="button"
                        onClick={() => abrirWhatsApp(cliente.telefono, cliente.nombre)}
                        className="icon-btn"
                        title="Escribir por WhatsApp"
                        style={{ color: "var(--accent-brand)" }}
                      >
                        <MessageCircle size={16} />
                      </button>

                      {esAdminTaller && (
                        <button
                          type="button"
                          onClick={() => eliminarCliente(cliente)}
                          className="icon-btn"
                          title="Eliminar cliente"
                          style={{ color: "var(--danger)" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Motos registradas a su nombre */}
                  <div style={{ marginTop: "0.9rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Bike size={14} color="var(--accent-brand)" />
                      Motos a su nombre ({motos.length})
                    </span>

                    {motos.length === 0 ? (
                      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        Sin motocicletas asociadas aún.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        {motos.map((m, idx) => (
                          <div
                            key={m.id || m.placa || idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "0.45rem 0.65rem",
                              backgroundColor: "var(--bg-app)",
                              borderRadius: 8,
                              border: "1px solid var(--border-color)",
                              fontSize: "0.84rem",
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>
                              {m.marca} {m.modelo}
                              {m.cilindrajeCc ? ` (${m.cilindrajeCc}cc)` : ""}
                            </span>
                            <span className="placa-badge">{m.placa}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}