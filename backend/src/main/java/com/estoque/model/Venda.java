package com.estoque.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "vendas")
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime dataVenda = LocalDateTime.now();

    private Double valorTotal;

    // --- CAMPOS EXTRAS ---
    private String vendedor;
    private String tipoAtendimento;

    // Relacionamento com Usuário (Cliente)
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @OneToMany(mappedBy = "venda", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<ItemVenda> itens = new ArrayList<>();

    // Construtor vazio
    public Venda() {
    }

    // --- GETTERS E SETTERS ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsuarioNome() {
        return usuario != null ? usuario.getNome() : "Cliente Desconhecido";
    }

    public LocalDateTime getDataVenda() {
        return dataVenda;
    }

    public void setDataVenda(LocalDateTime dataVenda) {
        this.dataVenda = dataVenda;
    }

    public Double getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(Double valorTotal) {
        this.valorTotal = valorTotal;
    }

    public String getVendedor() {
        return vendedor;
    }

    public void setVendedor(String vendedor) {
        this.vendedor = vendedor;
    }

    public String getTipoAtendimento() {
        return tipoAtendimento;
    }

    public void setTipoAtendimento(String tipoAtendimento) {
        this.tipoAtendimento = tipoAtendimento;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    // --- A CORREÇÃO ESTÁ AQUI ---
    // Antes estava getListaItemVendas(), agora é getItens()
    public List<ItemVenda> getItens() {
        return itens;
    }

    public void setItens(List<ItemVenda> listaItens) {
        this.itens = listaItens;
        // O Loop abaixo é CRUCIAL para o Cascade funcionar
        if (listaItens != null) {
            for (ItemVenda item : listaItens) {
                item.setVenda(this);
            }
        }
    }
}