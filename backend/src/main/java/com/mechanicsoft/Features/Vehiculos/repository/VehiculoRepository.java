package com.mechanicsoft.Features.Vehiculos.repository;

import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {

    Optional<Vehiculo> findByPlacaAndActivoTrue(String placa);

    Optional<Vehiculo> findByPlacaAndTallerIdAndActivoTrue(String placa, Long tallerId);

    Optional<Vehiculo> findByTallerIdAndPlacaIgnoreCase(Long tallerId, String placa);

    Optional<Vehiculo> findByIdAndActivoTrue(Long id);

    @Query("SELECT v FROM Vehiculo v WHERE v.taller.id = :tallerId AND UPPER(REPLACE(v.placa, ' ', '')) = UPPER(REPLACE(:placa, ' ', ''))")
    Optional<Vehiculo> buscarPorTallerYPlaca(@Param("tallerId") Long tallerId, @Param("placa") String placa);

    List<Vehiculo> findByActivoTrue();

    List<Vehiculo> findByTallerIdAndActivoTrue(Long tallerId);

    List<Vehiculo> findByClienteIdAndActivoTrue(Long clienteId);

    boolean existsByPlacaAndActivoTrue(String placa);

    boolean existsByPlacaAndTallerIdAndActivoTrue(String placa, Long tallerId);
}