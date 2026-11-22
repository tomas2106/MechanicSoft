package com.mechanicsoft.Features.Talleres.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios_taller")
public class UsuarioTaller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    // Roles: SUPER_ADMIN, ADMIN_TALLER, MECANICO
    @Column(nullable = false, length = 30)
    private String rol;

    // Indica si el dueño también opera como mecánico en patio
    @Column(name = "es_mecanico", nullable = false)
    private Boolean esMecanico = true;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "taller_id")
    private Taller taller;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}