package com.mechanicsoft.Features.Vehiculos.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VehiculoRequest {

    @NotBlank
    private String placa;

    @NotBlank
    private String marca;

    @NotBlank
    private String modelo;

    private Integer anio;

    @NotNull
    @Min(50)
    private Integer cilindrajeCc;

    private String color;

    @NotNull
    @Min(0)
    private Integer kilometraje;

    private String fotoVehiculo;

    private String observaciones;

    @NotNull
    private Long clienteId;

}