package com.mechanicsoft.Features.Clientes.repository;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByIdAndActivoTrue(Long id);

    Optional<Cliente> findByTelefonoAndActivoTrue(String telefono);

    Optional<Cliente> findByTelefonoAndTallerIdAndActivoTrue(String telefono, Long tallerId);

    List<Cliente> findByActivoTrue();

    List<Cliente> findByTallerIdAndActivoTrue(Long tallerId);
}