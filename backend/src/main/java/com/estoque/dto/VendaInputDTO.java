package com.estoque.dto;

import java.util.List;

// Esse record define o formato exato que o Frontend está enviando
public record VendaInputDTO(List<ItemInput> itens) {
    
    public record ItemInput(Long idProduto, Integer quantidade) {}
}