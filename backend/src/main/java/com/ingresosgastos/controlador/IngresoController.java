package com.ingresosgastos.controlador;

import com.ingresosgastos.modelo.Ingreso;
import com.ingresosgastos.modelo.ResumenMensual;
import com.ingresosgastos.servicio.IngresosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ingresos")
@RequiredArgsConstructor
public class IngresoController {

    private final IngresosService ingresosService;

    @GetMapping
    public ResponseEntity<List<Ingreso>> getAll(
            @RequestParam(required = false) Integer mes,
            @RequestParam(required = false) Integer anio,
            @RequestParam(required = false) Long categoriaId) {
        return ResponseEntity.ok(ingresosService.getAll(mes, anio, categoriaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ingreso> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ingresosService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Ingreso> create(@Valid @RequestBody Ingreso ingreso) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ingresosService.create(ingreso));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ingreso> update(@PathVariable Long id,
                                           @Valid @RequestBody Ingreso ingreso) {
        return ResponseEntity.ok(ingresosService.update(id, ingreso));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ingresosService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/resumen")
    public ResponseEntity<List<ResumenMensual>> getResumenMensual(
            @RequestParam int anio) {
        return ResponseEntity.ok(ingresosService.getResumenMensual(anio));
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalMes(
            @RequestParam int mes,
            @RequestParam int anio) {
        return ResponseEntity.ok(Map.of("total", ingresosService.getTotalMes(mes, anio)));
    }
}
