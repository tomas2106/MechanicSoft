package com.mechanicsoft.Features.Inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.mechanicsoft.Features.Talleres.entity.Taller;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "inventario", indexes = {
    @Index(name = "idx_inventario_taller", columnList = "taller_id")
})
public class ItemInventario {

    private static final ZoneId ZONA_COLOMBIA = ZoneId.of("America/Bogota");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "taller_id", nullable = false)
    private Taller taller;

    @Transient
    @JsonProperty("tallerId")
    public Long getTallerId() {
        return taller != null ? taller.getId() : null;
    }

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 60)
    private String codigo;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 2;

    @Column(name = "precio_compra", precision = 12, scale = 2)
    private BigDecimal precioCompra = BigDecimal.ZERO;

    @Column(name = "precio_venta", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioVenta = BigDecimal.ZERO;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.stock == null) this.stock = 0;
        if (this.stockMinimo == null) this.stockMinimo = 2;
        if (this.precioCompra == null) this.precioCompra = BigDecimal.ZERO;
        if (this.precioVenta == null) this.precioVenta = BigDecimal.ZERO;
        if (this.activo == null) this.activo = true;
        this.createdAt = LocalDateTime.now(ZONA_COLOMBIA);
    }
}