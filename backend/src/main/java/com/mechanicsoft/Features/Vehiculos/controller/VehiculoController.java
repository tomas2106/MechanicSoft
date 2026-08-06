package com.mechanicsoft.Features.Vehiculos.controller;

import com.mechanicsoft.Features.Vehiculos.dto.VehiculoRequest;
import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;
import com.mechanicsoft.Features.Vehiculos.service.interfaces.VehiculoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    private final VehiculoService service;

    public VehiculoController(VehiculoService service) {
        this.service = service;
    }

    @PostMapping
    public Vehiculo guardar(@Valid @RequestBody VehiculoRequest request) {
        return service.guardar(request);
    }

    @GetMapping
    public List<Vehiculo> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Vehiculo buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));
    }

    @GetMapping("/placa/{placa}")
    public Vehiculo buscarPorPlaca(@PathVariable String placa) {
        return service.buscarPorPlaca(placa)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));
    }

    @GetMapping("/cliente/{clienteId}")
    public List<Vehiculo> buscarPorCliente(@PathVariable Long clienteId) {
        return service.buscarPorCliente(clienteId);
    }

    @PutMapping("/{id}")
    public Vehiculo actualizar(@PathVariable Long id,
                               @Valid @RequestBody VehiculoRequest request) {
        return service.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

}