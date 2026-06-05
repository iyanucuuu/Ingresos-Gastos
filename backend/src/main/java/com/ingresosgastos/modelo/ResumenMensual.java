package com.ingresosgastos.modelo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResumenMensual {
    private int mes;
    private int anio;
    private BigDecimal total;
    private long cantidad;
}
