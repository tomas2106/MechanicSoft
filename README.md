# MechanicSoft — Plataforma SaaS Multi-Taller para Talleres de Motocicletas

![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![REST API](https://img.shields.io/badge/Arquitectura-Multi--Tenant_REST-0F766E?style=for-the-badge)

**MechanicSoft** es una aplicación web full-stack tipo SaaS diseñada para digitalizar la operación diaria, la trazabilidad de motocicletas, el control de inventario y el cierre de caja financiero en talleres de mecánica de motos.

A diferencia de un CRUD tradicional de un solo usuario, MechanicSoft aísla los datos entre múltiples talleres independientes (`taller_id`), aplica Control de Acceso Basado en Roles (RBAC) entre administradores y mecánicos, y ofrece a los clientes un portal público de consulta y agendamiento en tiempo real por taller (`/t/{slug}`).

---

## Aspectos Destacados de Ingeniería

* **Aislamiento Estricto Multi-Taller (`Multi-Tenant`):** Clientes, motocicletas y órdenes de servicio están vinculados a cada taller (`taller_id`) mediante interceptores HTTP (`X-Taller-Id`) y restricciones únicas compuestas en base de datos (`(taller_id, placa)` y `(taller_id, telefono)`), evitando cruces de información entre talleres.
* **Control de Acceso Basado en Roles (RBAC):**
  * `SUPERADMIN`: Creación y suspensión de talleres, gestión de planes y auditoría de credenciales.
  * `ADMIN_TALLER`: Control operativo completo, cierre de caja diario (mantenimientos + ventas de mostrador), métricas financieras por día/mes/año, gestión de trabajadores y permisos de inventario.
  * `MECANICO`: Operación en patio (recepción de motos, flujo de estados, consulta de garantías) con cifras financieras y configuración del taller restringidas.
* **Facturación Detallada y Descuento Automático de Inventario:** Permite sumar el valor de mano de obra junto con los repuestos del inventario utilizados durante el cierre de una orden, descontando el stock automáticamente y detallando los insumos en el comprobante del cliente.
* **Portal Público para Clientes y Agendamiento (`/t/{slug}`):** Los propietarios de motocicletas pueden consultar el estado de su reparación e historial de garantías por placa o teléfono, verificar si el taller está abierto en ese momento y agendar citas por franja horaria.
* **Manejo de Zona Horaria y Localización:** Fuerza la zona horaria oficial de Colombia (`America/Bogota`, `UTC-5`) en los ciclos de vida de JPA (`@PrePersist` / `@PreUpdate`) para evitar desfases de fecha en servidores en la nube, además de normalizar números de WhatsApp al formato colombiano (`+57`).
* **Cierre de Caja Auditable:** Exporta el resumen financiero diario (servicios entregados + ventas de productos) a archivos compatibles con Excel (`.csv` con codificación UTF-8 BOM) y reportes listos para guardar en PDF.

---

## Arquitectura del Sistema

```text
+-------------------------------------------------------------------+
|                        Frontend (React + Vite)                    |
|  - Portal Público (/t/:slug)   - Tablero Admin y Mecánicos        |
|  - Interceptor Axios (Authorization + Encabezado X-Taller-Id)     |
+---------------------------------+---------------------------------+
                                  | HTTPS / JSON REST API
                                  v
+-------------------------------------------------------------------+
|                   Backend (Spring Boot 3 / Java)                  |
|  - Controladores: Taller, OrdenServicio, Vehiculo, Cliente        |
|  - Capa de Servicio: Resolución de taller, normalización +57, RBAC|
|  - Persistencia: Spring Data JPA / Hibernate (Borrado lógico)     |
+---------------------------------+---------------------------------+
                                  | JDBC
                                  v
+-------------------------------------------------------------------+
|                  Base de Datos Relacional (PostgreSQL)            |
|  - Índices Únicos Compuestos: (taller_id, placa), (taller_id, tel)|
|  - Marcas de tiempo sincronizadas (America/Bogota)                |
+-------------------------------------------------------------------+