package com.estoque.model;

import jakarta.persistence.*;
import lombok.Data; // Se não usar lombok, gere os Getters/Setters manualmente
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vendas")
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dataVenda = LocalDateTime.now();

    private Double valorTotal;

    // --- NOVOS CAMPOS ---
    private String vendedor; // Pode ser nome ou "Venda Online"
    
    private String tipoAtendimento; // "LOJA" ou "DOMICILIO"
    // --------------------

    // Relacionamento com Usuário (Cliente)
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @OneToMany(mappedBy = "venda", fetch = FetchType.EAGER)
    private List<ItemVenda> itens;

    // Construtor vazio
    public Venda() {}

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsuarioNome() {
        return usuario != null ? usuario.getNome() : "Cliente Desconhecido";
    }

    public LocalDateTime getDataVenda() { return dataVenda; }
    public void setDataVenda(LocalDateTime dataVenda) { this.dataVenda = dataVenda; }

    public Double getValorTotal() { return valorTotal; }
    public void setValorTotal(Double valorTotal) { this.valorTotal = valorTotal; }

    public String getVendedor() { return vendedor; }
    public void setVendedor(String vendedor) { this.vendedor = vendedor; }

    public String getTipoAtendimento() { return tipoAtendimento; }
    public void setTipoAtendimento(String tipoAtendimento) { this.tipoAtendimento = tipoAtendimento; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public List<ItemVenda> getListaItemVendas(){
        return itens;
    }
}