package com.mechanicsoft.Features.Clientes.service.impl;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import com.mechanicsoft.Features.Clientes.repository.ClienteRepository;
import com.mechanicsoft.Features.Clientes.service.interfaces.ClienteService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository repository;

    public ClienteServiceImpl(ClienteRepository repository) {
        this.repository = repository;
    }

    @Override
    public Cliente guardar(Cliente cliente) {

        if (repository.findByTelefono(cliente.getTelefono()).isPresent()) {
            throw new RuntimeException("Ya existe un cliente registrado con ese teléfono.");
        }

        return repository.save(cliente);
    }

    @Override
    public List<Cliente> listar() {
        return repository.findAll();
    }

    @Override
    public Optional<Cliente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<Cliente> buscarPorTelefono(String telefono) {
        return repository.findByTelefono(telefono);
    }

    @Override
    public Cliente actualizar(Long id, Cliente cliente) {

        Cliente existente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        existente.setNombre(cliente.getNombre());
        existente.setTelefono(cliente.getTelefono());
        existente.setCorreo(cliente.getCorreo());

        return repository.save(existente);
    }

    @Override
    public void eliminar(Long id) {

        Cliente cliente = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        cliente.setActivo(false);

        repository.save(cliente);
    }

}