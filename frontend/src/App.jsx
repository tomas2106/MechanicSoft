import { useState } from "react";
import "./App.css";

import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";

import Inicio from "./pages/Inicio/Inicio";
import Clientes from "./pages/Clientes/Clientes";
import RegistroVehiculo from "./pages/RegistroVehiculo/RegistroVehiculo";
import ListaVehiculos from "./pages/ListaVehiculos/ListaVehiculos";
import Ordenes from "./pages/Ordenes/Ordenes";

function App() {

    // Página que aparecerá al iniciar MechanicSoft
    const [paginaActual, setPaginaActual] = useState("inicio");

    return (

        <div className="app">

            <Header />

            <div className="contenedor">

                <Sidebar
                    paginaActual={paginaActual}
                    cambiarPagina={setPaginaActual}
                />

                <main className="contenido">

                    {/* INICIO */}
                    {paginaActual === "inicio" && (
                        <Inicio />
                    )}

                    {/* CLIENTES */}
                    {paginaActual === "clientes" && (
                        <Clientes />
                    )}

                    {/* VEHÍCULOS */}
                    {paginaActual === "vehiculos" && (
                        <ListaVehiculos />
                    )}

                    {/* REGISTRAR VEHÍCULO */}
                    {paginaActual === "registroVehiculo" && (
                        <RegistroVehiculo />
                    )}

                    {/* ÓRDENES DE SERVICIO */}
                    {paginaActual === "ordenes" && (
                        <Ordenes />
                    )}

                </main>

            </div>

        </div>

    );
}

export default App;