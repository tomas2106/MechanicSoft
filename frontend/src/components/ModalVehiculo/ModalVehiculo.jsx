import "./ModalVehiculo.css";

export default function ModalVehiculo({
    abierto,
    vehiculo,
    cerrar
}) {

    if (!abierto || !vehiculo) {
        return null;
    }

    const cliente = vehiculo.cliente;

    const formatearKilometraje = (kilometraje) => {

        if (kilometraje === null || kilometraje === undefined) {
            return "—";
        }

        return kilometraje.toLocaleString("es-CO") + " km";
    };

    const formatearFecha = (fecha) => {

        if (!fecha) {
            return "—";
        }

        return new Date(fecha).toLocaleDateString(
            "es-CO",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
    };

    return (

        <div
            className="modal-fondo"
            onClick={cerrar}
        >

            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >

                {/* HEADER */}

                <div className="modal-header">

                    <div>

                        <span className="modal-etiqueta">
                            VEHÍCULO
                        </span>

                        <h2>
                            {vehiculo.marca} {vehiculo.modelo}
                        </h2>

                        <span className="modal-placa">
                            {vehiculo.placa}
                        </span>

                    </div>

                    <button
                        className="cerrar"
                        onClick={cerrar}
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>

                </div>


                {/* CONTENIDO */}

                <div className="contenido-modal">


                    {/* DATOS DEL VEHÍCULO */}

                    <section className="seccion">

                        <h3>
                            🏍️ Datos del vehículo
                        </h3>

                        <div className="datos-grid">

                            <div className="dato">

                                <span>Placa</span>

                                <strong>
                                    {vehiculo.placa || "—"}
                                </strong>

                            </div>


                            <div className="dato">

                                <span>Marca</span>

                                <strong>
                                    {vehiculo.marca || "—"}
                                </strong>

                            </div>


                            <div className="dato">

                                <span>Modelo</span>

                                <strong>
                                    {vehiculo.modelo || "—"}
                                </strong>

                            </div>


                            <div className="dato">

                                <span>Año</span>

                                <strong>
                                    {vehiculo.anio || "—"}
                                </strong>

                            </div>


                            <div className="dato">

                                <span>Cilindraje</span>

                                <strong>
                                    {vehiculo.cilindrajeCc
                                        ? `${vehiculo.cilindrajeCc} cc`
                                        : "—"
                                    }
                                </strong>

                            </div>


                            <div className="dato">

                                <span>Color</span>

                                <strong>
                                    {vehiculo.color || "—"}
                                </strong>

                            </div>


                            <div className="dato">

                                <span>Kilometraje</span>

                                <strong>
                                    {formatearKilometraje(
                                        vehiculo.kilometraje
                                    )}
                                </strong>

                            </div>


                            <div className="dato">

                                <span>Fecha de registro</span>

                                <strong>
                                    {formatearFecha(
                                        vehiculo.createdAt
                                    )}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* CLIENTE */}

                    <section className="seccion">

                        <h3>
                            👤 Propietario
                        </h3>

                        {cliente ? (

                            <div className="datos-grid">

                                <div className="dato">

                                    <span>Nombre</span>

                                    <strong>
                                        {cliente.nombre || "—"}
                                    </strong>

                                </div>


                                <div className="dato">

                                    <span>Teléfono</span>

                                    <strong>
                                        {cliente.telefono || "—"}
                                    </strong>

                                </div>


                                <div className="dato">

                                    <span>Correo</span>

                                    <strong>
                                        {cliente.correo || "No registrado"}
                                    </strong>

                                </div>

                            </div>

                        ) : (

                            <p className="sin-datos">
                                Este vehículo no tiene un propietario asociado.
                            </p>

                        )}

                    </section>


                    {/* OBSERVACIONES */}

                    <section className="seccion">

                        <h3>
                            📝 Observaciones
                        </h3>

                        <div className="observaciones">

                            {vehiculo.observaciones
                                ? vehiculo.observaciones
                                : "No hay observaciones registradas."
                            }

                        </div>

                    </section>

                </div>


                {/* FOOTER */}

                <div className="modal-footer">

                    <button
                        className="btn-cerrar"
                        onClick={cerrar}
                    >
                        Cerrar
                    </button>

                </div>

            </div>

        </div>

    );

}