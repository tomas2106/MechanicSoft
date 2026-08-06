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
    public Cliente guardar(@Valid @RequestBody Cliente cliente) {
        return service.guardar(cliente);
    }

    @GetMapping
    public List<Cliente> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Cliente buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @GetMapping("/telefono/{telefono}")
    public Cliente buscarPorTelefono(@PathVariable String telefono) {
        return service.buscarPorTelefono(telefono)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @PutMapping("/{id}")
    public Cliente actualizar(@PathVariable Long id,
                              @Valid @RequestBody Cliente cliente) {
        return service.actualizar(id, cliente);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }

}