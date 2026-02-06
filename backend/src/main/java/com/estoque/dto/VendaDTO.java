package com.estoque.dto;

import com.estoque.model.Venda;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record VendaDTO(Long id, LocalDateTime data, Double total, String vendedor, List<ItemVendaDTO> itens) {
    
    public VendaDTO(Venda venda) {
        this(
            venda.getId(),
            venda.getDataVenda(),
            venda.getValorTotal(),
            venda.getUsuario().getEmail(), 
            venda.getItens().stream().map(ItemVendaDTO::new).collect(Collectors.toList())
        );
    }
}