package com.mechanicsoft.Features.OrdenesServicio.service.impl;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import com.mechanicsoft.Features.Clientes.repository.ClienteRepository;
import com.mechanicsoft.Features.OrdenesServicio.dto.IngresoCompletoRequest;
import com.mechanicsoft.Features.OrdenesServicio.dto.OrdenResumenDTO;
import com.mechanicsoft.Features.OrdenesServicio.dto.OrdenServicioRequest;
import com.mechanicsoft.Features.OrdenesServicio.entity.EstadoOrden;
import com.mechanicsoft.Features.OrdenesServicio.entity.OrdenServicio;
import com.mechanicsoft.Features.OrdenesServicio.repository.OrdenServicioRepository;
import com.mechanicsoft.Features.OrdenesServicio.service.interfaces.OrdenServicioService;
import com.mechanicsoft.Features.Talleres.entity.Taller;
import com.mechanicsoft.Features.Talleres.repository.TallerRepository;
import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;
import com.mechanicsoft.Features.Vehiculos.repository.VehiculoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
public class OrdenServicioServiceImpl implements OrdenServicioService {

    private static final ZoneId ZONA_COLOMBIA = ZoneId.of("America/Bogota");

    private final OrdenServicioRepository ordenRepository;
    private final ClienteRepository clienteRepository;
    private final VehiculoRepository vehiculoRepository;
    private final TallerRepository tallerRepository;

    public OrdenServicioServiceImpl(
            OrdenServicioRepository ordenRepository,
            ClienteRepository clienteRepository,
            VehiculoRepository vehiculoRepository,
            TallerRepository tallerRepository) {
        this.ordenRepository = ordenRepository;
        this.clienteRepository = clienteRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.tallerRepository = tallerRepository;
    }

