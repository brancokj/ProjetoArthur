package com.estoque.dto;

import com.estoque.model.Produto;

public record ProdutoDTO(Long id, String nome, Double preco, Integer quantidade, String categoria) {
    
    public ProdutoDTO(Produto produto) {
        this(
            produto.getId(),
            produto.getNome(),
            produto.getPreco(),
            produto.getQuantidade(),
            produto.getCategoria() != null ? produto.getCategoria() : "Sem Categoria"
        );
    }
}