package com.mechanicsoft.Features.Clientes.entity;

import com.mechanicsoft.Features.Talleres.entity.Taller;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
    name = "clientes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_cliente_taller_telefono", columnNames = {"taller_id", "telefono"})
    }
)
public class Cliente {

    private static final ZoneId ZONA_COLOMBIA = ZoneId.of("America/Bogota");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 120)
    private String nombre;

    @NotBlank(message = "El teléfono es obligatorio")
    @Column(nullable = false, length = 25)
    private String telefono;

    @Email(message = "Correo inválido")
    @Column(length = 150)
    private String correo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "taller_id")
    private Taller taller;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean activo = true;

    @PrePersist
    public void prePersist() {
        if (this.nombre != null) {
            this.nombre = this.nombre.trim();
        }
        if (this.correo != null && this.correo.isBlank()) {
            this.correo = null;
        }
        if (this.activo == null) {
            this.activo = true;
        }
        createdAt = LocalDateTime.now(ZONA_COLOMBIA);
    }

    @PreUpdate
    public void preUpdate() {
        if (this.nombre != null) {
            this.nombre = this.nombre.trim();
        }
        if (this.correo != null && this.correo.isBlank()) {
            this.correo = null;
        }
    }
}