    @Override
    @Transactional
    public OrdenResumenDTO registrarIngresoCompleto(IngresoCompletoRequest request, Long tallerIdHeader) {
        if (tallerIdHeader == null) {
            throw new IllegalArgumentException("El identificador del taller (X-Taller-Id) es obligatorio.");
        }

        Taller taller = tallerRepository.findById(tallerIdHeader)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado."));

        String telefonoLimpio = request.getTelefono() != null ? request.getTelefono().trim() : "";
        String placaLimpia = request.getPlaca() != null
                ? request.getPlaca().trim().replaceAll("\\s+", "").toUpperCase()
                : "";

        if (placaLimpia.isEmpty()) {
            throw new IllegalArgumentException("La placa del vehículo es obligatoria.");
        }

        // 1. Buscar o crear cliente dentro del taller
        Cliente cliente = clienteRepository
                .buscarPorTallerYTelefono(tallerIdHeader, telefonoLimpio)
                .orElseGet(() -> {
                    Cliente nuevo = new Cliente();
                    nuevo.setNombre(request.getNombreCliente() != null ? request.getNombreCliente().trim() : "Cliente");
                    nuevo.setTelefono(telefonoLimpio);
                    nuevo.setCorreo(request.getCorreo());
                    nuevo.setTaller(taller);
                    nuevo.setActivo(true);
                    return clienteRepository.save(nuevo);
                });

        // 2. Buscar o crear vehículo asociado SIEMPRE al cliente y al taller
        Vehiculo vehiculo = vehiculoRepository
                .buscarPorTallerYPlaca(tallerIdHeader, placaLimpia)
                .orElseGet(() -> {
                    Vehiculo nuevoVehiculo = new Vehiculo();
                    nuevoVehiculo.setPlaca(placaLimpia);
                    nuevoVehiculo.setMarca(request.getMarca() != null ? request.getMarca().trim() : "");
                    nuevoVehiculo.setModelo(request.getModelo() != null ? request.getModelo().trim() : "");
                    nuevoVehiculo.setCilindrajeCc(request.getCilindrajeCc() != null ? request.getCilindrajeCc() : 150);
                    nuevoVehiculo.setTaller(taller);
                    nuevoVehiculo.setActivo(true);
                    return nuevoVehiculo;
                });

        vehiculo.setCliente(cliente);
        vehiculo.setTaller(taller);
        if (request.getKilometraje() != null && request.getKilometraje() > 0) {
            vehiculo.setKilometraje(request.getKilometraje());
        }
        vehiculo = vehiculoRepository.save(vehiculo);

        // 3. Crear la orden de servicio vinculada al vehículo y al taller
        OrdenServicio orden = new OrdenServicio();
        orden.setTaller(taller);
        orden.setVehiculo(vehiculo);
        orden.setEstado(EstadoOrden.RECIBIDO);
        orden.setFechaIngreso(LocalDateTime.now(ZONA_COLOMBIA));
        orden.setKilometrajeIngreso(request.getKilometraje() != null ? request.getKilometraje() : 0);
        orden.setMotivoIngreso(request.getMotivoIngreso() != null ? request.getMotivoIngreso().trim() : "");
        orden.setValorTotal(request.getValorTotal() != null ? request.getValorTotal() : BigDecimal.ZERO);
        orden.setActivo(true);

        OrdenServicio guardada = ordenRepository.save(orden);

        return new OrdenResumenDTO(
                guardada.getId(),
                guardada.getEstado(),
                guardada.getFechaIngreso(),
                guardada.getMotivoIngreso(),
                guardada.getKilometrajeIngreso(),
                guardada.getValorTotal(),
                guardada.getPrioridadOrden(),
                vehiculo.getId(),
                vehiculo.getPlaca(),
                vehiculo.getMarca(),
                vehiculo.getModelo(),
                vehiculo.getColor(),
                vehiculo.getCilindrajeCc(),
                cliente.getId(),
                cliente.getNombre(),
                cliente.getTelefono()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenResumenDTO> listarResumen(Long tallerIdHeader) {
        if (tallerIdHeader == null) {
            throw new IllegalArgumentException("El identificador del taller (X-Taller-Id) es obligatorio.");
        }
        return ordenRepository.findResumenByTaller(tallerIdHeader);
    }

    @Override
    @Transactional
    public OrdenServicio guardar(OrdenServicioRequest request, Long tallerIdHeader) {
        if (tallerIdHeader == null) {
            throw new IllegalArgumentException("El identificador del taller (X-Taller-Id) es obligatorio.");
        }

        Taller taller = tallerRepository.findById(tallerIdHeader)
                .orElseThrow(() -> new RuntimeException("Taller no encontrado."));

        Vehiculo vehiculo = vehiculoRepository.findById(request.getVehiculoId())
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado."));

        if (vehiculo.getTaller() == null) {
            vehiculo.setTaller(taller);
        }
        if (request.getKilometrajeIngreso() != null && request.getKilometrajeIngreso() > 0) {
            vehiculo.setKilometraje(request.getKilometrajeIngreso());
        }
        vehiculo = vehiculoRepository.save(vehiculo);

        OrdenServicio orden = new OrdenServicio();
        orden.setTaller(taller);
        orden.setVehiculo(vehiculo);
        orden.setEstado(EstadoOrden.RECIBIDO);
        orden.setFechaIngreso(LocalDateTime.now(ZONA_COLOMBIA));
        orden.setKilometrajeIngreso(request.getKilometrajeIngreso() != null ? request.getKilometrajeIngreso() : 0);
        orden.setMotivoIngreso(request.getMotivoIngreso());
        orden.setDiagnostico(request.getDiagnostico());
        orden.setTrabajoRealizado(request.getTrabajoRealizado());
        orden.setValorTotal(request.getValorTotal() != null ? request.getValorTotal() : BigDecimal.ZERO);
        orden.setDiasGarantia(request.getDiasGarantia() != null ? request.getDiasGarantia() : 30);
        orden.setProximoServicioDias(request.getProximoServicioDias() != null ? request.getProximoServicioDias() : 45);
        orden.setActivo(true);

        return ordenRepository.save(orden);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenServicio> listar(Long tallerIdHeader) {
        if (tallerIdHeader == null) {
            throw new IllegalArgumentException("El identificador del taller (X-Taller-Id) es obligatorio.");
        }
        return ordenRepository.findByTallerIdAndActivoTrue(tallerIdHeader);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrdenServicio> buscarPorId(Long id) {
        return ordenRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenServicio> buscarPorVehiculo(Long vehiculoId) {
        return ordenRepository.findByVehiculoIdAndActivoTrue(vehiculoId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrdenServicio> buscarPorEstado(EstadoOrden estado, Long tallerIdHeader) {
        if (tallerIdHeader == null) {
            throw new IllegalArgumentException("El identificador del taller (X-Taller-Id) es obligatorio.");
        }
        return ordenRepository.findByTallerIdAndEstadoAndActivoTrue(tallerIdHeader, estado);
    }

    @Override
    @Transactional
    public OrdenServicio actualizar(Long id, OrdenServicioRequest request, Long tallerIdHeader) {
        OrdenServicio orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de servicio no encontrada."));

        if (tallerIdHeader != null && orden.getTaller() != null && !orden.getTaller().getId().equals(tallerIdHeader)) {
            throw new RuntimeException("No tienes permiso para modificar una orden de otro taller.");
        }

        if (request.getMotivoIngreso() != null) orden.setMotivoIngreso(request.getMotivoIngreso());
        if (request.getDiagnostico() != null) orden.setDiagnostico(request.getDiagnostico());
        if (request.getTrabajoRealizado() != null) orden.setTrabajoRealizado(request.getTrabajoRealizado());
        if (request.getValorTotal() != null) orden.setValorTotal(request.getValorTotal());
        if (request.getDiasGarantia() != null) orden.setDiasGarantia(request.getDiasGarantia());
        if (request.getProximoServicioDias() != null) orden.setProximoServicioDias(request.getProximoServicioDias());
        if (request.getEstado() != null) {
            orden.setEstado(request.getEstado());
            if (request.getEstado() == EstadoOrden.ENTREGADO && orden.getFechaEntrega() == null) {
                orden.setFechaEntrega(LocalDateTime.now(ZONA_COLOMBIA));
            }
        }

        return ordenRepository.save(orden);
    }

    @Override
    @Transactional
    public OrdenServicio cambiarEstado(Long id, EstadoOrden estado) {
        OrdenServicio orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de servicio no encontrada."));
        orden.setEstado(estado);
        if (estado == EstadoOrden.ENTREGADO && orden.getFechaEntrega() == null) {
            orden.setFechaEntrega(LocalDateTime.now(ZONA_COLOMBIA));
        }
        return ordenRepository.save(orden);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        OrdenServicio orden = ordenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de servicio no encontrada."));
        orden.setActivo(false);
        ordenRepository.save(orden);
    }
}