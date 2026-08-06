import axios from "axios";

const API = "http://localhost:9769/api/ordenes-servicio";


// ==========================================
// OBTENER TODAS LAS ÓRDENES
// ==========================================

export const obtenerOrdenes = async () => {

    return axios.get(API);

};


// ==========================================
// OBTENER ORDEN POR ID
// ==========================================

export const obtenerOrdenPorId = async (id) => {

    return axios.get(`${API}/${id}`);

};


// ==========================================
// OBTENER HISTORIAL DE UN VEHÍCULO
// ==========================================

export const obtenerOrdenesPorVehiculo = async (vehiculoId) => {

    return axios.get(
        `${API}/vehiculo/${vehiculoId}`
    );

};


// ==========================================
// OBTENER ÓRDENES POR ESTADO
// ==========================================

export const obtenerOrdenesPorEstado = async (estado) => {

    return axios.get(
        `${API}/estado/${estado}`
    );

};


// ==========================================
// CREAR ORDEN
// ==========================================

export const guardarOrden = async (orden) => {

    return axios.post(
        API,
        orden
    );

};


// ==========================================
// ACTUALIZAR ORDEN
// ==========================================

export const actualizarOrden = async (
    id,
    orden
) => {

    return axios.put(
        `${API}/${id}`,
        orden
    );

};


// ==========================================
// CAMBIAR ESTADO
// ==========================================

export const cambiarEstadoOrden = async (
    id,
    estado
) => {

    return axios.patch(
        `${API}/${id}/estado`,
        null,
        {
            params: {
                estado: estado
            }
        }
    );

};


// ==========================================
// ELIMINAR / DESACTIVAR ORDEN
// ==========================================

export const eliminarOrden = async (id) => {

    return axios.delete(
        `${API}/${id}`
    );

};

