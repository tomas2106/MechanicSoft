package com.mechanicsoft.Features.Clientes.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "clientes")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 120)
    private String nombre;

    @NotBlank(message = "El teléfono es obligatorio")
    @Column(nullable = false, unique = true, length = 20)
    private String telefono;

    @Email(message = "Correo inválido")
    @Column(length = 150)
    private String correo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean activo = true;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

}