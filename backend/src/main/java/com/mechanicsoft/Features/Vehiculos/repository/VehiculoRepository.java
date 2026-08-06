package com.mechanicsoft.Features.Vehiculos.repository;

import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {

    // Buscar por placa (solo activos)
    Optional<Vehiculo> findByPlacaAndActivoTrue(String placa);

    // Buscar por ID (solo activos)
    Optional<Vehiculo> findByIdAndActivoTrue(Long id);

    // Listar todos los vehículos activos
    List<Vehiculo> findByActivoTrue();

    // Listar vehículos activos de un cliente
    List<Vehiculo> findByClienteIdAndActivoTrue(Long clienteId);

    // Verificar si una placa ya existe
    boolean existsByPlaca(String placa);

}