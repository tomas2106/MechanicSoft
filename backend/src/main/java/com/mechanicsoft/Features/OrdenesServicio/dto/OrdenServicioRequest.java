package com.mechanicsoft.Features.OrdenesServicio.dto;

import com.mechanicsoft.Features.OrdenesServicio.entity.EstadoOrden;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrdenServicioRequest {

    @NotNull(message = "El vehículo es obligatorio")
    private Long vehiculoId;

    @NotNull(message = "El kilometraje de ingreso es obligatorio")
    @Min(value = 0, message = "El kilometraje no puede ser negativo")
    private Integer kilometrajeIngreso;

    @NotBlank(message = "El motivo de ingreso es obligatorio")
    private String motivoIngreso;

    private String diagnostico;

    private String trabajoRealizado;

    private String observaciones;

    private EstadoOrden estado;

    private BigDecimal valorTotal;
}