import api from "./api";

export const tallerService = {
  listarPublicos: () => api.get("/public/talleres"),
  obtenerPorSlug: (slug) => api.get(`/public/talleres/${slug}`),
  actualizarPerfil: (id, datos) => api.put(`/talleres/${id}`, datos),
};