import api from "./api";

export const vehiculoService = {
  obtenerTodos: () => api.get("/vehiculos"),
  crear: (datos) => api.post("/vehiculos", datos),
  buscarPorPlaca: (placa) => api.get(`/vehiculos?placa=${placa.toUpperCase()}`),
};