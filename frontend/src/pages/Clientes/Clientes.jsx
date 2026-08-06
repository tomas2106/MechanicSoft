import { useEffect, useState } from "react";
import axios from "axios";
import {
    Users,
    UserPlus,
    Search,
    X,
    Save,
    ArrowLeft,
    Eye,
    Mail,
    Phone,
    User
} from "lucide-react";

import "./Clientes.css";
import DetalleCliente from "./DetalleCliente";

const API_URL = "http://localhost:9769/api/clientes";

function Clientes() {

    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [busqueda, setBusqueda] = useState("");

    const [formulario, setFormulario] = useState({
        nombre: "",
        telefono: "",
        correo: ""
    });


    // ==========================================
    // CARGAR CLIENTES
    // ==========================================

    useEffect(() => {
        cargarClientes();
    }, []);


    const cargarClientes = async () => {

        try {

            setCargando(true);
            setError("");

            const respuesta = await axios.get(API_URL);

            setClientes(respuesta.data);

        } catch (error) {

            console.error("Error al cargar clientes:", error);

            setError(
                "No fue posible cargar los clientes."
            );

        } finally {

            setCargando(false);

        }

    };


    // ==========================================
    // CAMBIAR DATOS DEL FORMULARIO
    // ==========================================

    const manejarCambio = (e) => {

        const { name, value } = e.target;

        setFormulario({
            ...formulario,
            [name]: value
        });

    };


    // ==========================================
    // REGISTRAR CLIENTE
    // ==========================================

    const registrarCliente = async (e) => {

        e.preventDefault();

        try {

            await axios.post(API_URL, {

                nombre: formulario.nombre,

                telefono: formulario.telefono,

                correo: formulario.correo || null

            });


            setFormulario({
                nombre: "",
                telefono: "",
                correo: ""
            });


            setMostrarFormulario(false);

            await cargarClientes();


        } catch (error) {

            console.error(
                "Error al registrar cliente:",
                error
            );

            alert(

                error.response?.data?.message ||

                "No fue posible registrar el cliente."

            );

        }

    };


    // ==========================================
    // FILTRAR CLIENTES
    // ==========================================

    const clientesFiltrados = clientes.filter((cliente) => {

        const texto = busqueda
            .toLowerCase()
            .trim();


        return (

            cliente.nombre
                ?.toLowerCase()
                .includes(texto)

            ||

            cliente.telefono
                ?.toLowerCase()
                .includes(texto)

            ||

            cliente.correo
                ?.toLowerCase()
                .includes(texto)

        );

    });


    // ==========================================
    // MOSTRAR DETALLE
    // ==========================================

    if (clienteSeleccionado) {

        return (

            <DetalleCliente

                cliente={clienteSeleccionado}

                volver={() =>
                    setClienteSeleccionado(null)
                }

            />

        );

    }


    // ==========================================
    // INTERFAZ
    // ==========================================

    return (

        <div className="clientes-page">


            {/* ==================================
                ENCABEZADO
            ================================== */}

            <div className="clientes-header">

                <div className="clientes-titulo">

                    <div className="clientes-titulo-icono">
                        <Users size={24} strokeWidth={2} />
                    </div>

                    <div>

                        <h1>
                            Clientes
                        </h1>

                        <p>
                            Gestiona los clientes registrados
                            en MechanicSoft.
                        </p>

                    </div>

                </div>


                <button

                    className="btn-nuevo-cliente"

                    onClick={() =>
                        setMostrarFormulario(true)
                    }

                >

                    <UserPlus size={18} />

                    <span>
                        Nuevo cliente
                    </span>

                </button>

            </div>


            {/* ==================================
                BUSCADOR
            ================================== */}

            <div className="clientes-filtros">

                <div className="buscador-wrapper">

                    <Search
                        size={18}
                        className="buscador-icono"
                    />

                    <input

                        type="text"

                        className="buscador-clientes"

                        placeholder="Buscar por nombre, teléfono o correo..."

                        value={busqueda}

                        onChange={(e) =>
                            setBusqueda(e.target.value)
                        }

                    />

                    {busqueda && (

                        <button

                            type="button"

                            className="btn-limpiar-busqueda"

                            onClick={() =>
                                setBusqueda("")
                            }

                        >

                            <X size={16} />

                        </button>

                    )}

                </div>

            </div>


            {/* ==================================
                FORMULARIO NUEVO CLIENTE
            ================================== */}

            {mostrarFormulario && (

                <div className="formulario-cliente">


                    <div className="formulario-header">

                        <div>

                            <div className="formulario-icono">
                                <UserPlus size={20} />
                            </div>

                            <div>

                                <h2>
                                    Registrar cliente
                                </h2>

                                <p>
                                    Introduce los datos del nuevo cliente.
                                </p>

                            </div>

                        </div>


                        <button

                            type="button"

                            onClick={() =>
                                setMostrarFormulario(false)
                            }

                            className="btn-cerrar"

                            aria-label="Cerrar formulario"

                        >

                            <X size={20} />

                        </button>

                    </div>


                    <form onSubmit={registrarCliente}>


                        <div className="formulario-grid">


                            {/* NOMBRE */}

                            <div className="campo">

                                <label>
                                    Nombre completo
                                </label>

                                <div className="input-wrapper">

                                    <User
                                        size={17}
                                        className="input-icono"
                                    />

                                    <input

                                        type="text"

                                        name="nombre"

                                        value={formulario.nombre}

                                        onChange={manejarCambio}

                                        placeholder="Nombre completo"

                                        required

                                    />

                                </div>

                            </div>


                            {/* TELÉFONO */}

                            <div className="campo">

                                <label>
                                    Teléfono
                                </label>

                                <div className="input-wrapper">

                                    <Phone
                                        size={17}
                                        className="input-icono"
                                    />

                                    <input

                                        type="text"

                                        name="telefono"

                                        value={formulario.telefono}

                                        onChange={manejarCambio}

                                        placeholder="Número de teléfono"

                                        required

                                    />

                                </div>

                            </div>


                            {/* CORREO */}

                            <div className="campo campo-correo">

                                <label>

                                    Correo

                                    <span>
                                        {" "}Opcional
                                    </span>

                                </label>

                                <div className="input-wrapper">

                                    <Mail
                                        size={17}
                                        className="input-icono"
                                    />

                                    <input

                                        type="email"

                                        name="correo"

                                        value={formulario.correo}

                                        onChange={manejarCambio}

                                        placeholder="correo@ejemplo.com"

                                    />

                                </div>

                            </div>

                        </div>


                        {/* BOTONES */}

                        <div className="acciones-formulario">


                            <button

                                type="button"

                                className="btn-cancelar"

                                onClick={() =>
                                    setMostrarFormulario(false)
                                }

                            >

                                <X size={17} />

                                Cancelar

                            </button>


                            <button

                                type="submit"

                                className="btn-guardar"

                            >

                                <Save size={17} />

                                Guardar cliente

                            </button>


                        </div>


                    </form>

                </div>

            )}


            {/* ==================================
                CARGANDO
            ================================== */}

            {cargando && (

                <div className="estado">

                    <div className="estado-spinner"></div>

                    <p>
                        Cargando clientes...
                    </p>

                </div>

            )}


            {/* ==================================
                ERROR
            ================================== */}

            {!cargando && error && (

                <div className="estado estado-error">

                    <h3>
                        No fue posible cargar los clientes
                    </h3>

                    <p>
                        {error}
                    </p>

                </div>

            )}


            {/* ==================================
                TABLA
            ================================== */}

            {!cargando && !error && (

                <div className="tabla-contenedor">


                    {/* SIN CLIENTES */}

                    {clientes.length === 0 && (

                        <div className="estado">

                            <div className="estado-icono">
                                <Users size={26} />
                            </div>

                            <h3>
                                No hay clientes registrados
                            </h3>

                            <p>
                                Registra tu primer cliente
                                para comenzar.
                            </p>

                        </div>

                    )}


                    {/* SIN RESULTADOS */}

                    {clientes.length > 0 &&
                        clientesFiltrados.length === 0 && (

                            <div className="estado">

                                <div className="estado-icono">
                                    <Search size={25} />
                                </div>

                                <h3>
                                    No se encontraron clientes
                                </h3>

                                <p>
                                    Intenta buscar con otro
                                    nombre, teléfono o correo.
                                </p>

                            </div>

                        )}


                    {/* CLIENTES */}

                    {clientesFiltrados.length > 0 && (

                        <table className="tabla-clientes">


                            <thead>

                                <tr>

                                    <th>
                                        Cliente
                                    </th>

                                    <th>
                                        Teléfono
                                    </th>

                                    <th>
                                        Correo
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                    <th>
                                        Acción
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {clientesFiltrados.map(
                                    (cliente) => (

                                        <tr
                                            key={cliente.id}
                                        >


                                            <td>

                                                <div className="cliente-nombre">

                                                    <div className="avatar-cliente">
                                                        {cliente.nombre
                                                            ?.charAt(0)
                                                            ?.toUpperCase()}
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {cliente.nombre}
                                                        </strong>

                                                        <span>
                                                            Cliente #{cliente.id}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <div className="dato-cliente">

                                                    <Phone size={15} />

                                                    {cliente.telefono}

                                                </div>

                                            </td>


                                            <td>

                                                <div className="dato-cliente">

                                                    <Mail size={15} />

                                                    {cliente.correo || "Sin correo"}

                                                </div>

                                            </td>


                                            <td>

                                                <span

                                                    className={

                                                        cliente.activo

                                                            ? "estado-activo"

                                                            : "estado-inactivo"

                                                    }

                                                >

                                                    <span className="estado-punto"></span>

                                                    {cliente.activo

                                                        ? "Activo"

                                                        : "Inactivo"

                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <button

                                                    className="btn-ver-cliente"

                                                    onClick={() =>
                                                        setClienteSeleccionado(
                                                            cliente
                                                        )
                                                    }

                                                >

                                                    <Eye size={16} />

                                                    Ver detalle

                                                </button>

                                            </td>


                                        </tr>

                                    )
                                )}

                            </tbody>


                        </table>

                    )}

                </div>

            )}

        </div>

    );

}


export default Clientes;

