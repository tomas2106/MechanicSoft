package com.mechanicsoft.Features.OrdenesServicio.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class IngresoCompletoRequest {

    @NotBlank(message = "El nombre del cliente es obligatorio")
    private String nombreCliente;

    @NotBlank(message = "El teléfono del cliente es obligatorio")
    private String telefono;

    private String correo;

    @NotBlank(message = "La placa es obligatoria")
    private String placa;

    @NotBlank(message = "La marca es obligatoria")
    private String marca;

    @NotBlank(message = "El modelo es obligatorio")
    private String modelo;

    private Integer cilindrajeCc;

    private Integer kilometraje;

    @NotBlank(message = "El motivo de ingreso es obligatorio")
    private String motivoIngreso;

    private BigDecimal valorTotal;
}