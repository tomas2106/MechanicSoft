package com.mechanicsoft.Features.Vehiculos.service.impl;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import com.mechanicsoft.Features.Clientes.repository.ClienteRepository;
import com.mechanicsoft.Features.Vehiculos.dto.VehiculoRequest;
import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;
import com.mechanicsoft.Features.Vehiculos.repository.VehiculoRepository;
import com.mechanicsoft.Features.Vehiculos.service.interfaces.VehiculoService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VehiculoServiceImpl implements VehiculoService {

    private final VehiculoRepository repository;
    private final ClienteRepository clienteRepository;

    public VehiculoServiceImpl(VehiculoRepository repository,
                               ClienteRepository clienteRepository) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
    }

    @Override
    public Vehiculo guardar(VehiculoRequest request) {

        if (repository.existsByPlaca(request.getPlaca())) {
            throw new RuntimeException("Ya existe un vehículo registrado con esa placa.");
        }

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        Vehiculo vehiculo = new Vehiculo();

        mapearVehiculo(vehiculo, request, cliente);

        return repository.save(vehiculo);
    }

    @Override
    public List<Vehiculo> listar() {
        return repository.findByActivoTrue();
    }

    @Override
    public Optional<Vehiculo> buscarPorId(Long id) {
        return repository.findByIdAndActivoTrue(id);
    }

    @Override
    public Optional<Vehiculo> buscarPorPlaca(String placa) {
        return repository.findByPlacaAndActivoTrue(placa);
    }

    @Override
    public Vehiculo actualizar(Long id, VehiculoRequest request) {

        Vehiculo existente = repository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        mapearVehiculo(existente, request, cliente);

        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {

        Vehiculo vehiculo = repository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));

        vehiculo.setActivo(false);

        repository.save(vehiculo);
    }

    @Override
    public List<Vehiculo> buscarPorCliente(Long clienteId) {
        return repository.findByClienteIdAndActivoTrue(clienteId);
    }

    /**
     * Método privado para mapear los datos del DTO a la entidad.
     * Evita duplicar código entre guardar() y actualizar().
     */
    private void mapearVehiculo(Vehiculo vehiculo,
                                VehiculoRequest request,
                                Cliente cliente) {

        vehiculo.setPlaca(request.getPlaca());
        vehiculo.setMarca(request.getMarca());
        vehiculo.setModelo(request.getModelo());
        vehiculo.setAnio(request.getAnio());
        vehiculo.setCilindrajeCc(request.getCilindrajeCc());
        vehiculo.setColor(request.getColor());
        vehiculo.setKilometraje(request.getKilometraje());
        vehiculo.setFotoVehiculo(request.getFotoVehiculo());
        vehiculo.setObservaciones(request.getObservaciones());
        vehiculo.setCliente(cliente);
    }

}