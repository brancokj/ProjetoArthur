package com.estoque.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Entity
@Table(name = "produtos")
@Data
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

    @JoinColumn(name = "categoria_id") 
    private String categoria;
}