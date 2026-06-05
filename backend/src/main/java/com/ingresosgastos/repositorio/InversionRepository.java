package com.ingresosgastos.repositorio;

import com.ingresosgastos.modelo.Inversion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InversionRepository extends JpaRepository<Inversion, Long> { }
