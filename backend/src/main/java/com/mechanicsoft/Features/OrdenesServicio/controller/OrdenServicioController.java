package com.mechanicsoft.Features.OrdenesServicio.controller;

import com.mechanicsoft.Features.OrdenesServicio.dto.IngresoCompletoRequest;
import com.mechanicsoft.Features.OrdenesServicio.dto.OrdenResumenDTO;
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

    @PostMapping("/ingreso-completo")
    public OrdenResumenDTO registrarIngresoCompleto(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @Valid @RequestBody IngresoCompletoRequest request) {
        return service.registrarIngresoCompleto(request, tallerId);
    }

    @GetMapping("/resumen")
    public List<OrdenResumenDTO> listarResumen(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId) {
        return service.listarResumen(tallerId);
    }

    @PostMapping
    public OrdenServicio guardar(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @Valid @RequestBody OrdenServicioRequest request) {
        return service.guardar(request, tallerId);
    }

    @GetMapping
    public List<OrdenServicio> listar(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId) {
        return service.listar(tallerId);
    }

    @GetMapping("/{id}")
    public OrdenServicio buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Orden de servicio no encontrada."));
    }

    @GetMapping("/vehiculo/{vehiculoId}")
    public List<OrdenServicio> buscarPorVehiculo(@PathVariable Long vehiculoId) {
        return service.buscarPorVehiculo(vehiculoId);
    }

    @GetMapping("/estado/{estado}")
    public List<OrdenServicio> buscarPorEstado(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @PathVariable EstadoOrden estado) {
        return service.buscarPorEstado(estado, tallerId);
    }

    @PutMapping("/{id}")
    public OrdenServicio actualizar(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @PathVariable Long id,
            @Valid @RequestBody OrdenServicioRequest request) {
        return service.actualizar(id, request, tallerId);
    }

    @PatchMapping("/{id}/estado")
    public OrdenServicio cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoOrden estado) {
        return service.cambiarEstado(id, estado);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}