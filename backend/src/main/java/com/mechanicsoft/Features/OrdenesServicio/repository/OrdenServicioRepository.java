package com.mechanicsoft.Features.OrdenesServicio.repository;

import com.mechanicsoft.Features.OrdenesServicio.dto.OrdenResumenDTO;
import com.mechanicsoft.Features.OrdenesServicio.entity.EstadoOrden;
import com.mechanicsoft.Features.OrdenesServicio.entity.OrdenServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrdenServicioRepository extends JpaRepository<OrdenServicio, Long> {

    List<OrdenServicio> findByActivoTrue();

    List<OrdenServicio> findByTallerIdAndActivoTrue(Long tallerId);

    List<OrdenServicio> findByVehiculoId(Long vehiculoId);

    List<OrdenServicio> findByEstado(EstadoOrden estado);

    List<OrdenServicio> findByTallerIdAndEstadoAndActivoTrue(Long tallerId, EstadoOrden estado);

    List<OrdenServicio> findByVehiculoIdAndActivoTrue(Long vehiculoId);

    @Query("""
        SELECT DISTINCT o FROM OrdenServicio o
        JOIN FETCH o.vehiculo v
        LEFT JOIN FETCH v.cliente c
        LEFT JOIN FETCH o.taller t
        LEFT JOIN FETCH v.taller vt
        WHERE o.activo = true
          AND v IS NOT NULL
          AND (
               (:placaExacta <> '' AND UPPER(REPLACE(v.placa, ' ', '')) = :placaExacta)
            OR (:telDigitos <> '' AND c IS NOT NULL AND c.telefono IS NOT NULL AND c.telefono LIKE CONCAT('%', :telDigitos, '%'))
          )
        ORDER BY o.id DESC
    """)
    List<OrdenServicio> buscarCoincidenciasPublicas(
            @Param("placaExacta") String placaExacta,
            @Param("telDigitos") String telDigitos
    );

    @Query("""
        SELECT o FROM OrdenServicio o
        JOIN FETCH o.vehiculo v
        JOIN FETCH v.cliente c
        JOIN o.taller t
        WHERE LOWER(t.slug) = LOWER(:slug)
          AND UPPER(REPLACE(v.placa, ' ', '')) = UPPER(REPLACE(:placa, ' ', ''))
          AND o.activo = true
        ORDER BY o.id DESC
    """)
    List<OrdenServicio> buscarHistorialPublicoPorPlaca(
            @Param("slug") String slug,
            @Param("placa") String placa
    );

    boolean existsByVehiculoIdAndEstadoNotInAndActivoTrue(Long vehiculoId, List<EstadoOrden> estadosFinalizados);

    @Query("""
        SELECT new com.mechanicsoft.Features.OrdenesServicio.dto.OrdenResumenDTO(
            o.id,
            o.estado,
            o.fechaIngreso,
            o.motivoIngreso,
            o.kilometrajeIngreso,
            o.valorTotal,
            o.prioridadOrden,
            v.id,
            v.placa,
            v.marca,
            v.modelo,
            v.color,
            v.cilindrajeCc,
            c.id,
            c.nombre,
            c.telefono
        )
        FROM OrdenServicio o
        JOIN o.vehiculo v
        JOIN v.cliente c
        WHERE (:tallerId IS NULL OR o.taller.id = :tallerId OR v.taller.id = :tallerId)
          AND o.activo = true
        ORDER BY o.fechaIngreso DESC
    """)
    List<OrdenResumenDTO> findResumenByTaller(@Param("tallerId") Long tallerId);
}