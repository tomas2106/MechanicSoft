package com.mechanicsoft.Features.Vehiculos.service.impl;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import com.mechanicsoft.Features.Clientes.repository.ClienteRepository;
import com.mechanicsoft.Features.Talleres.entity.Taller;
import com.mechanicsoft.Features.Talleres.repository.TallerRepository;
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
    private final TallerRepository tallerRepository;

    public VehiculoServiceImpl(VehiculoRepository repository,
                               ClienteRepository clienteRepository,
                               TallerRepository tallerRepository) {
        this.repository = repository;
        this.clienteRepository = clienteRepository;
        this.tallerRepository = tallerRepository;
    }

    private String normalizarPlaca(String placa) {
        if (placa == null) return "";
        return placa.trim().replaceAll("\\s+", "").toUpperCase();
    }

    private Taller resolverTaller(Long tallerIdHeader, Long tallerIdBody, Cliente cliente) {
        Long idFinal = tallerIdHeader != null ? tallerIdHeader : tallerIdBody;
        if (idFinal != null) {
            return tallerRepository.findById(idFinal).orElse(null);
        }
        return cliente != null ? cliente.getTaller() : null;
    }

    @Override
    public Vehiculo guardar(VehiculoRequest request, Long tallerIdHeader) {
        String placaNorm = normalizarPlaca(request.getPlaca());

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        Taller taller = resolverTaller(tallerIdHeader, request.getTallerId(), cliente);

        if (taller != null) {
            if (repository.existsByPlacaAndTallerIdAndActivoTrue(placaNorm, taller.getId())) {
                throw new RuntimeException("Ya existe una moto registrada con la placa " + placaNorm + " en este taller.");
            }
        } else if (repository.existsByPlacaAndActivoTrue(placaNorm)) {
            throw new RuntimeException("Ya existe una moto registrada con la placa " + placaNorm + ".");
        }

        Vehiculo vehiculo = new Vehiculo();
        mapearVehiculo(vehiculo, request, cliente, taller, placaNorm);
        return repository.save(vehiculo);
    }

    @Override
    public List<Vehiculo> listar(Long tallerIdHeader) {
        if (tallerIdHeader != null) {
            return repository.findByTallerIdAndActivoTrue(tallerIdHeader);
        }
        return repository.findByActivoTrue();
    }

    @Override
    public Optional<Vehiculo> buscarPorId(Long id) {
        return repository.findByIdAndActivoTrue(id);
    }

    @Override
    public Optional<Vehiculo> buscarPorPlaca(String placa, Long tallerIdHeader) {
        String placaNorm = normalizarPlaca(placa);
        if (tallerIdHeader != null) {
            Optional<Vehiculo> delTaller = repository.findByPlacaAndTallerIdAndActivoTrue(placaNorm, tallerIdHeader);
            if (delTaller.isPresent()) {
                return delTaller;
            }
        }
        return repository.findByPlacaAndActivoTrue(placaNorm);
    }

    @Override
    public Vehiculo actualizar(Long id, VehiculoRequest request, Long tallerIdHeader) {
        Vehiculo existente = repository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        Taller taller = existente.getTaller() != null
                ? existente.getTaller()
                : resolverTaller(tallerIdHeader, request.getTallerId(), cliente);

        String placaNorm = normalizarPlaca(request.getPlaca());
        mapearVehiculo(existente, request, cliente, taller, placaNorm);

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

    private void mapearVehiculo(Vehiculo vehiculo,
                                VehiculoRequest request,
                                Cliente cliente,
                                Taller taller,
                                String placaNorm) {
        vehiculo.setPlaca(placaNorm);
        vehiculo.setMarca(request.getMarca().trim());
        vehiculo.setModelo(request.getModelo().trim());
        vehiculo.setAnio(request.getAnio());
        vehiculo.setCilindrajeCc(request.getCilindrajeCc() != null && request.getCilindrajeCc() >= 40 ? request.getCilindrajeCc() : 150);
        vehiculo.setColor(request.getColor() != null ? request.getColor().trim() : null);
        vehiculo.setKilometraje(request.getKilometraje() != null && request.getKilometraje() >= 0 ? request.getKilometraje() : 0);
        vehiculo.setFotoVehiculo(request.getFotoVehiculo());
        vehiculo.setObservaciones(request.getObservaciones());
        vehiculo.setCliente(cliente);
        if (taller != null) {
            vehiculo.setTaller(taller);
        }
    }
}