package com.mechanicsoft.Features.Vehiculos.entity;

import com.mechanicsoft.Features.Clientes.entity.Cliente;
import com.mechanicsoft.Features.Talleres.entity.Taller;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "vehiculos",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_vehiculo_taller_placa", columnNames = {"taller_id", "placa"})
    }
)
public class Vehiculo {

    private static final ZoneId ZONA_COLOMBIA = ZoneId.of("America/Bogota");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La placa es obligatoria")
    @Column(nullable = false, length = 15)
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
    @Min(value = 40, message = "El cilindraje debe ser válido")
    @Column(name = "cilindraje_cc")
    private Integer cilindrajeCc = 150;

    @Column(length = 50)
    private String color;

    @NotNull(message = "El kilometraje es obligatorio")
    @Min(value = 0, message = "El kilometraje no puede ser negativo")
    @Column(nullable = false)
    private Integer kilometraje = 0;

    @Column(name = "foto_vehiculo", columnDefinition = "TEXT")
    private String fotoVehiculo;

    @Column(length = 500)
    private String observaciones;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "taller_id")
    private Taller taller;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.placa != null) {
            this.placa = this.placa.trim().replaceAll("\\s+", "").toUpperCase();
        }
        if (this.cilindrajeCc == null || this.cilindrajeCc < 40) {
            this.cilindrajeCc = 150;
        }
        if (this.kilometraje == null || this.kilometraje < 0) {
            this.kilometraje = 0;
        }
        LocalDateTime ahora = LocalDateTime.now(ZONA_COLOMBIA);
        createdAt = ahora;
        updatedAt = ahora;
    }

    @PreUpdate
    public void preUpdate() {
        if (this.placa != null) {
            this.placa = this.placa.trim().replaceAll("\\s+", "").toUpperCase();
        }
        updatedAt = LocalDateTime.now(ZONA_COLOMBIA);
    }
}