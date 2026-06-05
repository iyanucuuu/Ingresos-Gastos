package com.ingresosgastos.servicio;

import com.ingresosgastos.modelo.Deposito;
import com.ingresosgastos.modelo.Inversion;
import com.ingresosgastos.repositorio.InversionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InversionService {

    private final InversionRepository inversionRepo;

    /** Devuelve todas las inversiones recalculando valor_actual en cuentas de ahorro */
    public List<Inversion> getAll() {
        return inversionRepo.findAll().stream()
            .peek(inv -> { if ("ahorro".equals(inv.getTipo())) recalcular(inv); })
            .toList();
    }

    /** Crea la inversión. Para tipo=ahorro genera el depósito inicial automáticamente. */
    @Transactional
    public Inversion create(Inversion inv) {
        inv.setId(null);
        if ("ahorro".equals(inv.getTipo())) {
            Deposito depInicial = new Deposito();
            depInicial.setImporte(inv.getInvertido());
            depInicial.setFecha(inv.getFecha());
            depInicial.setInversion(inv);
            inv.getDepositos().clear();
            inv.getDepositos().add(depInicial);
            recalcular(inv);
        }
        return inversionRepo.save(inv);
    }

    /** Actualiza nombre, ticker, tasa y (para inversión normal) importes y valor. */
    @Transactional
    public Inversion update(Long id, Inversion datos) {
        Inversion inv = findOrThrow(id);
        inv.setNombre(datos.getNombre());
        inv.setTicker(datos.getTicker());
        inv.setTasaAnual(datos.getTasaAnual());

        if ("inversion".equals(inv.getTipo())) {
            inv.setInvertido(datos.getInvertido());
            inv.setValorActual(datos.getValorActual());
            inv.setFecha(datos.getFecha());
        } else {
            // Actualiza el importe del depósito inicial si cambió
            if (!inv.getDepositos().isEmpty()) {
                Deposito dep0 = inv.getDepositos().get(0);
                dep0.setImporte(datos.getInvertido());
                dep0.setFecha(datos.getFecha());
            }
            inv.setFecha(datos.getFecha());
            recalcular(inv);
        }
        return inversionRepo.save(inv);
    }

    @Transactional
    public void delete(Long id) {
        if (!inversionRepo.existsById(id))
            throw new EntityNotFoundException("Inversión no encontrada: " + id);
        inversionRepo.deleteById(id);
    }

    // ── Depósitos / Retiradas ────────────────────────────

    /** Añade un abono (importe > 0) o una retirada (importe < 0) a una cuenta de ahorro. */
    @Transactional
    public Inversion addDeposito(Long invId, Deposito depositoData) {
        Inversion inv = findOrThrow(invId);
        if (!"ahorro".equals(inv.getTipo()))
            throw new IllegalStateException("Solo las cuentas remuneradas admiten depósitos/retiradas");

        depositoData.setId(null);
        depositoData.setInversion(inv);
        inv.getDepositos().add(depositoData);
        recalcular(inv);
        return inversionRepo.save(inv);
    }

    /** Elimina un depósito/retirada (no permite borrar el depósito inicial). */
    @Transactional
    public Inversion deleteDeposito(Long invId, Long depositoId) {
        Inversion inv = findOrThrow(invId);
        if (inv.getDepositos().size() <= 1)
            throw new IllegalStateException("No se puede eliminar el depósito inicial");

        inv.getDepositos().removeIf(d -> d.getId().equals(depositoId));
        recalcular(inv);
        return inversionRepo.save(inv);
    }

    // ── Helpers ──────────────────────────────────────────

    private Inversion findOrThrow(Long id) {
        return inversionRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Inversión no encontrada: " + id));
    }

    /**
     * Recalcula invertido y valor_actual para tipo=ahorro.
     * Cada depósito (positivo o negativo) crece/decrece de forma compuesta
     * desde su propia fecha hasta hoy.
     */
    private void recalcular(Inversion inv) {
        if (inv.getDepositos().isEmpty()) return;

        BigDecimal tasaMensual = inv.getTasaAnual() != null && inv.getTasaAnual().compareTo(BigDecimal.ZERO) > 0
            ? inv.getTasaAnual().divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        LocalDate hoy = LocalDate.now();
        BigDecimal totalInvertido = BigDecimal.ZERO;
        BigDecimal valorActual    = BigDecimal.ZERO;

        for (Deposito dep : inv.getDepositos()) {
            totalInvertido = totalInvertido.add(dep.getImporte());
            long meses = Math.max(0L, ChronoUnit.MONTHS.between(
                dep.getFecha().withDayOfMonth(1),
                hoy.withDayOfMonth(1)
            ));
            BigDecimal factor = BigDecimal.ONE.add(tasaMensual)
                .pow((int) meses, MathContext.DECIMAL64);
            valorActual = valorActual.add(dep.getImporte().multiply(factor, MathContext.DECIMAL64));
        }

        inv.setInvertido(totalInvertido.setScale(2, RoundingMode.HALF_UP));
        inv.setValorActual(valorActual.setScale(2, RoundingMode.HALF_UP));
    }
}
