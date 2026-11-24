package com.mechanicsoft.Features.Vehiculos.repository;

import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {

    Optional<Vehiculo> findByPlacaAndActivoTrue(String placa);

    Optional<Vehiculo> findByPlacaAndTallerIdAndActivoTrue(String placa, Long tallerId);

    Optional<Vehiculo> findByIdAndActivoTrue(Long id);

    List<Vehiculo> findByActivoTrue();

    List<Vehiculo> findByTallerIdAndActivoTrue(Long tallerId);

    List<Vehiculo> findByClienteIdAndActivoTrue(Long clienteId);

    boolean existsByPlacaAndActivoTrue(String placa);

    boolean existsByPlacaAndTallerIdAndActivoTrue(String placa, Long tallerId);
}