package com.mechanicsoft.Features.OrdenesServicio.repository;

import com.mechanicsoft.Features.OrdenesServicio.entity.EstadoOrden;
import com.mechanicsoft.Features.OrdenesServicio.entity.OrdenServicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrdenServicioRepository extends JpaRepository<OrdenServicio, Long> {

    List<OrdenServicio> findByActivoTrue();

    List<OrdenServicio> findByTallerIdAndActivoTrue(Long tallerId);

    List<OrdenServicio> findByVehiculoId(Long vehiculoId);

    List<OrdenServicio> findByEstado(EstadoOrden estado);

    List<OrdenServicio> findByTallerIdAndEstadoAndActivoTrue(Long tallerId, EstadoOrden estado);

    List<OrdenServicio> findByVehiculoIdAndActivoTrue(Long vehiculoId);
}