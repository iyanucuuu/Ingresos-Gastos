package com.ingresosgastos.servicio;

import com.ingresosgastos.modelo.Categoria;
import com.ingresosgastos.repositorio.CategoriaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepo;

    public List<Categoria> getAll() {
        return categoriaRepo.findAll();
    }

    public List<Categoria> getByTipo(String tipo) {
        return categoriaRepo.findByTipoOrderByNombreAsc(tipo);
    }

    public Categoria getById(Long id) {
        return categoriaRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada: " + id));
    }

    @Transactional
    public Categoria create(Categoria categoria) {
        categoria.setId(null);
        return categoriaRepo.save(categoria);
    }

    @Transactional
    public Categoria update(Long id, Categoria datos) {
        Categoria categoria = categoriaRepo.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada: " + id));
        categoria.setNombre(datos.getNombre());
        categoria.setTipo(datos.getTipo());
        categoria.setIcono(datos.getIcono());
        categoria.setColor(datos.getColor());
        return categoriaRepo.save(categoria);
    }

    @Transactional
    public void delete(Long id) {
        if (!categoriaRepo.existsById(id)) throw new EntityNotFoundException("Categoría no encontrada: " + id);
        categoriaRepo.deleteById(id);
    }
}
