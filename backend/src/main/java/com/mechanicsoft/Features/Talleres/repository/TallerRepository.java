package com.mechanicsoft.Features.Talleres.repository;

import com.mechanicsoft.Features.Talleres.entity.Taller;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TallerRepository extends JpaRepository<Taller, Long> {
    Optional<Taller> findBySlugAndActivoTrue(String slug);
    Optional<Taller> findByEmailAndActivoTrue(String email);
    List<Taller> findByActivoTrue();
}