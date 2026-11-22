package com.mechanicsoft.Features.Vehiculos.entity;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "vehiculos")
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La placa es obligatoria")
    @Column(nullable = false, unique = true, length = 10)
    private String placa;

    @NotBlank(message = "La marca es obligatoria")
    @Column(nullable = false, length = 100)
    private String marca;

    @NotBlank(message = "El modelo es obligatorio")
    @Column(nullable = false, length = 100)
    private String modelo;

    @Column(name = "anio")
    private Integer anio;

    @NotNull(message = "El cilindraje es obligatorio")
    @Min(value = 50, message = "El cilindraje debe ser mayor a 50 cc")
    @Column(name = "cilindraje_cc")
    private Integer cilindrajeCc = 150;

    @Column(length = 50)
    private String color;

    @NotNull(message = "El kilometraje es obligatorio")
    @Min(value = 0, message = "El kilometraje no puede ser negativo")
    @Column(nullable = false)
    private Integer kilometraje;

    @Column(name = "foto_vehiculo", columnDefinition = "TEXT")
    private String fotoVehiculo;

    @Column(length = 500)
    private String observaciones;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}