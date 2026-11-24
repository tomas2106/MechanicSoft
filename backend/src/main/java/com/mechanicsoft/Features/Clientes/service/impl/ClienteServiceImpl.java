package com.mechanicsoft.Features.Clientes.service.impl;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import com.mechanicsoft.Features.Clientes.repository.ClienteRepository;
import com.mechanicsoft.Features.Clientes.service.interfaces.ClienteService;
import com.mechanicsoft.Features.Talleres.entity.Taller;
import com.mechanicsoft.Features.Talleres.repository.TallerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository repository;
    private final TallerRepository tallerRepository;

    public ClienteServiceImpl(ClienteRepository repository, TallerRepository tallerRepository) {
        this.repository = repository;
        this.tallerRepository = tallerRepository;
    }

    private String normalizarTelefonoCO(String raw) {
        if (raw == null) return "";
        String digits = raw.replaceAll("\\D+", "");
        if (digits.isEmpty()) return "";
        if (digits.startsWith("57") && digits.length() >= 12) {
            return digits;
        }
        return "57" + digits;
    }

    private Taller resolverTaller(Long tallerIdHeader, Cliente cliente) {
        Long id = tallerIdHeader != null
                ? tallerIdHeader
                : (cliente.getTaller() != null ? cliente.getTaller().getId() : null);
        if (id != null) {
            return tallerRepository.findById(id).orElse(null);
        }
        return null;
    }

    @Override
    public Cliente guardar(Cliente cliente, Long tallerIdHeader) {
        String telNorm = normalizarTelefonoCO(cliente.getTelefono());
        if (telNorm.isEmpty()) {
            throw new RuntimeException("El número de teléfono es obligatorio.");
        }
        cliente.setTelefono(telNorm);

        if (cliente.getCorreo() != null && cliente.getCorreo().isBlank()) {
            cliente.setCorreo(null);
        }

        Taller taller = resolverTaller(tallerIdHeader, cliente);
        if (taller != null) {
            cliente.setTaller(taller);
            if (repository.findByTelefonoAndTallerIdAndActivoTrue(telNorm, taller.getId()).isPresent()) {
                throw new RuntimeException("Ya existe un cliente registrado con ese WhatsApp en este taller.");
            }
        } else if (repository.findByTelefonoAndActivoTrue(telNorm).isPresent()) {
            throw new RuntimeException("Ya existe un cliente registrado con ese teléfono.");
        }

        return repository.save(cliente);
    }

    @Override
    public List<Cliente> listar(Long tallerIdHeader) {
        if (tallerIdHeader != null) {
            return repository.findByTallerIdAndActivoTrue(tallerIdHeader);
        }
        return repository.findByActivoTrue();
    }

    @Override
    public Optional<Cliente> buscarPorId(Long id) {
        return repository.findByIdAndActivoTrue(id);
    }

    @Override
    public Optional<Cliente> buscarPorTelefono(String telefono, Long tallerIdHeader) {
        String telNorm = normalizarTelefonoCO(telefono);
        if (tallerIdHeader != null) {
            Optional<Cliente> delTaller = repository.findByTelefonoAndTallerIdAndActivoTrue(telNorm, tallerIdHeader);
            if (delTaller.isPresent()) {
                return delTaller;
            }
        }
        return repository.findByTelefonoAndActivoTrue(telNorm);
    }

    @Override
    public Cliente actualizar(Long id, Cliente cliente, Long tallerIdHeader) {
        Cliente existente = repository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        String telNorm = normalizarTelefonoCO(cliente.getTelefono());
        existente.setNombre(cliente.getNombre() != null ? cliente.getNombre().trim() : existente.getNombre());
        existente.setTelefono(telNorm.isEmpty() ? existente.getTelefono() : telNorm);
        existente.setCorreo(cliente.getCorreo() != null && !cliente.getCorreo().isBlank() ? cliente.getCorreo().trim() : null);

        if (existente.getTaller() == null) {
            Taller taller = resolverTaller(tallerIdHeader, cliente);
            if (taller != null) {
                existente.setTaller(taller);
            }
        }

        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        Cliente cliente = repository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        cliente.setActivo(false);
        repository.save(cliente);
    }
}