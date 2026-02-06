package com.estoque.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotNull(message = "O preço é obrigatório")
    @Positive(message = "O valor tem que ser positivo")
    private Double preco;

    @NotNull(message = "A quantidade é obrigatória")
    @Min(value = 0, message = "O estoque não pode ser negativo")
    private Integer quantidade;

    // ATENÇÃO: Se categoria for apenas um texto, não use @JoinColumn. 
    // Use apenas @Column ou remova a anotação se o nome for igual.
    // Se for uma relação com outra tabela, o tipo deveria ser 'Categoria' e não 'String'.
    private String categoria; 
    
    private String descricao;

    // --- CONSTRUTOR VAZIO (Obrigatório para JPA) ---
    public Produto() {
    }

    // --- CONSTRUTOR CHEIO (Opcional, ajuda no DataSeeder) ---
    public Produto(String nome, Double preco, Integer quantidade, String categoria) {
        this.nome = nome;
        this.preco = preco;
        this.quantidade = quantidade;
        this.categoria = categoria;
    }

    // --- GETTERS E SETTERS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(double preco) {
        this.preco = preco;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}