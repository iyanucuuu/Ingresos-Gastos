package com.ingresosgastos.repositorio;

import com.ingresosgastos.modelo.Ingreso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface IngresoRepository extends JpaRepository<Ingreso, Long> {

    @Query("SELECT i FROM Ingreso i WHERE YEAR(i.fecha) = :anio AND MONTH(i.fecha) = :mes ORDER BY i.fecha DESC")
    List<Ingreso> findByMesAnio(@Param("mes") int mes, @Param("anio") int anio);

    @Query("SELECT i FROM Ingreso i WHERE YEAR(i.fecha) = :anio AND MONTH(i.fecha) = :mes AND i.categoria.id = :catId ORDER BY i.fecha DESC")
    List<Ingreso> findByMesAnioCategoria(@Param("mes") int mes, @Param("anio") int anio, @Param("catId") Long catId);

    @Query("SELECT i FROM Ingreso i WHERE YEAR(i.fecha) = :anio ORDER BY i.fecha DESC")
    List<Ingreso> findByAnio(@Param("anio") int anio);

    @Query("SELECT MONTH(i.fecha), YEAR(i.fecha), SUM(i.importe), COUNT(i) " +
           "FROM Ingreso i WHERE YEAR(i.fecha) = :anio GROUP BY YEAR(i.fecha), MONTH(i.fecha) ORDER BY MONTH(i.fecha)")
    List<Object[]> findResumenMensual(@Param("anio") int anio);

    @Query("SELECT COALESCE(SUM(i.importe), 0) FROM Ingreso i WHERE YEAR(i.fecha) = :anio AND MONTH(i.fecha) = :mes")
    BigDecimal sumByMesAnio(@Param("mes") int mes, @Param("anio") int anio);
}
