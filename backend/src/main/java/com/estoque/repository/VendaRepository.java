package com.estoque.repository;

import com.estoque.model.Venda;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {
    // O Spring cria o SQL automaticamente pelo nome do método
    List<Venda> findByDataVendaBetween(LocalDateTime inicio, LocalDateTime fim);
}