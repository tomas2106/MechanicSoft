import "./Inicio.css";

function Icono({ tipo }) {

  const iconos = {

    clientes: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),

    vehiculos: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 17h14" />
        <path d="M6 17l1.5-6h9L19 17" />
        <path d="M8 11l1-3h6l1 3" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),

    ordenes: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.2 2.2-2.1-2.1 2.3-2.3Z" />
      </svg>
    ),

    registrar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
        <path d="M19 8v6" />
        <path d="M16 11h6" />
      </svg>
    ),

    historial: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),

    control: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="M8 16v-5" />
        <path d="M12 16V7" />
        <path d="M16 16v-3" />
        <path d="M20 16V4" />
      </svg>
    )

  };

  return iconos[tipo];

}


function Inicio() {

  return (

    <div className="inicio">

      {/* ==========================
          HERO / BIENVENIDA
      ========================== */}

      <section className="inicio-hero">

        <div className="hero-contenido">

          <span className="hero-etiqueta">
            PANEL PRINCIPAL
          </span>

          <h1>
            Bienvenido a
            <span> MechanicSoft</span>
          </h1>

          <p>
            Administra clientes, vehículos y órdenes de servicio
            desde un solo lugar.
          </p>

        </div>

        <div className="hero-decoracion">

          <div className="hero-circulo circulo-1"></div>
          <div className="hero-circulo circulo-2"></div>

          <div className="hero-icono">
            <Icono tipo="ordenes" />
          </div>

        </div>

      </section>


      {/* ==========================
          MÓDULOS PRINCIPALES
      ========================== */}

      <section className="inicio-seccion">

        <div className="seccion-titulo">

          <div>
            <h2>Módulos principales</h2>

            <p>
              Accede rápidamente a las funciones principales del sistema.
            </p>
          </div>

        </div>


        <div className="inicio-tarjetas">


          {/* CLIENTES */}

          <div className="inicio-tarjeta">

            <div className="tarjeta-icono icono-clientes">
              <Icono tipo="clientes" />
            </div>

            <div className="tarjeta-contenido">

              <span>Clientes</span>

              <p>
                Gestiona la información y los datos
                de los clientes del taller.
              </p>

            </div>

            <div className="tarjeta-flecha">
              →
            </div>

          </div>


          {/* VEHÍCULOS */}

          <div className="inicio-tarjeta">

            <div className="tarjeta-icono icono-vehiculos">
              <Icono tipo="vehiculos" />
            </div>

            <div className="tarjeta-contenido">

              <span>Vehículos</span>

              <p>
                Registra, consulta y administra
                los vehículos asociados.
              </p>

            </div>

            <div className="tarjeta-flecha">
              →
            </div>

          </div>


          {/* ÓRDENES */}

          <div className="inicio-tarjeta">

            <div className="tarjeta-icono icono-ordenes">
              <Icono tipo="ordenes" />
            </div>

            <div className="tarjeta-contenido">

              <span>Órdenes de servicio</span>

              <p>
                Controla reparaciones, servicios
                y estados de cada orden.
              </p>

            </div>

            <div className="tarjeta-flecha">
              →
            </div>

          </div>

        </div>

      </section>


      {/* ==========================
          FUNCIONES DEL SISTEMA
      ========================== */}

      <section className="actividad">

        <div className="actividad-header">

          <div>

            <span className="subtitulo-seccion">
              HERRAMIENTAS
            </span>

            <h2>
              Todo lo que puedes hacer
            </h2>

            <p>
              MechanicSoft reúne las herramientas necesarias
              para mantener organizada la operación del taller.
            </p>

          </div>

        </div>


        <div className="inicio-info">


          {/* REGISTRAR CLIENTES */}

          <div className="info-item">

            <div className="info-icono">
              <Icono tipo="registrar" />
            </div>

            <div>

              <h3>
                Registrar clientes
              </h3>

              <p>
                Registra y consulta la información
                de los clientes del taller.
              </p>

            </div>

          </div>


          {/* VEHÍCULOS */}

          <div className="info-item">

            <div className="info-icono">
              <Icono tipo="vehiculos" />
            </div>

            <div>

              <h3>
                Registrar vehículos
              </h3>

              <p>
                Asocia vehículos a sus propietarios
                y consulta su información.
              </p>

            </div>

          </div>


          {/* ÓRDENES */}

          <div className="info-item">

            <div className="info-icono">
              <Icono tipo="ordenes" />
            </div>

            <div>

              <h3>
                Crear órdenes de servicio
              </h3>

              <p>
                Registra el ingreso de un vehículo,
                su motivo y el trabajo que se realizará.
              </p>

            </div>

          </div>


          {/* REPARACIONES */}

          <div className="info-item">

            <div className="info-icono">
              <Icono tipo="historial" />
            </div>

            <div>

              <h3>
                Gestionar reparaciones
              </h3>

              <p>
                Consulta las órdenes y actualiza
                su estado durante la reparación.
              </p>

            </div>

          </div>


          {/* HISTORIAL */}

          <div className="info-item">

            <div className="info-icono">
              <Icono tipo="historial" />
            </div>

            <div>

              <h3>
                Consultar historial
              </h3>

              <p>
                Revisa las órdenes de servicio
                asociadas a cada vehículo.
              </p>

            </div>

          </div>


          {/* CONTROL */}

          <div className="info-item">

            <div className="info-icono">
              <Icono tipo="control" />
            </div>

            <div>

              <h3>
                Controlar el taller
              </h3>

              <p>
                Mantén organizada la información
                de clientes, vehículos y servicios.
              </p>

            </div>

          </div>


        </div>

      </section>

    </div>

  );

}


export default Inicio;

