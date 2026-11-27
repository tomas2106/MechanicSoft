package com.mechanicsoft.Features.Clientes.service.impl;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import com.mechanicsoft.Features.Clientes.repository.ClienteRepository;
import com.mechanicsoft.Features.Clientes.service.interfaces.ClienteService;
import com.mechanicsoft.Features.Talleres.entity.Taller;
import com.mechanicsoft.Features.Talleres.repository.TallerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public static String normalizarTelefonoCO(String raw) {
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
    @Transactional
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
        if (taller == null) {
            throw new RuntimeException("No se pudo identificar el taller activo para registrar el cliente.");
        }
        cliente.setTaller(taller);

        // Si ya existe en este taller (activo o inactivo), actualizar nombre y reutilizarlo sin bloquear
        Optional<Cliente> existenteOpt = repository.findByTallerIdAndTelefono(taller.getId(), telNorm);
        if (existenteOpt.isPresent()) {
            Cliente existente = existenteOpt.get();
            if (cliente.getNombre() != null && !cliente.getNombre().isBlank()) {
                existente.setNombre(cliente.getNombre().trim());
            }
            if (cliente.getCorreo() != null) {
                existente.setCorreo(cliente.getCorreo());
            }
            existente.setActivo(true);
            return repository.save(existente);
        }

        cliente.setActivo(true);
        return repository.save(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Cliente> listar(Long tallerIdHeader) {
        if (tallerIdHeader != null) {
            return repository.findByTallerIdAndActivoTrueOrderByNombreAsc(tallerIdHeader);
        }
        return repository.findByActivoTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Cliente> buscarPorId(Long id) {
        return repository.findByIdAndActivoTrue(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Cliente> buscarPorTelefono(String telefono, Long tallerIdHeader) {
        String telNorm = normalizarTelefonoCO(telefono);
        if (tallerIdHeader != null) {
            return repository.findByTelefonoAndTallerIdAndActivoTrue(telNorm, tallerIdHeader);
        }
        return repository.findByTelefonoAndActivoTrue(telNorm);
    }

    @Override
    @Transactional
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
    @Transactional
    public void eliminar(Long id) {
        Cliente cliente = repository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado."));

        cliente.setActivo(false);
        repository.save(cliente);
    }
}