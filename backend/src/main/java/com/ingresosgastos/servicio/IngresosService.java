package com.ingresosgastos.servicio;

import com.ingresosgastos.modelo.Categoria;
import com.ingresosgastos.modelo.Ingreso;
import com.ingresosgastos.modelo.ResumenMensual;
import com.ingresosgastos.repositorio.CategoriaRepository;
import com.ingresosgastos.repositorio.IngresoRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IngresosService {

    private final IngresoRepository ingresoRepo;
    private final CategoriaRepository categoriaRepo;

    public List<Ingreso> getAll(Integer mes, Integer anio, Long categoriaId) {
        if (mes != null && anio != null && categoriaId != null) {
            return ingresoRepo.findByMesAnioCategoria(mes, anio, categoriaId);
        } else if (mes != null && anio != null) {
            return ingresoRepo.findByMesAnio(mes, anio);
        } else if (anio != null) {
            return ingresoRepo.findByAnio(anio);
        }
        return ingresoRepo.findAll();
    }

    public Ingreso getById(Long id) {
        return ingresoRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ingreso no encontrado: " + id));
    }

    @Transactional
    public Ingreso create(Ingreso ingreso) {
        Categoria cat = categoriaRepo.findById(ingreso.getCategoria().getId())
            .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada: " + ingreso.getCategoria().getId()));
        ingreso.setId(null);
        ingreso.setCategoria(cat);
        if (ingreso.getPeriodicidad() == null) ingreso.setPeriodicidad("puntual");
        return ingresoRepo.save(ingreso);
    }

    @Transactional
    public Ingreso update(Long id, Ingreso datos) {
        Ingreso ingreso = ingresoRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Ingreso no encontrado: " + id));
        Categoria cat = categoriaRepo.findById(datos.getCategoria().getId())
            .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada: " + datos.getCategoria().getId()));
        ingreso.setConcepto(datos.getConcepto());
        ingreso.setImporte(datos.getImporte());
        ingreso.setFecha(datos.getFecha());
        ingreso.setCategoria(cat);
        ingreso.setPeriodicidad(datos.getPeriodicidad());
        ingreso.setNotas(datos.getNotas());
        return ingresoRepo.save(ingreso);
    }

    @Transactional
    public void delete(Long id) {
        if (!ingresoRepo.existsById(id)) throw new EntityNotFoundException("Ingreso no encontrado: " + id);
        ingresoRepo.deleteById(id);
    }

    public List<ResumenMensual> getResumenMensual(int anio) {
        return ingresoRepo.findResumenMensual(anio).stream().map(row ->
            new ResumenMensual(
                ((Number) row[0]).intValue(),
                ((Number) row[1]).intValue(),
                (BigDecimal) row[2],
                ((Number) row[3]).longValue()
            )
        ).collect(Collectors.toList());
    }

    public BigDecimal getTotalMes(int mes, int anio) {
        return ingresoRepo.sumByMesAnio(mes, anio);
    }
}
