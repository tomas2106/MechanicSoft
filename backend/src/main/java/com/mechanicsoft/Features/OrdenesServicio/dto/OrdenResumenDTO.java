package com.mechanicsoft.Features.OrdenesServicio.dto;

import com.mechanicsoft.Features.OrdenesServicio.entity.EstadoOrden;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrdenResumenDTO(
    Long id,
    EstadoOrden estado,
    LocalDateTime fechaIngreso,
    String motivoIngreso,
    Integer kilometrajeIngreso,
    BigDecimal valorTotal,
    Integer prioridadOrden,
    Long vehiculoId,
    String placa,
    String marca,
    String modelo,
    String color,
    Integer cilindrajeCc,
    Long clienteId,
    String clienteNombre,
    String clienteTelefono
) {}