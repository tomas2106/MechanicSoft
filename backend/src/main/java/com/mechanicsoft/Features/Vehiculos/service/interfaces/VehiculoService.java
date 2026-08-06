package com.mechanicsoft.Features.Vehiculos.service.interfaces;

import com.mechanicsoft.Features.Vehiculos.dto.VehiculoRequest;
import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;

import java.util.List;
import java.util.Optional;

public interface VehiculoService {

    Vehiculo guardar(VehiculoRequest request);

    List<Vehiculo> listar();

    Optional<Vehiculo> buscarPorId(Long id);

    Optional<Vehiculo> buscarPorPlaca(String placa);

    Vehiculo actualizar(Long id, VehiculoRequest request);

    void eliminar(Long id);

    List<Vehiculo> buscarPorCliente(Long clienteId);

}

