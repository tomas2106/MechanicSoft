package com.mechanicsoft.Features.Vehiculos.service.interfaces;

import com.mechanicsoft.Features.Vehiculos.dto.VehiculoRequest;
import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;

import java.util.List;
import java.util.Optional;

public interface VehiculoService {

    Vehiculo guardar(VehiculoRequest request, Long tallerIdHeader);

    List<Vehiculo> listar(Long tallerIdHeader);

    Optional<Vehiculo> buscarPorId(Long id);

    Optional<Vehiculo> buscarPorPlaca(String placa, Long tallerIdHeader);

    Vehiculo actualizar(Long id, VehiculoRequest request, Long tallerIdHeader);

    void eliminar(Long id);

    List<Vehiculo> buscarPorCliente(Long clienteId);
}