package com.mechanicsoft.Features.Talleres.repository;

import com.mechanicsoft.Features.Talleres.entity.UsuarioTaller;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UsuarioTallerRepository extends JpaRepository<UsuarioTaller, Long> {
    Optional<UsuarioTaller> findByEmailAndActivoTrue(String email);
    List<UsuarioTaller> findByTallerIdAndActivoTrue(Long tallerId);
}