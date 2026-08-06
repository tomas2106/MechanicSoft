package com.mechanicsoft.Features.Clientes.service.interfaces;

import com.mechanicsoft.Features.Clientes.entity.Cliente;

import java.util.List;
import java.util.Optional;

public interface ClienteService {

    Cliente guardar(Cliente cliente);

    List<Cliente> listar();

    Optional<Cliente> buscarPorId(Long id);

    Optional<Cliente> buscarPorTelefono(String telefono);

    Cliente actualizar(Long id, Cliente cliente);

    void eliminar(Long id);

}