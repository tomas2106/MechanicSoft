package com.mechanicsoft.Features.Vehiculos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VehiculoRequest {

    @NotBlank(message = "La placa es obligatoria")
    private String placa;

    @NotBlank(message = "La marca es obligatoria")
    private String marca;

    @NotBlank(message = "El modelo es obligatorio")
    private String modelo;

    private Integer anio;

    @Min(value = 40, message = "El cilindraje debe ser mayor a 40 cc")
    private Integer cilindrajeCc = 150;

    private String color;

    @Min(value = 0, message = "El kilometraje no puede ser negativo")
    private Integer kilometraje = 0;

    private String fotoVehiculo;

    private String observaciones;

    @NotNull(message = "El cliente es obligatorio")
    private Long clienteId;

    private Long tallerId;
}