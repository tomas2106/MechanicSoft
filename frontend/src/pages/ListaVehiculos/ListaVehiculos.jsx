import { useEffect, useState } from "react";
import "./ListaVehiculos.css";

import ModalVehiculo from "../../components/ModalVehiculo/ModalVehiculo";

import {
    obtenerVehiculos,
    eliminarVehiculo
} from "../../services/vehiculoService";

export default function ListaVehiculos() {

    const [vehiculos, setVehiculos] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [fecha, setFecha] = useState("");

    const [modalAbierto, setModalAbierto] = useState(false);
    const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);

    useEffect(() => {
        cargarVehiculos();
    }, []);

    const cargarVehiculos = async () => {

        try {

            const respuesta = await obtenerVehiculos();

            setVehiculos(respuesta?.data || []);

        } catch (error) {

            console.error("Error cargando vehículos:", error);

            alert("Error cargando los vehículos.");

        }

    };

    const eliminar = async (id) => {

        const confirmar = window.confirm(
            "¿Desea eliminar este vehículo?"
        );

        if (!confirmar) return;

        try {

            await eliminarVehiculo(id);

            await cargarVehiculos();

        } catch (error) {

            console.error("Error eliminando vehículo:", error);

            alert("No fue posible eliminar el vehículo.");

        }

    };

    const abrirModal = (vehiculo) => {

        setVehiculoSeleccionado(vehiculo);

        setModalAbierto(true);

    };

    const cerrarModal = () => {

        setModalAbierto(false);

        setVehiculoSeleccionado(null);

    };

    const vehiculosFiltrados = vehiculos
        .filter((vehiculo) => {

            const textoBusqueda = busqueda
                .toLowerCase()
                .trim();

            const placa = vehiculo?.placa
                ?.toLowerCase() || "";

            const marca = vehiculo?.marca
                ?.toLowerCase() || "";

            const modelo = vehiculo?.modelo
                ?.toLowerCase() || "";

            const propietario = vehiculo?.cliente?.nombre
                ?.toLowerCase() || "";

            const coincideBusqueda =
                placa.includes(textoBusqueda) ||
                marca.includes(textoBusqueda) ||
                modelo.includes(textoBusqueda) ||
                propietario.includes(textoBusqueda);

            let coincideFecha = true;

            if (fecha) {

                const fechaVehiculo = vehiculo?.createdAt
                    ? new Date(vehiculo.createdAt)
                        .toISOString()
                        .split("T")[0]
                    : null;

                coincideFecha = fechaVehiculo === fecha;

            }

            return coincideBusqueda && coincideFecha;

        })
        .sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

    return (

        <div className="lista">

            <div className="encabezado-lista">

                <div>

                    <h1>Vehículos</h1>

                    <p>
                        Consulta y administra los vehículos registrados.
                    </p>

                </div>

            </div>


            {/* FILTROS */}

            <div className="filtros">

                <input
                    className="buscar"
                    type="text"
                    placeholder="Buscar por placa, marca, modelo o propietario..."
                    value={busqueda}
                    onChange={(e) =>
                        setBusqueda(e.target.value)
                    }
                />

                <input
                    className="buscar"
                    type="date"
                    value={fecha}
                    onChange={(e) =>
                        setFecha(e.target.value)
                    }
                />

                <button
                    className="btn-ver"
                    onClick={() => {

                        setBusqueda("");
                        setFecha("");

                    }}
                >
                    Limpiar filtros
                </button>

            </div>


            {/* CONTADOR */}

            <div className="contador">

                <span>
                    Vehículos encontrados:
                </span>

                <strong>
                    {vehiculosFiltrados.length}
                </strong>

            </div>


            {/* TABLA */}

            <div className="tabla-contenedor">

                <table>

                    <thead>

                        <tr>

                            <th>Placa</th>

                            <th>Marca</th>

                            <th>Modelo</th>

                            <th>Color</th>

                            <th>Km</th>

                            <th>Propietario</th>

                            <th>Teléfono</th>

                            <th>Fecha registro</th>

                            <th>Acciones</th>

                        </tr>

                    </thead>


                    <tbody>

                        {vehiculosFiltrados.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="9"
                                    className="sin-resultados"
                                >
                                    No existen vehículos registrados.
                                </td>

                            </tr>

                        ) : (

                            vehiculosFiltrados.map(
                                (vehiculo) => (

                                    <tr key={vehiculo.id}>

                                        <td>

                                            <strong>
                                                {vehiculo.placa}
                                            </strong>

                                        </td>

                                        <td>
                                            {vehiculo.marca}
                                        </td>

                                        <td>
                                            {vehiculo.modelo}
                                        </td>

                                        <td>
                                            {vehiculo.color || "—"}
                                        </td>

                                        <td>
                                            {vehiculo.kilometraje?.toLocaleString(
                                                "es-CO"
                                            )} km
                                        </td>

                                        <td>
                                            {vehiculo.cliente?.nombre || "—"}
                                        </td>

                                        <td>
                                            {vehiculo.cliente?.telefono || "—"}
                                        </td>

                                        <td>

                                            {vehiculo.createdAt
                                                ? new Date(
                                                    vehiculo.createdAt
                                                ).toLocaleDateString(
                                                    "es-CO"
                                                )
                                                : "—"
                                            }

                                        </td>

                                        <td>

                                            <div className="acciones">

                                                <button
                                                    className="btn-ver"
                                                    onClick={() =>
                                                        abrirModal(
                                                            vehiculo
                                                        )
                                                    }
                                                >
                                                    Ver
                                                </button>

                                                <button
                                                    className="btn-editar"
                                                    onClick={() =>
                                                        alert(
                                                            "La edición de vehículos la construiremos después."
                                                        )
                                                    }
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    className="btn-eliminar"
                                                    onClick={() =>
                                                        eliminar(
                                                            vehiculo.id
                                                        )
                                                    }
                                                >
                                                    Eliminar
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )

                        )}

                    </tbody>

                </table>

            </div>


            {/* MODAL */}

            <ModalVehiculo
                abierto={modalAbierto}
                vehiculo={vehiculoSeleccionado}
                cerrar={cerrarModal}
            />

        </div>

    );

}