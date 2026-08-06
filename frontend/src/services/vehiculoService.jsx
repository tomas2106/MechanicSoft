import axios from "axios";

const API = "https://mechanicsoft-test.onrender.com/api/vehiculos";


// ==========================================
// OBTENER TODOS LOS VEHÍCULOS
// ==========================================

export const obtenerVehiculos = async () => {

    return axios.get(API);

};


// ==========================================
// OBTENER VEHÍCULO POR ID
// ==========================================

export const obtenerVehiculoPorId = async (id) => {

    return axios.get(`${API}/${id}`);

};


// ==========================================
// BUSCAR VEHÍCULO POR PLACA
// ==========================================

export const obtenerVehiculoPorPlaca = async (placa) => {

    return axios.get(
        `${API}/placa/${placa.toUpperCase()}`
    );

};


// ==========================================
// OBTENER VEHÍCULOS DE UN CLIENTE
// ==========================================

export const obtenerVehiculosPorCliente = async (clienteId) => {

    return axios.get(
        `${API}/cliente/${clienteId}`
    );

};


// ==========================================
// REGISTRAR VEHÍCULO
// ==========================================

export const guardarVehiculo = async (vehiculo) => {

    return axios.post(
        API,
        vehiculo
    );

};


// ==========================================
// ACTUALIZAR VEHÍCULO
// ==========================================

export const actualizarVehiculo = async (
    id,
    vehiculo
) => {

    return axios.put(
        `${API}/${id}`,
        vehiculo
    );

};


// ==========================================
// ELIMINAR VEHÍCULO
// ==========================================

export const eliminarVehiculo = async (id) => {

    return axios.delete(
        `${API}/${id}`
    );

};

