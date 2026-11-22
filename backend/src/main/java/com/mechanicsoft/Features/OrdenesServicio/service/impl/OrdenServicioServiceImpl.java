package com.mechanicsoft.Features.OrdenesServicio.service.impl;

import com.mechanicsoft.Features.OrdenesServicio.dto.OrdenServicioRequest;
import com.mechanicsoft.Features.OrdenesServicio.entity.EstadoOrden;
import com.mechanicsoft.Features.OrdenesServicio.entity.OrdenServicio;
import com.mechanicsoft.Features.OrdenesServicio.repository.OrdenServicioRepository;
import com.mechanicsoft.Features.OrdenesServicio.service.interfaces.OrdenServicioService;
import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;
import com.mechanicsoft.Features.Vehiculos.repository.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrdenServicioServiceImpl implements OrdenServicioService {

    private final OrdenServicioRepository repository;
    private final VehiculoRepository vehiculoRepository;

    public OrdenServicioServiceImpl(
            OrdenServicioRepository repository,
            VehiculoRepository vehiculoRepository) {

        this.repository = repository;
        this.vehiculoRepository = vehiculoRepository;
    }

    @Override
    public OrdenServicio guardar(OrdenServicioRequest request) {

        Vehiculo vehiculo = vehiculoRepository.findById(request.getVehiculoId())
                .orElseThrow(() ->
                        new RuntimeException("Vehículo no encontrado."));

        // Actualizar kilometraje del vehículo si el de ingreso es mayor
        if (request.getKilometrajeIngreso() != null &&
                (vehiculo.getKilometraje() == null || request.getKilometrajeIngreso() > vehiculo.getKilometraje())) {
            vehiculo.setKilometraje(request.getKilometrajeIngreso());
            vehiculoRepository.save(vehiculo);
        }

        OrdenServicio orden = new OrdenServicio();

        orden.setVehiculo(vehiculo);
        orden.setKilometrajeIngreso(request.getKilometrajeIngreso());
        orden.setMotivoIngreso(request.getMotivoIngreso());
        orden.setDiagnostico(request.getDiagnostico());
        orden.setTrabajoRealizado(request.getTrabajoRealizado());
        orden.setObservaciones(request.getObservaciones());
        orden.setEstado(request.getEstado());
        orden.setValorTotal(request.getValorTotal());
        orden.setDiasGarantia(request.getDiasGarantia() != null ? request.getDiasGarantia() : 30);
        orden.setProximoServicioDias(request.getProximoServicioDias() != null ? request.getProximoServicioDias() : 45);

        return repository.save(orden);
    }

    @Override
    public List<OrdenServicio> listar() {
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
    public List<OrdenServicio> buscarPorEstado(EstadoOrden estado) {
        return repository.findByEstado(estado);
    }

    @Override
    public OrdenServicio actualizar(Long id, OrdenServicioRequest request) {

        OrdenServicio existente = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Orden de servicio no encontrada."));

        Vehiculo vehiculo = vehiculoRepository.findById(request.getVehiculoId())
                .orElseThrow(() ->
                        new RuntimeException("Vehículo no encontrado."));

        existente.setVehiculo(vehiculo);
        existente.setKilometrajeIngreso(request.getKilometrajeIngreso());
        existente.setMotivoIngreso(request.getMotivoIngreso());
        existente.setDiagnostico(request.getDiagnostico());
        existente.setTrabajoRealizado(request.getTrabajoRealizado());
        existente.setObservaciones(request.getObservaciones());
        existente.setValorTotal(request.getValorTotal());

        if (request.getDiasGarantia() != null) {
            existente.setDiasGarantia(request.getDiasGarantia());
        }
        if (request.getProximoServicioDias() != null) {
            existente.setProximoServicioDias(request.getProximoServicioDias());
        }
        if (request.getEstado() != null) {
            existente.setEstado(request.getEstado());
            if (request.getEstado() == EstadoOrden.ENTREGADO && existente.getFechaEntrega() == null) {
                existente.setFechaEntrega(LocalDateTime.now());
            }
        }

        return repository.save(existente);
    }

    @Override
    public OrdenServicio cambiarEstado(Long id, EstadoOrden estado) {

        OrdenServicio orden = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Orden de servicio no encontrada."));

        orden.setEstado(estado);

        if (estado == EstadoOrden.ENTREGADO) {
            orden.setFechaEntrega(LocalDateTime.now());
        }

        return repository.save(orden);
    }

    @Override
    public void eliminar(Long id) {

        OrdenServicio orden = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Orden de servicio no encontrada."));

        orden.setActivo(false);

        repository.save(orden);
    }
}