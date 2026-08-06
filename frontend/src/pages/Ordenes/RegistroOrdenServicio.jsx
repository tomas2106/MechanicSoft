import { useState } from "react";
import axios from "axios";
import {
    guardarOrden,
    obtenerOrdenesPorVehiculo
} from "../../services/ordenServicioService";

import "./RegistroOrdenServicio.css";

const API_VEHICULOS = "http://localhost:9769/api/vehiculos";

function RegistroOrdenServicio({ volver, ordenCreada }) {

    const [placaBusqueda, setPlacaBusqueda] = useState("");

    const [vehiculo, setVehiculo] = useState(null);

    const [buscandoVehiculo, setBuscandoVehiculo] = useState(false);

    const [errorVehiculo, setErrorVehiculo] = useState("");

    const [guardando, setGuardando] = useState(false);

    const [mensaje, setMensaje] = useState("");

    const [orden, setOrden] = useState({
        vehiculoId: "",
        kilometrajeIngreso: "",
        motivoIngreso: "",
        diagnostico: "",
        trabajoRealizado: "",
        observaciones: "",
        estado: "RECIBIDO",
        valorTotal: ""
    });


    // ==========================================
    // BUSCAR VEHÍCULO POR PLACA
    // ==========================================

    const buscarVehiculo = async () => {

        const placa = placaBusqueda.trim().toUpperCase();

        if (!placa) {

            setErrorVehiculo("Escribe una placa para buscar.");

            return;
        }

        try {

            setBuscandoVehiculo(true);
            setErrorVehiculo("");
            setVehiculo(null);
            setMensaje("");

            const respuesta = await axios.get(
                `${API_VEHICULOS}/placa/${placa}`
            );

            const vehiculoEncontrado = respuesta.data;

            setVehiculo(vehiculoEncontrado);

            setOrden((anterior) => ({
                ...anterior,
                vehiculoId: vehiculoEncontrado.id,
                kilometrajeIngreso:
                    vehiculoEncontrado.kilometraje ?? ""
            }));

        } catch (error) {

            console.error(
                "Error al buscar vehículo:",
                error
            );

            setErrorVehiculo(
                "No se encontró un vehículo registrado con esa placa."
            );

        } finally {

            setBuscandoVehiculo(false);

        }

    };


    // ==========================================
    // CAMBIAR VALORES DEL FORMULARIO
    // ==========================================

    const cambiarValor = (e) => {

        const { name, value } = e.target;

        setOrden((anterior) => ({
            ...anterior,
            [name]: value
        }));

    };


    // ==========================================
    // REGISTRAR ORDEN
    // ==========================================

    const registrarOrden = async (e) => {

        e.preventDefault();

        if (!vehiculo) {

            setErrorVehiculo(
                "Primero debes buscar y seleccionar un vehículo."
            );

            return;
        }

        try {

            setGuardando(true);
            setMensaje("");
            setErrorVehiculo("");

            const datosOrden = {

                vehiculoId: Number(orden.vehiculoId),

                kilometrajeIngreso:
                    Number(orden.kilometrajeIngreso),

                motivoIngreso:
                    orden.motivoIngreso.trim(),

                diagnostico:
                    orden.diagnostico.trim() || null,

                trabajoRealizado:
                    orden.trabajoRealizado.trim() || null,

                observaciones:
                    orden.observaciones.trim() || null,

                estado:
                    "RECIBIDO",

                valorTotal:
                    orden.valorTotal
                        ? Number(orden.valorTotal)
                        : null
            };


            const respuesta = await guardarOrden(
                datosOrden
            );


            setMensaje(
                `Orden #${respuesta.data.id} creada correctamente.`
            );


            // Actualizar el kilometraje mostrado
            setVehiculo((anterior) => ({
                ...anterior,
                kilometraje:
                    datosOrden.kilometrajeIngreso
            }));


            // Limpiar datos propios de la orden
            setOrden({
                vehiculoId: vehiculo.id,
                kilometrajeIngreso:
                    datosOrden.kilometrajeIngreso,
                motivoIngreso: "",
                diagnostico: "",
                trabajoRealizado: "",
                observaciones: "",
                estado: "RECIBIDO",
                valorTotal: ""
            });


            // Avisar a la página principal
            if (ordenCreada) {

                ordenCreada(respuesta.data);

            }

        } catch (error) {

            console.error(
                "Error al registrar orden:",
                error
            );

            const mensajeError =
                error.response?.data?.message ||
                "No fue posible registrar la orden de servicio.";

            setMensaje("");

            setErrorVehiculo(mensajeError);

        } finally {

            setGuardando(false);

        }

    };


    // ==========================================
    // LIMPIAR VEHÍCULO
    // ==========================================

    const cambiarVehiculo = () => {

        setVehiculo(null);

        setPlacaBusqueda("");

        setErrorVehiculo("");

        setMensaje("");

        setOrden({
            vehiculoId: "",
            kilometrajeIngreso: "",
            motivoIngreso: "",
            diagnostico: "",
            trabajoRealizado: "",
            observaciones: "",
            estado: "RECIBIDO",
            valorTotal: ""
        });

    };


    return (

        <div className="registro-orden">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="registro-orden-header">

                <div>

                    <button
                        type="button"
                        className="btn-volver-orden"
                        onClick={volver}
                    >
                        ← Volver a órdenes
                    </button>

                    <h1>
                        Nueva Orden de Servicio
                    </h1>

                    <p>
                        Registra el ingreso de un vehículo al taller.
                    </p>

                </div>

            </div>


            {/* ==================================
                MENSAJE
            ================================== */}

            {mensaje && (

                <div className="mensaje-exito">

                    ✓ {mensaje}

                </div>

            )}


            {/* ==================================
                BUSCAR VEHÍCULO
            ================================== */}

            <section className="orden-card-form">

                <div className="orden-section-title">

                    <div>

                        <h2>
                            1. Vehículo
                        </h2>

                        <p>
                            Busca el vehículo por su placa.
                        </p>

                    </div>

                </div>


                <div className="busqueda-vehiculo">

                    <div className="campo-orden">

                        <label>
                            Placa
                        </label>

                        <input
                            type="text"
                            value={placaBusqueda}
                            onChange={(e) =>
                                setPlacaBusqueda(
                                    e.target.value.toUpperCase()
                                )
                            }
                            onKeyDown={(e) => {

                                if (e.key === "Enter") {

                                    e.preventDefault();

                                    buscarVehiculo();

                                }

                            }}
                            placeholder="Ej: ABC123"
                        />

                    </div>


                    <button
                        type="button"
                        className="btn-buscar-vehiculo"
                        onClick={buscarVehiculo}
                        disabled={buscandoVehiculo}
                    >

                        {buscandoVehiculo
                            ? "Buscando..."
                            : "Buscar vehículo"}

                    </button>

                </div>


                {errorVehiculo && (

                    <div className="mensaje-error">

                        {errorVehiculo}

                    </div>

                )}


                {/* ==================================
                    VEHÍCULO ENCONTRADO
                ================================== */}

                {vehiculo && (

                    <div className="vehiculo-encontrado">

                        <div className="vehiculo-encontrado-header">

                            <div>

                                <span>
                                    Vehículo encontrado
                                </span>

                                <h3>
                                    {vehiculo.placa}
                                </h3>

                            </div>

                            <button
                                type="button"
                                onClick={cambiarVehiculo}
                                className="btn-cambiar-vehiculo"
                            >
                                Cambiar
                            </button>

                        </div>


                        <div className="datos-vehiculo-orden">

                            <div>

                                <span>
                                    Marca
                                </span>

                                <strong>
                                    {vehiculo.marca}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Modelo
                                </span>

                                <strong>
                                    {vehiculo.modelo}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Color
                                </span>

                                <strong>
                                    {vehiculo.color || "—"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Cilindraje
                                </span>

                                <strong>
                                    {vehiculo.cilindrajeCc} cc
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Cliente
                                </span>

                                <strong>
                                    {vehiculo.cliente?.nombre ||
                                        "No disponible"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Teléfono
                                </span>

                                <strong>
                                    {vehiculo.cliente?.telefono ||
                                        "No disponible"}
                                </strong>

                            </div>

                        </div>

                    </div>

                )}

            </section>


            {/* ==================================
                FORMULARIO ORDEN
            ================================== */}

            <form
                onSubmit={registrarOrden}
                className="orden-form"
            >

                {/* ==================================
                    INFORMACIÓN DE INGRESO
                ================================== */}

                <section className="orden-card-form">

                    <div className="orden-section-title">

                        <div>

                            <h2>
                                2. Información de ingreso
                            </h2>

                            <p>
                                Describe el motivo por el cual
                                ingresa el vehículo.
                            </p>

                        </div>

                    </div>


                    <div className="grid-orden">

                        <div className="campo-orden">

                            <label>
                                Kilometraje de ingreso
                            </label>

                            <input
                                type="number"
                                name="kilometrajeIngreso"
                                min="0"
                                value={
                                    orden.kilometrajeIngreso
                                }
                                onChange={cambiarValor}
                                required
                                disabled={!vehiculo}
                            />

                        </div>


                        <div className="campo-orden">

                            <label>
                                Estado inicial
                            </label>

                            <input
                                type="text"
                                value="Recibido"
                                disabled
                            />

                        </div>

                    </div>


                    <div className="campo-orden campo-completo">

                        <label>
                            Motivo de ingreso
                        </label>

                        <textarea
                            name="motivoIngreso"
                            value={
                                orden.motivoIngreso
                            }
                            onChange={cambiarValor}
                            placeholder="Ej: Cambio de aceite y revisión general."
                            rows="4"
                            required
                            disabled={!vehiculo}
                        />

                    </div>

                </section>


                {/* ==================================
                    DIAGNÓSTICO
                ================================== */}

                <section className="orden-card-form">

                    <div className="orden-section-title">

                        <div>

                            <h2>
                                3. Diagnóstico
                            </h2>

                            <p>
                                Esta información puede completarse
                                después de revisar el vehículo.
                            </p>

                        </div>

                    </div>


                    <div className="campo-orden campo-completo">

                        <label>
                            Diagnóstico
                        </label>

                        <textarea
                            name="diagnostico"
                            value={
                                orden.diagnostico
                            }
                            onChange={cambiarValor}
                            placeholder="Describe el diagnóstico realizado..."
                            rows="5"
                            disabled={!vehiculo}
                        />

                    </div>

                </section>


                {/* ==================================
                    TRABAJO
                ================================== */}

                <section className="orden-card-form">

                    <div className="orden-section-title">

                        <div>

                            <h2>
                                4. Trabajo realizado
                            </h2>

                            <p>
                                Registra las reparaciones o
                                mantenimientos realizados.
                            </p>

                        </div>

                    </div>


                    <div className="campo-orden campo-completo">

                        <label>
                            Trabajo realizado
                        </label>

                        <textarea
                            name="trabajoRealizado"
                            value={
                                orden.trabajoRealizado
                            }
                            onChange={cambiarValor}
                            placeholder="Describe los trabajos realizados..."
                            rows="5"
                            disabled={!vehiculo}
                        />

                    </div>

                </section>


                {/* ==================================
                    OBSERVACIONES Y VALOR
                ================================== */}

                <section className="orden-card-form">

                    <div className="orden-section-title">

                        <div>

                            <h2>
                                5. Cierre de la orden
                            </h2>

                            <p>
                                Información adicional y valor del servicio.
                            </p>

                        </div>

                    </div>


                    <div className="grid-orden">

                        <div className="campo-orden">

                            <label>
                                Valor total
                            </label>

                            <input
                                type="number"
                                name="valorTotal"
                                min="0"
                                value={
                                    orden.valorTotal
                                }
                                onChange={cambiarValor}
                                placeholder="Opcional"
                                disabled={!vehiculo}
                            />

                        </div>

                    </div>


                    <div className="campo-orden campo-completo">

                        <label>
                            Observaciones
                        </label>

                        <textarea
                            name="observaciones"
                            value={
                                orden.observaciones
                            }
                            onChange={cambiarValor}
                            placeholder="Información adicional sobre el servicio..."
                            rows="4"
                            disabled={!vehiculo}
                        />

                    </div>

                </section>


                {/* ==================================
                    BOTONES
                ================================== */}

                <div className="acciones-orden">

                    <button
                        type="button"
                        className="btn-cancelar-orden"
                        onClick={volver}
                    >
                        Cancelar
                    </button>


                    <button
                        type="submit"
                        className="btn-guardar-orden"
                        disabled={
                            !vehiculo ||
                            guardando
                        }
                    >

                        {guardando
                            ? "Registrando..."
                            : "Registrar orden"}

                    </button>

                </div>

            </form>

        </div>

    );

}

export default RegistroOrdenServicio;

