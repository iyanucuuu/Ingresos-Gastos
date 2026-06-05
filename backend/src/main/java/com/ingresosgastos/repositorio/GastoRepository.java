package com.ingresosgastos.repositorio;

import com.ingresosgastos.modelo.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {

    @Query("SELECT g FROM Gasto g WHERE YEAR(g.fecha) = :anio AND MONTH(g.fecha) = :mes ORDER BY g.fecha DESC")
    List<Gasto> findByMesAnio(@Param("mes") int mes, @Param("anio") int anio);

    @Query("SELECT g FROM Gasto g WHERE YEAR(g.fecha) = :anio AND MONTH(g.fecha) = :mes AND g.categoria.id = :catId ORDER BY g.fecha DESC")
    List<Gasto> findByMesAnioCategoria(@Param("mes") int mes, @Param("anio") int anio, @Param("catId") Long catId);

    @Query("SELECT g FROM Gasto g WHERE YEAR(g.fecha) = :anio ORDER BY g.fecha DESC")
    List<Gasto> findByAnio(@Param("anio") int anio);

    @Query("SELECT MONTH(g.fecha), YEAR(g.fecha), SUM(g.importe), COUNT(g) " +
           "FROM Gasto g WHERE YEAR(g.fecha) = :anio GROUP BY YEAR(g.fecha), MONTH(g.fecha) ORDER BY MONTH(g.fecha)")
    List<Object[]> findResumenMensual(@Param("anio") int anio);

    @Query("SELECT COALESCE(SUM(g.importe), 0) FROM Gasto g WHERE YEAR(g.fecha) = :anio AND MONTH(g.fecha) = :mes")
    BigDecimal sumByMesAnio(@Param("mes") int mes, @Param("anio") int anio);
}
