package com.ingresosgastos.servicio;

import com.ingresosgastos.modelo.Categoria;
import com.ingresosgastos.modelo.Gasto;
import com.ingresosgastos.modelo.ResumenMensual;
import com.ingresosgastos.repositorio.CategoriaRepository;
import com.ingresosgastos.repositorio.GastoRepository;
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
public class GastosService {

    private final GastoRepository gastoRepo;
    private final CategoriaRepository categoriaRepo;

    public List<Gasto> getAll(Integer mes, Integer anio, Long categoriaId) {
        if (mes != null && anio != null && categoriaId != null) {
            return gastoRepo.findByMesAnioCategoria(mes, anio, categoriaId);
        } else if (mes != null && anio != null) {
            return gastoRepo.findByMesAnio(mes, anio);
        } else if (anio != null) {
            return gastoRepo.findByAnio(anio);
        }
        return gastoRepo.findAll();
    }

    public Gasto getById(Long id) {
        return gastoRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Gasto no encontrado: " + id));
    }

    @Transactional
    public Gasto create(Gasto gasto) {
        Categoria cat = categoriaRepo.findById(gasto.getCategoria().getId())
            .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada: " + gasto.getCategoria().getId()));
        gasto.setId(null);
        gasto.setCategoria(cat);
        if (gasto.getPeriodicidad() == null) gasto.setPeriodicidad("puntual");
        return gastoRepo.save(gasto);
    }

    @Transactional
    public Gasto update(Long id, Gasto datos) {
        Gasto gasto = gastoRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Gasto no encontrado: " + id));
        Categoria cat = categoriaRepo.findById(datos.getCategoria().getId())
            .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada: " + datos.getCategoria().getId()));
        gasto.setConcepto(datos.getConcepto());
        gasto.setImporte(datos.getImporte());
        gasto.setFecha(datos.getFecha());
        gasto.setCategoria(cat);
        gasto.setPeriodicidad(datos.getPeriodicidad());
        gasto.setNotas(datos.getNotas());
        return gastoRepo.save(gasto);
    }

    @Transactional
    public void delete(Long id) {
        if (!gastoRepo.existsById(id)) throw new EntityNotFoundException("Gasto no encontrado: " + id);
        gastoRepo.deleteById(id);
    }

    public List<ResumenMensual> getResumenMensual(int anio) {
        return gastoRepo.findResumenMensual(anio).stream().map(row ->
            new ResumenMensual(
                ((Number) row[0]).intValue(),
                ((Number) row[1]).intValue(),
                (BigDecimal) row[2],
                ((Number) row[3]).longValue()
            )
        ).collect(Collectors.toList());
    }

    public BigDecimal getTotalMes(int mes, int anio) {
        return gastoRepo.sumByMesAnio(mes, anio);
    }
}
