package com.estoque.dto;

import java.util.List;

public class VendaDTO {
    // Lista de IDs dos produtos comprados (simplificado)
    private List<ItemVendaDTO> itens; 
    
    private String vendedor;
    private String tipoAtendimento; // O front vai mandar "LOJA" ou "DOMICILIO"

    public String getVendedor() { return vendedor; }
    public void setVendedor(String vendedor) { this.vendedor = vendedor; }

    public String getTipoAtendimento() { return tipoAtendimento; }
    public void setTipoAtendimento(String tipoAtendimento) { this.tipoAtendimento = tipoAtendimento; }

    public List<ItemVendaDTO> getItens() { return itens; }
    public void setItens(List<ItemVendaDTO> itens) { this.itens = itens; }
}