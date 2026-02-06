package com.estoque.dto;

import com.estoque.model.ItemVenda;

public record ItemVendaDTO(String produto, Integer quantidade, Double precoUnitario) {
    public ItemVendaDTO(ItemVenda item) {
        this(item.getProduto().getNome(), item.getQuantidade(), item.getPrecoUnitario());
    }
}