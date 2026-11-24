package com.mechanicsoft.Features.Clientes.controller;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import com.mechanicsoft.Features.Clientes.service.interfaces.ClienteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @PostMapping
    public Cliente guardar(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @Valid @RequestBody Cliente cliente) {
        return service.guardar(cliente, tallerId);
    }

    @GetMapping
    public List<Cliente> listar(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId) {
        return service.listar(tallerId);
    }

    @GetMapping("/{id}")
    public Cliente buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @GetMapping("/telefono/{telefono}")
    public Cliente buscarPorTelefono(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @PathVariable String telefono) {
        return service.buscarPorTelefono(telefono, tallerId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @PutMapping("/{id}")
    public Cliente actualizar(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @PathVariable Long id,
            @Valid @RequestBody Cliente cliente) {
        return service.actualizar(id, cliente, tallerId);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}