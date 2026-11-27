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
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public Vehiculo guardar(VehiculoRequest request, Long tallerIdHeader) {
        String placaNorm = normalizarPlaca(request.getPlaca());
        if (placaNorm.isEmpty()) {
            throw new RuntimeException("La placa de la motocicleta es obligatoria.");
        }

        if (request.getClienteId() == null) {
            throw new RuntimeException("Debe asociar un cliente válido antes de registrar la motocicleta.");
        }

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        Taller taller = resolverTaller(tallerIdHeader, request.getTallerId(), cliente);
        if (taller == null) {
            throw new RuntimeException("No se pudo identificar el taller activo para registrar la motocicleta.");
        }

        if (cliente.getTaller() == null) {
            cliente.setTaller(taller);
            clienteRepository.save(cliente);
        }

        Optional<Vehiculo> existenteOpt = repository.findByTallerIdAndPlacaIgnoreCase(taller.getId(), placaNorm);
        if (existenteOpt.isPresent()) {
            Vehiculo existente = existenteOpt.get();
            mapearVehiculo(existente, request, cliente, taller, placaNorm);
            existente.setActivo(true);
            return repository.save(existente);
        }

        Vehiculo vehiculo = new Vehiculo();
        mapearVehiculo(vehiculo, request, cliente, taller, placaNorm);
        vehiculo.setActivo(true);
        return repository.save(vehiculo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehiculo> listar(Long tallerIdHeader) {
        if (tallerIdHeader != null) {
            return repository.findByTallerIdAndActivoTrue(tallerIdHeader);
        }
        return repository.findByActivoTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Vehiculo> buscarPorId(Long id) {
        return repository.findByIdAndActivoTrue(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Vehiculo> buscarPorPlaca(String placa, Long tallerIdHeader) {
        String placaNorm = normalizarPlaca(placa);
        if (tallerIdHeader != null) {
            return repository.findByPlacaAndTallerIdAndActivoTrue(placaNorm, tallerIdHeader);
        }
        return repository.findByPlacaAndActivoTrue(placaNorm);
    }

    @Override
    @Transactional
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
    @Transactional
    public void eliminar(Long id) {
        Vehiculo vehiculo = repository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));

        vehiculo.setActivo(false);
        repository.save(vehiculo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehiculo> buscarPorCliente(Long clienteId) {
        return repository.findByClienteIdAndActivoTrue(clienteId);
    }

    private void mapearVehiculo(Vehiculo vehiculo,
                                VehiculoRequest request,
                                Cliente cliente,
                                Taller taller,
                                String placaNorm) {
        vehiculo.setPlaca(placaNorm);
        vehiculo.setMarca(request.getMarca() != null && !request.getMarca().isBlank() ? request.getMarca().trim() : "Sin marca");
        vehiculo.setModelo(request.getModelo() != null && !request.getModelo().isBlank() ? request.getModelo().trim() : "Sin modelo");
        vehiculo.setAnio(request.getAnio());
        vehiculo.setCilindrajeCc(request.getCilindrajeCc() != null && request.getCilindrajeCc() >= 40 ? request.getCilindrajeCc() : 150);
        vehiculo.setColor(request.getColor() != null && !request.getColor().isBlank() ? request.getColor().trim() : null);
        vehiculo.setKilometraje(request.getKilometraje() != null && request.getKilometraje() >= 0 ? request.getKilometraje() : 0);
        if (request.getFotoVehiculo() != null) {
            vehiculo.setFotoVehiculo(request.getFotoVehiculo());
        }
        vehiculo.setObservaciones(request.getObservaciones());
        vehiculo.setCliente(cliente);
        if (taller != null) {
            vehiculo.setTaller(taller);
        }
    }
}