package com.estoque.controller;

import com.estoque.model.Funcionario;
import com.estoque.repository.FuncionarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {

    @Autowired
    private FuncionarioRepository repository;

    @GetMapping
    public List<Funcionario> listar() {
        return repository.findAll();
    }

    @PostMapping
    public Funcionario criar(@RequestBody Funcionario f) {
        return repository.save(f);
    }
}