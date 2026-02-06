package com.estoque.controller;
// Controller simples para listar nomes

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.estoque.model.Funcionario;
import com.estoque.repository.FuncionarioRepository;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {
    @Autowired private FuncionarioRepository repo;

    @GetMapping
    public List<Funcionario> listar() {
        return repo.findAll(); // Ou findByAtivoTrue()
    }
    
    @PostMapping
    public Funcionario criar(@RequestBody Funcionario f) {
        return repo.save(f);
    }
}