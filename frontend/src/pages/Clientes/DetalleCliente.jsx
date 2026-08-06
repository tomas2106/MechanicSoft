import { useEffect, useState } from "react";
import axios from "axios";
import "./DetalleCliente.css";

const API_URL = "http://localhost:9769";

function DetalleCliente({ cliente, volver }) {

    const [vehiculos, setVehiculos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarVehiculos();
    }, []);

    const cargarVehiculos = async () => {

        try {

            setCargando(true);
            setError("");

            const respuesta = await axios.get(
                `${API_URL}/api/vehiculos/cliente/${cliente.id}`
            );

            setVehiculos(respuesta.data);

        } catch (error) {

            console.error("Error al cargar vehículos:", error);

            setError(
                "No fue posible cargar los vehículos del cliente."
            );

        } finally {

            setCargando(false);

        }

    };

    return (

        <div className="detalle-cliente">

            <button
                className="btn-volver"
                onClick={volver}
            >
                ← Volver a clientes
            </button>


            <div className="detalle-header">

                <div>

                    <h1>{cliente.nombre}</h1>

                    <p>
                        Información del cliente
                    </p>

                </div>

            </div>


            <div className="informacion-cliente">

                <div className="dato-cliente">

                    <span>📞 Teléfono</span>

                    <strong>
                        {cliente.telefono}
                    </strong>

                </div>


                <div className="dato-cliente">

                    <span>✉️ Correo</span>

                    <strong>
                        {cliente.correo || "No registrado"}
                    </strong>

                </div>


                <div className="dato-cliente">

                    <span>Estado</span>

                    <strong>
                        {cliente.activo ? "Activo" : "Inactivo"}
                    </strong>

                </div>

            </div>


            <section className="vehiculos-cliente">

                <div className="seccion-header">

                    <div>

                        <h2>🏍️ Vehículos</h2>

                        <p>
                            Vehículos asociados a este cliente
                        </p>

                    </div>

                    <span className="cantidad-vehiculos">
                        {vehiculos.length}
                    </span>

                </div>


                {cargando && (

                    <div className="estado-detalle">
                        Cargando vehículos...
                    </div>

                )}


                {!cargando && error && (

                    <div className="estado-detalle error">
                        {error}
                    </div>

                )}


                {!cargando && !error && vehiculos.length === 0 && (

                    <div className="estado-detalle">

                        <h3>No hay vehículos registrados</h3>

                        <p>
                            Este cliente todavía no tiene vehículos asociados.
                        </p>

                    </div>

                )}


                {!cargando && !error && vehiculos.length > 0 && (

                    <div className="vehiculos-grid">

                        {vehiculos.map((vehiculo) => (

                            <div
                                className="vehiculo-card"
                                key={vehiculo.id}
                            >

                                <div className="vehiculo-card-header">

                                    <div>

                                        <span className="placa">
                                            {vehiculo.placa}
                                        </span>

                                        <h3>
                                            {vehiculo.marca} {vehiculo.modelo}
                                        </h3>

                                    </div>

                                    <span className="estado-vehiculo">
                                        {vehiculo.activo
                                            ? "Activo"
                                            : "Inactivo"}
                                    </span>

                                </div>


                                <div className="vehiculo-datos">

                                    <div>
                                        <span>Color</span>
                                        <strong>
                                            {vehiculo.color || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Cilindraje</span>
                                        <strong>
                                            {vehiculo.cilindrajeCc} cc
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Kilometraje</span>
                                        <strong>
                                            {vehiculo.kilometraje?.toLocaleString("es-CO")} km
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Año</span>
                                        <strong>
                                            {vehiculo.anio || "—"}
                                        </strong>
                                    </div>

                                </div>


                                {vehiculo.observaciones && (

                                    <div className="observaciones">

                                        <span>
                                            Observaciones
                                        </span>

                                        <p>
                                            {vehiculo.observaciones}
                                        </p>

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>

    );

}

export default DetalleCliente;