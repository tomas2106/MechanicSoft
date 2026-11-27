package com.mechanicsoft.Features.Inventario.service.impl;

import com.mechanicsoft.Features.Inventario.dto.InventarioRequest;
import com.mechanicsoft.Features.Inventario.entity.ItemInventario;
import com.mechanicsoft.Features.Inventario.repository.InventarioRepository;
import com.mechanicsoft.Features.Inventario.service.interfaces.InventarioService;
import com.mechanicsoft.Features.Talleres.entity.Taller;
import com.mechanicsoft.Features.Talleres.repository.TallerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioServiceImpl implements InventarioService {

    private final InventarioRepository inventarioRepo;
    private final TallerRepository tallerRepo;

    @Override
    @Transactional(readOnly = true)
    public List<ItemInventario> listarPorTaller(Long tallerId) {
        if (tallerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta el encabezado X-Taller-Id.");
        }
        return inventarioRepo.findByTaller_IdAndActivoTrueOrderByNombreAsc(tallerId);
    }

    @Override
    @Transactional
    public ItemInventario crear(Long tallerId, InventarioRequest req) {
        if (tallerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta el encabezado X-Taller-Id.");
        }
        if (req.nombre() == null || req.nombre().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre del producto es obligatorio.");
        }
        Taller taller = tallerRepo.findById(tallerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Taller no encontrado."));

        ItemInventario item = new ItemInventario();
        item.setTaller(taller);
        item.setNombre(req.nombre().trim());
        item.setCodigo(req.codigo() != null ? req.codigo().trim() : null);
        item.setStock(req.stock() != null ? req.stock() : 0);
        item.setStockMinimo(req.stockMinimo() != null ? req.stockMinimo() : 2);
        item.setPrecioCompra(req.precioCompra() != null ? req.precioCompra() : BigDecimal.ZERO);
        item.setPrecioVenta(req.precioVenta() != null ? req.precioVenta() : BigDecimal.ZERO);
        item.setActivo(true);
        return inventarioRepo.save(item);
    }

    @Override
    @Transactional
    public ItemInventario actualizar(Long id, InventarioRequest req) {
        ItemInventario item = inventarioRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado."));
        if (req.nombre() != null && !req.nombre().isBlank()) item.setNombre(req.nombre().trim());
        item.setCodigo(req.codigo());
        if (req.stock() != null) item.setStock(req.stock());
        if (req.stockMinimo() != null) item.setStockMinimo(req.stockMinimo());
        if (req.precioCompra() != null) item.setPrecioCompra(req.precioCompra());
        if (req.precioVenta() != null) item.setPrecioVenta(req.precioVenta());
        return inventarioRepo.save(item);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        ItemInventario item = inventarioRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado."));
        item.setActivo(false);
        inventarioRepo.save(item);
    }
}