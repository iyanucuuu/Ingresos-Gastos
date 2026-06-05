package com.ingresosgastos.modelo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "depositos")
@Data
@NoArgsConstructor
public class Deposito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inversion_id", nullable = false)
    @JsonIgnore          // evita bucle JSON Inversion → Deposito → Inversion
    private Inversion inversion;

    @NotNull
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal importe;   // negativo = retirada

    @NotNull
    @Column(nullable = false)
    private LocalDate fecha;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
