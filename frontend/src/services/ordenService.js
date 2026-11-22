import api from "./api";

export const ordenService = {
  obtenerTodas: () => api.get("/ordenes-servicio"),
  crear: (datos) => api.post("/ordenes-servicio", datos),
  actualizar: (id, datos) => api.put(`/ordenes-servicio/${id}`, datos),
  actualizarEstado: (id, estado) =>
    api.patch(`/ordenes-servicio/${id}/estado?estado=${estado}`),
  consultarPublica: (tallerSlug, query) =>
    api.get(`/public/consulta?taller=${tallerSlug}&q=${encodeURIComponent(query)}`),
};