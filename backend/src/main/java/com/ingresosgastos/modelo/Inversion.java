package com.ingresosgastos.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inversiones")
@Data
@NoArgsConstructor
public class Inversion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 10)
    private String ticker;

    @NotBlank
    @Column(nullable = false, length = 20)
    private String tipo;  // "inversion" | "ahorro"

    @NotNull
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal invertido;

    @NotNull
    @Column(name = "valor_actual", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorActual;

    @NotNull
    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "tasa_anual", precision = 5, scale = 2)
    private BigDecimal tasaAnual;

    @OneToMany(mappedBy = "inversion", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("fecha ASC, id ASC")
    private List<Deposito> depositos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
