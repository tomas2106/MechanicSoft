import api from "./api";

export const ordenService = {
  obtenerTodas: () => api.get("/ordenes-servicio"),
  crear: (datos) => api.post("/ordenes-servicio", datos),
  actualizarEstado: (id, estado) => api.patch(`/ordenes-servicio/${id}/estado`, { estado }),
  consultarPublica: (tallerSlug, query) =>
    api.get(`/public/consulta?taller=${tallerSlug}&q=${encodeURIComponent(query)}`),
};