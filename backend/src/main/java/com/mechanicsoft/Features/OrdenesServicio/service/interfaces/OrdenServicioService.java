package com.mechanicsoft.Features.OrdenesServicio.service.interfaces;

import com.mechanicsoft.Features.OrdenesServicio.dto.OrdenServicioRequest;
import com.mechanicsoft.Features.OrdenesServicio.entity.EstadoOrden;
import com.mechanicsoft.Features.OrdenesServicio.entity.OrdenServicio;

import java.util.List;
import java.util.Optional;

public interface OrdenServicioService {

    OrdenServicio guardar(OrdenServicioRequest request);

    List<OrdenServicio> listar();

    Optional<OrdenServicio> buscarPorId(Long id);

    List<OrdenServicio> buscarPorVehiculo(Long vehiculoId);

    List<OrdenServicio> buscarPorEstado(EstadoOrden estado);

    OrdenServicio actualizar(Long id, OrdenServicioRequest request);

    OrdenServicio cambiarEstado(Long id, EstadoOrden estado);

    void eliminar(Long id);
}