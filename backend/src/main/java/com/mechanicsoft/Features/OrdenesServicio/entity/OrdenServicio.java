package com.mechanicsoft.Features.OrdenesServicio.entity;

import com.mechanicsoft.Features.Talleres.entity.Taller;
import com.mechanicsoft.Features.Vehiculos.entity.Vehiculo;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Table(name = "ordenes_servicio")
public class OrdenServicio {

    public static final ZoneId ZONA_COLOMBIA = ZoneId.of("America/Bogota");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "taller_id")
    private Taller taller;

    @NotNull(message = "El kilometraje es obligatorio")
    @Min(value = 0, message = "El kilometraje no puede ser negativo")
    @Column(name = "kilometraje_ingreso", nullable = false)
    private Integer kilometrajeIngreso;

    @NotBlank(message = "El motivo de ingreso es obligatorio")
    @Column(name = "motivo_ingreso", nullable = false, length = 500)
    private String motivoIngreso;

    @Column(columnDefinition = "TEXT")
    private String diagnostico;

    @Column(name = "trabajo_realizado", columnDefinition = "TEXT")
    private String trabajoRealizado;

    @Column(length = 500)
    private String observaciones;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoOrden estado = EstadoOrden.RECIBIDO;

    @Column(name = "valor_total", precision = 12, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @Column(name = "dias_garantia")
    private Integer diasGarantia = 30;

    @Column(name = "proximo_servicio_dias")
    private Integer proximoServicioDias = 45;

    @Column(name = "prioridad_orden")
    private Integer prioridadOrden;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDateTime fechaIngreso;

    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;

    @Column(nullable = false)
    private Boolean activo = true;

    @PrePersist
    public void prePersist() {
        if (this.fechaIngreso == null) {
            this.fechaIngreso = LocalDateTime.now(ZONA_COLOMBIA);
        }
        if (this.estado == null) {
            this.estado = EstadoOrden.RECIBIDO;
        }
        if (this.valorTotal == null) {
            this.valorTotal = BigDecimal.ZERO;
        }
        if (this.diasGarantia == null) {
            this.diasGarantia = 30;
        }
        if (this.proximoServicioDias == null) {
            this.proximoServicioDias = 45;
        }
        if (this.activo == null) {
            this.activo = true;
        }
    }
}