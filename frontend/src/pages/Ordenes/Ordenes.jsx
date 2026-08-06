import { useEffect, useState } from "react";
import RegistroOrdenServicio from "./RegistroOrdenServicio";

import {
    obtenerOrdenes,
    guardarOrden,
    cambiarEstadoOrden
} from "../../services/ordenServicioService";

import {
    obtenerVehiculos
} from "../../services/vehiculoService";

import "./Ordenes.css";

import DetalleOrden from "./DetalleOrden";


function Ordenes() {

    // ==========================================
    // ÓRDENES
    // ==========================================

    const [ordenes, setOrdenes] = useState([]);

    const [cargando, setCargando] = useState(true);

    const [error, setError] = useState("");


    // ==========================================
    // VEHÍCULOS
    // ==========================================

    const [vehiculos, setVehiculos] = useState([]);


    // ==========================================
    // BÚSQUEDA Y FILTROS
    // ==========================================

    const [busqueda, setBusqueda] = useState("");

    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const [mostrarRegistro, setMostrarRegistro] = useState(false);


    // ==========================================
    // MODAL NUEVA ORDEN
    // ==========================================

    const [mostrarFormulario, setMostrarFormulario] =
        useState(false);


    const [guardando, setGuardando] =
        useState(false);


    const [errorFormulario, setErrorFormulario] =
        useState("");


    // ==========================================
    // FORMULARIO
    // ==========================================

    const [nuevaOrden, setNuevaOrden] = useState({

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
    // VER DATELLER DE ORDEN 
    // ==========================================
    
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
    
    
    // ==========================================
    // CARGA INICIAL
    // ==========================================

    useEffect(() => {

        cargarOrdenes();

        cargarVehiculos();

    }, []);


    // ==========================================
    // CARGAR ÓRDENES
    // ==========================================

    const cargarOrdenes = async () => {

        try {

            setCargando(true);

            setError("");

            const respuesta = await obtenerOrdenes();

            setOrdenes(respuesta.data);

        } catch (error) {

            console.error(
                "Error al cargar órdenes:",
                error
            );

            setError(
                "No fue posible cargar las órdenes de servicio."
            );

        } finally {

            setCargando(false);

        }

    };


    // ==========================================
    // CARGAR VEHÍCULOS
    // ==========================================

    const cargarVehiculos = async () => {

        try {

            const respuesta = await obtenerVehiculos();

            setVehiculos(respuesta.data);

        } catch (error) {

            console.error(
                "Error al cargar vehículos:",
                error
            );

        }

    };


    // ==========================================
    // CAMBIAR VALOR DEL FORMULARIO
    // ==========================================

    const cambiarValorFormulario = (e) => {

        const {
            name,
            value
        } = e.target;


        setNuevaOrden({

            ...nuevaOrden,

            [name]: value

        });

    };


    // ==========================================
    // ABRIR FORMULARIO
    // ==========================================

    const abrirFormulario = () => {

        setErrorFormulario("");

        setNuevaOrden({

            vehiculoId: "",

            kilometrajeIngreso: "",

            motivoIngreso: "",

            diagnostico: "",

            trabajoRealizado: "",

            observaciones: "",

            estado: "RECIBIDO",

            valorTotal: ""

        });

        setMostrarFormulario(true);

    };


    // ==========================================
    // CERRAR FORMULARIO
    // ==========================================

    const cerrarFormulario = () => {

        if (guardando) {
            return;
        }

        setMostrarFormulario(false);

        setErrorFormulario("");

    };


    // ==========================================
    // CREAR ORDEN
    // ==========================================

    const registrarOrden = async (e) => {

        e.preventDefault();

        try {

            setGuardando(true);

            setErrorFormulario("");


            const datos = {

                vehiculoId:
                    Number(nuevaOrden.vehiculoId),

                kilometrajeIngreso:
                    Number(nuevaOrden.kilometrajeIngreso),

                motivoIngreso:
                    nuevaOrden.motivoIngreso.trim(),

                diagnostico:
                    nuevaOrden.diagnostico.trim() || null,

                trabajoRealizado:
                    nuevaOrden.trabajoRealizado.trim() || null,

                observaciones:
                    nuevaOrden.observaciones.trim() || null,

                estado:
                    nuevaOrden.estado,

                valorTotal:
                    nuevaOrden.valorTotal !== ""
                        ? Number(nuevaOrden.valorTotal)
                        : null

            };


            await guardarOrden(datos);


            await cargarOrdenes();


            setMostrarFormulario(false);


            setNuevaOrden({

                vehiculoId: "",

                kilometrajeIngreso: "",

                motivoIngreso: "",

                diagnostico: "",

                trabajoRealizado: "",

                observaciones: "",

                estado: "RECIBIDO",

                valorTotal: ""

            });


        } catch (error) {

            console.error(
                "Error al registrar orden:",
                error
            );


            const mensaje =
                error.response?.data?.message ||
                "No fue posible registrar la orden de servicio.";


            setErrorFormulario(mensaje);

        } finally {

            setGuardando(false);

        }

    };


    // ==========================================
    // CAMBIAR ESTADO
    // ==========================================

    const actualizarEstado = async (id, nuevoEstado) => {

    try {

        console.log("Actualizando orden:", id);
        console.log("Nuevo estado:", nuevoEstado);

        const respuesta = await cambiarEstadoOrden(
            id,
            nuevoEstado
        );

        console.log("Respuesta del servidor:", respuesta.data);

        await cargarOrdenes();

    } catch (error) {

        console.error("ERROR COMPLETO:", error);

        console.error(
            "Respuesta backend:",
            error.response?.data
        );

        console.error(
            "Status:",
            error.response?.status
        );

        console.error(
            "URL:",
            error.config?.url
        );

        alert(
            error.response?.data?.message ||
            error.response?.data ||
            "No fue posible actualizar el estado."
        );

    }

    };


    // ==========================================
    // BUSCAR Y FILTRAR
    // ==========================================

    const ordenesFiltradas =
        ordenes.filter((orden) => {

            const texto =
                busqueda
                    .toLowerCase()
                    .trim();


            const placa =
                orden.vehiculo?.placa
                    ?.toLowerCase() || "";


            const marca =
                orden.vehiculo?.marca
                    ?.toLowerCase() || "";


            const modelo =
                orden.vehiculo?.modelo
                    ?.toLowerCase() || "";


            const coincideBusqueda =
                placa.includes(texto) ||
                marca.includes(texto) ||
                modelo.includes(texto);


            const coincideEstado =
                filtroEstado === "TODOS" ||
                orden.estado === filtroEstado;


            return (
                coincideBusqueda &&
                coincideEstado
            );

        });


    // ==========================================
    // ESTADÍSTICAS
    // ==========================================

    const recibidas =
        ordenes.filter(
            (orden) =>
                orden.estado === "RECIBIDO"
        ).length;


    const diagnostico =
        ordenes.filter(
            (orden) =>
                orden.estado === "DIAGNOSTICO"
        ).length;


    const reparacion =
        ordenes.filter(
            (orden) =>
                orden.estado === "EN_REPARACION"
        ).length;


    const listas =
        ordenes.filter(
            (orden) =>
                orden.estado === "LISTO_PARA_ENTREGA"
        ).length;


    // ==========================================
    // TEXTO DEL ESTADO
    // ==========================================

    const nombreEstado = (estado) => {

        const estados = {

            RECIBIDO: "Recibido",

            DIAGNOSTICO: "Diagnóstico",

            EN_REPARACION: "En reparación",

            LISTO_PARA_ENTREGA:
                "Lista para entrega",

            ENTREGADO: "Entregado",

            CANCELADO: "Cancelado"

        };


        return estados[estado] || estado;

    };

    if (mostrarRegistro) {

    return (
        <RegistroOrdenServicio
            volver={() => setMostrarRegistro(false)}
            ordenCreada={() => {
                setMostrarRegistro(false);
                cargarOrdenes();
            }}
        />
    );
    }

    if (ordenSeleccionada) {

    return (

        <DetalleOrden
            ordenId={ordenSeleccionada}
            volver={() => setOrdenSeleccionada(null)}
        />

    );

    }

    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="ordenes-page">


            {/* ==================================
                HEADER
            ================================== */}

            <div className="ordenes-header">

                <div>

                    <h1>
                        Órdenes de Servicio
                    </h1>

                    <p>
                        Gestiona los servicios y reparaciones
                        del taller.
                    </p>

                </div>


                <button
                    className="btn-nueva-orden"
                    onClick={() => setMostrarRegistro(true)}
                >

                    + Nueva orden

                </button>

            </div>


            {/* ==================================
                ESTADÍSTICAS
            ================================== */}

            <div className="ordenes-estadisticas">


                <div className="estadistica">

                    <span>
                        Recibidas
                    </span>

                    <strong>
                        {recibidas}
                    </strong>

                </div>


                <div className="estadistica">

                    <span>
                        En diagnóstico
                    </span>

                    <strong>
                        {diagnostico}
                    </strong>

                </div>


                <div className="estadistica">

                    <span>
                        En reparación
                    </span>

                    <strong>
                        {reparacion}
                    </strong>

                </div>


                <div className="estadistica">

                    <span>
                        Listas para entrega
                    </span>

                    <strong>
                        {listas}
                    </strong>

                </div>


            </div>


            {/* ==================================
                FILTROS
            ================================== */}

            <div className="ordenes-filtros">


                <input
                    type="text"
                    placeholder="Buscar por placa, marca o modelo..."
                    value={busqueda}
                    onChange={(e) =>
                        setBusqueda(
                            e.target.value
                        )
                    }
                />


                <select
                    value={filtroEstado}
                    onChange={(e) =>
                        setFiltroEstado(
                            e.target.value
                        )
                    }
                >

                    <option value="TODOS">
                        Todos los estados
                    </option>

                    <option value="RECIBIDO">
                        Recibido
                    </option>

                    <option value="DIAGNOSTICO">
                        Diagnóstico
                    </option>

                    <option value="EN_REPARACION">
                        En reparación
                    </option>

                    <option value="LISTO_PARA_ENTREGA">
                        Lista para entrega
                    </option>

                    <option value="ENTREGADO">
                        Entregado
                    </option>

                    <option value="CANCELADO">
                        Cancelado
                    </option>

                </select>


            </div>


            {/* ==================================
                CARGANDO
            ================================== */}

            {cargando && (

                <div className="ordenes-estado">

                    Cargando órdenes...

                </div>

            )}


            {/* ==================================
                ERROR
            ================================== */}

            {!cargando && error && (

                <div className="ordenes-estado error">

                    {error}

                </div>

            )}


            {/* ==================================
                SIN ÓRDENES
            ================================== */}

            {!cargando &&
                !error &&
                ordenes.length === 0 && (

                    <div className="ordenes-estado">

                        <h3>
                            No hay órdenes de servicio
                        </h3>

                        <p>
                            Cuando registres una orden,
                            aparecerá aquí.
                        </p>

                    </div>

                )}


            {/* ==================================
                SIN RESULTADOS
            ================================== */}

            {!cargando &&
                !error &&
                ordenes.length > 0 &&
                ordenesFiltradas.length === 0 && (

                    <div className="ordenes-estado">

                        <h3>
                            No se encontraron órdenes
                        </h3>

                        <p>
                            Prueba con otra búsqueda
                            o cambia el filtro.
                        </p>

                    </div>

                )}


            {/* ==================================
                LISTA
            ================================== */}

            {!cargando &&
                !error &&
                ordenesFiltradas.length > 0 && (

                    <div className="ordenes-lista">


                        {ordenesFiltradas.map(
                            (orden) => (

                                <div
                                    className="orden-card"
                                    key={orden.id}
                                >


                                    {/* HEADER */}

                                    <div className="orden-card-header">

                                        <div>

                                            <span className="orden-id">

                                                Orden #{orden.id}

                                            </span>


                                            <h2>

                                                {orden.vehiculo?.placa}

                                            </h2>


                                            <p>

                                                {orden.vehiculo?.marca}
                                                {" "}
                                                {orden.vehiculo?.modelo}

                                            </p>

                                        </div>


                                        <span
                                            className={`estado-orden estado-${orden.estado}`}
                                        >

                                            {nombreEstado(
                                                orden.estado
                                            )}

                                        </span>

                                    </div>


                                    {/* INFORMACIÓN */}

                                    <div className="orden-card-info">


                                        <div>

                                            <span>
                                                Kilometraje
                                            </span>

                                            <strong>

                                                {orden.kilometrajeIngreso
                                                    ?.toLocaleString(
                                                        "es-CO"
                                                    )}

                                                {" km"}

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Motivo
                                            </span>

                                            <strong>

                                                {orden.motivoIngreso}

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Fecha de ingreso
                                            </span>

                                            <strong>

                                                {orden.fechaIngreso
                                                    ? new Date(
                                                        orden.fechaIngreso
                                                    ).toLocaleDateString(
                                                        "es-CO"
                                                    )
                                                    : "—"}

                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Valor
                                            </span>

                                            <strong>

                                                {orden.valorTotal
                                                    ? `$ ${Number(
                                                        orden.valorTotal
                                                    ).toLocaleString(
                                                        "es-CO"
                                                    )}`
                                                    : "Pendiente"}

                                            </strong>

                                        </div>


                                    </div>


                                    {/* ACCIONES */}

                                    <div className="orden-card-footer">


                                        <div className="cambiar-estado">

                                            <label>
                                                Estado
                                            </label>


                                            <select
                                                value={
                                                    orden.estado
                                                }
                                                onChange={(e) =>
                                                    actualizarEstado(
                                                        orden.id,
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="RECIBIDO">
                                                    Recibido
                                                </option>

                                                <option value="DIAGNOSTICO">
                                                    Diagnóstico
                                                </option>

                                                <option value="EN_REPARACION">
                                                    En reparación
                                                </option>

                                                <option value="LISTO_PARA_ENTREGA">
                                                    Lista para entrega
                                                </option>

                                                <option value="ENTREGADO">
                                                    Entregado
                                                </option>

                                                <option value="CANCELADO">
                                                    Cancelado
                                                </option>

                                            </select>

                                        </div>


                                        <button
                                            className="btn-ver-orden"
                                            onClick={() => setOrdenSeleccionada(orden.id)}
                                        >

                                            Ver detalle →

                                        </button>


                                    </div>


                                </div>

                            )
                        )}

                    </div>

                )}


            {/* ==================================
                MODAL NUEVA ORDEN
            ================================== */}

            {mostrarFormulario && (

                <div
                    className="modal-overlay"
                    onClick={cerrarFormulario}
                >

                    <div
                        className="modal-orden"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >


                        {/* HEADER MODAL */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Nueva orden de servicio
                                </h2>

                                <p>
                                    Registra el ingreso de un vehículo
                                    al taller.
                                </p>

                            </div>


                            <button
                                className="btn-cerrar-modal"
                                onClick={cerrarFormulario}
                            >

                                ×

                            </button>

                        </div>


                        {/* ERROR */}

                        {errorFormulario && (

                            <div className="error-formulario">

                                {errorFormulario}

                            </div>

                        )}


                        {/* FORMULARIO */}

                        <form
                            className="formulario-orden"
                            onSubmit={registrarOrden}
                        >


                            {/* VEHÍCULO */}

                            <div className="campo-orden campo-completo">

                                <label>
                                    Vehículo
                                </label>


                                <select
                                    name="vehiculoId"
                                    value={
                                        nuevaOrden.vehiculoId
                                    }
                                    onChange={
                                        cambiarValorFormulario
                                    }
                                    required
                                >

                                    <option value="">
                                        Selecciona un vehículo
                                    </option>


                                    {vehiculos.map(
                                        (vehiculo) => (

                                            <option
                                                key={vehiculo.id}
                                                value={vehiculo.id}
                                            >

                                                {vehiculo.placa}
                                                {" — "}
                                                {vehiculo.marca}
                                                {" "}
                                                {vehiculo.modelo}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* GRID */}

                            <div className="formulario-grid">


                                {/* KILOMETRAJE */}

                                <div className="campo-orden">

                                    <label>
                                        Kilometraje de ingreso
                                    </label>

                                    <input
                                        type="number"
                                        name="kilometrajeIngreso"
                                        value={
                                            nuevaOrden.kilometrajeIngreso
                                        }
                                        onChange={
                                            cambiarValorFormulario
                                        }
                                        min="0"
                                        required
                                    />

                                </div>


                                {/* ESTADO */}

                                <div className="campo-orden">

                                    <label>
                                        Estado inicial
                                    </label>

                                    <select
                                        name="estado"
                                        value={
                                            nuevaOrden.estado
                                        }
                                        onChange={
                                            cambiarValorFormulario
                                        }
                                    >

                                        <option value="RECIBIDO">
                                            Recibido
                                        </option>

                                        <option value="DIAGNOSTICO">
                                            Diagnóstico
                                        </option>

                                        <option value="EN_REPARACION">
                                            En reparación
                                        </option>

                                    </select>

                                </div>


                                {/* VALOR */}

                                <div className="campo-orden">

                                    <label>
                                        Valor total
                                    </label>

                                    <input
                                        type="number"
                                        name="valorTotal"
                                        value={
                                            nuevaOrden.valorTotal
                                        }
                                        onChange={
                                            cambiarValorFormulario
                                        }
                                        min="0"
                                        placeholder="Opcional"
                                    />

                                </div>


                            </div>


                            {/* MOTIVO */}

                            <div className="campo-orden">

                                <label>
                                    Motivo del ingreso
                                </label>

                                <textarea
                                    name="motivoIngreso"
                                    value={
                                        nuevaOrden.motivoIngreso
                                    }
                                    onChange={
                                        cambiarValorFormulario
                                    }
                                    placeholder="Ej: Cambio de aceite y revisión de frenos..."
                                    required
                                />

                            </div>


                            {/* DIAGNÓSTICO */}

                            <div className="campo-orden">

                                <label>
                                    Diagnóstico
                                    <span>
                                        Opcional
                                    </span>
                                </label>

                                <textarea
                                    name="diagnostico"
                                    value={
                                        nuevaOrden.diagnostico
                                    }
                                    onChange={
                                        cambiarValorFormulario
                                    }
                                    placeholder="Diagnóstico realizado por el mecánico..."
                                />

                            </div>


                            {/* TRABAJO */}

                            <div className="campo-orden">

                                <label>
                                    Trabajo realizado
                                    <span>
                                        Opcional
                                    </span>
                                </label>

                                <textarea
                                    name="trabajoRealizado"
                                    value={
                                        nuevaOrden.trabajoRealizado
                                    }
                                    onChange={
                                        cambiarValorFormulario
                                    }
                                    placeholder="Describe el trabajo realizado..."
                                />

                            </div>


                            {/* OBSERVACIONES */}

                            <div className="campo-orden">

                                <label>
                                    Observaciones
                                    <span>
                                        Opcional
                                    </span>
                                </label>

                                <textarea
                                    name="observaciones"
                                    value={
                                        nuevaOrden.observaciones
                                    }
                                    onChange={
                                        cambiarValorFormulario
                                    }
                                    placeholder="Información adicional..."
                                />

                            </div>


                            {/* BOTONES */}

                            <div className="modal-footer">


                                <button
                                    type="button"
                                    className="btn-cancelar-orden"
                                    onClick={cerrarFormulario}
                                    disabled={guardando}
                                >

                                    Cancelar

                                </button>


                                <button
                                    type="submit"
                                    className="btn-guardar-orden"
                                    disabled={guardando}
                                >

                                    {guardando
                                        ? "Guardando..."
                                        : "Crear orden"}

                                </button>


                            </div>


                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default Ordenes;