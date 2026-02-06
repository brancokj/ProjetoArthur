package com.estoque.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "item_venda")
public class ItemVenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantidade;
    private Double precoUnitario;
    
    // Esse campo guarda o nome do produto (Histórico)
    private String produtoNome; 

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @ManyToOne
    @JoinColumn(name = "venda_id")
    @JsonIgnore // OBRIGATÓRIO: Impede travar o JSON
    private Venda venda;

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getQuantidade() { return quantidade; }
    public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }

    public Double getPrecoUnitario() { return precoUnitario; }
    public void setPrecoUnitario(Double precoUnitario) { this.precoUnitario = precoUnitario; }

    public String getProdutoNome() { return produtoNome; }
    public void setProdutoNome(String produtoNome) { this.produtoNome = produtoNome; }

    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }

    public Venda getVenda() { return venda; }
    public void setVenda(Venda venda) { this.venda = venda; }
}