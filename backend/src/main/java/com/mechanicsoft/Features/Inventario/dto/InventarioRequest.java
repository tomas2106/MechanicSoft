package com.mechanicsoft.Features.Inventario.dto;

import java.math.BigDecimal;

public record InventarioRequest(
    String nombre,
    String codigo,
    Integer stock,
    Integer stockMinimo,
    BigDecimal precioCompra,
    BigDecimal precioVenta
) {}