package com.ingresosgastos.controlador;

import com.ingresosgastos.modelo.Deposito;
import com.ingresosgastos.modelo.Inversion;
import com.ingresosgastos.servicio.InversionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inversiones")
@RequiredArgsConstructor
public class InversionController {

    private final InversionService inversionService;

    @GetMapping
    public ResponseEntity<List<Inversion>> getAll() {
        return ResponseEntity.ok(inversionService.getAll());
    }

    @PostMapping
    public ResponseEntity<Inversion> create(@Valid @RequestBody Inversion inversion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inversionService.create(inversion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inversion> update(@PathVariable Long id,
                                             @RequestBody Inversion inversion) {
        return ResponseEntity.ok(inversionService.update(id, inversion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inversionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Depósitos / Retiradas ──────────────────────────────

    /** importe > 0 → abono     importe < 0 → retirada */
    @PostMapping("/{id}/depositos")
    public ResponseEntity<Inversion> addDeposito(@PathVariable Long id,
                                                   @RequestBody Deposito deposito) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(inversionService.addDeposito(id, deposito));
    }

    @DeleteMapping("/{id}/depositos/{depositoId}")
    public ResponseEntity<Inversion> deleteDeposito(@PathVariable Long id,
                                                      @PathVariable Long depositoId) {
        return ResponseEntity.ok(inversionService.deleteDeposito(id, depositoId));
    }
}
