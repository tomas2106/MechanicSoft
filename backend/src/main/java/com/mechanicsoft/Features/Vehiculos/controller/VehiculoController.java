package com.mechanicsoft.Features.Vehiculos.controller;

import com.mechanicsoft.Features.Vehiculos.dto.VehiculoRequest;
import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;
import com.mechanicsoft.Features.Vehiculos.service.interfaces.VehiculoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    private final VehiculoService service;

    public VehiculoController(VehiculoService service) {
        this.service = service;
    }

    @PostMapping
    public Vehiculo guardar(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @Valid @RequestBody VehiculoRequest request) {
        return service.guardar(request, tallerId);
    }

    @GetMapping
    public List<Vehiculo> listar(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId) {
        return service.listar(tallerId);
    }

    @GetMapping("/{id}")
    public Vehiculo buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));
    }

    @GetMapping("/placa/{placa}")
    public Vehiculo buscarPorPlaca(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @PathVariable String placa) {
        return service.buscarPorPlaca(placa, tallerId)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado con esa placa."));
    }

    @GetMapping("/cliente/{clienteId}")
    public List<Vehiculo> buscarPorCliente(@PathVariable Long clienteId) {
        return service.buscarPorCliente(clienteId);
    }

    @PutMapping("/{id}")
    public Vehiculo actualizar(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @PathVariable Long id,
            @Valid @RequestBody VehiculoRequest request) {
        return service.actualizar(id, request, tallerId);
    }

    @PatchMapping("/{id}/foto")
    public Vehiculo actualizarFoto(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        Vehiculo vehiculo = service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));

        String nuevaFoto = payload.get("fotoVehiculo");
        VehiculoRequest req = new VehiculoRequest();
        req.setPlaca(vehiculo.getPlaca());
        req.setMarca(vehiculo.getMarca());
        req.setModelo(vehiculo.getModelo());
        req.setAnio(vehiculo.getAnio());
        req.setCilindrajeCc(vehiculo.getCilindrajeCc());
        req.setColor(vehiculo.getColor());
        req.setKilometraje(vehiculo.getKilometraje());
        req.setObservaciones(vehiculo.getObservaciones());
        req.setClienteId(vehiculo.getCliente().getId());
        req.setFotoVehiculo(nuevaFoto);

        Long tallerId = vehiculo.getTaller() != null ? vehiculo.getTaller().getId() : null;
        return service.actualizar(id, req, tallerId);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}