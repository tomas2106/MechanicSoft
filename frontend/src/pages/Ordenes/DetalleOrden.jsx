import { useEffect, useState } from "react";
import { obtenerOrdenPorId } from "../../services/ordenServicioService";
import "./DetalleOrden.css";

function DetalleOrden({ ordenId, volver }) {

    const [orden, setOrden] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        cargarOrden();

    }, [ordenId]);


    const cargarOrden = async () => {

        try {

            setCargando(true);
            setError("");

            const respuesta =
                await obtenerOrdenPorId(ordenId);

            setOrden(respuesta.data);

        } catch (error) {

            console.error(
                "Error al cargar la orden:",
                error
            );

            setError(
                "No fue posible cargar el detalle de la orden."
            );

        } finally {

            setCargando(false);

        }

    };


    const traducirEstado = (estado) => {

        const estados = {

            RECIBIDO: "Recibido",

            DIAGNOSTICO: "Diagnóstico",

            EN_REPARACION: "En reparación",

            LISTO_PARA_ENTREGA: "Lista para entrega",

            ENTREGADO: "Entregado",

            CANCELADO: "Cancelado"

        };

        return estados[estado] || estado;

    };


    const formatearFecha = (fecha) => {

        if (!fecha) {
            return "—";
        }

        return new Date(fecha).toLocaleString(
            "es-CO",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    };


    if (cargando) {

        return (

            <div className="detalle-orden">

                <div className="orden-estado">

                    Cargando detalle de la orden...

                </div>

            </div>

        );

    }


    if (error) {

        return (

            <div className="detalle-orden">

                <button
                    className="btn-volver-orden"
                    onClick={volver}
                >
                    ← Volver a órdenes
                </button>

                <div className="orden-estado error">

                    {error}

                </div>

            </div>

        );

    }


    if (!orden) {
        return null;
    }


    const vehiculo = orden.vehiculo;

    const cliente = vehiculo?.cliente;


    return (

        <div className="detalle-orden">


            {/* ==============================
                VOLVER
            ============================== */}

            <button
                className="btn-volver-orden"
                onClick={volver}
            >

                ← Volver a órdenes

            </button>


            {/* ==============================
                HEADER
            ============================== */}

            <div className="detalle-orden-header">

                <div>

                    <span className="numero-orden">

                        Orden #{orden.id}

                    </span>

                    <h1>

                        {vehiculo?.placa || "Vehículo"}

                    </h1>

                    <p>

                        {vehiculo?.marca}
                        {" "}
                        {vehiculo?.modelo}

                    </p>

                </div>


                <span
                    className={`detalle-estado estado-${orden.estado}`}
                >

                    {traducirEstado(orden.estado)}

                </span>

            </div>


            {/* ==============================
                INFORMACIÓN GENERAL
            ============================== */}

            <div className="detalle-grid">


                <div className="detalle-card">

                    <h2>
                        Información del vehículo
                    </h2>


                    <div className="datos-grid">

                        <div className="dato">

                            <span>
                                Placa
                            </span>

                            <strong>
                                {vehiculo?.placa || "—"}
                            </strong>

                        </div>


                        <div className="dato">

                            <span>
                                Marca
                            </span>

                            <strong>
                                {vehiculo?.marca || "—"}
                            </strong>

                        </div>


                        <div className="dato">

                            <span>
                                Modelo
                            </span>

                            <strong>
                                {vehiculo?.modelo || "—"}
                            </strong>

                        </div>


                        <div className="dato">

                            <span>
                                Color
                            </span>

                            <strong>
                                {vehiculo?.color || "—"}
                            </strong>

                        </div>


                        <div className="dato">

                            <span>
                                Cilindraje
                            </span>

                            <strong>
                                {vehiculo?.cilindrajeCc
                                    ? `${vehiculo.cilindrajeCc} cc`
                                    : "—"}
                            </strong>

                        </div>


                        <div className="dato">

                            <span>
                                Año
                            </span>

                            <strong>
                                {vehiculo?.anio || "—"}
                            </strong>

                        </div>

                    </div>

                </div>


                <div className="detalle-card">

                    <h2>
                        Información del cliente
                    </h2>


                    <div className="datos-grid">

                        <div className="dato">

                            <span>
                                Nombre
                            </span>

                            <strong>
                                {cliente?.nombre || "—"}
                            </strong>

                        </div>


                        <div className="dato">

                            <span>
                                Teléfono
                            </span>

                            <strong>
                                {cliente?.telefono || "—"}
                            </strong>

                        </div>


                        <div className="dato dato-completo">

                            <span>
                                Correo
                            </span>

                            <strong>
                                {cliente?.correo || "No registrado"}
                            </strong>

                        </div>

                    </div>

                </div>


            </div>


            {/* ==============================
                DATOS DE INGRESO
            ============================== */}

            <div className="detalle-card">

                <h2>
                    Información de ingreso
                </h2>


                <div className="datos-grid">


                    <div className="dato">

                        <span>
                            Kilometraje de ingreso
                        </span>

                        <strong>

                            {orden.kilometrajeIngreso
                                ?.toLocaleString("es-CO")}
                            {" km"}

                        </strong>

                    </div>


                    <div className="dato">

                        <span>
                            Fecha de ingreso
                        </span>

                        <strong>
                            {formatearFecha(
                                orden.fechaIngreso
                            )}
                        </strong>

                    </div>


                    <div className="dato">

                        <span>
                            Fecha de entrega
                        </span>

                        <strong>
                            {formatearFecha(
                                orden.fechaEntrega
                            )}
                        </strong>

                    </div>


                    <div className="dato">

                        <span>
                            Valor total
                        </span>

                        <strong>

                            {orden.valorTotal
                                ? `$ ${Number(
                                    orden.valorTotal
                                ).toLocaleString("es-CO")}`
                                : "Pendiente"}

                        </strong>

                    </div>

                </div>

            </div>


            {/* ==============================
                MOTIVO
            ============================== */}

            <div className="detalle-card">

                <h2>
                    Motivo del ingreso
                </h2>

                <div className="texto-detalle">

                    {orden.motivoIngreso || "No registrado"}

                </div>

            </div>


            {/* ==============================
                DIAGNÓSTICO
            ============================== */}

            <div className="detalle-card">

                <h2>
                    Diagnóstico
                </h2>

                <div className="texto-detalle">

                    {orden.diagnostico || "Pendiente"}

                </div>

            </div>


            {/* ==============================
                TRABAJO REALIZADO
            ============================== */}

            <div className="detalle-card">

                <h2>
                    Trabajo realizado
                </h2>

                <div className="texto-detalle">

                    {orden.trabajoRealizado || "Pendiente"}

                </div>

            </div>


            {/* ==============================
                OBSERVACIONES
            ============================== */}

            <div className="detalle-card">

                <h2>
                    Observaciones
                </h2>

                <div className="texto-detalle">

                    {orden.observaciones || "Sin observaciones"}

                </div>

            </div>


        </div>

    );

}


export default DetalleOrden;