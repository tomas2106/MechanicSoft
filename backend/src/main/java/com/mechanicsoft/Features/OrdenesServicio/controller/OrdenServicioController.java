package com.mechanicsoft.Features.OrdenesServicio.controller;

import com.mechanicsoft.Features.OrdenesServicio.dto.OrdenServicioRequest;
import com.mechanicsoft.Features.OrdenesServicio.entity.EstadoOrden;
import com.mechanicsoft.Features.OrdenesServicio.entity.OrdenServicio;
import com.mechanicsoft.Features.OrdenesServicio.service.interfaces.OrdenServicioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordenes-servicio")
public class OrdenServicioController {

    private final OrdenServicioService service;

    public OrdenServicioController(OrdenServicioService service) {
        this.service = service;
    }

    // Crear una orden
    @PostMapping
    public OrdenServicio guardar(
            @Valid @RequestBody OrdenServicioRequest request) {

        return service.guardar(request);
    }

    // Listar órdenes activas
    @GetMapping
    public List<OrdenServicio> listar() {

        return service.listar();
    }

    // Buscar orden por ID
    @GetMapping("/{id}")
    public OrdenServicio buscarPorId(
            @PathVariable Long id) {

        return service.buscarPorId(id)
                .orElseThrow(() ->
                        new RuntimeException("Orden de servicio no encontrada."));
    }

    // Buscar historial de un vehículo
    @GetMapping("/vehiculo/{vehiculoId}")
    public List<OrdenServicio> buscarPorVehiculo(
            @PathVariable Long vehiculoId) {

        return service.buscarPorVehiculo(vehiculoId);
    }

    // Buscar órdenes por estado
    @GetMapping("/estado/{estado}")
    public List<OrdenServicio> buscarPorEstado(
            @PathVariable EstadoOrden estado) {

        return service.buscarPorEstado(estado);
    }

    // Actualizar una orden
    @PutMapping("/{id}")
    public OrdenServicio actualizar(
            @PathVariable Long id,
            @Valid @RequestBody OrdenServicioRequest request) {

        return service.actualizar(id, request);
    }

    // Cambiar estado
    @PatchMapping("/{id}/estado")
    public OrdenServicio cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoOrden estado) {

        return service.cambiarEstado(id, estado);
    }

    // Desactivar orden
    @DeleteMapping("/{id}")
    public void eliminar(
            @PathVariable Long id) {

        service.eliminar(id);
    }
}