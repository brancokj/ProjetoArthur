package com.estoque.controller;

import com.estoque.dto.ProdutoInputDTO;
import com.estoque.model.Produto;
import com.estoque.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoRepository repository;

    @GetMapping
    public ResponseEntity<Page<Produto>> listar(@PageableDefault(size = 10, sort = {"nome"}) Pageable paginacao) {
        return ResponseEntity.ok(repository.findAll(paginacao));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> detalhar(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Produto> criar(@RequestBody ProdutoInputDTO dados) {
        Produto novo = new Produto();
        novo.setNome(dados.nome());
        novo.setPreco(dados.preco());
        novo.setCategoria(dados.categoria());
        novo.setQuantidade(dados.quantidade() != null ? dados.quantidade() : 0);
        
        repository.save(novo);
        return ResponseEntity.ok(novo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> editar(@PathVariable Long id, @RequestBody ProdutoInputDTO dados) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        
        produto.setNome(dados.nome());
        produto.setPreco(dados.preco());
        produto.setCategoria(dados.categoria());
        
        repository.save(produto);
        return ResponseEntity.ok(produto);
    }

    @PutMapping("/{id}/estoque")
    public ResponseEntity<Void> adicionarEstoque(@PathVariable Long id, @RequestBody Map<String, Integer> payload) {
        Produto produto = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        
        Integer qtd = payload.get("quantidade");
        if (qtd != null && qtd > 0) {
            produto.setQuantidade(produto.getQuantidade() + qtd);
            repository.save(produto);
        }
        
        return ResponseEntity.ok().build();
    }
}