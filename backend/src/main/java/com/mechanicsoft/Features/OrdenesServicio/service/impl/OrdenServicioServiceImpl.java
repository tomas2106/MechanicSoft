package com.mechanicsoft.Features.OrdenesServicio.service.impl;

import com.mechanicsoft.Features.OrdenesServicio.dto.OrdenServicioRequest;
import com.mechanicsoft.Features.OrdenesServicio.entity.EstadoOrden;
import com.mechanicsoft.Features.OrdenesServicio.entity.OrdenServicio;
import com.mechanicsoft.Features.OrdenesServicio.repository.OrdenServicioRepository;
import com.mechanicsoft.Features.OrdenesServicio.service.interfaces.OrdenServicioService;
import com.mechanicsoft.Features.Talleres.entity.Taller;
import com.mechanicsoft.Features.Talleres.repository.TallerRepository;
import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;
import com.mechanicsoft.Features.Vehiculos.repository.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrdenServicioServiceImpl implements OrdenServicioService {

    private final OrdenServicioRepository repository;
    private final VehiculoRepository vehiculoRepository;
    private final TallerRepository tallerRepository;

    public OrdenServicioServiceImpl(
            OrdenServicioRepository repository,
            VehiculoRepository vehiculoRepository,
            TallerRepository tallerRepository) {

        this.repository = repository;
        this.vehiculoRepository = vehiculoRepository;
        this.tallerRepository = tallerRepository;
    }

    private Taller resolverTaller(Long tallerIdHeader, Long tallerIdBody, Vehiculo vehiculo) {
        Long id = tallerIdHeader != null ? tallerIdHeader : tallerIdBody;
        if (id != null) {
            return tallerRepository.findById(id).orElse(null);
        }
        if (vehiculo != null && vehiculo.getTaller() != null) {
            return vehiculo.getTaller();
        }
        return null;
    }

    @Override
    public OrdenServicio guardar(OrdenServicioRequest request, Long tallerIdHeader) {

        Vehiculo vehiculo = vehiculoRepository.findById(request.getVehiculoId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));

        Taller taller = resolverTaller(tallerIdHeader, request.getTallerId(), vehiculo);

        // Si el vehículo aún no tenía taller asignado, vincularlo ahora
        if (vehiculo.getTaller() == null && taller != null) {
            vehiculo.setTaller(taller);
        }

        // Actualizar kilometraje del vehículo si el de ingreso es mayor
        if (request.getKilometrajeIngreso() != null &&
                (vehiculo.getKilometraje() == null || request.getKilometrajeIngreso() > vehiculo.getKilometraje())) {
            vehiculo.setKilometraje(request.getKilometrajeIngreso());
        }
        vehiculoRepository.save(vehiculo);

        OrdenServicio orden = new OrdenServicio();
        orden.setVehiculo(vehiculo);
        orden.setTaller(taller);
        orden.setKilometrajeIngreso(request.getKilometrajeIngreso());
        orden.setMotivoIngreso(request.getMotivoIngreso());
        orden.setDiagnostico(request.getDiagnostico());
        orden.setTrabajoRealizado(request.getTrabajoRealizado());
        orden.setObservaciones(request.getObservaciones());
        orden.setEstado(request.getEstado() != null ? request.getEstado() : EstadoOrden.RECIBIDO);
        orden.setValorTotal(request.getValorTotal() != null ? request.getValorTotal() : BigDecimal.ZERO);
        orden.setDiasGarantia(request.getDiasGarantia() != null ? request.getDiasGarantia() : 30);
        orden.setProximoServicioDias(request.getProximoServicioDias() != null ? request.getProximoServicioDias() : 45);
        orden.setPrioridadOrden(request.getPrioridadOrden());

        // Usar siempre hora oficial de Colombia (America/Bogota)
        orden.setFechaIngreso(
                request.getFechaIngreso() != null
                        ? request.getFechaIngreso()
                        : LocalDateTime.now(OrdenServicio.ZONA_COLOMBIA)
        );

        if (orden.getEstado() == EstadoOrden.ENTREGADO) {
            orden.setFechaEntrega(LocalDateTime.now(OrdenServicio.ZONA_COLOMBIA));
        }

        return repository.save(orden);
    }

    @Override
    public List<OrdenServicio> listar(Long tallerIdHeader) {
        if (tallerIdHeader != null) {
            return repository.findByTallerIdAndActivoTrue(tallerIdHeader);
        }
        return repository.findByActivoTrue();
    }

    @Override
    public Optional<OrdenServicio> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<OrdenServicio> buscarPorVehiculo(Long vehiculoId) {
        return repository.findByVehiculoIdAndActivoTrue(vehiculoId);
    }

    @Override
    public List<OrdenServicio> buscarPorEstado(EstadoOrden estado, Long tallerIdHeader) {
        if (tallerIdHeader != null) {
            return repository.findByTallerIdAndEstadoAndActivoTrue(tallerIdHeader, estado);
        }
        return repository.findByEstado(estado);
    }

    @Override
    public OrdenServicio actualizar(Long id, OrdenServicioRequest request, Long tallerIdHeader) {

        OrdenServicio existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de servicio no encontrada."));

        Vehiculo vehiculo = vehiculoRepository.findById(request.getVehiculoId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));

        if (existente.getTaller() == null) {
            Taller taller = resolverTaller(tallerIdHeader, request.getTallerId(), vehiculo);
            if (taller != null) {
                existente.setTaller(taller);
            }
        }

        existente.setVehiculo(vehiculo);
        existente.setKilometrajeIngreso(request.getKilometrajeIngreso());
        existente.setMotivoIngreso(request.getMotivoIngreso());
        existente.setDiagnostico(request.getDiagnostico());
        existente.setTrabajoRealizado(request.getTrabajoRealizado());
        existente.setObservaciones(request.getObservaciones());
        if (request.getValorTotal() != null) {
            existente.setValorTotal(request.getValorTotal());
        }
        if (request.getPrioridadOrden() != null) {
            existente.setPrioridadOrden(request.getPrioridadOrden());
        }
        if (request.getDiasGarantia() != null) {
            existente.setDiasGarantia(request.getDiasGarantia());
        }
        if (request.getProximoServicioDias() != null) {
            existente.setProximoServicioDias(request.getProximoServicioDias());
        }
        if (request.getEstado() != null) {
            existente.setEstado(request.getEstado());
            if (request.getEstado() == EstadoOrden.ENTREGADO && existente.getFechaEntrega() == null) {
                existente.setFechaEntrega(LocalDateTime.now(OrdenServicio.ZONA_COLOMBIA));
            }
        }

        return repository.save(existente);
    }

    @Override
    public OrdenServicio cambiarEstado(Long id, EstadoOrden estado) {

        OrdenServicio orden = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de servicio no encontrada."));

        orden.setEstado(estado);

        if (estado == EstadoOrden.ENTREGADO) {
            orden.setFechaEntrega(LocalDateTime.now(OrdenServicio.ZONA_COLOMBIA));
        }

        return repository.save(orden);
    }

    @Override
    public void eliminar(Long id) {

        OrdenServicio orden = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de servicio no encontrada."));

        orden.setActivo(false);
        repository.save(orden);
    }
}