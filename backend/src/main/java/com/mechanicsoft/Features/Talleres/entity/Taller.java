package com.mechanicsoft.Features.Talleres.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "talleres")
public class Taller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 250)
    private String ubicacion;

    @Column(length = 30)
    private String whatsapp;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "tiene_inventario")
    private Boolean tieneInventario = true;

    @Column(name = "citas_habilitadas")
    private Boolean citasHabilitadas = true;

    @Column(name = "cupos_diarios")
    private Integer cuposDiarios = 8;

    @Column(name = "abierto_hoy")
    private Boolean abiertoHoy = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (activo == null) {
            activo = true;
        }
        if (tieneInventario == null) {
            tieneInventario = true;
        }
        if (citasHabilitadas == null) {
            citasHabilitadas = true;
        }
        if (cuposDiarios == null) {
            cuposDiarios = 8;
        }
        if (abiertoHoy == null) {
            abiertoHoy = false;
        }
    }
}