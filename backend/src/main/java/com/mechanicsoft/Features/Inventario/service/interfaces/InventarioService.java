package com.mechanicsoft.Features.Inventario.service.interfaces;

import com.mechanicsoft.Features.Inventario.dto.InventarioRequest;
import com.mechanicsoft.Features.Inventario.entity.ItemInventario;
import java.util.List;

public interface InventarioService {
    List<ItemInventario> listarPorTaller(Long tallerId);
    ItemInventario crear(Long tallerId, InventarioRequest request);
    ItemInventario actualizar(Long id, InventarioRequest request);
    void eliminar(Long id);
}