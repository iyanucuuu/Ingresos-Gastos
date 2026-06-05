package com.ingresosgastos.repositorio;

import com.ingresosgastos.modelo.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    List<Categoria> findByTipoOrderByNombreAsc(String tipo);
}
