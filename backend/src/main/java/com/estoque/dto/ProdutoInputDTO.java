package com.estoque.dto;

public record ProdutoInputDTO(
    String nome, 
    Double preco, 
    String categoria, 
    Integer quantidade 
) {}