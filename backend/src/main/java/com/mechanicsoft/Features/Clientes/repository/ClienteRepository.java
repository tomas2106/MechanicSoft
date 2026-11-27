package com.mechanicsoft.Features.Clientes.repository;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByIdAndActivoTrue(Long id);

    Optional<Cliente> findByTelefonoAndActivoTrue(String telefono);

    Optional<Cliente> findByTelefonoAndTallerIdAndActivoTrue(String telefono, Long tallerId);

    Optional<Cliente> findByTallerIdAndTelefono(Long tallerId, String telefono);

    @Query("SELECT c FROM Cliente c WHERE c.taller.id = :tallerId AND c.telefono = :telefono")
    Optional<Cliente> buscarPorTallerYTelefono(@Param("tallerId") Long tallerId, @Param("telefono") String telefono);

    List<Cliente> findByActivoTrue();

    List<Cliente> findByTallerIdAndActivoTrue(Long tallerId);

    List<Cliente> findByTallerIdAndActivoTrueOrderByNombreAsc(Long tallerId);
}