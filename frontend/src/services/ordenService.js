import api from "./api";

const normalizarOrdenResumen = (item) => {
  if (!item || typeof item !== "object") return item;

  if (item.vehiculo && typeof item.vehiculo === "object") {
    return item;
  }

  return {
    ...item,
    vehiculoId: item.vehiculoId ?? null,
    vehiculo: {
      id: item.vehiculoId ?? null,
      placa: item.placa || "",
      marca: item.marca || "",
      modelo: item.modelo || "",
      cilindrajeCc: item.cilindrajeCc ?? null,
      kilometraje: item.kilometrajeIngreso ?? item.kilometraje ?? 0,
      cliente: {
        id: item.clienteId ?? null,
        nombre: item.clienteNombre || item.nombreCliente || "Cliente",
        telefono: item.clienteTelefono || item.telefono || "",
      },
    },
  };
};

export const ordenService = {
  obtenerTodas: async () => {
    try {
      const res = await api.get("/ordenes-servicio/resumen");
      const lista = Array.isArray(res.data)
        ? res.data.map(normalizarOrdenResumen)
        : [];
      return { ...res, data: lista };
    } catch {
      return api.get("/ordenes-servicio");
    }
  },

  obtenerPorId: (id) => api.get(`/ordenes-servicio/${id}`),

  buscarPorVehiculo: (vehiculoId) =>
    api.get(`/ordenes-servicio/vehiculo/${vehiculoId}`),

  crear: (datos) => api.post("/ordenes-servicio", datos),

  actualizar: (id, datos) => api.put(`/ordenes-servicio/${id}`, datos),

  actualizarEstado: (id, estado) =>
    api.patch(`/ordenes-servicio/${id}/estado?estado=${estado}`),

  eliminar: (id) => api.delete(`/ordenes-servicio/${id}`),

  consultarPublica: async (tallerSlug, query) => {
    const placaLimpia = (query || "").trim().replace(/\s+/g, "").toUpperCase();
    const cacheKey = `ms_pub_${tallerSlug}_${placaLimpia}`;

    try {
      const res = await api.get(
        `/public/consulta?taller=${encodeURIComponent(tallerSlug)}&q=${encodeURIComponent(placaLimpia)}`
      );
      sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
      return res;
    } catch (err) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        return { data: JSON.parse(cached) };
      }
      throw err;
    }
  },
};