package com.mechanicsoft.Features.Clientes.service.interfaces;

import com.mechanicsoft.Features.Clientes.entity.Cliente;

import java.util.List;
import java.util.Optional;

public interface ClienteService {

    Cliente guardar(Cliente cliente, Long tallerIdHeader);

    List<Cliente> listar(Long tallerIdHeader);

    Optional<Cliente> buscarPorId(Long id);

    Optional<Cliente> buscarPorTelefono(String telefono, Long tallerIdHeader);

    Cliente actualizar(Long id, Cliente cliente, Long tallerIdHeader);

    void eliminar(Long id);
}