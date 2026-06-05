package com.ingresosgastos.controlador;

import com.ingresosgastos.modelo.Gasto;
import com.ingresosgastos.modelo.ResumenMensual;
import com.ingresosgastos.servicio.GastosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gastos")
@RequiredArgsConstructor
public class GastoController {

    private final GastosService gastosService;

    @GetMapping
    public ResponseEntity<List<Gasto>> getAll(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Long categoriaId) {
        return ResponseEntity.ok(gastosService.getAll(mes, anio, categoriaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Gasto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(gastosService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Gasto> create(@Valid @RequestBody Gasto gasto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gastosService.create(gasto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Gasto> update(@PathVariable Long id,
                                         @Valid @RequestBody Gasto gasto) {
        return ResponseEntity.ok(gastosService.update(id, gasto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        gastosService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/resumen")
    public ResponseEntity<List<ResumenMensual>> getResumenMensual(
            @RequestParam int anio) {
        return ResponseEntity.ok(gastosService.getResumenMensual(anio));
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalMes(
            @RequestParam int mes,
            @RequestParam int anio) {
        return ResponseEntity.ok(Map.of("total", gastosService.getTotalMes(mes, anio)));
    }
}
