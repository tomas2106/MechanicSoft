import { useEffect, useState } from "react";
import axios from "axios";
import "./RegistroVehiculo.css";
import { guardarVehiculo } from "../../services/vehiculoService";

const API_CLIENTES = "http://localhost:9769/api/clientes";

const formularioInicial = {
    placa: "",
    marca: "",
    modelo: "",
    anio: "",
    cilindrajeCc: "",
    color: "",
    kilometraje: "",
    observaciones: "",
    clienteId: ""
};

export default function RegistroVehiculo() {

    const [vehiculo, setVehiculo] = useState(formularioInicial);

    const [clientes, setClientes] = useState([]);

    const [cargandoClientes, setCargandoClientes] = useState(true);

    const [guardando, setGuardando] = useState(false);


    // ==========================================
    // CARGAR CLIENTES
    // ==========================================

    useEffect(() => {

        cargarClientes();

    }, []);


    const cargarClientes = async () => {

        try {

            setCargandoClientes(true);

            const respuesta = await axios.get(API_CLIENTES);

            setClientes(respuesta.data);

        } catch (error) {

            console.error(
                "Error al cargar clientes:",
                error
            );

            alert(
                "No fue posible cargar los clientes."
            );

        } finally {

            setCargandoClientes(false);

        }

    };


    // ==========================================
    // CAMBIAR VALORES DEL FORMULARIO
    // ==========================================

    const cambiarValor = (e) => {

        const { name, value } = e.target;

        setVehiculo({
            ...vehiculo,
            [name]: value.toUpperCase()
        });

    };


    // ==========================================
    // REGISTRAR VEHÍCULO
    // ==========================================

    const registrar = async (e) => {

        e.preventDefault();


        if (!vehiculo.clienteId) {

            alert(
                "Debes seleccionar un cliente."
            );

            return;

        }


        try {

            setGuardando(true);


            const datosEnviar = {

                placa: vehiculo.placa
                    .trim()
                    .toUpperCase(),

                marca: vehiculo.marca.trim(),

                modelo: vehiculo.modelo.trim(),

                anio: vehiculo.anio
                    ? Number(vehiculo.anio)
                    : null,

                cilindrajeCc:
                    Number(vehiculo.cilindrajeCc),

                color: vehiculo.color.trim(),

                kilometraje:
                    Number(vehiculo.kilometraje),

                fotoVehiculo: null,

                observaciones:
                    vehiculo.observaciones.trim() || null,

                clienteId:
                    Number(vehiculo.clienteId)

            };


            await guardarVehiculo(datosEnviar);


            alert(
                "Vehículo registrado correctamente."
            );


            setVehiculo(formularioInicial);


        } catch (error) {

            console.error(
                "Error al registrar vehículo:",
                error
            );


            const mensaje =
                error.response?.data?.message ||
                error.response?.data ||
                "Ocurrió un error al registrar el vehículo.";


            alert(mensaje);

        } finally {

            setGuardando(false);

        }

    };


    // ==========================================
    // CLIENTE SELECCIONADO
    // ==========================================

    const clienteSeleccionado = clientes.find(
        (cliente) =>
            cliente.id === Number(vehiculo.clienteId)
    );


    // ==========================================
    // INTERFAZ
    // ==========================================

    return (

        <div className="registro-container">

            <h1>
                Registrar Vehículo
            </h1>


            <form
                onSubmit={registrar}
                className="registro-grid"
            >


                {/* ==================================
                    DATOS DEL VEHÍCULO
                ================================== */}

                <div className="card grande">

                    <h2>
                        Datos del Vehículo
                    </h2>


                    <div className="grid-form">


                        {/* PLACA */}

                        <div className="campo">

                            <label>
                                Placa
                            </label>

                            <input
                                type="text"
                                name="placa"
                                value={vehiculo.placa}
                                onChange={cambiarValor}
                                placeholder="Ej: ABC123"
                                maxLength={10}
                                required
                            />

                        </div>


                        {/* MARCA */}

                        <div className="campo">

                            <label>
                                Marca
                            </label>

                            <input
                                type="text"
                                name="marca"
                                value={vehiculo.marca}
                                onChange={cambiarValor}
                                placeholder="Ej: Honda"
                                required
                            />

                        </div>


                        {/* MODELO */}

                        <div className="campo">

                            <label>
                                Modelo
                            </label>

                            <input
                                type="text"
                                name="modelo"
                                value={vehiculo.modelo}
                                onChange={cambiarValor}
                                placeholder="Ej: CB190R"
                                required
                            />

                        </div>


                        {/* AÑO */}

                        <div className="campo">

                            <label>
                                Año
                            </label>

                            <input
                                type="number"
                                name="anio"
                                value={vehiculo.anio}
                                onChange={cambiarValor}
                                placeholder="Ej: 2024"
                                min="1900"
                                max="2100"
                            />

                        </div>


                        {/* COLOR */}

                        <div className="campo">

                            <label>
                                Color
                            </label>

                            <input
                                type="text"
                                name="color"
                                value={vehiculo.color}
                                onChange={cambiarValor}
                                placeholder="Ej: Negro"
                                required
                            />

                        </div>


                        {/* CILINDRAJE */}

                        <div className="campo">

                            <label>
                                Cilindraje (cc)
                            </label>

                            <input
                                type="number"
                                name="cilindrajeCc"
                                value={vehiculo.cilindrajeCc}
                                onChange={cambiarValor}
                                placeholder="Ej: 190"
                                min="50"
                                required
                            />

                        </div>


                        {/* KILOMETRAJE */}

                        <div className="campo">

                            <label>
                                Kilometraje
                            </label>

                            <input
                                type="number"
                                name="kilometraje"
                                value={vehiculo.kilometraje}
                                onChange={cambiarValor}
                                placeholder="Ej: 15000"
                                min="0"
                                required
                            />

                        </div>


                    </div>

                </div>


                {/* ==================================
                    CLIENTE
                ================================== */}

                <div className="card">

                    <h2>
                        Cliente
                    </h2>


                    <div className="campo">

                        <label>
                            Propietario
                        </label>


                        <select
                            name="clienteId"
                            value={vehiculo.clienteId}
                            onChange={cambiarValor}
                            required
                            disabled={cargandoClientes}
                        >

                            <option value="">

                                {cargandoClientes
                                    ? "Cargando clientes..."
                                    : "Seleccionar cliente"}

                            </option>


                            {clientes.map((cliente) => (

                                <option
                                    key={cliente.id}
                                    value={cliente.id}
                                >

                                    {cliente.nombre}
                                    {" — "}
                                    {cliente.telefono}

                                </option>

                            ))}

                        </select>

                    </div>


                    {!cargandoClientes &&
                        clientes.length === 0 && (

                            <p className="mensaje-sin-clientes">

                                No hay clientes registrados.
                                Registra primero un cliente.

                            </p>

                        )}

                </div>


                {/* ==================================
                    OBSERVACIONES
                ================================== */}

                <div className="card grande">

                    <h2>
                        Observaciones del Vehículo
                    </h2>


                    <div className="campo">

                        <label>
                            Observaciones
                        </label>


                        <textarea
                            name="observaciones"
                            value={vehiculo.observaciones}
                            onChange={cambiarValor}
                            rows="8"
                            placeholder="Información adicional del vehículo..."
                        />

                    </div>

                </div>


                {/* ==================================
                    RESUMEN
                ================================== */}

                <div className="card">

                    <h2>
                        Resumen
                    </h2>


                    <div className="resumen">


                        <p>

                            <strong>
                                Cliente:
                            </strong>

                            {" "}

                            {clienteSeleccionado
                                ? clienteSeleccionado.nombre
                                : "No seleccionado"}

                        </p>


                        <p>

                            <strong>
                                Placa:
                            </strong>

                            {" "}

                            {vehiculo.placa || "—"}

                        </p>


                        <p>

                            <strong>
                                Vehículo:
                            </strong>

                            {" "}

                            {vehiculo.marca || "—"}

                            {" "}

                            {vehiculo.modelo || ""}

                        </p>


                        <button
                            className="btn-registrar"
                            type="submit"
                            disabled={
                                guardando ||
                                cargandoClientes ||
                                clientes.length === 0
                            }
                        >

                            {guardando
                                ? "Registrando..."
                                : "Registrar Vehículo"}

                        </button>


                    </div>

                </div>


            </form>

        </div>

    );

}

