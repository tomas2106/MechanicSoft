package com.mechanicsoft.Features.OrdenesServicio.service.interfaces;

import com.mechanicsoft.Features.OrdenesServicio.dto.IngresoCompletoRequest;
import com.mechanicsoft.Features.OrdenesServicio.dto.OrdenResumenDTO;
import com.mechanicsoft.Features.OrdenesServicio.dto.OrdenServicioRequest;
import com.mechanicsoft.Features.OrdenesServicio.entity.EstadoOrden;
import com.mechanicsoft.Features.OrdenesServicio.entity.OrdenServicio;

import java.util.List;
import java.util.Optional;

public interface OrdenServicioService {

    OrdenServicio guardar(OrdenServicioRequest request, Long tallerIdHeader);

    OrdenResumenDTO registrarIngresoCompleto(IngresoCompletoRequest request, Long tallerIdHeader);

    List<OrdenResumenDTO> listarResumen(Long tallerIdHeader);

    List<OrdenServicio> listar(Long tallerIdHeader);

    Optional<OrdenServicio> buscarPorId(Long id);

    List<OrdenServicio> buscarPorVehiculo(Long vehiculoId);

    List<OrdenServicio> buscarPorEstado(EstadoOrden estado, Long tallerIdHeader);

    OrdenServicio actualizar(Long id, OrdenServicioRequest request, Long tallerIdHeader);

    OrdenServicio cambiarEstado(Long id, EstadoOrden estado);

    void eliminar(Long id);
}