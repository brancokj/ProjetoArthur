package com.estoque.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "categorias")
@Data
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nome;

    // Relacionamento: Uma categoria tem muitos produtos
    @OneToMany(mappedBy = "categoria")
    private List<Produto> produtos;
}