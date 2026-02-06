package com.estoque.dto;

public class ItemVendaDTO {

    private Long idProduto;
    private Integer quantidade;

    // --- GETTERS E SETTERS OBRIGATÓRIOS ---
    public Long getIdProduto() {
        return idProduto;
    }

    public void setIdProduto(Long idProduto) {
        this.idProduto = idProduto;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }
}