package com.ingresosgastos.repositorio;

import com.ingresosgastos.modelo.Deposito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepositoRepository extends JpaRepository<Deposito, Long> { }
