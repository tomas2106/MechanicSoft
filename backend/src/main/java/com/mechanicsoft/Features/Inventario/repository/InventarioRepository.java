package com.mechanicsoft.Features.Inventario.repository;

import com.mechanicsoft.Features.Inventario.entity.ItemInventario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventarioRepository extends JpaRepository<ItemInventario, Long> {

    List<ItemInventario> findByTaller_IdAndActivoTrueOrderByNombreAsc(Long tallerId);
}