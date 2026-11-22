import api from "./api";

export const clienteService = {
  obtenerTodos: () => api.get("/clientes"),
  crear: (datos) => api.post("/clientes", datos),
  buscarPorTelefono: (telefono) => api.get(`/clientes?telefono=${telefono}`),
};