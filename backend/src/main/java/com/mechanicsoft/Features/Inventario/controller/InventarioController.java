package com.mechanicsoft.Features.Inventario.controller;

import com.mechanicsoft.Features.Inventario.dto.InventarioRequest;
import com.mechanicsoft.Features.Inventario.entity.ItemInventario;
import com.mechanicsoft.Features.Inventario.service.interfaces.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping
    public List<ItemInventario> listar(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId) {
        return inventarioService.listarPorTaller(tallerId);
    }

    @PostMapping
    public ResponseEntity<ItemInventario> crear(
            @RequestHeader(value = "X-Taller-Id", required = false) Long tallerId,
            @RequestBody InventarioRequest request) {
        return ResponseEntity.ok(inventarioService.crear(tallerId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemInventario> actualizar(
            @PathVariable Long id,
            @RequestBody InventarioRequest request) {
        return ResponseEntity.ok(inventarioService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        inventarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}