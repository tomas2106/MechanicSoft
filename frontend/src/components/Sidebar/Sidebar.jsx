import { useState } from "react";
import "./Sidebar.css";

export default function Sidebar({
    paginaActual,
    cambiarPagina
}) {

    const [menuAbierto, setMenuAbierto] = useState(false);

    const cambiarVista = (pagina) => {

        cambiarPagina(pagina);

        setMenuAbierto(false);

    };

    return (

        <>

            <button
                className="menu-toggle"
                onClick={() => setMenuAbierto(!menuAbierto)}
            >
                ☰
            </button>

            <aside
                className={`sidebar ${
                    menuAbierto ? "abierto" : ""
                }`}
            >

                <div className="sidebar-header">

                    <h2>MechanicSoft</h2>

                </div>


                <nav>

                    {/* INICIO */}

                    <button
                        className={
                            paginaActual === "inicio"
                                ? "activo"
                                : ""
                        }
                        onClick={() => cambiarVista("inicio")}
                    >
                         Inicio
                    </button>


                    {/* CLIENTES */}

                    <button
                        className={
                            paginaActual === "clientes"
                                ? "activo"
                                : ""
                        }
                        onClick={() => cambiarVista("clientes")}
                    >
                         Clientes
                    </button>


                    {/* VEHÍCULOS */}

                    <button
                        className={
                            paginaActual === "vehiculos"
                                ? "activo"
                                : ""
                        }
                        onClick={() => cambiarVista("vehiculos")}
                    >
                         Vehículos
                    </button>


                    {/* REGISTRAR VEHÍCULO */}

                    <button
                        className={
                            paginaActual === "registroVehiculo"
                                ? "activo"
                                : ""
                        }
                        onClick={() =>
                            cambiarVista("registroVehiculo")
                        }
                    >
                         Registrar vehículo
                    </button>


                    {/* ÓRDENES */}

                    <button
                        className={
                            paginaActual === "ordenes"
                                ? "activo"
                                : ""
                        }
                        onClick={() => cambiarVista("ordenes")}
                    >
                         Órdenes de servicio
                    </button>

                </nav>

            </aside>

        </>

    );

}